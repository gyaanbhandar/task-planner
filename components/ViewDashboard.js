'use client';
import React, { useMemo, useState, useEffect } from 'react';
import { VISUAL_THEME, CATEGORIES } from '../constants/taskConstants';
import { todayStr } from '../utils/dateUtils';

/*
  ViewDashboard — "Overview" (AnuTask Overview Dashboard).

  Single source of truth for deadline status lives in classify() below.
  Every consumer on this screen — the 5 summary cards, the main filter
  list, the donut chart, Today's Agenda, Next 7 Days and the calendar
  markers — derives from that same function, so counts never disagree.

  Statuses are mutually exclusive for incomplete tasks:
    overdue · due_today · due_soon · upcoming · none
  Completed ('done') and trashed tasks are already excluded upstream
  (taskService.fetchTasks drops 'trashed'); we drop 'done' here so no
  completed task is ever counted as pending.

  Dates are stored date-only (YYYY-MM-DD) with a separate 12-hour `time`
  string ("5:00 PM"). All day math uses the device-local calendar day
  (todayStr), which for this account is Asia/Kolkata.
*/

const PER_PAGE = 4;          // Tasks Needing Attention rows per page
const PANEL_PER_PAGE = 4;    // Today's Agenda rows per page

// Fixed card heights (desktop) so the grid never shifts between filters/pages.
const TASKS_CARD_H = 318;
const BOTTOM_H     = 228;
const CALENDAR_H   = 318;
const PANEL_H      = 228;

// ---- date / time helpers -------------------------------------
const parseDate = (d) => { if (!d) return null; const dt = new Date(d + 'T00:00:00'); return isNaN(dt.getTime()) ? null : dt; };
// Whole-day difference between a deadline date and today's local date.
const dayDiff = (deadline) => {
  const dt = parseDate(deadline);
  if (!dt) return null;
  const today = new Date(todayStr() + 'T00:00:00');
  return Math.round((dt - today) / 86400000);
};
// Convert a 12-hour "h:mm AM/PM" string to minutes since midnight (null if unparseable).
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

// ---- THE single classification function ----------------------
// Returns one of: 'overdue' | 'due_today' | 'due_soon' | 'upcoming' | 'none'
const classify = (task) => {
  const n = dayDiff(task.deadline);
  if (n === null) return 'none';
  if (n < 0) return 'overdue';                       // deadline day already passed
  if (n === 0) {                                      // deadline is today's calendar day
    const dueMin = timeToMinutes(task.time);
    // A timed task becomes overdue only once its specific time has passed.
    // A date-only task (no parseable time) stays due_today all day.
    if (dueMin !== null && nowMinutes() > dueMin) return 'overdue';
    return 'due_today';
  }
  if (n <= 3) return 'due_soon';                      // within the next 1–3 local days
  return 'upcoming';                                  // more than 3 days away
};

// Urgency rank for default sorting (lower = more urgent).
const urgencyRank = (task) => {
  const s = classify(task);
  const order = { overdue: 0, due_today: 1, due_soon: 2, upcoming: 3, none: 4 };
  const base = order[s] * 100000;
  const n = dayDiff(task.deadline);
  if (s === 'overdue') return base + (1000 + (n ?? 0)); // more overdue first (n more negative)
  if (s === 'due_today') return base + (timeToMinutes(task.time) ?? 1440); // earlier time first
  if (n === null) return base;
  return base + n;
};

// ---- labels / formatting -------------------------------------
const prettyDate = (d) => { const dt = parseDate(d); if (!dt) return 'No date'; return dt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }); };
// Badge text per the brief's suggested formats.
const badgeText = (task) => {
  const s = classify(task);
  const n = dayDiff(task.deadline);
  if (s === 'none') return 'No deadline';
  if (s === 'overdue') {
    if (n === 0) return `Overdue · ${task.time || 'today'}`;           // timed task past its time today
    const d = Math.abs(n);
    return `${d} day${d !== 1 ? 's' : ''} overdue`;
  }
  if (s === 'due_today') return task.time ? `Due today · ${task.time}` : 'Due today';
  if (s === 'due_soon') return n === 1 ? 'Due tomorrow' : `Due in ${n} days`;
  return prettyDate(task.deadline);                                    // upcoming → absolute date
};

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

