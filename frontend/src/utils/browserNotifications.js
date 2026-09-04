// Browser Notification Utility for Smriti Scheduled Reminders

export function isNotificationSupported() {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function getNotificationPermission() {
  if (!isNotificationSupported()) return 'unsupported';
  return Notification.permission;
}

export async function requestNotificationPermission() {
  if (!isNotificationSupported()) return 'unsupported';
  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (err) {
    console.warn('Notification permission request error:', err);
    return Notification.permission;
  }
}

export function sendBrowserNotification({ title, body, icon, tag }) {
  if (!isNotificationSupported() || Notification.permission !== 'granted') {
    return null;
  }

  try {
    // High-contrast clean flower icon for Smriti notification
    const defaultFlowerIcon = 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=192&auto=format&fit=crop&q=80';

    const notif = new Notification(title, {
      body,
      icon: icon || defaultFlowerIcon,
      badge: '/favicon.svg',
      tag: tag || `smriti-rem-${Date.now()}`,
      silent: false
    });

    notif.onclick = () => {
      try {
        window.focus();
      } catch (e) {
        // Safe focus fallback
      }
      notif.close();
    };

    return notif;
  } catch (err) {
    console.warn('Failed to fire browser notification:', err);
    return null;
  }
}
