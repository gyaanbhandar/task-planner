'use client';
import React, { useMemo, useState, useEffect } from 'react';
import { VISUAL_THEME, CATEGORIES, PRIORITY_CONFIG } from '../constants/taskConstants';
import { todayStr } from '../utils/dateUtils';

/*
  ViewDashboard — "Overview" (AnuTask completion-focused dashboard).

  This screen is driven ENTIRELY by the real task list passed in `tasks`
  (which already excludes trashed tasks; it DOES include status==='done'
  so completion math works). Every widget derives from the helpers below,
  so no two numbers on the page can disagree.

  Sections (top → bottom), matching the product design:
    • 5 summary cards: Completed · Pending · Due Today · Due Soon · Upcoming
      each with a real week-over-week delta.
    • Task Progress: completion donut + 7-day activity bar chart.
    • Tasks Needing Attention: priority-sorted, filterable, paginated list.
    • Calendar (right), Today's Agenda (right), Recent Completions (right).
    • Weekly Goal progress + Daily Streak (bottom).

  Dates are stored date-only (YYYY-MM-DD) with a separate 12-hour `time`
  string ("5:00 PM"). All day math uses the device-local calendar day
  (todayStr), which for this account is Asia/Kolkata.
*/

// ---- date / time helpers -------------------------------------
const parseDate = (d) => { if (!d) return null; const dt = new Date(d + 'T00:00:00'); return isNaN(dt.getTime()) ? null : dt; };
const dayDiff = (deadline) => {
  const dt = parseDate(deadline);
  if (!dt) return null;
  const today = new Date(todayStr() + 'T00:00:00');
  return Math.round((dt - today) / 86400000);
};
const timeToMinutes = (time) => {
  if (!time) return null;
  const m = String(time).match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!m) return null;
  let h = parseInt(m[1], 10);
  const min = parseInt(m[2], 10);
  const p = m[3].toUpperCase();
  if (p === 'PM' && h < 12) h += 12;
  if (p === 'AM' && h === 12) h = 0;
  return h * 60 + min;
};
const nowMinutes = () => { const n = new Date(); return n.getHours() * 60 + n.getMinutes(); };

