import type { EmailListItem } from '../types';

export function getTotalPages(itemCount: number, pageSize: number) {
  return Math.max(1, Math.ceil(itemCount / pageSize));
}

export function getPagedEmails(emails: EmailListItem[], page: number, pageSize: number) {
  const totalPages = getTotalPages(emails.length, pageSize);
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * pageSize;
  return emails.slice(start, start + pageSize);
}

export function getPageForEmailId(emails: EmailListItem[], emailId: string, pageSize: number) {
  const index = emails.findIndex((email) => email.id === emailId);
  return index >= 0 ? Math.floor(index / pageSize) + 1 : 1;
}

export function hasEmailId(emails: EmailListItem[], emailId: string | null | undefined) {
  return Boolean(emailId && emails.some((email) => email.id === emailId));
}

export function getFirstEmailId(emails: EmailListItem[]) {
  return emails[0]?.id ?? '';
}

export function resolveSelectedEmailId(emails: EmailListItem[], currentEmailId: string) {
  return hasEmailId(emails, currentEmailId) ? currentEmailId : getFirstEmailId(emails);
}
