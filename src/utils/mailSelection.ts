import type { EmailListItem, MailboxOverview } from '../types';

export function findSelectedMailItem(
  selectedEmailId: string,
  allEmails: EmailListItem[],
  sortedEmails: EmailListItem[],
  overview: MailboxOverview
) {
  return (
    allEmails.find((email) => email.id === selectedEmailId) ??
    sortedEmails.find((email) => email.id === selectedEmailId) ??
    overview.spotlightEmails.find((email) => email.id === selectedEmailId) ??
    null
  );
}

export function findAdjacentMailItems(selectedEmailId: string, emails: EmailListItem[]) {
  const index = emails.findIndex((email) => email.id === selectedEmailId);
  return {
    previousEmail: index > 0 ? emails[index - 1] : null,
    nextEmail: index >= 0 && index < emails.length - 1 ? emails[index + 1] : null
  };
}
