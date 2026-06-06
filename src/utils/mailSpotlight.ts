import type { EmailListItem, SpotlightFilter } from '../types';
import { toDateInputValue, todayKey } from './date';
import { isOpenAttentionStatus, scoreEmail } from './mailAttention';

export function getProcessedTodayEmails(emails: EmailListItem[]) {
  const today = todayKey();
  return emails
    .filter(
      (email) =>
        !isOpenAttentionStatus(email.attentionStatus) &&
        email.attentionStatusUpdatedAt &&
        toDateInputValue(new Date(email.attentionStatusUpdatedAt)) === today
    )
    .slice(0, 5);
}

export function getOpenSpotlightEmails(emails: EmailListItem[]) {
  return emails
    .filter((email) => isOpenAttentionStatus(email.attentionStatus))
    .sort((a, b) => scoreEmail(b) - scoreEmail(a));
}

export function getSpotlightTabCounts(emails: EmailListItem[]) {
  const urgent = (email: EmailListItem) =>
    email.attentionReasons.includes('HIGH_PRIORITY') || email.priorityLevel === 'P1';
  return {
    all: emails.length,
    urgent: emails.filter(urgent).length,
    reply: emails.filter((email) => email.needsReply).length,
    unread: emails.filter((email) => !email.read).length
  };
}

export function getFilteredSpotlightEmails(
  emails: EmailListItem[],
  filter: SpotlightFilter,
  query: string
) {
  let list = emails;
  if (filter === 'urgent') {
    list = list.filter(
      (email) => email.attentionReasons.includes('HIGH_PRIORITY') || email.priorityLevel === 'P1'
    );
  } else if (filter === 'reply') {
    list = list.filter((email) => email.needsReply);
  } else if (filter === 'unread') {
    list = list.filter((email) => !email.read);
  }

  const q = query.trim().toLowerCase();
  if (!q) {
    return list;
  }

  return list.filter(
    (email) =>
      email.subject.toLowerCase().includes(q) ||
      email.fromEmail.toLowerCase().includes(q) ||
      (email.fromName?.toLowerCase().includes(q) ?? false)
  );
}
