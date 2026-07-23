'use client';

import React, { useState, useEffect } from 'react';
import { VISUAL_THEME } from '../constants/taskConstants';

export default function FormPanel({ editingTask, onSave, onClose, isMobile }) {
  // Helper: Convert "01:03 PM" or "13:03" to 24-hour "HH:mm" for <input type="time">
  const convertTo24Hour = (timeStr) => {
    if (!timeStr) return '09:00';
    if (/^\d{2}:\d{2}$/.test(timeStr)) return timeStr; // Already HH:mm

    const match = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (!match) return '09:00';

    let [_, hours, minutes, period] = match;
    let h = parseInt(hours, 10);
    if (period.toUpperCase() === 'PM' && h < 12) h += 12;
    if (period.toUpperCase() === 'AM' && h === 12) h = 0;

    return `${h.toString().padStart(2, '0')}:${minutes}`;
  };

  // Helper: Convert 24-hour "13:03" to 12-hour "01:03 PM" for saving
  const convertTo12Hour = (time24) => {
    if (!time24) return '09:00 AM';
    const [hours, minutes] = time24.split(':');
    if (!hours || !minutes) return '09:00 AM';

    let h = parseInt(hours, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;

    return `${h.toString().padStart(2, '0')}:${minutes} ${ampm}`;
  };

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Personal',
    subcategory: 'General',
    priority: 'medium',
    frequency: 'One-Time Task',
    date: new Date().toISOString().split('T')[0],
    time: '09:00', // Stores "HH:mm" for input
  });

  // Load task data when Editing
  useEffect(() => {
    if (editingTask) {
      setFormData({
        title: editingTask.title || '',
        description: editingTask.description || '',
        category: editingTask.category || 'Personal',
        subcategory: editingTask.subcategory || 'General',
        priority: editingTask.priority || 'medium',
        frequency: editingTask.frequency || 'One-Time Task',
        date: editingTask.deadline || editingTask.date || new Date().toISOString().split('T')[0],
        time: convertTo24Hour(editingTask.time), // Properly converts "01:03 PM" -> "13:03"
      });
    }
  }, [editingTask]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      alert('Task Title is required!');
      return;
    }

    // Convert 24h time to clean 12h display format
    const formattedTime = convertTo12Hour(formData.time);

    const payload = {
      ...formData,
      title: formData.title.trim(),
      time: formattedTime, // Save "01:03 PM" format
      deadline: formData.date,
      status: editingTask ? editingTask.status : 'pending',
    };

    onSave(payload);
  };

  return (
    <div className="bg-white p-5 rounded-2xl shadow-lg border border-gray-100 max-w-xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-gray-800">
          {editingTask ? 'Edit Task' : 'Create New Task'}
        </h2>
        {onClose && (
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 font-bold">
            ✕
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Task Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g. Client Onboarding Call"
            className="w-full p-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Description / Notes</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Add details..."
            className="w-full p-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 h-20"
          />
        </div>

        {/* Category & Subcategory */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full p-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none"
            >
              <option value="Personal">Personal</option>
              <option value="Work">Work</option>
              <option value="Professional">Professional</option>
              <option value="Lead Gen">Lead Gen</option>
              <option value="Clients">Clients</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Priority</label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="w-full p-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none"
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
            </select>
          </div>
        </div>

        {/* Date & Time Input */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Target Date</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full p-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Target Time</label>
            <input
              type="time"
              name="time"
              value={formData.time}
              onChange={handleChange}
              className="w-full p-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none"
              required
            />
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="flex-1 bg-indigo-600 text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-indigo-700 transition"
          >
            {editingTask ? 'Save Changes' : 'Create Task'}
          </button>
        </div>
      </form>
    </div>
  );
}
