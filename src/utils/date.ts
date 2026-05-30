import type { MailboxDatePreset } from '../types';

export function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function toDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function todayKey() {
  return toDateInputValue(new Date());
}

export function shiftMonthKey(monthKey: string, amount: number) {
  const [year, month] = monthKey.split('-').map(Number);
  const date = new Date(year, month - 1 + amount, 1);
  return toDateInputValue(date).slice(0, 7);
}

export function buildCalendarDays(
  monthKey: string,
  stats: Map<string, { total: number; unread: number; needsReply: number; attention: number }>
) {
  const [year, month] = monthKey.split('-').map(Number);
  const firstDay = new Date(year, month - 1, 1);
  const start = addDays(firstDay, -firstDay.getDay());

  return Array.from({ length: 42 }, (_, index) => {
    const date = addDays(start, index);
    const dateKey = toDateInputValue(date);
    return {
      dateKey,
      dayOfMonth: date.getDate(),
      inCurrentMonth: date.getMonth() === month - 1,
      stats: stats.get(dateKey) ?? { total: 0, unread: 0, needsReply: 0, attention: 0 }
    };
  });
}

export function formatCalendarMonth(monthKey: string) {
  const [year, month] = monthKey.split('-').map(Number);
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long'
  }).format(new Date(year, month - 1, 1));
}

export function formatCalendarDate(dateKey: string) {
  return new Intl.DateTimeFormat('ko-KR', {
    month: 'long',
    day: 'numeric',
    weekday: 'short'
  }).format(new Date(`${dateKey}T00:00:00`));
}

export function getMailboxDatePreset(startDate: string, endDate: string): MailboxDatePreset {
  const today = todayKey();
  const weekStart = toDateInputValue(addDays(new Date(), -6));
  const monthStart = toDateInputValue(addDays(new Date(), -29));

  if (!startDate && !endDate) {
    return 'all';
  }
  if (startDate === today && endDate === today) {
    return 'today';
  }
  if (startDate === weekStart && endDate === today) {
    return 'week';
  }
  if (startDate === monthStart && endDate === today) {
    return 'month';
  }
  return 'custom';
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat('ko-KR', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(value));
}
