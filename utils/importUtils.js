// utils/importUtils.js
// Import tasks from CSV or JSON files — same format as export

/**
 * Parse a CSV file content into task objects
 * Expected CSV headers: Title, Description, Category, Subcategory, Priority, Status, Type, Deadline, Time, Created At
 */
export const parseCSVTasks = (csvContent) => {
  const lines = csvContent.trim().split('\n');
  if (lines.length < 2) throw new Error('CSV file is empty or has no data rows');

  const headers = parseCSVLine(lines[0]).map(h => h.trim().toLowerCase());

  const requiredHeaders = ['title'];
  const missing = requiredHeaders.filter(h => !headers.includes(h));
  if (missing.length > 0) throw new Error(`Missing required columns: ${missing.join(', ')}`);

  const tasks = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = parseCSVLine(line);
    const row = {};
    headers.forEach((h, idx) => {
      row[h] = (values[idx] || '').trim();
    });

    if (!row.title) continue;

    tasks.push({
      title: row.title,
      description: row.description || '',
      category: normalizeCategory(row.category),
      subcategory: row.subcategory || 'General',
      priority: normalizePriority(row.priority),
      status: normalizeStatus(row.status),
      type: normalizeType(row.type),
      deadline: normalizeDeadline(row.deadline),
      time: row.time || '09:00 AM',
    });
  }

  if (tasks.length === 0) throw new Error('No valid tasks found in CSV');
  return tasks;
};

/**
 * Parse a JSON file content into task objects
 */
export const parseJSONTasks = (jsonContent) => {
  let parsed;
  try {
    parsed = JSON.parse(jsonContent);
  } catch (e) {
    throw new Error('Invalid JSON file — check file format');
  }

  if (!Array.isArray(parsed)) {
    throw new Error('JSON file should contain an array of tasks');
  }

  if (parsed.length === 0) throw new Error('JSON file has no tasks');

  const tasks = parsed
    .filter(item => item.title && item.title.trim())
    .map(item => ({
      title: item.title.trim(),
      description: item.description || '',
      category: normalizeCategory(item.category),
      subcategory: item.subcategory || 'General',
      priority: normalizePriority(item.priority),
      status: normalizeStatus(item.status),
      type: normalizeType(item.type),
      deadline: normalizeDeadline(item.deadline),
      time: item.time || '09:00 AM',
    }));

  if (tasks.length === 0) throw new Error('No valid tasks found in JSON');
  return tasks;
};

/**
 * Main import handler — detects file type and parses accordingly
 */
export const importTasksFromFile = (file) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('No file selected'));
      return;
    }

    const fileName = file.name.toLowerCase();
    const isCSV = fileName.endsWith('.csv');
    const isJSON = fileName.endsWith('.json');

    if (!isCSV && !isJSON) {
      reject(new Error('Only .csv and .json files are supported'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target.result;
        const tasks = isCSV ? parseCSVTasks(content) : parseJSONTasks(content);
        resolve(tasks);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};

// ── Helper functions ──

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (inQuotes) {
      if (char === '"' && line[i + 1] === '"') {
        current += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        current += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
  }
  result.push(current);
  return result;
}

const VALID_CATEGORIES = ['personal', 'work', 'professional', 'leadgen', 'clients', 'health', 'learning', 'finance'];
function normalizeCategory(val) {
  if (!val) return 'personal';
  const lower = val.toLowerCase().trim();
  if (VALID_CATEGORIES.includes(lower)) return lower;
  const match = VALID_CATEGORIES.find(c => lower.includes(c) || c.includes(lower));
  return match || 'personal';
}

function normalizePriority(val) {
  if (!val) return 'medium';
  const lower = val.toLowerCase().trim();
  if (['high', 'medium', 'low'].includes(lower)) return lower;
  return 'medium';
}

function normalizeStatus(val) {
  if (!val) return 'pending';
  const lower = val.toLowerCase().trim();
  if (lower === 'done' || lower === 'completed' || lower === 'complete') return 'done';
  return 'pending';
}

function normalizeType(val) {
  if (!val) return 'one-time';
  const lower = val.toLowerCase().trim().replace(/\s+/g, '-');
  if (['one-time', 'daily', 'weekly', 'monthly'].includes(lower)) return lower;
  if (lower === 'onetime' || lower === 'once') return 'one-time';
  return 'one-time';
}

function normalizeDeadline(val) {
  if (!val) return '';
  if (/^\d{4}-\d{2}-\d{2}/.test(val)) return val.substring(0, 10);
  const ddmm = val.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (ddmm) return `${ddmm[3]}-${ddmm[2].padStart(2, '0')}-${ddmm[1].padStart(2, '0')}`;
  try {
    const d = new Date(val);
    if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];
  } catch (e) {}
  return '';
}
