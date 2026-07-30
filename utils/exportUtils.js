// utils/exportUtils.js

export const exportTasksAsCSV = (tasks) => {
  if (!tasks || tasks.length === 0) {
    alert('No tasks to export!');
    return;
  }

  const headers = ['Title', 'Description', 'Category', 'Subcategory', 'Priority', 'Status', 'Type', 'Deadline', 'Time', 'Created At'];
  
  const csvRows = [
    headers.join(','),
    ...tasks.map(t => [
      `"${(t.title || '').replace(/"/g, '""')}"`,
      `"${(t.description || '').replace(/"/g, '""')}"`,
      `"${t.category || ''}"`,
      `"${t.subcategory || 'General'}"`,
      `"${t.priority || 'medium'}"`,
      `"${t.status || 'pending'}"`,
      `"${t.type || 'one-time'}"`,
      `"${t.deadline || ''}"`,
      `"${t.time || ''}"`,
      `"${t.created_at || ''}"`
    ].join(','))
  ];

  const csvContent = csvRows.join('\n');
  downloadFile(csvContent, 'tasks-export.csv', 'text/csv;charset=utf-8;');
};

export const exportTasksAsJSON = (tasks) => {
  if (!tasks || tasks.length === 0) {
    alert('No tasks to export!');
    return;
  }

  const cleanTasks = tasks.map(t => ({
    title: t.title,
    description: t.description || '',
    category: t.category,
    subcategory: t.subcategory || 'General',
    priority: t.priority,
    status: t.status,
    type: t.type,
    deadline: t.deadline || '',
    time: t.time || '',
    created_at: t.created_at || ''
  }));

  const jsonContent = JSON.stringify(cleanTasks, null, 2);
  downloadFile(jsonContent, 'tasks-export.json', 'application/json');
};

function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
