'use client';
import React, { useMemo, useState, useEffect } from 'react';
import { VISUAL_THEME, CATEGORIES } from '../constants/taskConstants';
import { todayStr } from '../utils/dateUtils';

/*
  ViewDashboard — "Overview" — a calm control panel for the day.
  Design goals: clear hierarchy, soft depth (real shadows on a cool
  canvas), tabular numbers, disciplined accents. One bold signal:
  the overdue red. Everything else stays quiet.
  Fixed card heights keep the whole grid aligned across filters/pages.
*/

const PER_PAGE = 4;
const PANEL_PER_PAGE = 4;

// Fixed card heights (desktop) so nothing shifts between filters/pages.
const TASKS_CARD_H = 318;
const BOTTOM_H     = 228;
const CALENDAR_H   = 318;
const PANEL_H      = 228;

// ---- design tokens (local, layered on VISUAL_THEME) ----------
const T = {
  canvas:  '#F6F7F9',
  card:    '#FFFFFF',
  ink:     '#101828',   // primary text
  ink2:    '#667085',   // secondary
  ink3:    '#98A2B3',   // tertiary / muted
  line:    '#EAECF0',   // hairline
  lineSoft:'#F2F4F7',
  accent:  '#6366F1',
  shadow:  '0 1px 2px rgba(16,24,40,0.04), 0 1px 3px rgba(16,24,40,0.06)',
  shadowLift: '0 4px 12px rgba(16,24,40,0.08)',
};
const NUM = { fontVariantNumeric: 'tabular-nums', fontFeatureSettings: '"tnum"' };

// ---- date helpers --------------------------------------------
const parseDate = (d) => { if (!d) return null; const dt = new Date(d + 'T00:00:00'); return isNaN(dt.getTime()) ? null : dt; };
const diffDays = (deadline) => { const dt = parseDate(deadline); if (!dt) return null; const today = new Date(todayStr() + 'T00:00:00'); return Math.round((dt - today) / 86400000); };
const prettyDate = (d) => { const dt = parseDate(d); if (!dt) return 'No date'; return dt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }); };
const relLabel = (deadline) => {
  const n = diffDays(deadline);
  if (n === null) return 'No deadline';
  if (n < 0) return `${prettyDate(deadline)} · ${Math.abs(n)}d overdue`;
  if (n === 0) return 'Today';
  if (n === 1) return 'Tomorrow';
  return `${prettyDate(deadline)} · in ${n}d`;
};
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const BUCKETS = {
  overdue:     { label: 'Overdue',     sub: 'Past deadline',   color: '#F04438', soft: '#FEF3F2', ring: '#FEE4E2', icon: '⏰' },
  due_soon:    { label: 'Due Soon',    sub: 'Next 3 days',     color: '#F79009', soft: '#FFFAEB', ring: '#FEF0C7', icon: '⚡' },
  upcoming:    { label: 'Upcoming',    sub: 'After 3 days',    color: '#6366F1', soft: '#EEF2FF', ring: '#E0E7FF', icon: '📅' },
  no_deadline: { label: 'No Deadline', sub: 'No date set',     color: '#98A2B3', soft: '#F8FAFC', ring: '#EAECF0', icon: '○' },
};

const catOf = (task, cc) => { const list = (cc && cc.length ? cc : CATEGORIES); return list.find(c => c.id === task.category) || null; };

