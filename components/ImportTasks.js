'use client';
import React, { useState, useRef } from 'react';
import { VISUAL_THEME, PRIORITY_CONFIG } from '../constants/taskConstants';
import { importTasksFromFile } from '../utils/importUtils';

export default function ImportTasks({ onImport, onClose, isMobile }) {
  const [dragOver, setDragOver] = useState(false);
  const [parsedTasks, setParsedTasks] = useState(null);
  const [error, setError] = useState('');
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const fileInputRef = useRef(null);

  const handleFile = async (file) => {
    setError('');
    setParsedTasks(null);
    setImportResult(null);

    try {
      const tasks = await importTasksFromFile(file);
      setParsedTasks(tasks);
    } catch (err) {
      setError(err.message || 'File parse failed');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    if (file) handleFile(file);
  };

  const handleImport = async () => {
    if (!parsedTasks || parsedTasks.length === 0) return;
    setImporting(true);
    setError('');

    try {
      const result = await onImport(parsedTasks);
      setImportResult(result);
    } catch (err) {
      setError(err.message || 'Import failed');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.5)', zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: isMobile ? '16px' : '32px'
    }}>
      <div style={{
        background: '#FFFFFF', borderRadius: '16px', width: '100%',
        maxWidth: '560px', maxHeight: '85vh', overflowY: 'auto',
        boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
        display: 'flex', flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px', borderBottom: `1px solid ${VISUAL_THEME.border}`,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: VISUAL_THEME.text }}>
              📤 Import Tasks
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: '12px', color: VISUAL_THEME.textSec }}>
              CSV ya JSON file upload karo — same format as export
            </p>
          </div>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', fontSize: '20px',
            cursor: 'pointer', color: VISUAL_THEME.textSec, padding: '4px'
          }}>✕</button>
        </div>

        {/* Body */}
        <div style={{ padding: '24px', flex: 1 }}>

          {/* Import Result Success */}
          {importResult && (
            <div style={{
              background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '12px',
              padding: '16px 20px', marginBottom: '16px', textAlign: 'center'
            }}>
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>✅</div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#059669' }}>
                {importResult.count} Tasks Successfully Imported!
              </div>
              <p style={{ fontSize: '12px', color: '#10B981', margin: '6px 0 0' }}>
                Sab tasks aapke dashboard mein add ho gaye hain
              </p>
              <button onClick={onClose} style={{
                marginTop: '12px', padding: '10px 24px', background: '#059669',
                color: '#FFF', border: 'none', borderRadius: '8px', fontSize: '13px',
                fontWeight: 600, cursor: 'pointer'
              }}>
                Dashboard pe jaao →
              </button>
            </div>
          )}

          {/* Error */}
          {error && (
            <div style={{
              background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '10px',
              padding: '12px 16px', marginBottom: '16px', fontSize: '13px',
              color: '#DC2626', fontWeight: 500
            }}>
              ❌ {error}
            </div>
          )}

          {/* Drop Zone */}
          {!parsedTasks && !importResult && (
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: `2px dashed ${dragOver ? VISUAL_THEME.accent : VISUAL_THEME.border}`,
                borderRadius: '14px',
                padding: '40px 24px',
                textAlign: 'center',
                cursor: 'pointer',
                background: dragOver ? 'rgba(99, 102, 241, 0.04)' : '#FAFAFA',
                transition: 'all 0.2s'
              }}
            >
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>📁</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: VISUAL_THEME.text, marginBottom: '6px' }}>
                File drag & drop karo ya click karo
              </div>
              <div style={{ fontSize: '12px', color: VISUAL_THEME.textSec }}>
                Supported: .csv, .json
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.json"
                onChange={handleFileInput}
                style={{ display: 'none' }}
              />
            </div>
          )}

          {/* Format Guide */}
          {!parsedTasks && !importResult && (
            <div style={{
              marginTop: '16px', background: '#F8FAFC', borderRadius: '10px',
              padding: '14px 16px', border: `1px solid ${VISUAL_THEME.borderAlt}`
            }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: VISUAL_THEME.textSec, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                📋 File Format Guide
              </div>
              <div style={{ fontSize: '12px', color: VISUAL_THEME.textSec, lineHeight: '1.6' }}>
                <strong>CSV Headers:</strong> Title, Description, Category, Subcategory, Priority, Status, Type, Deadline, Time<br />
                <strong>JSON:</strong> Array of objects with same fields<br />
                <strong>Tip:</strong> Pehle Export karo, usi file mein apne tasks add karo, phir Import karo!
              </div>
            </div>
          )}

          {/* Preview Table */}
          {parsedTasks && !importResult && (
            <div>
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                marginBottom: '12px'
              }}>
                <div style={{ fontSize: '14px', fontWeight: 600, color: VISUAL_THEME.text }}>
                  📋 Preview — {parsedTasks.length} task{parsedTasks.length > 1 ? 's' : ''} found
                </div>
                <button onClick={() => { setParsedTasks(null); setError(''); }} style={{
                  background: 'none', border: 'none', fontSize: '12px',
                  color: VISUAL_THEME.accent, cursor: 'pointer', fontWeight: 600
                }}>
                  ← Change file
                </button>
              </div>

              <div style={{
                maxHeight: '280px', overflowY: 'auto', borderRadius: '10px',
                border: `1px solid ${VISUAL_THEME.border}`
              }}>
                {parsedTasks.map((task, idx) => (
                  <div key={idx} style={{
                    padding: '10px 14px',
                    borderBottom: idx < parsedTasks.length - 1 ? `1px solid ${VISUAL_THEME.borderAlt}` : 'none',
                    display: 'flex', alignItems: 'center', gap: '10px',
                    fontSize: '13px'
                  }}>
                    <span style={{
                      width: '22px', height: '22px', borderRadius: '6px',
                      background: '#EEF2FF', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontSize: '10px', fontWeight: 700,
                      color: VISUAL_THEME.accent, flexShrink: 0
                    }}>
                      {idx + 1}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontWeight: 600, color: VISUAL_THEME.text,
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                      }}>
                        {task.title}
                      </div>
                      <div style={{ fontSize: '11px', color: VISUAL_THEME.textSec, marginTop: '2px' }}>
                        {task.category} • {task.subcategory} • {task.deadline || 'No date'}
                      </div>
                    </div>
                    <span style={{
                      fontSize: '11px', fontWeight: 600, padding: '2px 8px',
                      borderRadius: '4px',
                      background: PRIORITY_CONFIG[task.priority]?.bg || '#FEF3C7',
                      color: PRIORITY_CONFIG[task.priority]?.color || '#D97706'
                    }}>
                      {task.priority}
                    </span>
                  </div>
                ))}
              </div>

              {/* Import Button */}
              <button
                onClick={handleImport}
                disabled={importing}
                style={{
                  width: '100%', marginTop: '16px', padding: '14px',
                  background: importing ? '#A5B4FC' : VISUAL_THEME.accent,
                  color: '#FFFFFF', border: 'none', borderRadius: '10px',
                  fontSize: '14px', fontWeight: 700, cursor: importing ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                }}
              >
                {importing ? (
                  <>⏳ Importing...</>
                ) : (
                  <>📤 Import {parsedTasks.length} Task{parsedTasks.length > 1 ? 's' : ''}</>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
