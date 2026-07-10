export const todayStr = () => new Date().toISOString().split('T')[0];

export const formatIndianDate = () => {
  return new Date().toLocaleDateString('en-IN', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric' 
  });
};