// Local YYYY-MM-DD from a Date.
const isoOf = (dt) => `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
// Local YYYY-MM-DD from a timestamp string (e.g. completed_at ISO).
const isoOfTs = (ts) => { if (!ts) return null; const d = new Date(ts); return isNaN(d.getTime()) ? null : isoOf(d); };

// Deadline status for an INCOMPLETE task.
// 'overdue' | 'due_today' | 'due_soon' | 'upcoming' | 'none'
const classify = (task) => {
  const n = dayDiff(task.deadline);
  if (n === null) return 'none';
  if (n < 0) return 'overdue';
  if (n === 0) {
    const dueMin = timeToMinutes(task.time);
    if (dueMin !== null && nowMinutes() > dueMin) return 'overdue';
    return 'due_today';
  }
  if (n <= 3) return 'due_soon';
  return 'upcoming';
};

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

// ---- palette -------------------------------------------------
const C = {
  green:  '#10B981', greenSoft: '#ECFDF5', greenRing: '#D1FAE5',
  red:    '#EF4444', redSoft:   '#FEF2F2', redRing:   '#FEE2E2',
  amber:  '#F59E0B', amberSoft: '#FFFBEB', amberRing: '#FEF3C7',
  blue:   '#3B82F6', blueSoft:  '#EFF6FF', blueRing:  '#DBEAFE',
  violet: '#8B5CF6', violetSoft:'#F5F3FF', violetRing:'#EDE9FE',
  ink: '#0F172A', sub: '#64748B', faint: '#94A3B8',
  line: '#EAECF0', line2: '#F1F5F9',
  accent: VISUAL_THEME.accent,
};

const catOf = (task, cc) => { const list = (cc && cc.length ? cc : CATEGORIES); return list.find(c => c.id === task.category) || null; };
const prettyBadge = (task) => {
  const n = dayDiff(task.deadline);
  if (n === null) return { text: 'No date', color: C.sub, soft: '#F8FAFC' };
  if (n < 0) return { text: `${Math.abs(n)}d overdue`, color: C.red, soft: C.redSoft };
  if (n === 0) return { text: 'Today', color: C.red, soft: C.redSoft };
  if (n === 1) return { text: 'Tomorrow', color: C.amber, soft: C.amberSoft };
  if (n <= 3) return { text: `In ${n} days`, color: C.amber, soft: C.amberSoft };
  const dt = parseDate(task.deadline);
  return { text: dt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }), color: C.blue, soft: C.blueSoft };
};

const PER_PAGE = 4;

export default function ViewDashboard({
  tasks = [], handleToggleStatus, onSelectDetail, isMobile,
  userName, userFullName, formatIndianDate, onNewTask, onViewChange, customCategories,
  weeklyGoalTarget = 25, onSearch,
}) {
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [sortMode, setSortMode] = useState('priority'); // priority | deadline
  const [calMonth, setCalMonth] = useState(() => { const d = new Date(todayStr() + 'T00:00:00'); return { y: d.getFullYear(), m: d.getMonth() }; });
  const [hoverId, setHoverId] = useState(null);
  const [query, setQuery] = useState('');

  useEffect(() => { setPage(0); }, [filter, sortMode]);

  const cleanName = userFullName || (userName ? (userName.split('@')[0].charAt(0).toUpperCase() + userName.split('@')[0].slice(1)) : 'User');
  const getGreeting = () => { const hr = new Date().getHours(); if (hr < 12) return 'Good morning'; if (hr < 17) return 'Good afternoon'; if (hr < 22) return 'Good evening'; return 'Hey, Night owl'; };

  // ---- partition ----------------------------------------------
  const active = useMemo(() => tasks.filter(t => t.status !== 'trashed'), [tasks]);
  const pending = useMemo(() => active.filter(t => t.status !== 'done'), [active]);
  const completed = useMemo(() => active.filter(t => t.status === 'done'), [active]);

  // ---- counts -------------------------------------------------
  const counts = useMemo(() => {
    const c = { completed: completed.length, pending: pending.length, due_today: 0, due_soon: 0, upcoming: 0, overdue: 0 };
    pending.forEach(t => { const s = classify(t); if (c[s] !== undefined) c[s] += 1; });
    return c;
  }, [pending, completed]);

  const totalTracked = active.length || 1;
  const completionPct = Math.round((completed.length / totalTracked) * 100);

  // ---- week-over-week deltas ----------------------------------
  // "This week" = Mon..today; "Last week" = the 7 days before this week's Monday.
  const weekBounds = useMemo(() => {
    const t = new Date(todayStr() + 'T00:00:00');
    const dow = (t.getDay() + 6) % 7; // Monday=0
    const thisMon = new Date(t); thisMon.setDate(t.getDate() - dow);
    const lastMon = new Date(thisMon); lastMon.setDate(thisMon.getDate() - 7);
    return { thisMon: isoOf(thisMon), lastMon: isoOf(lastMon), thisMonDate: thisMon, lastMonDate: lastMon };
  }, []);

  const deltas = useMemo(() => {
    const { thisMon, lastMon } = weekBounds;
    const inThis = (iso) => iso && iso >= thisMon;
    const inLast = (iso) => iso && iso >= lastMon && iso < thisMon;
    // completed: by completion date
    const compThis = completed.filter(t => inThis(isoOfTs(t.completed_at))).length;
    const compLast = completed.filter(t => inLast(isoOfTs(t.completed_at))).length;
    // created this/last week → approximates how "pending/upcoming" moved
    const createdThis = active.filter(t => inThis(isoOfTs(t.created_at))).length;
    const createdLast = active.filter(t => inLast(isoOfTs(t.created_at))).length;
    return {
      completed: compThis - compLast,
      pending: createdThis - createdLast,
    };
  }, [completed, active, weekBounds]);

  // ---- 7-day activity bars (Mon..Sun of current week) ---------
  const weekBars = useMemo(() => {
    const base = weekBounds.thisMonDate;
    const rows = [];
    for (let i = 0; i < 7; i++) {
      const dt = new Date(base); dt.setDate(base.getDate() + i);
      const iso = isoOf(dt);
      const done = completed.filter(t => isoOfTs(t.completed_at) === iso).length;
      const due = active.filter(t => t.deadline === iso).length;
      const total = Math.max(done, due, 0);
      rows.push({
        iso,
        done, total: total || done,
        isToday: iso === todayStr(),
        isFuture: iso > todayStr(),
        wd: dt.toLocaleDateString('en-IN', { weekday: 'short' }),
        dm: dt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      });
    }
    return rows;
  }, [completed, active, weekBounds]);
  const barMax = Math.max(1, ...weekBars.map(b => b.total));

  // ---- daily streak (consecutive days with ≥1 completion up to today) ----
  const streak = useMemo(() => {
    const doneDays = new Set(completed.map(t => isoOfTs(t.completed_at)).filter(Boolean));
    let count = 0;
    const cur = new Date(todayStr() + 'T00:00:00');
    // allow streak to count from today if done today, else from yesterday
    if (!doneDays.has(isoOf(cur))) cur.setDate(cur.getDate() - 1);
    while (doneDays.has(isoOf(cur))) { count += 1; cur.setDate(cur.getDate() - 1); }
    // last 7 weekday markers
    const week = [];
    const t = new Date(todayStr() + 'T00:00:00');
    const dow = (t.getDay() + 6) % 7;
    const mon = new Date(t); mon.setDate(t.getDate() - dow);
    for (let i = 0; i < 7; i++) {
      const d = new Date(mon); d.setDate(mon.getDate() + i);
      week.push({ label: d.toLocaleDateString('en-IN', { weekday: 'short' }), active: doneDays.has(isoOf(d)), isToday: isoOf(d) === todayStr(), isFuture: isoOf(d) > todayStr() });
    }
    return { count, week };
  }, [completed]);

  // ---- weekly goal (completed this week vs target) ------------
  const weekly = useMemo(() => {
    const done = completed.filter(t => isoOfTs(t.completed_at) >= weekBounds.thisMon).length;
    const target = weeklyGoalTarget || 25;
    const pct = Math.min(100, Math.round((done / target) * 100));
    const t = new Date(todayStr() + 'T00:00:00');
    const daysLeft = 6 - ((t.getDay() + 6) % 7);
    return { done, target, pct, daysLeft, remaining: Math.max(0, target - done) };
  }, [completed, weekBounds, weeklyGoalTarget]);

  // ---- recent completions -------------------------------------
  const recent = useMemo(() => {
    return [...completed]
      .filter(t => t.completed_at)
      .sort((a, b) => new Date(b.completed_at) - new Date(a.completed_at))
      .slice(0, 4)
      .map(t => ({ ...t, when: new Date(t.completed_at).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' }) }));
  }, [completed]);

  // ---- today's agenda (today's tasks, time-ordered) -----------
  const agenda = useMemo(() => {
    return pending
      .filter(t => t.deadline === todayStr())
      .sort((a, b) => (timeToMinutes(a.time) ?? 1440) - (timeToMinutes(b.time) ?? 1440))
      .slice(0, 5);
  }, [pending]);

  // ---- tasks needing attention --------------------------------
  const prioRank = (t) => ({ high: 0, medium: 1, low: 2 }[t.priority] ?? 3);
  const sorted = useMemo(() => {
    const arr = [...pending];
    if (sortMode === 'deadline') {
      arr.sort((a, b) => {
        const na = dayDiff(a.deadline), nb = dayDiff(b.deadline);
        return (na ?? 9999) - (nb ?? 9999);
      });
    } else {
      arr.sort((a, b) => prioRank(a) - prioRank(b) || (dayDiff(a.deadline) ?? 9999) - (dayDiff(b.deadline) ?? 9999));
    }
    return arr;
  }, [pending, sortMode]);

  const FILTERS = [
    { id: 'all', label: 'All Pending', n: counts.pending },
    { id: 'due_today', label: 'Due Today', n: counts.due_today },
    { id: 'due_soon', label: 'Due Soon', n: counts.due_soon },
    { id: 'overdue', label: 'Overdue', n: counts.overdue },
    { id: 'upcoming', label: 'Upcoming', n: counts.upcoming },
  ];
  const fullList = useMemo(() => filter === 'all' ? sorted : sorted.filter(t => classify(t) === filter), [filter, sorted]);
  const totalPages = Math.max(1, Math.ceil(fullList.length / PER_PAGE));
  const safePage = Math.min(page, totalPages - 1);
  const rows = fullList.slice(safePage * PER_PAGE, safePage * PER_PAGE + PER_PAGE);

  // ---- calendar -----------------------------------------------
  const calendar = useMemo(() => {
    const first = new Date(calMonth.y, calMonth.m, 1);
    const daysInMonth = new Date(calMonth.y, calMonth.m + 1, 0).getDate();
    const startDow = (first.getDay() + 6) % 7;
    const cells = [];
    for (let i = 0; i < startDow; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      const iso = `${calMonth.y}-${String(calMonth.m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayTasks = pending.filter(t => t.deadline === iso);
      const n = dayDiff(iso);
      cells.push({
        d, iso,
        isToday: iso === todayStr(),
        isOverdue: n !== null && n < 0 && dayTasks.length > 0,
        isDue: n !== null && n >= 0 && n <= 3 && dayTasks.length > 0,
        isWeekend: (new Date(iso + 'T00:00:00').getDay() + 6) % 7 >= 5,
        taskCount: dayTasks.length,
      });
    }
    return cells;
  }, [calMonth, pending]);

  // ============================================================
  // CARD DEFINITIONS
  // ============================================================
  const SUMMARY = [
    { key: 'completed', value: counts.completed, label: 'Completed', sub: `${completionPct}% of ${active.length} tasks`, color: C.green, soft: C.greenSoft, icon: '✓', delta: deltas.completed, foot: 'from last week' },
    { key: 'pending', value: counts.pending, label: 'Pending', sub: `${active.length ? Math.round((counts.pending / active.length) * 100) : 0}% of ${active.length} tasks`, color: C.red, soft: C.redSoft, icon: '◷', delta: deltas.pending, foot: 'from last week', invert: true },
    { key: 'due_today', value: counts.due_today, label: 'Due Today', sub: `${active.length ? Math.round((counts.due_today / active.length) * 100) : 0}% of total`, color: C.amber, soft: C.amberSoft, icon: '▣', tag: counts.due_today > 0 ? 'Action needed →' : 'All clear →', tagColor: C.amber },
    { key: 'due_soon', value: counts.due_soon, label: 'Due Soon', sub: 'Within 3 days', color: C.blue, soft: C.blueSoft, icon: '◷', tag: 'Plan ahead →', tagColor: C.blue },
    { key: 'upcoming', value: counts.upcoming, label: 'Upcoming', sub: 'More than 3 days', color: C.violet, soft: C.violetSoft, icon: '▣', tag: 'On track →', tagColor: C.violet },
  ];

  const cardBox = { background: '#FFFFFF', borderRadius: '16px', border: `1px solid ${C.line}`, boxShadow: '0 1px 2px rgba(16,24,40,0.04)', boxSizing: 'border-box' };

  // ---------- 5 summary cards ----------
  const SummaryCards = (
    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(5, 1fr)', gap: '14px' }}>
      {SUMMARY.map(s => {
        const deltaUp = (s.delta ?? 0) >= 0;
        const good = s.invert ? !deltaUp : deltaUp; // for Pending, going down is good
        return (
          <button key={s.key} onClick={() => s.key === 'completed' ? null : setFilter(s.key === 'pending' ? 'all' : s.key)}
            style={{ ...cardBox, textAlign: 'left', cursor: 'pointer', padding: '16px', background: s.soft, border: `1px solid ${s.soft}`, display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <span style={{ width: '34px', height: '34px', borderRadius: '11px', background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color, fontSize: '16px', fontWeight: 700, boxShadow: '0 1px 2px rgba(16,24,40,0.06)' }}>{s.icon}</span>
              <MiniSpark color={s.color} seed={s.value} />
            </div>
            <div>
              <div style={{ fontSize: '26px', fontWeight: 800, color: C.ink, lineHeight: 1, letterSpacing: '-1px', ...NUM }}>{s.value}</div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: C.ink, marginTop: '5px' }}>{s.label}</div>
              <div style={{ fontSize: '11px', color: C.sub, marginTop: '2px', ...NUM }}>{s.sub}</div>
            </div>
            {s.delta !== undefined ? (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 600, color: good ? '#059669' : '#DC2626', background: '#FFFFFF', padding: '4px 8px', borderRadius: '8px', alignSelf: 'flex-start', ...NUM }}>
                {deltaUp ? '▲' : '▼'} {deltaUp ? '+' : ''}{s.delta} {s.foot}
              </div>
            ) : (
              <div style={{ fontSize: '11px', fontWeight: 600, color: s.tagColor, background: '#FFFFFF', padding: '4px 8px', borderRadius: '8px', alignSelf: 'flex-start' }}>{s.tag}</div>
            )}
          </button>
        );
      })}
    </div>
  );

  // ---------- Task Progress (donut + bars) ----------
  const ProgressCard = (
    <div style={{ ...cardBox, padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 700, color: C.ink, margin: 0, letterSpacing: '-0.3px' }}>Task Progress</h2>
        <span style={{ fontSize: '12px', fontWeight: 600, color: C.sub, border: `1px solid ${C.line}`, borderRadius: '8px', padding: '6px 10px' }}>This Week ▾</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'auto 1fr', gap: '22px', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
          <ProgressDonut pct={completionPct} completed={completed.length} pending={counts.pending} total={active.length} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
            {[
              { c: C.green, label: 'Completed', n: counts.completed },
              { c: C.red, label: 'Pending', n: counts.pending },
              { c: C.amber, label: 'Due Today', n: counts.due_today },
              { c: C.blue, label: 'Due Soon', n: counts.due_soon },
              { c: C.violet, label: 'Upcoming', n: counts.upcoming },
            ].map(r => (
              <div key={r.label} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12.5px' }}>
                <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: r.c, flexShrink: 0 }} />
                <span style={{ color: C.sub, minWidth: isMobile ? '70px' : '78px' }}>{r.label}</span>
                <span style={{ fontWeight: 700, color: C.ink, ...NUM }}>{r.n}</span>
                <span style={{ color: C.faint, ...NUM }}>{active.length ? Math.round((r.n / active.length) * 100) : 0}%</span>
              </div>
            ))}
          </div>
        </div>
        {/* week bars */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: isMobile ? '6px' : '10px', height: '150px', paddingTop: '18px' }}>
          {weekBars.map(b => {
            const h = Math.round((b.total / barMax) * 108);
            const doneH = b.total > 0 ? Math.round((b.done / b.total) * h) : 0;
            const anyOverdue = b.total > b.done && b.iso < todayStr();
            const fill = anyOverdue ? C.red : C.green;
            return (
              <div key={b.iso} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '7px', minWidth: 0 }}>
                <span style={{ fontSize: '10.5px', fontWeight: 700, color: b.isToday ? C.ink : C.faint, ...NUM }}>{b.done}/{b.total}</span>
                <div title={`${b.done} of ${b.total} done`} style={{ width: isMobile ? '18px' : '24px', height: `${Math.max(h, 6)}px`, borderRadius: '7px', background: C.line2, position: 'relative', overflow: 'hidden', border: b.isToday ? `2px solid ${C.green}` : 'none' }}>
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: `${doneH}px`, background: fill, borderRadius: '7px' }} />
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '10.5px', fontWeight: 600, color: b.isToday ? C.ink : C.sub }}>{b.wd}</div>
                  <div style={{ fontSize: '9.5px', color: C.faint, ...NUM }}>{b.dm}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  // ---------- Tasks Needing Attention ----------
  const AttentionCard = (
    <div style={{ ...cardBox, padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '14px', gap: '10px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <span style={{ width: '30px', height: '30px', borderRadius: '9px', background: C.redSoft, color: C.red, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px', flexShrink: 0 }}>!</span>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: C.ink, margin: 0, letterSpacing: '-0.3px' }}>Tasks Needing Attention</h2>
            <p style={{ fontSize: '12px', color: C.faint, margin: '2px 0 0 0', ...NUM }}>{counts.pending} pending · {counts.due_today} due today · {counts.due_soon} due soon</p>
          </div>
        </div>
        <button onClick={() => setSortMode(m => m === 'priority' ? 'deadline' : 'priority')}
          style={{ fontSize: '12px', fontWeight: 600, color: C.sub, border: `1px solid ${C.line}`, borderRadius: '9px', padding: '7px 11px', background: '#FFFFFF', cursor: 'pointer' }}>
          ↕ {sortMode === 'priority' ? 'Priority' : 'Deadline'} ▾
        </button>
      </div>

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '14px' }}>
        {FILTERS.map(f => {
          const on = filter === f.id;
          return (
            <button key={f.id} onClick={() => setFilter(f.id)} style={{
              padding: '6px 12px', borderRadius: '9px', cursor: 'pointer', fontSize: '12px', fontWeight: 600, whiteSpace: 'nowrap',
              border: `1px solid ${on ? C.accent : C.line}`, background: on ? '#EEF2FF' : '#FFFFFF', color: on ? C.accent : C.sub,
            }}>
              {f.label}<span style={{ ...NUM, marginLeft: '6px', fontWeight: 700, background: on ? '#FFFFFF' : '#F1F5F9', color: on ? C.accent : C.faint, padding: '1px 6px', borderRadius: '6px' }}>{f.n}</span>
            </button>
          );
        })}
      </div>

      {fullList.length === 0 ? (
        <div style={{ padding: '34px 0', textAlign: 'center' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: C.greenSoft, color: C.green, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', marginBottom: '8px' }}>✓</div>
          <p style={{ fontSize: '14px', fontWeight: 600, color: C.ink, margin: '0 0 2px 0' }}>Nothing in this view</p>
          <p style={{ fontSize: '12px', color: C.faint, margin: 0 }}>All caught up here.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {rows.map(t => {
            const b = prettyBadge(t);
            const cat = catOf(t, customCategories);
            const prio = PRIORITY_CONFIG[t.priority] || PRIORITY_CONFIG.medium;
            const hov = hoverId === t.id;
            return (
              <div key={t.id} onMouseEnter={() => setHoverId(t.id)} onMouseLeave={() => setHoverId(null)}
                style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '11px 10px', margin: '0 -10px', borderRadius: '10px', background: hov && !isMobile ? '#F8FAFC' : 'transparent' }}>
                <input type="checkbox" checked={false} aria-label={`Complete ${t.title}`}
                  onChange={() => handleToggleStatus && handleToggleStatus(t.id, t.status)}
                  style={{ width: '17px', height: '17px', cursor: 'pointer', accentColor: C.accent, flexShrink: 0 }} />
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: prio.color, flexShrink: 0 }} title={`${prio.label} priority`} />
                <div style={{ flex: 1, minWidth: 0, cursor: onSelectDetail ? 'pointer' : 'default' }} onClick={() => onSelectDetail && onSelectDetail(t)}>
                  <div title={t.title} style={{ fontSize: '13.5px', fontWeight: 500, color: C.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</div>
                  {isMobile && (
                    <div style={{ display: 'flex', gap: '6px', marginTop: '5px', flexWrap: 'wrap' }}>
                      <span style={pill(b.color, b.soft)}>{b.text}</span>
                      {cat && <span style={pill(C.sub, '#F8FAFC')}>{cat.icon} {cat.name}</span>}
                    </div>
                  )}
                </div>
                {!isMobile && (
                  <>
                    <span style={{ ...pill(b.color, b.soft), width: '92px', justifyContent: 'center' }}><span style={{ width: '5px', height: '5px', borderRadius: '50%', background: b.color, marginRight: '5px' }} />{b.text}</span>
                    {cat && <span style={{ ...pill(C.sub, '#F8FAFC'), width: '112px', justifyContent: 'center' }}>{cat.icon} {cat.name}</span>}
                    <button onClick={() => onSelectDetail && onSelectDetail(t)} style={{ fontSize: '12px', fontWeight: 600, color: C.accent, border: `1px solid ${C.line}`, background: '#FFFFFF', borderRadius: '8px', padding: '6px 14px', cursor: 'pointer' }}>View</button>
                  </>
                )}
              </div>
            );
          })}
          {/* pager */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px', marginTop: '12px', paddingTop: '12px', borderTop: `1px solid ${C.line2}` }}>
            <span style={{ fontSize: '12px', color: C.sub, ...NUM }}>{fullList.length === 0 ? 0 : safePage * PER_PAGE + 1} – {Math.min(fullList.length, (safePage + 1) * PER_PAGE)} of {fullList.length}</span>
            <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={safePage === 0} style={{ ...navBtn, opacity: safePage === 0 ? 0.4 : 1 }}>‹</button>
            <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={safePage >= totalPages - 1} style={{ ...navBtn, opacity: safePage >= totalPages - 1 ? 0.4 : 1 }}>›</button>
          </div>
        </div>
      )}
    </div>
  );

  // ---------- Calendar ----------
  const CalendarCard = (
    <div style={{ ...cardBox, padding: '18px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 700, color: C.ink, margin: 0 }}>Calendar</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button onClick={() => setCalMonth(p => { const m = p.m - 1; return m < 0 ? { y: p.y - 1, m: 11 } : { y: p.y, m }; })} style={navBtn}>‹</button>
          <span style={{ fontSize: '13px', fontWeight: 600, color: C.ink, minWidth: '78px', textAlign: 'center', ...NUM }}>{MONTHS[calMonth.m].slice(0, 3)} {calMonth.y}</span>
          <button onClick={() => setCalMonth(p => { const m = p.m + 1; return m > 11 ? { y: p.y + 1, m: 0 } : { y: p.y, m }; })} style={navBtn}>›</button>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '3px', marginBottom: '6px' }}>
        {['M','T','W','T','F','S','S'].map((d, i) => (
          <div key={i} style={{ textAlign: 'center', fontSize: '11px', fontWeight: 600, color: C.faint }}>{d}</div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '3px' }}>
        {calendar.map((c, i) => {
          if (!c) return <div key={`e${i}`} />;
          const color = c.isToday ? '#FFFFFF' : c.isOverdue ? C.red : c.isWeekend ? '#CBD5E1' : C.ink;
          const clickable = c.taskCount > 0 && onViewChange;
          return (
            <button key={c.iso} title={c.taskCount ? `${c.taskCount} task(s)` : ''}
              onClick={clickable ? () => onViewChange('calendar', null, null) : undefined}
              style={{ aspectRatio: '1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', borderRadius: '9px', border: 'none', background: c.isToday ? C.accent : 'transparent', boxShadow: c.isToday ? '0 2px 6px rgba(99,102,241,0.35)' : 'none', fontSize: '12.5px', fontWeight: c.isToday ? 700 : 500, color, cursor: clickable ? 'pointer' : 'default', ...NUM }}>
              {c.d}
              {c.taskCount > 0 && !c.isToday && (
                <span style={{ position: 'absolute', bottom: '4px', width: '4px', height: '4px', borderRadius: '50%', background: c.isOverdue ? C.red : c.isDue ? C.amber : C.accent }} />
              )}
              {c.isToday && <span style={{ position: 'absolute', bottom: '4px', width: '4px', height: '4px', borderRadius: '50%', background: '#FFFFFF' }} />}
            </button>
          );
        })}
      </div>
    </div>
  );

  // ---------- Today's Agenda ----------
  const AgendaCard = (
    <div style={{ ...cardBox, padding: '18px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 700, color: C.ink, margin: 0 }}>☀️ Today&apos;s Agenda <span style={{ color: C.faint, fontWeight: 500, ...NUM }}>· {new Date(todayStr() + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span></h3>
        {onViewChange && <button onClick={() => onViewChange('today', null, null)} style={{ fontSize: '12px', fontWeight: 600, color: C.accent, background: 'transparent', border: 'none', cursor: 'pointer' }}>View all</button>}
      </div>
      {agenda.length === 0 ? (
        <p style={{ fontSize: '13px', color: C.sub, margin: 0 }}>Nothing scheduled for today. 🎉</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '13px' }}>
          {agenda.map(t => {
            const cat = catOf(t, customCategories);
            return (
              <div key={t.id} onClick={() => onSelectDetail && onSelectDetail(t)} style={{ display: 'flex', alignItems: 'center', gap: '11px', cursor: onSelectDetail ? 'pointer' : 'default' }}>
                <span style={{ fontSize: '11.5px', fontWeight: 600, color: C.sub, width: '58px', flexShrink: 0, ...NUM }}>{t.time || '—'}</span>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: cat ? cat.color : C.accent, flexShrink: 0 }} />
                <span title={t.title} style={{ flex: 1, minWidth: 0, fontSize: '13px', color: C.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</span>
                {cat && <span style={{ fontSize: '10.5px', fontWeight: 600, color: cat.color, background: cat.bg, padding: '3px 8px', borderRadius: '6px', flexShrink: 0 }}>{cat.name}</span>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  // ---------- Recent Completions ----------
  const RecentCard = (
    <div style={{ ...cardBox, padding: '18px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 700, color: C.ink, margin: 0 }}>✅ Recent Completions</h3>
        {onViewChange && <button onClick={() => onViewChange('all_tasks', null, null)} style={{ fontSize: '12px', fontWeight: 600, color: C.accent, background: 'transparent', border: 'none', cursor: 'pointer' }}>View all</button>}
      </div>
      {recent.length === 0 ? (
        <p style={{ fontSize: '13px', color: C.sub, margin: 0 }}>No completed tasks yet. Finish one to see it here.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {recent.map(t => (
            <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: '11px' }}>
              <span style={{ width: '18px', height: '18px', borderRadius: '50%', background: C.greenSoft, color: C.green, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', flexShrink: 0 }}>✓</span>
              <span title={t.title} style={{ flex: 1, minWidth: 0, fontSize: '13px', color: C.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</span>
              <span style={{ fontSize: '11px', color: C.faint, flexShrink: 0, ...NUM }}>{t.when}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // ---------- Weekly Goal ----------
  const GoalCard = (
    <div style={{ ...cardBox, padding: '18px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 700, color: C.ink, margin: 0 }}>🎯 Weekly Goal</h3>
        <span style={{ fontSize: '12px', fontWeight: 600, color: C.amber, ...NUM }}>{weekly.daysLeft} day{weekly.daysLeft !== 1 ? 's' : ''} left</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '8px' }}>
        <span style={{ fontSize: '22px', fontWeight: 800, color: C.ink, ...NUM }}>{weekly.done} / {weekly.target}</span>
        <span style={{ fontSize: '13px', color: C.sub }}>tasks</span>
      </div>
      <div style={{ height: '9px', borderRadius: '6px', background: C.line2, overflow: 'hidden', marginBottom: '8px' }}>
        <div style={{ height: '100%', width: `${weekly.pct}%`, background: `linear-gradient(90deg, ${C.green}, #34D399)`, borderRadius: '6px' }} />
      </div>
      <p style={{ fontSize: '12px', color: C.sub, margin: 0 }}>
        {weekly.remaining > 0 ? `🏆 You're ${weekly.remaining} task${weekly.remaining !== 1 ? 's' : ''} away from your weekly goal!` : '🎉 Weekly goal reached. Fantastic!'}
      </p>
    </div>
  );

  // ---------- Daily Streak ----------
  const StreakCard = (
    <div style={{ ...cardBox, padding: '18px' }}>
      <h3 style={{ fontSize: '15px', fontWeight: 700, color: C.ink, margin: '0 0 12px 0' }}>🔥 Daily Streak</h3>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: C.ink, lineHeight: 1, ...NUM }}>{streak.count} day{streak.count !== 1 ? 's' : ''}</div>
          <div style={{ fontSize: '12px', fontWeight: 600, color: C.amber, marginTop: '4px' }}>{streak.count > 0 ? 'Keep it up!' : 'Start today!'}</div>
        </div>
        <div style={{ display: 'flex', gap: '7px' }}>
          {streak.week.map((d, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontSize: '16px', opacity: d.active ? 1 : d.isFuture ? 0.25 : 0.4, filter: d.active ? 'none' : 'grayscale(1)' }}>🔥</span>
              <span style={{ fontSize: '10px', fontWeight: d.isToday ? 700 : 500, color: d.isToday ? C.ink : C.faint }}>{d.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ============================================================
  // LAYOUT
  // ============================================================
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', boxSizing: 'border-box', maxWidth: '100%' }}>

      {/* Greeting + search + new task */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h1 style={{ fontSize: isMobile ? '22px' : '28px', fontWeight: 800, color: C.ink, margin: '0 0 4px 0', letterSpacing: '-0.8px' }}>
            {getGreeting()}, {cleanName} 👋
          </h1>
          <p style={{ fontSize: '13.5px', color: C.sub, margin: 0 }}>
            {formatIndianDate ? formatIndianDate() : ''} <span style={{ color: C.faint }}>·</span> Stay consistent, great things take time.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {!isMobile && (
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: C.faint, fontSize: '14px' }}>🔍</span>
              <input
                value={query}
                onChange={(e) => { setQuery(e.target.value); onSearch && onSearch(e.target.value); }}
                placeholder="Search tasks, clients..."
                style={{ width: '280px', padding: '11px 14px 11px 36px', borderRadius: '11px', border: `1px solid ${C.line}`, background: '#FFFFFF', fontSize: '13px', color: C.ink, outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
          )}
          {onNewTask && (
            <button onClick={onNewTask} style={{ background: C.accent, color: '#FFFFFF', border: 'none', padding: '11px 18px', borderRadius: '11px', fontSize: '13.5px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 2px 8px rgba(99,102,241,0.35)', display: 'inline-flex', alignItems: 'center', gap: '7px' }}>
              <span style={{ fontSize: '16px', lineHeight: 1 }}>+</span> New Task
            </button>
          )}
        </div>
      </div>

      {SummaryCards}

      {/* Main two-column grid */}
      {isMobile ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {ProgressCard}{CalendarCard}{AttentionCard}{AgendaCard}{RecentCard}{GoalCard}{StreakCard}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 340px', gap: '18px', alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', minWidth: 0 }}>
            {ProgressCard}
            {AttentionCard}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' }}>
              {GoalCard}
              {StreakCard}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', minWidth: 0 }}>
            {CalendarCard}
            {AgendaCard}
            {RecentCard}
          </div>
        </div>
      )}
    </div>
  );
}

// ---- shared styles & small components ------------------------
const NUM = { fontVariantNumeric: 'tabular-nums' };
const pill = (color, soft) => ({ display: 'inline-flex', alignItems: 'center', fontSize: '11px', fontWeight: 600, color, background: soft, padding: '4px 9px', borderRadius: '7px', whiteSpace: 'nowrap', flexShrink: 0 });
const navBtn = { width: '28px', height: '28px', borderRadius: '8px', border: `1px solid #EAECF0`, background: '#FFFFFF', color: '#667085', cursor: 'pointer', fontSize: '14px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: 0, flexShrink: 0 };

function MiniSpark({ color, seed = 0 }) {
  // tiny deterministic sparkline, purely decorative (matches the image's corner chart)
  const bars = [0.4, 0.6, 0.35, 0.8, 0.55, 0.95].map((v, i) => Math.min(1, v + ((seed + i) % 3) * 0.04));
  return (
    <svg width="40" height="22" viewBox="0 0 40 22" aria-hidden="true">
      {bars.map((h, i) => (
        <rect key={i} x={i * 7} y={22 - h * 20} width="4.5" height={h * 20} rx="1.5" fill={color} opacity={0.35 + (i / bars.length) * 0.6} />
      ))}
    </svg>
  );
}

function ProgressDonut({ pct, completed, pending, total }) {
  const size = 150, stroke = 20, r = (size - stroke) / 2, cx = size / 2, cy = size / 2;
  const circ = 2 * Math.PI * r;
  const t = Math.max(completed + pending, 1);
  const compFrac = completed / t;
  const pendFrac = pending / t;
  const seg = (frac, offsetFrac, col) => {
    const len = Math.max(0, frac * circ - 3);
    return <circle cx={cx} cy={cy} r={r} fill="none" stroke={col} strokeWidth={stroke} strokeDasharray={`${len} ${circ - len}`} strokeDashoffset={-offsetFrac * circ} strokeLinecap="round" />;
  };
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }} role="img" aria-label={`${pct}% completed`}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#F1F5F9" strokeWidth={stroke} />
        {pending > 0 && seg(pendFrac, compFrac, '#EF4444')}
        {completed > 0 && seg(compFrac, 0, '#10B981')}
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: '30px', fontWeight: 800, color: '#0F172A', lineHeight: 1, letterSpacing: '-1px', ...NUM }}>{pct}%</div>
        <div style={{ fontSize: '12px', color: '#0F172A', marginTop: '3px', fontWeight: 600 }}>Completed</div>
        <div style={{ fontSize: '10.5px', color: '#94A3B8', marginTop: '1px', ...NUM }}>{completed} of {total} tasks</div>
      </div>
    </div>
  );
}
