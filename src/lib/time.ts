const OFFSET_KEY = 'letitbe-dev-offset-ms';

/** Development-only clock offset, so day and week locks can be tested. */
export function devOffsetMs(): number {
  if (!import.meta.env.DEV) return 0;
  try {
    return Number(localStorage.getItem(OFFSET_KEY) ?? 0) || 0;
  } catch {
    return 0;
  }
}

export function setDevOffsetMs(ms: number) {
  if (!import.meta.env.DEV) return;
  localStorage.setItem(OFFSET_KEY, String(ms));
}

export function now(): number {
  return Date.now() + devOffsetMs();
}

const pad = (n: number) => String(n).padStart(2, '0');

/** Local calendar day as YYYY-MM-DD. */
export function dateKey(ms: number = now()): string {
  const d = new Date(ms);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function keyToDate(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(key: string, n: number): string {
  const d = keyToDate(key);
  d.setDate(d.getDate() + n);
  return dateKey(d.getTime());
}

export function daysBetween(a: string, b: string): number {
  return Math.round((keyToDate(b).getTime() - keyToDate(a).getTime()) / 86_400_000);
}

export function formatDay(key: string): string {
  return keyToDate(key).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' });
}

export function formatShortDay(key: string): string {
  return keyToDate(key).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}

export function formatClock(ms: number): string {
  return new Date(ms).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

/** "20:00" as the reader's locale writes it, to match the browser's own time field. */
export function formatPracticeTime(hhmm: string): string {
  const [h, m] = hhmm.split(':').map(Number);
  const d = new Date(2000, 0, 1, h || 0, m || 0);
  return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

export function minutesOfDay(ms: number = now()): number {
  const d = new Date(ms);
  return d.getHours() * 60 + d.getMinutes();
}

export function parseClock(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

/** Monday of the week containing the given day. */
export function weekStart(key: string): string {
  const d = keyToDate(key);
  const shift = (d.getDay() + 6) % 7;
  return addDays(key, -shift);
}
