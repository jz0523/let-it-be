/** Web Notifications with a quiet fallback: callers always show an in-app prompt too. */

export function notifySupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function notifyGranted(): boolean {
  return notifySupported() && Notification.permission === 'granted';
}

export async function askToNotify(): Promise<boolean> {
  if (!notifySupported()) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  try {
    return (await Notification.requestPermission()) === 'granted';
  } catch {
    return false;
  }
}

export function notify(title: string, body: string) {
  if (!notifyGranted()) return;
  try {
    new Notification(title, { body, icon: `${import.meta.env.BASE_URL}icon.svg`, tag: 'letitbe' });
  } catch {
    // Some browsers only allow notifications from a service worker. The in-app prompt covers it.
  }
}
