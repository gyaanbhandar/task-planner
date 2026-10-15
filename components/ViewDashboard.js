'use client';
import React, { useMemo, useState } from 'react';
import { VISUAL_THEME, CATEGORIES } from '../constants/taskConstants';
import { todayStr } from '../utils/dateUtils';

/*
  ViewDashboard — "Overview" screen.
  Master 2-column layout (image-matched):
    LEFT  : Today's Tasks card  →  Deadline Overview donut  →  Next 7 Days
    RIGHT : Calendar month grid →  Today panel
  Both columns top-aligned; nothing overflows. AnuTask theme.
*/

// ---- date helpers --------------------------------------------
const parseDate = (d) => { if (!d) return null; const dt = new Date(d + 'T00:00:00'); return isNaN(dt.getTime()) ? null : dt; };
const diffDays = (deadline) => { const dt = parseDate(deadline); if (!dt) return null; const today = new Date(todayStr() + 'T00:00:00'); return Math.round((dt - today) / 86400000); };
const prettyDate = (d) => { const dt = parseDate(d); if (!dt) return 'No date'; return dt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }); };
const relLabel = (deadline) => {
  const n = diffDays(deadline);
  if (n === null) return 'No deadline';
  if (n < 0) return `${prettyDate(deadline)} (${Math.abs(n)}d overdue)`;
  if (n === 0) return 'Today';
  if (n === 1) return 'Tomorrow';
  return `${prettyDate(deadline)} (in ${n}d)`;
};
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const BUCKETS = {
  overdue:     { label: 'Overdue',     sub: 'Tasks past deadline',      color: '#EF4444', bg: '#FEF2F2', chart: '#EF4444', icon: '⏰' },
  due_soon:    { label: 'Due Soon',    sub: 'Next 3 days',              color: '#F59E0B', bg: '#FFFBEB', chart: '#F59E0B', icon: '⚡' },
  upcoming:    { label: 'Upcoming',    sub: 'After 3 days',             color: '#6366F1', bg: '#EEF2FF', chart: '#6366F1', icon: '📅' },
  no_deadline: { label: 'No Deadline', sub: 'Set a date to prioritize', color: '#94A3B8', bg: '#F8FAFC', chart: '#CBD5E1', icon: '➖' },
};

const catOf = (task, cc) => { const list = (cc && cc.length ? cc : CATEGORIES); return list.find(c => c.id === task.category) || null; };

