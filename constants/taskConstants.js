// constants/taskConstants.js

export const CATEGORIES = [
  { id: 'personal', name: 'Personal', icon: '👤', color: '#6366F1', bg: 'rgba(99, 102, 241, 0.08)' },
  { id: 'work', name: 'Work', icon: '💼', color: '#10B981', bg: 'rgba(16, 185, 129, 0.08)' },
  { id: 'professional', name: 'Professional', icon: '🏢', color: '#3B82F6', bg: 'rgba(59, 130, 246, 0.08)' },
  { id: 'clients', name: 'Clients', icon: '👥', color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.08)' },
  { id: 'leadgen', name: 'Lead Gen', icon: '🎯', color: '#EF4444', bg: 'rgba(239, 68, 68, 0.08)' },
];

export const CLIENTS = [
  { id: 'abc', name: 'ABC', status: 'Active', health: 82, email: 'contact@abc.com', phone: '+61 412 345 678', zone: 'Australia/Sydney', since: '10 Jan 2026', metrics: { total: 15, completed: 8, pending: 6, overdue: 1 } },
  { id: 'yun', name: 'YUN', status: 'Active', health: 91, email: 'hello@yun.io', phone: '+1 555 019 2834', zone: 'US/Pacific', since: '14 Feb 2026', metrics: { total: 9, completed: 5, pending: 3, overdue: 1 } },
  { id: 'horizon', name: 'Horizon Solutions', status: 'Active', health: 76, email: 'ops@horizon.com', phone: '+44 20 7946 0192', zone: 'Europe/London', since: '03 Mar 2026', metrics: { total: 12, completed: 8, pending: 2, overdue: 2 } },
  { id: 'network', name: 'Network Scaffol', status: 'On Hold', health: 64, email: 'info@netscaff.net', phone: '+91 22 2778 0401', zone: 'Asia/Kolkata', since: '22 Mar 2026', metrics: { total: 6, completed: 4, pending: 1, overdue: 1 } },
  { id: 'telcos', name: 'Telcos Guru', status: 'Active', health: 88, email: 'support@telcos.guru', phone: '+61 2 9876 5432', zone: 'Australia/Melbourne', since: '05 Apr 2026', metrics: { total: 7, completed: 5, pending: 1, overdue: 1 } },
  { id: 'jaypee', name: 'Jaypee Greens Hotel', status: 'Inactive', health: 45, email: 'mgmt@jaypee.in', phone: '+91 120 4077000', zone: 'Asia/Kolkata', since: '18 Apr 2026', metrics: { total: 5, completed: 3, pending: 1, overdue: 1 } },
];

export const PRIORITY_CONFIG = {
  high: { label: 'High', color: '#EF4444', bg: '#FEE2E2', icon: '🔺' },
  medium: { label: 'Medium', color: '#F59E0B', bg: '#FEF3C7', icon: '🔸' },
  low: { label: 'Low', color: '#10B981', bg: '#D1FAE5', icon: '🔹' }
};

export const RECURRING_PRESETS = [
  { id: 'rec_1', title: 'Drink 8 glasses of water', frequency: 'Daily', schedule: 'Every day', nextRun: 'Today, 07:00 AM', lastCompleted: 'Today, 06:45 AM', active: true, category: 'health' },
  { id: 'rec_2', title: 'Morning Exercise', frequency: 'Daily', schedule: 'Every day', nextRun: 'Tomorrow, 06:30 AM', lastCompleted: 'Today, 06:35 AM', active: true, category: 'health' },
  { id: 'rec_3', title: 'Publish on LinkedIn', frequency: 'Daily', schedule: 'Every day', nextRun: 'Today, 09:00 AM', lastCompleted: 'Yesterday, 09:05 AM', active: true, category: 'personal' },
  { id: 'rec_4', title: 'Daily Networking', frequency: 'Daily', schedule: 'Every day', nextRun: 'Today, 10:00 AM', lastCompleted: 'Today, 10:10 AM', active: true, category: 'work' },
  { id: 'rec_5', title: 'Weekly SEO Report', frequency: 'Weekly', schedule: 'Every Monday', nextRun: 'Mon, 21 Jul, 11:00 AM', lastCompleted: 'Mon, 14 Jul, 11:05 AM', active: true, category: 'professional' },
  { id: 'rec_6', title: 'Team Review Meeting', frequency: 'Weekly', schedule: 'Every Friday', nextRun: 'Fri, 18 Jul, 04:00 PM', lastCompleted: 'Fri, 11 Jul, 04:05 PM', active: true, category: 'work' },
  { id: 'rec_7', title: 'Monthly Goal Review', frequency: 'Monthly', schedule: 'Day 1 of every month', nextRun: 'Fri, 01 Aug, 10:00 AM', lastCompleted: 'Tue, 01 Jul, 10:10 AM', active: true, category: 'personal' },
  { id: 'rec_8', title: 'Credit Card Payment', frequency: 'Monthly', schedule: 'Day 5 of every month', nextRun: 'Tue, 05 Aug, 09:00 AM', lastCompleted: 'Never', active: true, category: 'finance' },
  { id: 'rec_9', title: 'Mom\'s Birthday', frequency: 'Custom', schedule: 'Yearly on 12 Aug', nextRun: 'Tue, 12 Aug, 12:00 AM', lastCompleted: 'Mon, 12 Aug 2025, 12:00 AM', active: true, category: 'personal' },
];

export const VISUAL_THEME = {
  bg: '#FAFAFA',
  surface: '#FFFFFF',
  sidebar: '#FFFFFF',
  border: '#E4E4E7',
  borderAlt: '#F4F4F5',
  text: '#0F172A',
  textSec: '#64748B',
  accent: '#6366F1',
  accentHover: '#4F46E5'
};
