'use client';
import React, { useMemo } from 'react';
import { VISUAL_THEME } from '../constants/taskConstants';
import { todayStr } from '../utils/dateUtils';

/*
  ViewDashboard — "Overview" screen.
  A single overall view of every task bucketed by deadline:
  Overdue / Due Soon / Upcoming / No Deadline, plus a donut
  breakdown and a Next-7-Days glance. Deadline-focused; the
  rest of the app's screens stay simple.
  Styled in the AnuTask theme (indigo accent, same cards).
*/

// ---- helpers -------------------------------------------------
const parseDate = (d) => {
  if (!d) return null;
  const dt = new Date(d + 'T00:00:00');
  return isNaN(dt.getTime()) ? null : dt;
};

const diffDays = (deadline) => {
  const dt = parseDate(deadline);
  if (!dt) return null;
  const today = new Date(todayStr() + 'T00:00:00');
  return Math.round((dt - today) / 86400000);
};

const prettyDate = (d) => {
  const dt = parseDate(d);
  if (!dt) return 'No date';
  return dt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

// Friendly relative label for a deadline, e.g. "2 days overdue", "Today", "in 3 days"
const relLabel = (deadline) => {
  const n = diffDays(deadline);
  if (n === null) return 'No deadline';
  if (n < 0) return `${prettyDate(deadline)} (${Math.abs(n)} day${Math.abs(n) !== 1 ? 's' : ''} overdue)`;
  if (n === 0) return 'Today';
  if (n === 1) return 'Tomorrow';
  if (n <= 3) return `${prettyDate(deadline)} (in ${n} days)`;
  return `${prettyDate(deadline)} (in ${n} days)`;
};

// Bucket colors (AnuTask palette)
const BUCKETS = {
  overdue:    { key: 'overdue',    label: 'Overdue',     sub: 'Tasks past deadline', color: '#EF4444', bg: '#FEF2F2', chart: '#EF4444' },
  due_soon:   { key: 'due_soon',   label: 'Due Soon',    sub: 'Next 3 days',         color: '#F59E0B', bg: '#FFFBEB', chart: '#F59E0B' },
  upcoming:   { key: 'upcoming',   label: 'Upcoming',    sub: 'After 3 days',        color: '#6366F1', bg: '#EEF2FF', chart: '#6366F1' },
  no_deadline:{ key: 'no_deadline',label: 'No Deadline', sub: 'Set a date to prioritize', color: '#94A3B8', bg: '#F8FAFC', chart: '#CBD5E1' },
};

export default function ViewDashboard({
  tasks = [],
  handleToggleStatus,
  onSelectDetail,
  isMobile,
  userName,
  userFullName,
  formatIndianDate,
  onNewTask,
  onViewChange,
}) {
  const cleanName = userFullName || (userName ? (userName.split('@')[0].charAt(0).toUpperCase() + userName.split('@')[0].slice(1)) : 'User');

  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return 'Good morning';
    if (hr < 17) return 'Good afternoon';
    if (hr < 22) return 'Good evening';
    return 'Hey, Night owl';
  };

  // Only pending (not-done) tasks count toward the deadline overview.
  const pending = useMemo(() => tasks.filter(t => t.status !== 'done'), [tasks]);

  const buckets = useMemo(() => {
    const b = { overdue: [], due_soon: [], upcoming: [], no_deadline: [] };
    pending.forEach(t => {
      const n = diffDays(t.deadline);
      if (n === null) b.no_deadline.push(t);
      else if (n < 0) b.overdue.push(t);
      else if (n <= 3) b.due_soon.push(t);
      else b.upcoming.push(t);
    });
    return b;
  }, [pending]);

  const counts = {
    overdue: buckets.overdue.length,
    due_soon: buckets.due_soon.length,
    upcoming: buckets.upcoming.length,
    no_deadline: buckets.no_deadline.length,
  };
  const totalPending = pending.length;

  // Donut segments
  const donut = useMemo(() => {
    const total = totalPending || 1;
    const order = ['overdue', 'due_soon', 'upcoming', 'no_deadline'];
    let acc = 0;
    return order.map(k => {
      const value = counts[k];
      const frac = value / total;
      const seg = { key: k, value, pct: Math.round((value / (totalPending || 1)) * 100), start: acc, end: acc + frac, color: BUCKETS[k].chart };
      acc += frac;
      return seg;
    });
  }, [counts, totalPending]);

  // All pending tasks sorted for the main list: overdue first, then by nearest deadline, no-deadline last.
  const sortedTasks = useMemo(() => {
    const rank = (t) => {
      const n = diffDays(t.deadline);
      if (n === null) return 1e9;        // no deadline → bottom
      return n;                          // smaller (incl. negative overdue) → top
    };
    return [...pending].sort((a, b) => rank(a) - rank(b));
  }, [pending]);

  // Next 7 days glance (by date)
  const next7 = useMemo(() => {
    const rows = [];
    for (let i = 0; i < 7; i++) {
      const dt = new Date(todayStr() + 'T00:00:00');
      dt.setDate(dt.getDate() + i);
      const iso = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
      const count = pending.filter(t => t.deadline === iso).length;
      let label;
      if (i === 0) label = 'Today';
      else if (i === 1) label = 'Tomorrow';
      else label = dt.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
      rows.push({ iso, label, count, isToday: i === 0 });
    }
    return rows;
  }, [pending]);

  const card = { background: '#FFFFFF', borderRadius: '16px', border: `1px solid ${VISUAL_THEME.border}`, boxSizing: 'border-box' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', boxSizing: 'border-box' }}>

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
          <button onClick={onNewTask} style={{ background: VISUAL_THEME.accent, color: '#FFFFFF', border: 'none', padding: '10px 18px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>+ New Task</button>
        )}
      </div>

      {/* Stat cards row */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: isMobile ? '12px' : '16px' }}>
        {['overdue', 'due_soon', 'upcoming', 'no_deadline'].map(k => {
          const b = BUCKETS[k];
          return (
            <div key={k} style={{ ...card, background: b.bg, border: `1px solid ${b.color}22`, padding: isMobile ? '14px' : '18px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: `0 0 0 1px ${b.color}22` }}>
                  <span style={{ fontSize: '20px' }}>{k === 'overdue' ? '⏰' : k === 'due_soon' ? '⚡' : k === 'upcoming' ? '📅' : '➖'}</span>
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '26px', fontWeight: 800, color: b.color, lineHeight: 1 }}>{counts[k]}</div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: VISUAL_THEME.text, marginTop: '3px' }}>{b.label}</div>
                  <div style={{ fontSize: '11px', color: VISUAL_THEME.textSec }}>{b.sub}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main grid: task list (left) + donut & next-7 (right) */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.5fr 1fr', gap: '20px', alignItems: 'start' }}>

        {/* Left: All deadlines list */}
        <div style={{ ...card, padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: VISUAL_THEME.text, margin: 0 }}>All Deadlines</h3>
              <p style={{ fontSize: '12px', color: VISUAL_THEME.textSec, margin: '2px 0 0 0' }}>
                {totalPending} pending • {counts.overdue} overdue • {counts.due_soon} due soon
              </p>
            </div>
          </div>

          {sortedTasks.length === 0 ? (
            <div style={{ padding: '40px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: '36px', marginBottom: '10px', opacity: 0.5 }}>🎉</div>
              <p style={{ fontSize: '15px', fontWeight: 700, color: VISUAL_THEME.text, margin: '0 0 4px 0' }}>All caught up!</p>
              <p style={{ fontSize: '13px', color: VISUAL_THEME.textSec, margin: 0 }}>No pending tasks. Create one to get started.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '460px', overflowY: 'auto', paddingRight: '2px' }}>
              {sortedTasks.map(t => {
                const n = diffDays(t.deadline);
                const bk = n === null ? BUCKETS.no_deadline : n < 0 ? BUCKETS.overdue : n <= 3 ? BUCKETS.due_soon : BUCKETS.upcoming;
                return (
                  <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '11px 14px', borderRadius: '12px', border: `1px solid ${VISUAL_THEME.border}`, background: '#FFFFFF' }}>
                    <input
                      type="checkbox"
                      checked={t.status === 'done'}
                      onChange={(e) => { e.stopPropagation(); handleToggleStatus && handleToggleStatus(t.id, t.status); }}
                      style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: VISUAL_THEME.accent, flexShrink: 0 }}
                    />
                    <div
                      style={{ flex: 1, minWidth: 0, cursor: onSelectDetail ? 'pointer' : 'default' }}
                      onClick={() => onSelectDetail && onSelectDetail(t)}
                    >
                      <div style={{ fontSize: '14px', fontWeight: 600, color: VISUAL_THEME.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '3px', flexWrap: 'wrap' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 600, color: bk.color, background: bk.bg, padding: '2px 8px', borderRadius: '999px' }}>
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: bk.color }} />
                          {relLabel(t.deadline)}{t.time ? ` • ${t.time}` : ''}
                        </span>
                        {t.subcategory && t.subcategory !== 'General' && (
                          <span style={{ fontSize: '11px', color: VISUAL_THEME.textSec }}>{t.subcategory}</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right column: donut + next 7 days */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Deadline Overview donut */}
          <div style={{ ...card, padding: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: VISUAL_THEME.text, margin: '0 0 16px 0' }}>Deadline Overview</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '18px', flexWrap: 'wrap' }}>
              <Donut segments={donut} total={totalPending} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1, minWidth: '130px' }}>
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

          {/* Next 7 days */}
          <div style={{ ...card, padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: VISUAL_THEME.text, margin: 0 }}>Next 7 Days</h3>
              {onViewChange && (
                <button onClick={() => onViewChange('upcoming', null, null)} style={{ background: 'transparent', border: 'none', color: VISUAL_THEME.accent, fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>View all</button>
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {next7.map((r, i) => (
                <div key={r.iso} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 0', borderTop: i === 0 ? 'none' : `1px solid ${VISUAL_THEME.borderAlt}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: r.count > 0 ? (r.isToday ? '#EF4444' : VISUAL_THEME.accent) : '#E2E8F0', flexShrink: 0 }} />
                    <span style={{ fontSize: '13px', fontWeight: r.isToday ? 700 : 500, color: r.isToday ? VISUAL_THEME.text : VISUAL_THEME.textSec }}>{r.label}</span>
                  </div>
                  <span style={{ fontSize: '12.5px', fontWeight: 600, color: r.count > 0 ? VISUAL_THEME.text : '#94A3B8' }}>
                    {r.count} task{r.count !== 1 ? 's' : ''}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---- Donut (pure SVG, no deps) -------------------------------
function Donut({ segments, total }) {
  const size = 130, stroke = 18, r = (size - stroke) / 2, cx = size / 2, cy = size / 2;
  const circ = 2 * Math.PI * r;
  const hasData = total > 0 && segments.some(s => s.value > 0);

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#F1F5F9" strokeWidth={stroke} />
        {hasData && segments.map(s => {
          if (s.value === 0) return null;
          const len = (s.end - s.start) * circ;
          const gap = circ - len;
          const offset = -s.start * circ;
          return (
            <circle
              key={s.key}
              cx={cx} cy={cy} r={r}
              fill="none"
              stroke={s.color}
              strokeWidth={stroke}
              strokeDasharray={`${len} ${gap}`}
              strokeDashoffset={offset}
              strokeLinecap="butt"
            />
          );
        })}
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: '24px', fontWeight: 800, color: VISUAL_THEME.text, lineHeight: 1 }}>{total}</div>
        <div style={{ fontSize: '11px', color: VISUAL_THEME.textSec, marginTop: '2px' }}>Pending</div>
      </div>
    </div>
  );
}