export default function ViewDashboard({
  tasks = [], handleToggleStatus, onSelectDetail, isMobile,
  userName, userFullName, formatIndianDate, onNewTask, onViewChange, customCategories,
}) {
  const [filter, setFilter] = useState('all');
  const [calMonth, setCalMonth] = useState(() => { const d = new Date(todayStr() + 'T00:00:00'); return { y: d.getFullYear(), m: d.getMonth() }; });

  const cleanName = userFullName || (userName ? (userName.split('@')[0].charAt(0).toUpperCase() + userName.split('@')[0].slice(1)) : 'User');
  const getGreeting = () => { const hr = new Date().getHours(); if (hr < 12) return 'Good morning'; if (hr < 17) return 'Good afternoon'; if (hr < 22) return 'Good evening'; return 'Hey, Night owl'; };

  const pending = useMemo(() => tasks.filter(t => t.status !== 'done'), [tasks]);
  const buckets = useMemo(() => {
    const b = { overdue: [], due_soon: [], upcoming: [], no_deadline: [] };
    pending.forEach(t => { const n = diffDays(t.deadline); if (n === null) b.no_deadline.push(t); else if (n < 0) b.overdue.push(t); else if (n <= 3) b.due_soon.push(t); else b.upcoming.push(t); });
    return b;
  }, [pending]);
  const counts = { overdue: buckets.overdue.length, due_soon: buckets.due_soon.length, upcoming: buckets.upcoming.length, no_deadline: buckets.no_deadline.length };
  const totalPending = pending.length;

  const todayPlusOverdue = useMemo(() => {
    const rank = (t) => { const n = diffDays(t.deadline); return n === null ? 1e9 : n; };
    return pending.filter(t => { const n = diffDays(t.deadline); return n !== null && n <= 0; }).sort((a, b) => rank(a) - rank(b));
  }, [pending]);

  const cardCounts = {
    all: todayPlusOverdue.length,
    overdue: todayPlusOverdue.filter(t => diffDays(t.deadline) < 0).length,
    today: todayPlusOverdue.filter(t => diffDays(t.deadline) === 0).length,
    no_date: pending.filter(t => diffDays(t.deadline) === null).length,
  };
  const cardList = useMemo(() => {
    if (filter === 'overdue') return todayPlusOverdue.filter(t => diffDays(t.deadline) < 0);
    if (filter === 'today') return todayPlusOverdue.filter(t => diffDays(t.deadline) === 0);
    if (filter === 'no_date') return pending.filter(t => diffDays(t.deadline) === null);
    return todayPlusOverdue;
  }, [filter, todayPlusOverdue, pending]);

  const donut = useMemo(() => {
    const total = totalPending || 1; let acc = 0;
    return ['overdue', 'due_soon', 'upcoming', 'no_deadline'].map(k => { const value = counts[k]; const frac = value / total; const seg = { key: k, value, start: acc, end: acc + frac, color: BUCKETS[k].chart }; acc += frac; return seg; });
  }, [counts, totalPending]);

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

  const calendar = useMemo(() => {
    const first = new Date(calMonth.y, calMonth.m, 1);
    const daysInMonth = new Date(calMonth.y, calMonth.m + 1, 0).getDate();
    let startDow = (first.getDay() + 6) % 7; // Mon-first
    const cells = [];
    for (let i = 0; i < startDow; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      const iso = `${calMonth.y}-${String(calMonth.m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const n = diffDays(iso);
      const taskCount = pending.filter(t => t.deadline === iso).length;
      cells.push({ d, iso, isToday: iso === todayStr(), isOverdue: n !== null && n < 0 && taskCount > 0, isDue: n !== null && n >= 0 && n <= 3 && taskCount > 0, taskCount });
    }
    return cells;
  }, [calMonth, pending]);

  const todayPanel = todayPlusOverdue.slice(0, 6);
  const card = { background: '#FFFFFF', borderRadius: '16px', border: `1px solid ${VISUAL_THEME.border}`, boxSizing: 'border-box' };

  // ---- sub-blocks (so left/right columns stay independent) ----

  const TasksCard = (
    <div style={{ ...card, padding: '18px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap', marginBottom: '4px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 700, color: VISUAL_THEME.text, margin: 0 }}>Today's Tasks</h3>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: `All (${cardCounts.all})` },
            { id: 'overdue', label: `Overdue (${cardCounts.overdue})` },
            { id: 'today', label: `Due Today (${cardCounts.today})` },
            { id: 'no_date', label: `No Date (${cardCounts.no_date})` },
          ].map(tab => {
            const active = filter === tab.id;
            return (
              <button key={tab.id} onClick={() => setFilter(tab.id)} style={{
                padding: '5px 11px', borderRadius: '999px', border: active ? `1px solid ${VISUAL_THEME.accent}` : `1px solid ${VISUAL_THEME.border}`,
                cursor: 'pointer', fontSize: '11.5px', fontWeight: 600, whiteSpace: 'nowrap',
                background: active ? '#EEF2FF' : '#FFFFFF', color: active ? VISUAL_THEME.accent : VISUAL_THEME.textSec,
              }}>{tab.label}</button>
            );
          })}
        </div>
      </div>
      <p style={{ fontSize: '12px', color: VISUAL_THEME.textSec, margin: '0 0 10px 0' }}>
        {cardCounts.all} task{cardCounts.all !== 1 ? 's' : ''} • {cardCounts.overdue} overdue • {cardCounts.today} due today
      </p>
      {cardList.length === 0 ? (
        <div style={{ padding: '32px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: '32px', marginBottom: '8px', opacity: 0.5 }}>🎉</div>
          <p style={{ fontSize: '14px', fontWeight: 700, color: VISUAL_THEME.text, margin: '0 0 4px 0' }}>Nothing here!</p>
          <p style={{ fontSize: '12.5px', color: VISUAL_THEME.textSec, margin: 0 }}>No tasks in this filter.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {cardList.map((t, idx) => {
            const n = diffDays(t.deadline);
            const bk = n === null ? BUCKETS.no_deadline : n < 0 ? BUCKETS.overdue : n <= 3 ? BUCKETS.due_soon : BUCKETS.upcoming;
            const cat = catOf(t, customCategories);
            return (
              <div key={t.id} style={{ display: 'flex', alignItems: isMobile ? 'flex-start' : 'center', gap: '10px', padding: '11px 4px', borderTop: idx === 0 ? 'none' : `1px solid ${VISUAL_THEME.borderAlt}` }}>
                <input type="checkbox" checked={t.status === 'done'} onChange={(e) => { e.stopPropagation(); handleToggleStatus && handleToggleStatus(t.id, t.status); }}
                  style={{ width: '17px', height: '17px', cursor: 'pointer', accentColor: VISUAL_THEME.accent, flexShrink: 0, marginTop: isMobile ? '2px' : 0 }} />
                <div style={{ flex: 1, minWidth: 0, cursor: onSelectDetail ? 'pointer' : 'default' }} onClick={() => onSelectDetail && onSelectDetail(t)}>
                  <div style={{ fontSize: '13.5px', fontWeight: 600, color: VISUAL_THEME.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</div>
                  {/* Mobile: badges go under the title so the name isn't squeezed */}
                  {isMobile && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '5px', flexWrap: 'wrap' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 600, color: bk.color, background: bk.bg, padding: '3px 9px', borderRadius: '999px', whiteSpace: 'nowrap' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: bk.color }} />
                        {relLabel(t.deadline)}{t.time && n === 0 ? `, ${t.time}` : ''}
                      </span>
                      {cat && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 600, color: cat.color, background: cat.bg, padding: '3px 9px', borderRadius: '999px', whiteSpace: 'nowrap' }}>
                          {cat.icon} {cat.name}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                {!isMobile && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 600, color: bk.color, background: bk.bg, padding: '3px 9px', borderRadius: '999px', whiteSpace: 'nowrap', flexShrink: 0 }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: bk.color }} />
                    {relLabel(t.deadline)}{t.time && n === 0 ? `, ${t.time}` : ''}
                  </span>
                )}
                {cat && !isMobile && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 600, color: cat.color, background: cat.bg, padding: '3px 9px', borderRadius: '999px', whiteSpace: 'nowrap', flexShrink: 0 }}>
                    {cat.icon} {cat.name}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  const DonutCard = (
    <div style={{ ...card, padding: '18px' }}>
      <h3 style={{ fontSize: '15px', fontWeight: 700, color: VISUAL_THEME.text, margin: '0 0 14px 0' }}>Deadline Overview</h3>
      <div style={{ display: 'flex', alignItems: 'center', gap: '18px', flexWrap: 'wrap' }}>
        <Donut segments={donut} total={totalPending} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '9px', flex: 1, minWidth: '150px' }}>
          {['overdue', 'due_soon', 'upcoming', 'no_deadline'].map(k => (
            <div key={k} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: BUCKETS[k].chart }} />
                <span style={{ fontSize: '12.5px', color: VISUAL_THEME.textSec }}>{BUCKETS[k].label}</span>
              </div>
              <span style={{ fontSize: '12.5px', fontWeight: 700, color: VISUAL_THEME.text }}>
                {counts[k]} ({totalPending ? Math.round((counts[k] / totalPending) * 100) : 0}%)
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const Next7Card = (
    <div style={{ ...card, padding: '18px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 700, color: VISUAL_THEME.text, margin: 0 }}>Next 7 Days</h3>
        {onViewChange && (<button onClick={() => onViewChange('upcoming', null, null)} style={{ background: 'transparent', border: 'none', color: VISUAL_THEME.accent, fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>View all</button>)}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {next7.map((r, i) => (
          <div key={r.iso} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderTop: i === 0 ? 'none' : `1px solid ${VISUAL_THEME.borderAlt}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: r.count > 0 ? (r.isToday ? '#EF4444' : VISUAL_THEME.accent) : '#E2E8F0', flexShrink: 0 }} />
              <span style={{ fontSize: '13px', fontWeight: r.isToday ? 700 : 500, color: r.isToday ? VISUAL_THEME.text : VISUAL_THEME.textSec }}>{r.label}</span>
            </div>
            <span style={{ fontSize: '12.5px', fontWeight: 600, color: r.count > 0 ? VISUAL_THEME.text : '#94A3B8' }}>{r.count} task{r.count !== 1 ? 's' : ''}</span>
          </div>
        ))}
      </div>
    </div>
  );

  const CalendarCard = (
    <div style={{ ...card, padding: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 700, color: VISUAL_THEME.text, margin: 0 }}>Calendar</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button onClick={() => setCalMonth(p => { const m = p.m - 1; return m < 0 ? { y: p.y - 1, m: 11 } : { y: p.y, m }; })} style={calNavBtn}>‹</button>
          <span style={{ fontSize: '12.5px', fontWeight: 600, color: VISUAL_THEME.text, minWidth: '78px', textAlign: 'center' }}>{MONTHS[calMonth.m].slice(0, 3)} {calMonth.y}</span>
          <button onClick={() => setCalMonth(p => { const m = p.m + 1; return m > 11 ? { y: p.y + 1, m: 0 } : { y: p.y, m }; })} style={calNavBtn}>›</button>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '3px', marginBottom: '4px' }}>
        {['M','T','W','T','F','S','S'].map((d, i) => (
          <div key={i} style={{ textAlign: 'center', fontSize: '10px', fontWeight: 700, color: VISUAL_THEME.textSec, padding: '2px 0' }}>{d}</div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '3px' }}>
        {calendar.map((c, i) => {
          if (!c) return <div key={`e${i}`} />;
          const color = c.isToday ? '#FFFFFF' : c.isOverdue ? '#EF4444' : c.isDue ? '#F59E0B' : VISUAL_THEME.text;
          return (
            <div key={c.iso} title={c.taskCount ? `${c.taskCount} task${c.taskCount !== 1 ? 's' : ''}` : ''}
              style={{ aspectRatio: '1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative',
                borderRadius: '7px', background: c.isToday ? VISUAL_THEME.accent : 'transparent',
                fontSize: '12px', fontWeight: c.isToday ? 700 : 500, color }}>
              {c.d}
              {c.taskCount > 0 && !c.isToday && (
                <span style={{ position: 'absolute', bottom: '3px', width: '4px', height: '4px', borderRadius: '50%', background: c.isOverdue ? '#EF4444' : c.isDue ? '#F59E0B' : VISUAL_THEME.accent }} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  const TodayPanelCard = (
    <div style={{ ...card, padding: '16px' }}>
      <h3 style={{ fontSize: '14px', fontWeight: 700, color: VISUAL_THEME.text, margin: '0 0 12px 0' }}>
        Today ({new Date(todayStr() + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })})
      </h3>
      {todayPanel.length === 0 ? (
        <p style={{ fontSize: '12.5px', color: VISUAL_THEME.textSec, margin: 0 }}>Nothing due today or overdue. 🎉</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {todayPanel.map(t => {
            const n = diffDays(t.deadline);
            const dotColor = n < 0 ? '#EF4444' : '#F59E0B';
            const sub = n < 0 ? `${Math.abs(n)} day${Math.abs(n) !== 1 ? 's' : ''} overdue` : (t.time ? `Today, ${t.time}` : 'Today');
            return (
              <div key={t.id} style={{ display: 'flex', gap: '10px', cursor: onSelectDetail ? 'pointer' : 'default' }} onClick={() => onSelectDetail && onSelectDetail(t)}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: dotColor, marginTop: '5px', flexShrink: 0 }} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: VISUAL_THEME.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</div>
                  <div style={{ fontSize: '11.5px', color: n < 0 ? '#EF4444' : VISUAL_THEME.textSec }}>{sub}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', boxSizing: 'border-box', maxWidth: '100%' }}>

      {/* Greeting */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: 700, color: VISUAL_THEME.text, margin: '0 0 2px 0', letterSpacing: '-0.5px' }}>
            {getGreeting()}, {cleanName} 👋
          </h1>
          <p style={{ fontSize: '13px', color: VISUAL_THEME.textSec, margin: 0 }}>
            {formatIndianDate ? formatIndianDate() : ''} • {totalPending} pending task{totalPending !== 1 ? 's' : ''}
          </p>
        </div>
        {onNewTask && (
          <button onClick={onNewTask} style={{ background: VISUAL_THEME.accent, color: '#FFFFFF', border: 'none', padding: '10px 18px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', flexShrink: 0 }}>+ New Task</button>
        )}
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: isMobile ? '12px' : '16px' }}>
        {['overdue', 'due_soon', 'upcoming', 'no_deadline'].map(k => {
          const b = BUCKETS[k];
          return (
            <div key={k} style={{ ...card, background: b.bg, border: `1px solid ${b.color}22`, padding: isMobile ? '14px' : '16px 18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: `0 0 0 1px ${b.color}22` }}>
                  <span style={{ fontSize: '19px' }}>{b.icon}</span>
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: b.color, lineHeight: 1 }}>{counts[k]}</div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: VISUAL_THEME.text, marginTop: '2px' }}>{b.label}</div>
                  <div style={{ fontSize: '11px', color: VISUAL_THEME.textSec }}>{b.sub}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Master 2-column layout */}
      {isMobile ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {TasksCard}{CalendarCard}{TodayPanelCard}{DonutCard}{Next7Card}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 320px', gap: '18px', alignItems: 'start' }}>
          {/* LEFT column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', minWidth: 0 }}>
            {TasksCard}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px', alignItems: 'start' }}>
              {DonutCard}
              {Next7Card}
            </div>
          </div>
          {/* RIGHT column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', minWidth: 0 }}>
            {CalendarCard}
            {TodayPanelCard}
          </div>
        </div>
      )}
    </div>
  );
}

const calNavBtn = { width: '24px', height: '24px', borderRadius: '7px', border: `1px solid ${VISUAL_THEME.border}`, background: '#FFFFFF', color: VISUAL_THEME.textSec, cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, flexShrink: 0 };

function Donut({ segments, total }) {
  const size = 120, stroke = 17, r = (size - stroke) / 2, cx = size / 2, cy = size / 2;
  const circ = 2 * Math.PI * r;
  const hasData = total > 0 && segments.some(s => s.value > 0);
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#F1F5F9" strokeWidth={stroke} />
        {hasData && segments.map(s => {
          if (s.value === 0) return null;
          const len = (s.end - s.start) * circ;
          return <circle key={s.key} cx={cx} cy={cy} r={r} fill="none" stroke={s.color} strokeWidth={stroke} strokeDasharray={`${len} ${circ - len}`} strokeDashoffset={-s.start * circ} strokeLinecap="butt" />;
        })}
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: '23px', fontWeight: 800, color: VISUAL_THEME.text, lineHeight: 1 }}>{total}</div>
        <div style={{ fontSize: '11px', color: VISUAL_THEME.textSec, marginTop: '2px' }}>Pending</div>
      </div>
    </div>
  );
}
