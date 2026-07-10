export const notificationService = {
  hasSupport() {
    return typeof window !== 'undefined' && 'Notification' in window;
  },
  getPermission() {
    return this.hasSupport() ? Notification.permission : 'denied';
  },
  async requestPermission() {
    if (this.hasSupport() && Notification.permission === 'default') {
      return await Notification.requestPermission();
    }
    return this.getPermission();
  },
  send(title, body) {
    if (this.hasSupport() && Notification.permission === 'granted') {
      new Notification(title, { body, icon: '⚡' });
    }
  }
};