export default function ViewDashboard({
  tasks = [], handleToggleStatus, onSelectDetail, isMobile,
  userName, userFullName, formatIndianDate, onNewTask, onViewChange, customCategories,
}) {
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [panelPage, setPanelPage] = useState(0);
  const [calMonth, setCalMonth] = useState(() => { const d = new Date(todayStr() + 'T00:00:00'); return { y: d.getFullYear(), m: d.getMonth() }; });
  const [hoverId, setHoverId] = useState(null);

  useEffect(() => { setPage(0); }, [filter]);

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
  const fullList = useMemo(() => {
    if (filter === 'overdue') return todayPlusOverdue.filter(t => diffDays(t.deadline) < 0);
    if (filter === 'today') return todayPlusOverdue.filter(t => diffDays(t.deadline) === 0);
    if (filter === 'no_date') return pending.filter(t => diffDays(t.deadline) === null);
    return todayPlusOverdue;
  }, [filter, todayPlusOverdue, pending]);

  const totalPages = Math.max(1, Math.ceil(fullList.length / PER_PAGE));
  const safePage = Math.min(page, totalPages - 1);
  const cardList = fullList.slice(safePage * PER_PAGE, safePage * PER_PAGE + PER_PAGE);

  const donut = useMemo(() => {
    const total = totalPending || 1; let acc = 0;
    return ['overdue', 'due_soon', 'upcoming', 'no_deadline'].map(k => { const value = counts[k]; const frac = value / total; const seg = { key: k, value, start: acc, end: acc + frac, color: BUCKETS[k].color }; acc += frac; return seg; });
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
    let startDow = (first.getDay() + 6) % 7;
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

  const panelFull = todayPlusOverdue;
  const panelTotalPages = Math.max(1, Math.ceil(panelFull.length / PANEL_PER_PAGE));
  const safePanelPage = Math.min(panelPage, panelTotalPages - 1);
  const todayPanel = panelFull.slice(safePanelPage * PANEL_PER_PAGE, safePanelPage * PANEL_PER_PAGE + PANEL_PER_PAGE);

  const card = { background: T.card, borderRadius: '14px', border: `1px solid ${T.line}`, boxShadow: T.shadow, boxSizing: 'border-box' };

  const ROW_H = 44;
  const LIST_H = PER_PAGE * ROW_H;

  const Pager = ({ cur, total, onPrev, onNext }) => {
    if (total <= 1) return null;
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px', marginTop: '10px', paddingTop: '10px', borderTop: `1px solid ${T.lineSoft}` }}>
        <button onClick={onPrev} disabled={cur === 0} style={{ ...pagerBtn, opacity: cur === 0 ? 0.4 : 1, cursor: cur === 0 ? 'default' : 'pointer' }}>‹</button>
        <span style={{ fontSize: '11.5px', color: T.ink2, fontWeight: 600, ...NUM, minWidth: '34px', textAlign: 'center' }}>{cur + 1} / {total}</span>
        <button onClick={onNext} disabled={cur >= total - 1} style={{ ...pagerBtn, opacity: cur >= total - 1 ? 0.4 : 1, cursor: cur >= total - 1 ? 'default' : 'pointer' }}>›</button>
      </div>
    );
  };

  const SectionTitle = ({ children, right }) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
      <h3 style={{ fontSize: '14px', fontWeight: 700, color: T.ink, margin: 0, letterSpacing: '-0.2px' }}>{children}</h3>
      {right}
    </div>
  );

  // ---------- Today's Tasks ----------
  const TasksCard = (
    <div style={{ ...card, padding: '16px 18px', height: isMobile ? 'auto' : TASKS_CARD_H, display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap', marginBottom: '2px' }}>
        <div>
          <h3 style={{ fontSize: '14px', fontWeight: 700, color: T.ink, margin: 0, letterSpacing: '-0.2px' }}>Today&apos;s Tasks</h3>
          <p style={{ fontSize: '11.5px', color: T.ink3, margin: '2px 0 0 0', ...NUM }}>
            {cardCounts.all} total · {cardCounts.overdue} overdue · {cardCounts.today} due today
          </p>
        </div>
        <div style={{ display: 'inline-flex', gap: '2px', background: T.lineSoft, padding: '3px', borderRadius: '9px' }}>
          {[
            { id: 'all', label: 'All', n: cardCounts.all },
            { id: 'overdue', label: 'Overdue', n: cardCounts.overdue },
            { id: 'today', label: 'Today', n: cardCounts.today },
            { id: 'no_date', label: 'No date', n: cardCounts.no_date },
          ].map(tab => {
            const active = filter === tab.id;
            return (
              <button key={tab.id} onClick={() => setFilter(tab.id)} style={{
                padding: '5px 10px', borderRadius: '7px', border: 'none', cursor: 'pointer',
                fontSize: '11.5px', fontWeight: 600, whiteSpace: 'nowrap',
                background: active ? T.card : 'transparent',
                color: active ? T.ink : T.ink2,
                boxShadow: active ? '0 1px 2px rgba(16,24,40,0.06)' : 'none',
                transition: 'all 0.12s',
              }}>{tab.label}<span style={{ ...NUM, marginLeft: '5px', color: active ? T.accent : T.ink3, fontWeight: 700 }}>{tab.n}</span></button>
            );
          })}
        </div>
      </div>

      <div style={{ flex: 1, minHeight: isMobile ? 'auto' : LIST_H, display: 'flex', flexDirection: 'column', marginTop: '8px' }}>
        {fullList.length === 0 ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#ECFDF3', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px', fontSize: '18px' }}>✓</div>
            <p style={{ fontSize: '13.5px', fontWeight: 600, color: T.ink, margin: '0 0 2px 0' }}>All clear here</p>
            <p style={{ fontSize: '12px', color: T.ink3, margin: 0 }}>No tasks in this view.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {cardList.map((t, idx) => {
              const n = diffDays(t.deadline);
              const bk = n === null ? BUCKETS.no_deadline : n < 0 ? BUCKETS.overdue : n <= 3 ? BUCKETS.due_soon : BUCKETS.upcoming;
              const cat = catOf(t, customCategories);
              const hov = hoverId === t.id;
              return (
                <div key={t.id}
                  onMouseEnter={() => setHoverId(t.id)} onMouseLeave={() => setHoverId(null)}
                  style={{ display: 'flex', alignItems: isMobile ? 'flex-start' : 'center', gap: '11px', height: isMobile ? 'auto' : ROW_H, padding: isMobile ? '9px 8px' : '0 8px', margin: '0 -8px',
                    borderRadius: '8px', background: hov && !isMobile ? T.lineSoft : 'transparent', transition: 'background 0.12s' }}>
                  <input type="checkbox" checked={t.status === 'done'} onChange={(e) => { e.stopPropagation(); handleToggleStatus && handleToggleStatus(t.id, t.status); }}
                    style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: T.accent, flexShrink: 0, marginTop: isMobile ? '2px' : 0 }} />
                  <div style={{ flex: 1, minWidth: 0, cursor: onSelectDetail ? 'pointer' : 'default' }} onClick={() => onSelectDetail && onSelectDetail(t)}>
                    <div style={{ fontSize: '13px', fontWeight: 500, color: T.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</div>
                    {isMobile && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '5px', flexWrap: 'wrap' }}>
                        <span style={pillDeadline(bk)}><span style={dot(bk.color)} />{relLabel(t.deadline)}{t.time && n === 0 ? `, ${t.time}` : ''}</span>
                        {cat && <span style={pillCat(cat)}>{cat.name}</span>}
                      </div>
                    )}
                  </div>
                  {!isMobile && (
                    <span style={pillDeadline(bk)}><span style={dot(bk.color)} />{relLabel(t.deadline)}{t.time && n === 0 ? `, ${t.time}` : ''}</span>
                  )}
                  {cat && !isMobile && <span style={{ ...pillCat(cat), width: '92px', justifyContent: 'center' }}>{cat.name}</span>}
                </div>
              );
            })}
          </div>
        )}
      </div>
      {fullList.length > 0 && (
        <Pager cur={safePage} total={totalPages} onPrev={() => setPage(p => Math.max(0, p - 1))} onNext={() => setPage(p => Math.min(totalPages - 1, p + 1))} />
      )}
    </div>
  );

  // ---------- Deadline Overview (donut) ----------
  const DonutCard = (
    <div style={{ ...card, padding: '16px 18px', height: isMobile ? 'auto' : BOTTOM_H, display: 'flex', flexDirection: 'column' }}>
      <SectionTitle>Deadline Overview</SectionTitle>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '16px', marginTop: '6px' }}>
        <Donut segments={donut} total={totalPending} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '9px', flex: 1, minWidth: '140px' }}>
          {['overdue', 'due_soon', 'upcoming', 'no_deadline'].map(k => (
            <div key={k} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '3px', background: BUCKETS[k].color }} />
                <span style={{ fontSize: '12px', color: T.ink2 }}>{BUCKETS[k].label}</span>
              </div>
              <span style={{ fontSize: '12px', fontWeight: 600, color: T.ink, ...NUM }}>
                {counts[k]} <span style={{ color: T.ink3, fontWeight: 500 }}>· {totalPending ? Math.round((counts[k] / totalPending) * 100) : 0}%</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ---------- Next 7 Days ----------
  const Next7Card = (
    <div style={{ ...card, padding: '16px 18px', height: isMobile ? 'auto' : BOTTOM_H, display: 'flex', flexDirection: 'column' }}>
      <SectionTitle right={onViewChange && (<button onClick={() => onViewChange('upcoming', null, null)} style={{ background: 'transparent', border: 'none', color: T.accent, fontSize: '11.5px', fontWeight: 600, cursor: 'pointer', padding: 0 }}>View all</button>)}>Next 7 Days</SectionTitle>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', marginTop: '4px' }}>
        {next7.map((r, i) => (
          <div key={r.iso} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0', borderTop: i === 0 ? 'none' : `1px solid ${T.lineSoft}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: r.count > 0 ? (r.isToday ? T.accent : T.ink3) : T.line, flexShrink: 0 }} />
              <span style={{ fontSize: '12.5px', fontWeight: r.isToday ? 600 : 400, color: r.isToday ? T.ink : T.ink2 }}>{r.label}</span>
            </div>
            <span style={{ fontSize: '12px', fontWeight: r.count > 0 ? 600 : 400, color: r.count > 0 ? T.ink : T.ink3, ...NUM }}>{r.count} task{r.count !== 1 ? 's' : ''}</span>
          </div>
        ))}
      </div>
    </div>
  );

  // ---------- Calendar ----------
  const CalendarCard = (
    <div style={{ ...card, padding: '16px', height: isMobile ? 'auto' : CALENDAR_H, display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: 700, color: T.ink, margin: 0, letterSpacing: '-0.2px' }}>Calendar</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button onClick={() => setCalMonth(p => { const m = p.m - 1; return m < 0 ? { y: p.y - 1, m: 11 } : { y: p.y, m }; })} style={calNavBtn}>‹</button>
          <span style={{ fontSize: '12px', fontWeight: 600, color: T.ink, minWidth: '74px', textAlign: 'center', ...NUM }}>{MONTHS[calMonth.m].slice(0, 3)} {calMonth.y}</span>
          <button onClick={() => setCalMonth(p => { const m = p.m + 1; return m > 11 ? { y: p.y + 1, m: 0 } : { y: p.y, m }; })} style={calNavBtn}>›</button>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', marginBottom: '4px' }}>
        {['M','T','W','T','F','S','S'].map((d, i) => (
          <div key={i} style={{ textAlign: 'center', fontSize: '10px', fontWeight: 600, color: T.ink3, padding: '2px 0' }}>{d}</div>
        ))}
      </div>
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gridAutoRows: '1fr', gap: '2px' }}>
        {calendar.map((c, i) => {
          if (!c) return <div key={`e${i}`} />;
          const color = c.isToday ? '#FFFFFF' : c.isOverdue ? BUCKETS.overdue.color : c.isDue ? BUCKETS.due_soon.color : T.ink;
          return (
            <div key={c.iso} title={c.taskCount ? `${c.taskCount} task${c.taskCount !== 1 ? 's' : ''}` : ''}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative',
                borderRadius: '8px', background: c.isToday ? T.accent : 'transparent',
                boxShadow: c.isToday ? '0 2px 6px rgba(99,102,241,0.35)' : 'none',
                fontSize: '11.5px', fontWeight: c.isToday ? 700 : 500, color, ...NUM }}>
              {c.d}
              {c.taskCount > 0 && !c.isToday && (
                <span style={{ position: 'absolute', bottom: '3px', width: '4px', height: '4px', borderRadius: '50%', background: c.isOverdue ? BUCKETS.overdue.color : c.isDue ? BUCKETS.due_soon.color : T.accent }} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  // ---------- Today panel ----------
  const TodayPanelCard = (
    <div style={{ ...card, padding: '16px', height: isMobile ? 'auto' : PANEL_H, display: 'flex', flexDirection: 'column' }}>
      <h3 style={{ fontSize: '13.5px', fontWeight: 700, color: T.ink, margin: '0 0 10px 0', letterSpacing: '-0.2px' }}>
        Today <span style={{ color: T.ink3, fontWeight: 500, ...NUM }}>· {new Date(todayStr() + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
      </h3>
      {panelFull.length === 0 ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
          <p style={{ fontSize: '12.5px', color: T.ink3, margin: 0 }}>Nothing due today or overdue.</p>
        </div>
      ) : (
        <>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {todayPanel.map(t => {
              const n = diffDays(t.deadline);
              const dotColor = n < 0 ? BUCKETS.overdue.color : BUCKETS.due_soon.color;
              const sub = n < 0 ? `${Math.abs(n)} day${Math.abs(n) !== 1 ? 's' : ''} overdue` : (t.time ? `Today, ${t.time}` : 'Today');
              return (
                <div key={t.id} style={{ display: 'flex', gap: '9px', cursor: onSelectDetail ? 'pointer' : 'default' }} onClick={() => onSelectDetail && onSelectDetail(t)}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: dotColor, marginTop: '5px', flexShrink: 0 }} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: '12.5px', fontWeight: 500, color: T.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</div>
                    <div style={{ fontSize: '11px', color: n < 0 ? BUCKETS.overdue.color : T.ink3, fontWeight: n < 0 ? 600 : 400 }}>{sub}</div>
                  </div>
                </div>
              );
            })}
          </div>
          <Pager cur={safePanelPage} total={panelTotalPages} onPrev={() => setPanelPage(p => Math.max(0, p - 1))} onNext={() => setPanelPage(p => Math.min(panelTotalPages - 1, p + 1))} />
        </>
      )}
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', boxSizing: 'border-box', maxWidth: '100%', margin: isMobile ? 0 : '-8px', padding: isMobile ? 0 : '8px' }}>

      {/* Greeting */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: 700, color: T.ink, margin: '0 0 3px 0', letterSpacing: '-0.6px' }}>
            {getGreeting()}, {cleanName}
          </h1>
          <p style={{ fontSize: '13px', color: T.ink2, margin: 0 }}>
            {formatIndianDate ? formatIndianDate() : ''} <span style={{ color: T.ink3 }}>·</span> <span style={{ ...NUM, fontWeight: 500 }}>{totalPending}</span> pending
          </p>
        </div>
        {onNewTask && (
          <button onClick={onNewTask}
            style={{ background: T.accent, color: '#FFFFFF', border: 'none', padding: '9px 16px', borderRadius: '9px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', flexShrink: 0, boxShadow: '0 1px 2px rgba(99,102,241,0.3)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '15px', lineHeight: 1 }}>+</span> New Task
          </button>
        )}
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: isMobile ? '12px' : '14px' }}>
        {['overdue', 'due_soon', 'upcoming', 'no_deadline'].map(k => {
          const b = BUCKETS[k];
          const pct = totalPending ? Math.round((counts[k] / totalPending) * 100) : 0;
          return (
            <div key={k} style={{ ...card, padding: isMobile ? '14px' : '15px 16px', position: 'relative', overflow: 'hidden' }}>
              {/* accent left bar */}
              <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '3px', background: b.color }} />
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '28px', fontWeight: 800, color: T.ink, lineHeight: 1, letterSpacing: '-1px', ...NUM }}>{counts[k]}</div>
                  <div style={{ fontSize: '12.5px', fontWeight: 600, color: T.ink, marginTop: '6px' }}>{b.label}</div>
                  <div style={{ fontSize: '11px', color: T.ink3, marginTop: '1px' }}>{b.sub}</div>
                </div>
                <div style={{ width: '32px', height: '32px', borderRadius: '9px', background: b.soft, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '15px' }}>
                  {b.icon}
                </div>
              </div>
              {/* subtle share bar */}
              <div style={{ marginTop: '12px', height: '3px', borderRadius: '3px', background: T.lineSoft, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pct}%`, background: b.color, borderRadius: '3px' }} />
              </div>
            </div>
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

// ---- refined badge + control styles --------------------------
const dot = (color) => ({ width: '5px', height: '5px', borderRadius: '50%', background: color, flexShrink: 0 });
const pillDeadline = (bk) => ({ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 600, color: bk.color, background: bk.soft, padding: '3px 8px', borderRadius: '7px', whiteSpace: 'nowrap', flexShrink: 0, border: `1px solid ${bk.ring}` });
const pillCat = (cat) => ({ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 500, color: '#475467', background: '#F9FAFB', padding: '3px 9px', borderRadius: '7px', whiteSpace: 'nowrap', flexShrink: 0, border: '1px solid #EAECF0' });
const calNavBtn = { width: '24px', height: '24px', borderRadius: '7px', border: `1px solid #EAECF0`, background: '#FFFFFF', color: '#667085', cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, flexShrink: 0 };
const pagerBtn = { width: '26px', height: '24px', borderRadius: '7px', border: `1px solid #EAECF0`, background: '#FFFFFF', color: '#667085', fontSize: '13px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' };

function Donut({ segments, total }) {
  const size = 108, stroke = 15, r = (size - stroke) / 2, cx = size / 2, cy = size / 2;
  const circ = 2 * Math.PI * r;
  const hasData = total > 0 && segments.some(s => s.value > 0);
  const GAP = 0.012; // tiny gap between segments for a crisper chart
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
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
        <div style={{ fontSize: '22px', fontWeight: 800, color: '#101828', lineHeight: 1, letterSpacing: '-0.5px', fontVariantNumeric: 'tabular-nums' }}>{total}</div>
        <div style={{ fontSize: '10px', color: '#98A2B3', marginTop: '2px', fontWeight: 500 }}>Pending</div>
      </div>
    </div>
  );
}
