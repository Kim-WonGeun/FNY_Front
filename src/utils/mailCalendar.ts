import type { EmailListItem } from '../types';
import { toDateInputValue } from './date';
import { isOpenAttentionStatus } from './mailAttention';

export function buildCalendarDayStats(emails: EmailListItem[]) {
  const stats = new Map<string, { total: number; unread: number; needsReply: number; attention: number }>();

  emails.forEach((email) => {
    const dateKey = toDateInputValue(new Date(email.receivedAt));
    const current = stats.get(dateKey) ?? { total: 0, unread: 0, needsReply: 0, attention: 0 };
    current.total += 1;
    if (!email.read) {
      current.unread += 1;
    }
    if (email.needsReply) {
      current.needsReply += 1;
    }
    if (isOpenAttentionStatus(email.attentionStatus)) {
      current.attention += 1;
    }
    stats.set(dateKey, current);
  });

  return stats;
}

export function getEmailsForDate(emails: EmailListItem[], dateKey: string) {
  return emails.filter((email) => toDateInputValue(new Date(email.receivedAt)) === dateKey);
}
