'use client';
// ============================================
// useVoiceCommand — browser speech capture + command execution.
//
// 1. Starts the Web Speech API (SpeechRecognition) set to hi-IN, which handles
//    Hinglish reasonably well and needs no API key.
// 2. Sends the transcript to /api/voice-command to be parsed into an action plan.
// 3. Executes the plan against the existing taskService. Destructive actions
//    (delete, bulk reorder, mass complete) are NOT run immediately — they are
//    returned as a `pendingConfirm` object the UI shows before the user confirms.
//
// Returns a small state machine the UI can drive with one mic button.
// ============================================

import { useState, useRef, useCallback } from 'react';
import { taskService } from '../services/taskService';

// Which actions need an explicit confirm before running.
function needsConfirm(actions) {
  return actions.some(
    (a) =>
      a.type === 'delete' ||
      (a.type === 'reorder') ||
      (a.type === 'complete' && Array.isArray(a.ids) && a.ids.length > 2)
  );
}

export function useVoiceCommand({ session, tasks, categories, clients, reload, showToast }) {
  // status: 'idle' | 'listening' | 'processing' | 'confirming' | 'executing'
  const [status, setStatus] = useState('idle');
  const [transcript, setTranscript] = useState('');
  const [pendingConfirm, setPendingConfirm] = useState(null); // { actions, speak, transcript }
  const [supported, setSupported] = useState(true);
  const recognitionRef = useRef(null);

  const resetSoon = useCallback(() => {
    setTimeout(() => {
      setStatus('idle');
      setTranscript('');
    }, 1500);
  }, []);

  // ---- Execute a validated action plan against taskService ----
  const runActions = useCallback(
    async (actions) => {
      if (!session?.user?.id) return;
      const userId = session.user.id;
      setStatus('executing');

      let created = 0, updated = 0, deleted = 0, completed = 0, reordered = false;

      try {
        for (const a of actions) {
          if (a.type === 'create' && a.task) {
            await taskService.createTask(
              {
                title: a.task.title,
                description: a.task.description || '',
                category: a.task.category || 'personal',
                subcategory: a.task.subcategory || 'General',
                priority: a.task.priority || 'medium',
                type: a.task.type || 'one-time',
                deadline: a.task.deadline || null,
                time: a.task.time || '09:00 AM',
              },
              userId
            );
            created++;
          } else if (a.type === 'update' && a.id && a.changes) {
            const existing = (tasks || []).find((t) => String(t.id) === String(a.id));
            if (existing) {
              await taskService.updateTask(a.id, { ...existing, ...a.changes });
              updated++;
            }
          } else if (a.type === 'delete' && Array.isArray(a.ids)) {
            for (const id of a.ids) {
              await taskService.trashTask(id);
              deleted++;
            }
          } else if (a.type === 'complete' && Array.isArray(a.ids)) {
            for (const id of a.ids) {
              const existing = (tasks || []).find((t) => String(t.id) === String(id));
              // toggleTaskStatus flips based on CURRENT status; only toggle when
              // the current state differs from the requested one.
              const want = a.done === false ? 'pending' : 'done';
              if (existing && existing.status !== want) {
                await taskService.toggleTaskStatus(id, existing.status);
                completed++;
              }
            }
          } else if (a.type === 'reorder' && Array.isArray(a.orderedIds)) {
            await taskService.updateTaskOrder(a.orderedIds);
            reordered = true;
          }
        }

        await reload?.();

        const bits = [];
        if (created) bits.push(`${created} banaya`);
        if (updated) bits.push(`${updated} update`);
        if (completed) bits.push(`${completed} done`);
        if (deleted) bits.push(`${deleted} trash`);
        if (reordered) bits.push('reorder');
        showToast?.(`🎙️ ${bits.length ? bits.join(' • ') : 'Done'} ✓`);
      } catch (err) {
        console.error('Voice execute error:', err);
        showToast?.('❌ Voice action failed — please try again');
      } finally {
        setPendingConfirm(null);
        resetSoon();
      }
    },
    [session, tasks, reload, showToast, resetSoon]
  );

  // ---- Send transcript to the parser, then run or stage for confirm ----
  const processTranscript = useCallback(
    async (text) => {
      setStatus('processing');
      try {
        const res = await fetch('/api/voice-command', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            transcript: text,
            tasks: (tasks || []).map((t) => ({
              id: t.id, title: t.title, status: t.status,
              priority: t.priority, time: t.time, deadline: t.deadline, category: t.category,
            })),
            categories: categories || [],
            clients: clients || [],
            userId: session?.user?.id,
          }),
        });
        const data = await res.json();

        if (data.error) {
          showToast?.(`🎙️ ${data.error}`);
          resetSoon();
          return;
        }

        const actions = data.actions || [];
        const clarify = actions.find((a) => a.type === 'clarify');
        if (clarify) {
          showToast?.(`🎙️ ${clarify.message || 'Kaunsa task? Dobara bolein.'}`);
          resetSoon();
          return;
        }

        if (actions.length === 0) {
          showToast?.('🎙️ Koi action nahi mila — dobara try karein.');
          resetSoon();
          return;
        }

        if (needsConfirm(actions)) {
          setPendingConfirm({ actions, speak: data.speak, transcript: text });
          setStatus('confirming');
        } else {
          await runActions(actions);
        }
      } catch (err) {
        console.error('Voice process error:', err);
        showToast?.('❌ Voice parsing failed — please try again');
        resetSoon();
      }
    },
    [tasks, categories, clients, session, showToast, runActions, resetSoon]
  );

  // ---- Start listening ----
  const startListening = useCallback(() => {
    if (typeof window === 'undefined') return;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      setSupported(false);
      showToast?.('🎙️ Is browser mein voice support nahi — Chrome use karein.');
      return;
    }

    try {
      const recognition = new SR();
      recognition.lang = 'hi-IN'; // handles Hinglish better than en-US
      recognition.interimResults = true;
      recognition.continuous = false;
      recognition.maxAlternatives = 1;

      let finalText = '';

      recognition.onresult = (event) => {
        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const chunk = event.results[i][0].transcript;
          if (event.results[i].isFinal) finalText += chunk;
          else interim += chunk;
        }
        setTranscript(finalText || interim);
      };

      recognition.onerror = (e) => {
        console.error('SpeechRecognition error:', e.error);
        if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
          showToast?.('🎙️ Mic permission chahiye — browser settings mein allow karein.');
        } else if (e.error === 'no-speech') {
          showToast?.('🎙️ Kuch sunayi nahi diya — dobara bolein.');
        }
        setStatus('idle');
      };

      recognition.onend = () => {
        const text = (finalText || transcript || '').trim();
        if (text) {
          processTranscript(text);
        } else {
          setStatus('idle');
        }
      };

      recognitionRef.current = recognition;
      setTranscript('');
      setStatus('listening');
      recognition.start();
    } catch (err) {
      console.error('startListening error:', err);
      setStatus('idle');
    }
  }, [transcript, processTranscript, showToast]);

  const stopListening = useCallback(() => {
    try {
      recognitionRef.current?.stop();
    } catch (e) {}
  }, []);

  const cancelConfirm = useCallback(() => {
    setPendingConfirm(null);
    setStatus('idle');
    setTranscript('');
  }, []);

  const confirmPending = useCallback(() => {
    if (pendingConfirm?.actions) runActions(pendingConfirm.actions);
  }, [pendingConfirm, runActions]);

  return {
    status,
    transcript,
    supported,
    pendingConfirm,
    startListening,
    stopListening,
    confirmPending,
    cancelConfirm,
  };
}
