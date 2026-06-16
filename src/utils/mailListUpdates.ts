import type { EmailListItem, MailboxOverview } from '../types';

export function upsertEmailListItem(emails: EmailListItem[], item: EmailListItem) {
  if (emails.some((email) => email.id === item.id)) {
    return emails.map((email) => (email.id === item.id ? item : email));
  }

  return [item, ...emails];
}

export function updateOverviewSpotlightEmail(overview: MailboxOverview, item: EmailListItem) {
  if (!overview.spotlightEmails.some((email) => email.id === item.id)) {
    return overview;
  }

  return {
    ...overview,
    spotlightEmails: overview.spotlightEmails.map((email) => (email.id === item.id ? item : email))
  };
}
