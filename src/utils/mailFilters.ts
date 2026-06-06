import type { EmailListItem, MailboxAnalysisFilter, MailboxCategory } from '../types';
import { toDateInputValue } from './date';
import { getEmailsForAnalysisFilter } from './mailAnalysisQueue';

type MailboxEmailFilterOptions = {
  analysisFilter: MailboxAnalysisFilter;
  query: string;
  senderQuery: string;
  startDate: string;
  endDate: string;
  searchBody: boolean;
};

export function getEmailsForMailboxCategory(
  emails: EmailListItem[],
  category: MailboxCategory,
  primaryMailAccountEmail: string | null
) {
  if (category === 'inbox') {
    return emails.filter((email) => email.fromEmail !== primaryMailAccountEmail);
  }
  if (category === 'sent') {
    return emails.filter((email) => email.fromEmail === primaryMailAccountEmail);
  }
  return emails;
}

export function getMailboxCounts(emails: EmailListItem[], primaryMailAccountEmail: string | null) {
  const sent = emails.filter((email) => email.fromEmail === primaryMailAccountEmail).length;
  return {
    all: emails.length,
    sent,
    inbox: emails.length - sent
  };
}

export function getFilteredMailboxEmails(emails: EmailListItem[], options: MailboxEmailFilterOptions) {
  let list = getEmailsForAnalysisFilter(emails, options.analysisFilter);

  const q = options.searchBody ? '' : options.query.trim().toLowerCase();
  if (q) {
    list = list.filter(
      (email) =>
        email.subject.toLowerCase().includes(q) ||
        (email.shortSummary?.toLowerCase().includes(q) ?? false) ||
        (email.snippet?.toLowerCase().includes(q) ?? false)
    );
  }

  const senderQuery = options.senderQuery.trim().toLowerCase();
  if (senderQuery) {
    list = list.filter(
      (email) =>
        email.fromEmail.toLowerCase().includes(senderQuery) ||
        (email.fromName?.toLowerCase().includes(senderQuery) ?? false)
    );
  }

  if (options.startDate) {
    list = list.filter((email) => toDateInputValue(new Date(email.receivedAt)) >= options.startDate);
  }

  if (options.endDate) {
    list = list.filter((email) => toDateInputValue(new Date(email.receivedAt)) <= options.endDate);
  }

  return list;
}
