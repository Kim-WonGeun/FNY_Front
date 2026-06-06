import type { EmailListItem } from '../types';

export function sortEmailsByReceivedDesc(emails: EmailListItem[]) {
  return [...emails].sort((a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime());
}
