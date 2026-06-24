import { useMemo } from 'react';
import { ALL_MAIL_PAGE_SIZE } from '../constants';
import type { EmailListItem, MailboxAnalysisFilter, MailboxCategory } from '../types';
import { getMailboxAnalysisCounts } from '../utils/mailAnalysisQueue';
import {
  getEmailsForMailboxCategory,
  getFilteredMailboxEmails,
  getMailboxCounts
} from '../utils/mailFilters';
import { getPagedEmails, getTotalPages } from '../utils/mailPagination';

type UseFilteredMailboxViewsOptions = {
  sortedAllEmails: EmailListItem[];
  mailboxAccountId: string;
  mailboxCategory: MailboxCategory;
  primaryMailAccountEmail: string | null;
  mailboxAnalysisFilter: MailboxAnalysisFilter;
  query: string;
  senderQuery: string;
  startDate: string;
  endDate: string;
  searchBody: boolean;
  page: number;
};

export function useFilteredMailboxViews({
  sortedAllEmails,
  mailboxAccountId,
  mailboxCategory,
  primaryMailAccountEmail,
  mailboxAnalysisFilter,
  query,
  senderQuery,
  startDate,
  endDate,
  searchBody,
  page
}: UseFilteredMailboxViewsOptions) {
  const accountEmails = useMemo(
    () => mailboxAccountId === 'all'
      ? sortedAllEmails
      : sortedAllEmails.filter((email) => email.mailAccountId === mailboxAccountId),
    [mailboxAccountId, sortedAllEmails]
  );
  const categoryEmails = useMemo(
    () => getEmailsForMailboxCategory(accountEmails, mailboxCategory, primaryMailAccountEmail),
    [accountEmails, mailboxCategory, primaryMailAccountEmail]
  );
  const filteredEmails = useMemo(
    () => getFilteredMailboxEmails(categoryEmails, {
      analysisFilter: mailboxAnalysisFilter,
      query,
      senderQuery,
      startDate,
      endDate,
      searchBody
    }),
    [categoryEmails, mailboxAnalysisFilter, query, senderQuery, startDate, endDate, searchBody]
  );
  const mailboxCounts = useMemo(
    () => getMailboxCounts(accountEmails, primaryMailAccountEmail),
    [accountEmails, primaryMailAccountEmail]
  );
  const mailboxAnalysisCounts = useMemo(
    () => getMailboxAnalysisCounts(categoryEmails),
    [categoryEmails]
  );
  const totalPages = getTotalPages(filteredEmails.length, ALL_MAIL_PAGE_SIZE);
  const pagedEmails = useMemo(
    () => getPagedEmails(filteredEmails, page, ALL_MAIL_PAGE_SIZE),
    [filteredEmails, page]
  );

  return { filteredEmails, mailboxCounts, mailboxAnalysisCounts, pagedEmails, totalPages };
}