// Status palette (accessible text on tinted backgrounds).
const STATUS = {
  overdue:   { label: 'Overdue',     sub: 'Past deadline',   color: '#DC2626', soft: '#FEF2F2', ring: '#FEE2E2', icon: '⏰' },
  due_today: { label: 'Due Today',   sub: 'Due before end of day', color: '#EA580C', soft: '#FFF7ED', ring: '#FFEDD5', icon: '📌' },
  due_soon:  { label: 'Due Soon',    sub: 'Within 3 days',   color: '#D97706', soft: '#FFFBEB', ring: '#FEF3C7', icon: '⚡' },
  upcoming:  { label: 'Upcoming',    sub: 'More than 3 days', color: '#6366F1', soft: '#EEF2FF', ring: '#E0E7FF', icon: '📅' },
  none:      { label: 'No Deadline', sub: 'No date set',     color: '#64748B', soft: '#F8FAFC', ring: '#E2E8F0', icon: '○' },
};
const ORDER = ['overdue', 'due_today', 'due_soon', 'upcoming', 'none'];

const catOf = (task, cc) => { const list = (cc && cc.length ? cc : CATEGORIES); return list.find(c => c.id === task.category) || null; };

export default function ViewDashboard({
  tasks = [], handleToggleStatus, onSelectDetail, isMobile,
  userName, userFullName, formatIndianDate, onNewTask, onViewChange, customCategories,
}) {
  const [filter, setFilter] = useState('all');   // all | overdue | due_today | due_soon | upcoming | none
  const [page, setPage] = useState(0);
  const [panelPage, setPanelPage] = useState(0);
  const [calMonth, setCalMonth] = useState(() => { const d = new Date(todayStr() + 'T00:00:00'); return { y: d.getFullYear(), m: d.getMonth() }; });
  const [hoverId, setHoverId] = useState(null);

  useEffect(() => { setPage(0); }, [filter]);

  const cleanName = userFullName || (userName ? (userName.split('@')[0].charAt(0).toUpperCase() + userName.split('@')[0].slice(1)) : 'User');
  const getGreeting = () => { const hr = new Date().getHours(); if (hr < 12) return 'Good morning'; if (hr < 17) return 'Good afternoon'; if (hr < 22) return 'Good evening'; return 'Hey, Night owl'; };

  // Incomplete tasks only (already excludes trashed upstream). This is the
  // ONE dataset every widget below classifies.
  const pending = useMemo(() => tasks.filter(t => t.status !== 'done' && t.status !== 'trashed'), [tasks]);

  // Classify once, reuse everywhere.
  const classified = useMemo(() => pending.map(t => ({ task: t, status: classify(t) })), [pending]);
  const counts = useMemo(() => {
    const c = { overdue: 0, due_today: 0, due_soon: 0, upcoming: 0, none: 0 };
    classified.forEach(({ status }) => { c[status] += 1; });
    return c;
  }, [classified]);
  const totalPending = pending.length;

  // Main list, sorted by urgency, then narrowed by the active filter.
  const sortedPending = useMemo(() => [...pending].sort((a, b) => urgencyRank(a) - urgencyRank(b)), [pending]);
  const fullList = useMemo(() => {
    if (filter === 'all') return sortedPending;
    return sortedPending.filter(t => classify(t) === filter);
  }, [filter, sortedPending]);

  const totalPages = Math.max(1, Math.ceil(fullList.length / PER_PAGE));
  const safePage = Math.min(page, totalPages - 1);
  const cardList = fullList.slice(safePage * PER_PAGE, safePage * PER_PAGE + PER_PAGE);

  // Donut — same classification, safe when empty.
  const donut = useMemo(() => {
    const total = totalPending || 1; let acc = 0;
    return ORDER.map(k => { const value = counts[k]; const frac = value / total; const seg = { key: k, value, start: acc, end: acc + frac, color: STATUS[k].color }; acc += frac; return seg; });
  }, [counts, totalPending]);

  // Next 7 days — count each task against exactly one local date.
  const next7 = useMemo(() => {
    const rows = [];
    for (let i = 0; i < 7; i++) {
      const dt = new Date(todayStr() + 'T00:00:00'); dt.setDate(dt.getDate() + i);
      const iso = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
      const count = pending.filter(t => t.deadline === iso).length;
      const label = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : dt.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
      rows.push({ iso, label, count, isToday: i === 0 });
    }
    return rows;
  }, [pending]);

  // Calendar markers from real pending data.
  const calendar = useMemo(() => {
    const first = new Date(calMonth.y, calMonth.m, 1);
    const daysInMonth = new Date(calMonth.y, calMonth.m + 1, 0).getDate();
    let startDow = (first.getDay() + 6) % 7; // Monday-first
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
        taskCount: dayTasks.length,
      });
    }
    return cells;
  }, [calMonth, pending]);

  // Today's Agenda — ONLY tasks whose due-date calendar day is today (overdue-by-time items
  // from earlier today may remain, with an accurate badge). Not the full overdue list.
  const agendaFull = useMemo(() => {
    return sortedPending.filter(t => dayDiff(t.deadline) === 0);
  }, [sortedPending]);
  const panelTotalPages = Math.max(1, Math.ceil(agendaFull.length / PANEL_PER_PAGE));
  const safePanelPage = Math.min(panelPage, panelTotalPages - 1);
  const agenda = agendaFull.slice(safePanelPage * PANEL_PER_PAGE, safePanelPage * PANEL_PER_PAGE + PANEL_PER_PAGE);

  const card = { background: '#FFFFFF', borderRadius: '14px', border: `1px solid #EAECF0`, boxShadow: '0 1px 2px rgba(16,24,40,0.04)', boxSizing: 'border-box' };
  const ROW_H = 44;
  const LIST_H = PER_PAGE * ROW_H;

  const Pager = ({ cur, total, onPrev, onNext, label }) => {
    if (total <= 1) return null;
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px', marginTop: '10px', paddingTop: '10px', borderTop: `1px solid #F2F4F7` }}>
        <button onClick={onPrev} disabled={cur === 0} aria-label={`Previous ${label} page`} style={{ ...pagerBtn, opacity: cur === 0 ? 0.4 : 1, cursor: cur === 0 ? 'default' : 'pointer' }}>‹</button>
        <span style={{ fontSize: '11.5px', color: '#667085', fontWeight: 600, ...NUM, minWidth: '34px', textAlign: 'center' }}>{cur + 1} / {total}</span>
        <button onClick={onNext} disabled={cur >= total - 1} aria-label={`Next ${label} page`} style={{ ...pagerBtn, opacity: cur >= total - 1 ? 0.4 : 1, cursor: cur >= total - 1 ? 'default' : 'pointer' }}>›</button>
      </div>
    );
  };

  // ================= Tasks Needing Attention =================
  const FILTERS = [
    { id: 'all',       label: 'All Pending', n: totalPending },
    { id: 'overdue',   label: 'Overdue',     n: counts.overdue },
    { id: 'due_today', label: 'Due Today',   n: counts.due_today },
    { id: 'due_soon',  label: 'Due Soon',    n: counts.due_soon },
    { id: 'upcoming',  label: 'Upcoming',    n: counts.upcoming },
    { id: 'none',      label: 'No Deadline', n: counts.none },
  ];

  const TasksCard = (
    <div style={{ ...card, padding: '16px 18px', height: isMobile ? 'auto' : TASKS_CARD_H, display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: '10px' }}>
        <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#101828', margin: 0, letterSpacing: '-0.2px' }}>Tasks Needing Attention</h2>
        <p style={{ fontSize: '11.5px', color: '#98A2B3', margin: '2px 0 0 0', ...NUM }}>
          {totalPending} open · {counts.overdue} overdue · {counts.due_today} due today
        </p>
      </div>

      {/* Filter chips */}
      <div role="tablist" aria-label="Task filters" style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' }}>
        {FILTERS.map(f => {
          const active = filter === f.id;
          return (
            <button key={f.id} role="tab" aria-selected={active} onClick={() => setFilter(f.id)} style={{
              padding: '5px 10px', borderRadius: '8px', cursor: 'pointer', fontSize: '11.5px', fontWeight: 600, whiteSpace: 'nowrap',
              border: `1px solid ${active ? VISUAL_THEME.accent : '#EAECF0'}`,
              background: active ? '#EEF2FF' : '#FFFFFF',
              color: active ? VISUAL_THEME.accent : '#667085',
              transition: 'all 0.12s',
            }}>
              {f.label}<span style={{ ...NUM, marginLeft: '5px', fontWeight: 700, color: active ? VISUAL_THEME.accent : '#98A2B3' }}>{f.n}</span>
            </button>
          );
        })}
      </div>

      <div style={{ flex: 1, minHeight: isMobile ? 'auto' : LIST_H, display: 'flex', flexDirection: 'column' }}>
        {fullList.length === 0 ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#ECFDF3', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px', fontSize: '17px', color: '#12B76A' }}>✓</div>
            <p style={{ fontSize: '13.5px', fontWeight: 600, color: '#101828', margin: '0 0 2px 0' }}>Nothing in this view</p>
            <p style={{ fontSize: '12px', color: '#98A2B3', margin: 0 }}>All caught up here.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {cardList.map((t, idx) => {
              const s = classify(t);
              const st = STATUS[s];
              const cat = catOf(t, customCategories);
              const hov = hoverId === t.id;
              return (
                <div key={t.id}
                  onMouseEnter={() => setHoverId(t.id)} onMouseLeave={() => setHoverId(null)}
                  style={{ display: 'flex', alignItems: isMobile ? 'flex-start' : 'center', gap: '11px', height: isMobile ? 'auto' : ROW_H, padding: isMobile ? '9px 8px' : '0 8px', margin: '0 -8px',
                    borderRadius: '8px', background: hov && !isMobile ? '#F9FAFB' : 'transparent', transition: 'background 0.12s' }}>
                  <input type="checkbox" checked={t.status === 'done'} aria-label={`Mark "${t.title}" complete`}
                    onChange={(e) => { e.stopPropagation(); handleToggleStatus && handleToggleStatus(t.id, t.status); }}
                    style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: VISUAL_THEME.accent, flexShrink: 0, marginTop: isMobile ? '2px' : 0 }} />
                  <div style={{ flex: 1, minWidth: 0, cursor: onSelectDetail ? 'pointer' : 'default' }} onClick={() => onSelectDetail && onSelectDetail(t)}>
                    <div title={t.title} style={{ fontSize: '13px', fontWeight: 500, color: '#101828', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</div>
                    {isMobile && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '5px', flexWrap: 'wrap' }}>
                        <span style={pillDeadline(st)}><span style={dot(st.color)} />{badgeText(t)}</span>
                        {cat && <span style={pillCat()}>{cat.name}</span>}
                      </div>
                    )}
                  </div>
                  {!isMobile && (
                    <span style={pillDeadline(st)}><span style={dot(st.color)} />{badgeText(t)}</span>
                  )}
                  {cat && !isMobile && <span style={{ ...pillCat(), width: '96px', justifyContent: 'center' }}>{cat.name}</span>}
                </div>
              );
            })}
          </div>
        )}
      </div>
      {fullList.length > 0 && (
        <Pager cur={safePage} total={totalPages} label="task" onPrev={() => setPage(p => Math.max(0, p - 1))} onNext={() => setPage(p => Math.min(totalPages - 1, p + 1))} />
      )}
    </div>
  );

  // ================= Deadline Overview (donut) =================
  const DonutCard = (
    <div style={{ ...card, padding: '16px 18px', height: isMobile ? 'auto' : BOTTOM_H, display: 'flex', flexDirection: 'column' }}>
      <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#101828', margin: 0, letterSpacing: '-0.2px' }}>Deadline Overview</h3>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '16px', marginTop: '6px' }}>
        <Donut segments={donut} total={totalPending} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '7px', flex: 1, minWidth: '140px' }}>
          {ORDER.map(k => (
            <button key={k} onClick={() => setFilter(k === 'all' ? 'all' : k)} aria-label={`Filter ${STATUS[k].label}`}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', background: 'transparent', border: 'none', padding: '1px 0', cursor: 'pointer', textAlign: 'left' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '3px', background: STATUS[k].color }} />
                <span style={{ fontSize: '12px', color: '#475467' }}>{STATUS[k].label}</span>
              </span>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#101828', ...NUM }}>
                {counts[k]} <span style={{ color: '#98A2B3', fontWeight: 500 }}>· {totalPending ? Math.round((counts[k] / totalPending) * 100) : 0}%</span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  // ================= Next 7 Days =================
  const Next7Card = (
    <div style={{ ...card, padding: '16px 18px', height: isMobile ? 'auto' : BOTTOM_H, display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#101828', margin: 0, letterSpacing: '-0.2px' }}>Next 7 Days</h3>
        {onViewChange && (<button onClick={() => onViewChange('upcoming', null, null)} style={{ background: 'transparent', border: 'none', color: VISUAL_THEME.accent, fontSize: '11.5px', fontWeight: 600, cursor: 'pointer', padding: 0 }}>View all</button>)}
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', marginTop: '4px' }}>
        {next7.map((r, i) => (
          <div key={r.iso} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0', borderTop: i === 0 ? 'none' : `1px solid #F2F4F7` }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: r.count > 0 ? (r.isToday ? VISUAL_THEME.accent : '#98A2B3') : '#EAECF0', flexShrink: 0 }} />
              <span style={{ fontSize: '12.5px', fontWeight: r.isToday ? 600 : 400, color: r.isToday ? '#101828' : '#475467' }}>{r.label}</span>
            </span>
            <span style={{ fontSize: '12px', fontWeight: r.count > 0 ? 600 : 400, color: r.count > 0 ? '#101828' : '#98A2B3', ...NUM }}>{r.count} task{r.count !== 1 ? 's' : ''}</span>
          </div>
        ))}
      </div>
    </div>
  );

  // ================= Calendar =================
  const CalendarCard = (
    <div style={{ ...card, padding: '16px', height: isMobile ? 'auto' : CALENDAR_H, display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#101828', margin: 0, letterSpacing: '-0.2px' }}>Calendar</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button onClick={() => setCalMonth(p => { const m = p.m - 1; return m < 0 ? { y: p.y - 1, m: 11 } : { y: p.y, m }; })} aria-label="Previous month" style={calNavBtn}>‹</button>
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#101828', minWidth: '74px', textAlign: 'center', ...NUM }}>{MONTHS[calMonth.m].slice(0, 3)} {calMonth.y}</span>
          <button onClick={() => setCalMonth(p => { const m = p.m + 1; return m > 11 ? { y: p.y + 1, m: 0 } : { y: p.y, m }; })} aria-label="Next month" style={calNavBtn}>›</button>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', marginBottom: '4px' }}>
        {['M','T','W','T','F','S','S'].map((d, i) => (
          <div key={i} style={{ textAlign: 'center', fontSize: '10px', fontWeight: 600, color: '#98A2B3', padding: '2px 0' }}>{d}</div>
        ))}
      </div>
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gridAutoRows: '1fr', gap: '2px' }}>
        {calendar.map((c, i) => {
          if (!c) return <div key={`e${i}`} />;
          const color = c.isToday ? '#FFFFFF' : c.isOverdue ? STATUS.overdue.color : c.isDue ? STATUS.due_soon.color : '#101828';
          const clickable = c.taskCount > 0 && onViewChange;
          return (
            <button key={c.iso} title={c.taskCount ? `${c.taskCount} task${c.taskCount !== 1 ? 's' : ''} on ${c.iso}` : ''}
              onClick={clickable ? () => onViewChange('calendar', null, null) : undefined}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative',
                borderRadius: '8px', border: 'none', background: c.isToday ? VISUAL_THEME.accent : 'transparent',
                boxShadow: c.isToday ? '0 2px 6px rgba(99,102,241,0.35)' : 'none',
                fontSize: '11.5px', fontWeight: c.isToday ? 700 : 500, color, cursor: clickable ? 'pointer' : 'default', ...NUM }}>
              {c.d}
              {c.taskCount > 0 && !c.isToday && (
                <span style={{ position: 'absolute', bottom: '3px', width: '4px', height: '4px', borderRadius: '50%', background: c.isOverdue ? STATUS.overdue.color : c.isDue ? STATUS.due_soon.color : VISUAL_THEME.accent }} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );

  // ================= Today's Agenda =================
  const TodayPanelCard = (
    <div style={{ ...card, padding: '16px', height: isMobile ? 'auto' : PANEL_H, display: 'flex', flexDirection: 'column' }}>
      <h3 style={{ fontSize: '13.5px', fontWeight: 700, color: '#101828', margin: '0 0 10px 0', letterSpacing: '-0.2px' }}>
        Today&apos;s Agenda <span style={{ color: '#98A2B3', fontWeight: 500, ...NUM }}>· {new Date(todayStr() + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
      </h3>
      {agendaFull.length === 0 ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <p style={{ fontSize: '12.5px', color: '#475467', margin: '0 0 8px 0' }}>Nothing due today.</p>
          {onViewChange && (
            <button onClick={() => onViewChange('upcoming', null, null)} style={{ alignSelf: 'flex-start', background: 'transparent', border: 'none', color: VISUAL_THEME.accent, fontSize: '12px', fontWeight: 600, cursor: 'pointer', padding: 0 }}>View upcoming tasks →</button>
          )}
        </div>
      ) : (
        <>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {agenda.map(t => {
              const s = classify(t);
              const dotColor = s === 'overdue' ? STATUS.overdue.color : STATUS.due_today.color;
              const sub = badgeText(t);
              const cat = catOf(t, customCategories);
              return (
                <div key={t.id} style={{ display: 'flex', gap: '9px', cursor: onSelectDetail ? 'pointer' : 'default' }} onClick={() => onSelectDetail && onSelectDetail(t)}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: dotColor, marginTop: '5px', flexShrink: 0 }} />
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div title={t.title} style={{ fontSize: '12.5px', fontWeight: 500, color: '#101828', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</div>
                    <div style={{ fontSize: '11px', color: s === 'overdue' ? STATUS.overdue.color : '#98A2B3', fontWeight: s === 'overdue' ? 600 : 400 }}>
                      {sub}{cat ? ` · ${cat.name}` : ''}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <Pager cur={safePanelPage} total={panelTotalPages} label="agenda" onPrev={() => setPanelPage(p => Math.max(0, p - 1))} onNext={() => setPanelPage(p => Math.min(panelTotalPages - 1, p + 1))} />
        </>
      )}
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', boxSizing: 'border-box', maxWidth: '100%' }}>

      {/* Greeting */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: 700, color: '#101828', margin: '0 0 3px 0', letterSpacing: '-0.6px' }}>
            {getGreeting()}, {cleanName}
          </h1>
          <p style={{ fontSize: '13px', color: '#667085', margin: 0 }}>
            {formatIndianDate ? formatIndianDate() : ''} <span style={{ color: '#98A2B3' }}>·</span> <span style={{ ...NUM, fontWeight: 500 }}>{totalPending}</span> pending
          </p>
        </div>
        {onNewTask && (
          <button onClick={onNewTask}
            style={{ background: VISUAL_THEME.accent, color: '#FFFFFF', border: 'none', padding: '9px 16px', borderRadius: '9px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', flexShrink: 0, boxShadow: '0 1px 2px rgba(99,102,241,0.3)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '15px', lineHeight: 1 }}>+</span> New Task
          </button>
        )}
      </div>

      {/* Five summary cards — clickable, each activates its filter */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(5, 1fr)', gap: isMobile ? '12px' : '12px' }}>
        {ORDER.map(k => {
          const st = STATUS[k];
          const active = filter === k;
          const pct = totalPending ? Math.round((counts[k] / totalPending) * 100) : 0;
          return (
            <button key={k} onClick={() => setFilter(k)} aria-pressed={active} aria-label={`${st.label}: ${counts[k]} tasks`}
              style={{ ...card, textAlign: 'left', cursor: 'pointer', padding: isMobile ? '13px' : '14px', position: 'relative', overflow: 'hidden',
                border: `1px solid ${active ? st.color : '#EAECF0'}`,
                boxShadow: active ? `0 0 0 1px ${st.color}` : '0 1px 2px rgba(16,24,40,0.04)',
                transition: 'box-shadow 0.12s, border-color 0.12s' }}>
              <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '3px', background: st.color }} />
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '6px' }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '26px', fontWeight: 800, color: '#101828', lineHeight: 1, letterSpacing: '-1px', ...NUM }}>{counts[k]}</div>
                  <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#101828', marginTop: '6px' }}>{st.label}</div>
                  <div style={{ fontSize: '10.5px', color: '#98A2B3', marginTop: '1px' }}>{st.sub}</div>
                </div>
                <span style={{ width: '30px', height: '30px', borderRadius: '9px', background: st.soft, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '14px' }}>{st.icon}</span>
              </div>
              <div style={{ marginTop: '11px', height: '3px', borderRadius: '3px', background: '#F2F4F7', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pct}%`, background: st.color, borderRadius: '3px' }} />
              </div>
            </button>
          );
        })}
      </div>

      {/* Master 2-column layout */}
      {isMobile ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {TasksCard}{CalendarCard}{TodayPanelCard}{DonutCard}{Next7Card}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 316px', gap: '16px', alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', minWidth: 0 }}>
            {TasksCard}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', alignItems: 'start' }}>
              {DonutCard}
              {Next7Card}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', minWidth: 0 }}>
            {CalendarCard}
            {TodayPanelCard}
          </div>
        </div>
      )}
    </div>
  );
}

// ---- shared styles -------------------------------------------
const NUM = { fontVariantNumeric: 'tabular-nums' };
const dot = (color) => ({ width: '5px', height: '5px', borderRadius: '50%', background: color, flexShrink: 0 });
const pillDeadline = (st) => ({ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 600, color: st.color, background: st.soft, padding: '3px 8px', borderRadius: '7px', whiteSpace: 'nowrap', flexShrink: 0, border: `1px solid ${st.ring}` });
const pillCat = () => ({ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 500, color: '#475467', background: '#F9FAFB', padding: '3px 9px', borderRadius: '7px', whiteSpace: 'nowrap', flexShrink: 0, border: '1px solid #EAECF0' });
const calNavBtn = { width: '24px', height: '24px', borderRadius: '7px', border: `1px solid #EAECF0`, background: '#FFFFFF', color: '#667085', cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, flexShrink: 0 };
const pagerBtn = { width: '26px', height: '24px', borderRadius: '7px', border: `1px solid #EAECF0`, background: '#FFFFFF', color: '#667085', fontSize: '13px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' };

function Donut({ segments, total }) {
  const size = 104, stroke = 15, r = (size - stroke) / 2, cx = size / 2, cy = size / 2;
  const circ = 2 * Math.PI * r;
  const hasData = total > 0 && segments.some(s => s.value > 0);
  const GAP = 0.012;
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }} role="img" aria-label={`${total} pending tasks by deadline`}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#F2F4F7" strokeWidth={stroke} />
        {hasData && segments.map(s => {
          if (s.value === 0) return null;
          const span = Math.max(0, (s.end - s.start) - GAP);
          const len = span * circ;
          return <circle key={s.key} cx={cx} cy={cy} r={r} fill="none" stroke={s.color} strokeWidth={stroke} strokeDasharray={`${len} ${circ - len}`} strokeDashoffset={-s.start * circ} strokeLinecap="round" />;
        })}
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: '21px', fontWeight: 800, color: '#101828', lineHeight: 1, letterSpacing: '-0.5px', fontVariantNumeric: 'tabular-nums' }}>{total}</div>
        <div style={{ fontSize: '10px', color: '#98A2B3', marginTop: '2px', fontWeight: 500 }}>Pending</div>
      </div>
    </div>
  );
}
