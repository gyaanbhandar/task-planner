'use client';
import React, { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import TaskCard from './TaskCard';
import { VISUAL_THEME } from '../constants/taskConstants';

function SortableTaskItem({ task, onToggle, onSelectDetail, onDelete, isMobile }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    position: 'relative',
    zIndex: isDragging ? 100 : 'auto',
  };

  return (
    <div ref={setNodeRef} style={style}>
      <div style={{ display: 'flex', alignItems: 'stretch', gap: '0' }}>
        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '28px',
            cursor: 'grab',
            color: '#CBD5E1',
            fontSize: '16px',
            flexShrink: 0,
            userSelect: 'none',
            touchAction: 'none',
            borderRadius: '8px 0 0 8px',
            background: isDragging ? 'rgba(99,102,241,0.06)' : 'transparent'
          }}
          title="Drag to reorder"
        >
          та┐
        </div>
        <div style={{ flex: 1 }}>
          <TaskCard
            task={task}
            onToggle={onToggle}
            onSelectDetail={onSelectDetail}
            onDelete={onDelete}
            isMobile={isMobile}
          />
        </div>
      </div>
    </div>
  );
}

export default function DraggableTaskList({
  tasks,
  onReorder,
  onToggle,
  onSelectDetail,
  onDelete,
  isMobile,
  emptyMessage
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = tasks.findIndex(t => t.id === active.id);
      const newIndex = tasks.findIndex(t => t.id === over.id);
      const reordered = arrayMove(tasks, oldIndex, newIndex);
      onReorder(reordered);
    }
  };

  if (!tasks || tasks.length === 0) {
    return (
      <div style={{ padding: '40px 0', textAlign: 'center', color: VISUAL_THEME.textSec, fontSize: '13px' }}>
        {emptyMessage || 'No tasks found. Click "+ New Task" to add one!'}
      </div>
    );
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {tasks.map(task => (
            <SortableTaskItem
              key={task.id}
              task={task}
              onToggle={onToggle}
              onSelectDetail={onSelectDetail}
              onDelete={onDelete}
              isMobile={isMobile}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
