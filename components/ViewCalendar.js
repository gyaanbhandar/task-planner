'use client';
import React, { useState } from 'react';
import { VISUAL_THEME, PRIORITY_CONFIG } from '../constants/taskConstants';
import { todayStr } from '../utils/dateUtils';

export default function ViewCalendar({ tasks, setInspectedTask }) {
  // Start with current month
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth()); // 0-11
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedDay, setSelectedDay] = useState(null); // "YYYY-MM-DD" or null

  const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  // Navigate months
  const goToPrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
    setSelectedDay(null);
  };

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
    setSelectedDay(null);
  };

  const goToToday = () => {
    const now = new Date();
    setCurrentMonth(now.getMonth());
    setCurrentYear(now.getFullYear());
    setSelectedDay(null);
  };

  // Calculate calendar grid
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();

  // Day of week for 1st day (0=Sun, 1=Mon, ... 6=Sat)
  // We want Monday=0, so adjust: (day + 6) % 7
  const firstDayWeekday = (firstDayOfMonth.getDay() + 6) % 7; // Monday-based offset

  const todayString = todayStr();

  // Get tasks for a specific date string "YYYY-MM-DD"
  const getTasksForDay = (dateStr) => {
    return tasks.filter(t => {
      // Match exact deadline
      if (t.deadline === dateStr) return true;
      // Also match daily recurring tasks (show on every day)
      if (t.type === 'daily' && t.status === 'pending') return true;
      return false;
    });
  };

  // Get tasks for selected day panel
  const selectedDayTasks = selectedDay ? getTasksForDay(selectedDay) : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Calendar Card */}
      <div style={{ background: '#FFFFFF', borderRadius: '16px', border: `1px solid ${VISUAL_THEME.border}`, padding: '20px', boxSizing: 'border-box' }}>
        
        {/* Header with Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button 
              onClick={goToPrevMonth} 
              style={{ width: '34px', height: '34px', borderRadius: '8px', border: `1px solid ${VISUAL_THEME.border}`, background: '#F8FAFC', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              ◀
            </button>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: VISUAL_THEME.text, margin: 0, minWidth: '180px', textAlign: 'center' }}>
              {MONTH_NAMES[currentMonth]} {currentYear}
            </h3>
            <button 
              onClick={goToNextMonth} 
              style={{ width: '34px', height: '34px', borderRadius: '8px', border: `1px solid ${VISUAL_THEME.border}`, background: '#F8FAFC', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              ▶
            </button>
          </div>
          <button 
            onClick={goToToday}
            style={{ padding: '6px 14px', borderRadius: '6px', border: `1px solid ${VISUAL_THEME.accent}`, background: '#EEF2FF', color: VISUAL_THEME.accent, fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
          >
            Today
          </button>
        </div>

        {/* Day Headers */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px', background: VISUAL_THEME.border }}>
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
            <div key={d} style={{ background: '#F8FAFC', padding: '10px', fontSize: '11px', fontWeight: 600, textAlign: 'center', color: VISUAL_THEME.textSec }}>
              {d}
            </div>
          ))}

          {/* Empty cells before 1st day */}
          {Array.from({ length: firstDayWeekday }).map((_, i) => (
            <div key={`empty-${i}`} style={{ background: '#FAFAFA', minHeight: '85px', padding: '8px', border: `1px solid ${VISUAL_THEME.borderAlt}` }} />
          ))}

          {/* Actual day cells */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const paddedDay = String(dayNum).padStart(2, '0');
            const paddedMonth = String(currentMonth + 1).padStart(2, '0');
            const dayStrVal = `${currentYear}-${paddedMonth}-${paddedDay}`;
            const dayTasks = getTasksForDay(dayStrVal);
            const isToday = dayStrVal === todayString;
            const isSelected = dayStrVal === selectedDay;
            const hasTasks = dayTasks.length > 0;

            return (
              <div
                key={i}
                onClick={() => setSelectedDay(isSelected ? null : dayStrVal)}
                style={{
                  background: isSelected ? 'rgba(99, 102, 241, 0.04)' : '#FFFFFF',
                  minHeight: '85px',
                  padding: '8px',
                  border: isSelected 
                    ? `2px solid ${VISUAL_THEME.accent}` 
                    : isToday 
                      ? `2px solid #6366F1` 
                      : `1px solid ${VISUAL_THEME.borderAlt}`,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  position: 'relative'
                }}
              >
                {/* Day Number */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    color: isToday ? '#FFFFFF' : VISUAL_THEME.text,
                    background: isToday ? VISUAL_THEME.accent : 'transparent',
                    width: isToday ? '24px' : 'auto',
                    height: isToday ? '24px' : 'auto',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {dayNum}
                  </span>
                  {hasTasks && (
                    <span style={{ fontSize: '9px', fontWeight: 700, color: VISUAL_THEME.accent, background: '#EEF2FF', padding: '1px 5px', borderRadius: '4px' }}>
                      {dayTasks.length}
                    </span>
                  )}
                </div>

                {/* Task Pills (show max 3) */}
                {dayTasks.slice(0, 3).map(dt => (
                  <div
                    key={dt.id}
                    onClick={(e) => { e.stopPropagation(); if (setInspectedTask) setInspectedTask(dt); }}
                    style={{
                      fontSize: '9px',
                      background: dt.status === 'done' 
                        ? 'rgba(16, 185, 129, 0.08)' 
                        : (PRIORITY_CONFIG[dt.priority]?.bg || 'rgba(99,102,241,0.06)'),
                      color: dt.status === 'done' 
                        ? '#059669' 
                        : (PRIORITY_CONFIG[dt.priority]?.color || VISUAL_THEME.accent),
                      padding: '2px 4px',
                      borderRadius: '3px',
                      marginTop: '2px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      cursor: 'pointer',
                      fontWeight: 500,
                      textDecoration: dt.status === 'done' ? 'line-through' : 'none'
                    }}
                  >
                    {dt.title}
                  </div>
                ))}
                {dayTasks.length > 3 && (
                  <div style={{ fontSize: '8px', color: VISUAL_THEME.textSec, marginTop: '2px', fontWeight: 600 }}>
                    +{dayTasks.length - 3} more
                  </div>
                )}
              </div>
            );
          })}

          {/* Empty cells after last day to complete the grid row */}
          {(() => {
            const totalCells = firstDayWeekday + daysInMonth;
            const remainingCells = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
            return Array.from({ length: remainingCells }).map((_, i) => (
              <div key={`trail-${i}`} style={{ background: '#FAFAFA', minHeight: '85px', padding: '8px', border: `1px solid ${VISUAL_THEME.borderAlt}` }} />
            ));
          })()}
        </div>
      </div>

      {/* Selected Day Detail Panel */}
      {selectedDay && (
        <div style={{ background: '#FFFFFF', borderRadius: '16px', border: `1px solid ${VISUAL_THEME.border}`, padding: '20px', boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: VISUAL_THEME.text, margin: 0 }}>
              📅 {(() => {
                try {
                  const d = new Date(selectedDay + 'T00:00:00');
                  const day = String(d.getDate()).padStart(2, '0');
                  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
                  const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
                  return `${day} ${months[d.getMonth()]} ${currentYear} (${days[d.getDay()]})`;
                } catch(e) { return selectedDay; }
              })()}
            </h3>
            <span style={{ fontSize: '12px', color: VISUAL_THEME.textSec, fontWeight: 600 }}>
              {selectedDayTasks.length} task{selectedDayTasks.length !== 1 ? 's' : ''}
            </span>
          </div>

          {selectedDayTasks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px', color: VISUAL_THEME.textSec, fontSize: '13px' }}>
              🗓️ Is din koi task nahi hai
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {selectedDayTasks.map(task => (
                <div
                  key={task.id}
                  onClick={() => { if (setInspectedTask) setInspectedTask(task); }}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '10px',
                    border: `1px solid ${VISUAL_THEME.borderAlt}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    cursor: 'pointer',
                    transition: 'background 0.15s',
                    background: '#FAFAFA'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#F1F5F9'}
                  onMouseLeave={e => e.currentTarget.style.background = '#FAFAFA'}
                >
                  {/* Status indicator */}
                  <div style={{
                    width: '10px', height: '10px', borderRadius: '50%', flexShrink: 0,
                    background: task.status === 'done' ? '#10B981' : (PRIORITY_CONFIG[task.priority]?.color || '#F59E0B')
                  }} />

                  {/* Task Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: '13px', fontWeight: 600, color: VISUAL_THEME.text,
                      textDecoration: task.status === 'done' ? 'line-through' : 'none',
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                    }}>
                      {task.title}
                    </div>
                    <div style={{ fontSize: '11px', color: VISUAL_THEME.textSec, marginTop: '2px' }}>
                      {task.time || '09:00 AM'} • {task.category} • {task.subcategory || 'General'}
                    </div>
                  </div>

                  {/* Priority Badge */}
                  <span style={{
                    fontSize: '10px', fontWeight: 700, padding: '3px 8px', borderRadius: '4px',
                    background: PRIORITY_CONFIG[task.priority]?.bg || '#FEF3C7',
                    color: PRIORITY_CONFIG[task.priority]?.color || '#D97706',
                    flexShrink: 0
                  }}>
                    {(task.priority || 'medium').toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
