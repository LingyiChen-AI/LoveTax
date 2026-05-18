import { formatInTimeZone } from 'date-fns-tz';

export function toLocalDate(when: Date, tz: string): string {
  return formatInTimeZone(when, tz, 'yyyy-MM-dd');
}

export function todayInTz(tz: string): string {
  return toLocalDate(new Date(), tz);
}

export function daysAgo(yyyyMmDd: string, n: number): string {
  const [y, m, d] = yyyyMmDd.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() - n);
  return dt.toISOString().slice(0, 10);
}
