// 1. Edit mode ke liye useEffect verify karein
useEffect(() => {
  if (editingTask) {
    setFormData({
      title: editingTask.title || '',
      description: editingTask.description || '',
      category: editingTask.category || 'Personal',
      priority: editingTask.priority || 'MEDIUM',
      date: editingTask.date || new Date().toISOString().split('T')[0],
      // Time ko correctly payload se populate karein:
      time: editingTask.time || '09:00', 
    });
  }
}, [editingTask]);

// 2. Submit Handle karte waqt ensure karein ki time payload mein ja raha hai
const handleSubmit = async (e) => {
  e.preventDefault();
  
  const payload = {
    ...formData,
    // Explicitly send selected time
    time: formData.time || "09:00", 
  };

  if (editingTask) {
    await updateTask(editingTask.id, payload);
  } else {
    await createTask(payload);
  }
};
