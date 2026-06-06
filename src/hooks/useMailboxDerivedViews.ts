import { useMemo } from 'react';
import { ALL_MAIL_PAGE_SIZE } from '../constants';
import {
  buildCalendarDays,
  getMailboxDatePreset
} from '../utils/date';
import {
  buildCalendarDayStats,
  getEmailsForDate
} from '../utils/mailCalendar';
import {
  getAnalysisQueueCounts,
  getAnalysisQueueEmails,
  getAnalysisSkippedReasonStats,
  getMailboxAnalysisCounts
} from '../utils/mailAnalysisQueue';
import {
  getEmailsForMailboxCategory,
  getFilteredMailboxEmails,
  getMailboxCounts
} from '../utils/mailFilters';
import {
  getPagedEmails,
  getTotalPages
} from '../utils/mailPagination';
import {
  getFilteredSpotlightEmails,
  getOpenSpotlightEmails,
  getProcessedTodayEmails,
  getSpotlightTabCounts
} from '../utils/mailSpotlight';
import { sortEmailsByReceivedDesc } from '../utils/mailSorting';
import type {
  AnalysisQueueFilter,
  EmailListItem,
  MailboxAnalysisFilter,
  MailboxCategory,
  MailboxOverview,
  SpotlightFilter
} from '../types';

type UseMailboxDerivedViewsOptions = {
  allEmails: EmailListItem[];
  allMailEndDate: string;
  allMailPage: number;
  allMailQuery: string;
  allMailSearchBody: boolean;
  allMailSenderQuery: string;
  allMailStartDate: string;
  analysisQueueFilter: AnalysisQueueFilter;
  calendarMonth: string;
  listQuery: string;
  mailboxAnalysisFilter: MailboxAnalysisFilter;
  mailboxCategory: MailboxCategory;
  overview: MailboxOverview;
  primaryMailAccountEmail: string | null;
  selectedCalendarDate: string;
  spotlightFilter: SpotlightFilter;
};

export function useMailboxDerivedViews({
  allEmails,
  allMailEndDate,
  allMailPage,
  allMailQuery,
  allMailSearchBody,
  allMailSenderQuery,
  allMailStartDate,
  analysisQueueFilter,
  calendarMonth,
  listQuery,
  mailboxAnalysisFilter,
  mailboxCategory,
  overview,
  primaryMailAccountEmail,
  selectedCalendarDate,
  spotlightFilter
}: UseMailboxDerivedViewsOptions) {
  const sortedEmails = useMemo(() => getOpenSpotlightEmails(overview.spotlightEmails), [overview.spotlightEmails]);
  const sortedAllEmails = useMemo(() => sortEmailsByReceivedDesc(allEmails), [allEmails]);
  const tabCounts = useMemo(() => getSpotlightTabCounts(sortedEmails), [sortedEmails]);
  const analysisQueueCounts = useMemo(() => getAnalysisQueueCounts(sortedAllEmails), [sortedAllEmails]);
  const analysisQueueEmails = useMemo(
    () => getAnalysisQueueEmails(sortedAllEmails, analysisQueueFilter),
    [sortedAllEmails, analysisQueueFilter]
  );
  const processedTodayEmails = useMemo(() => getProcessedTodayEmails(sortedAllEmails), [sortedAllEmails]);
  const calendarDayStats = useMemo(() => buildCalendarDayStats(sortedAllEmails), [sortedAllEmails]);
  const calendarDays = useMemo(
    () => buildCalendarDays(calendarMonth, calendarDayStats),
    [calendarMonth, calendarDayStats]
  );
  const calendarYear = Number(calendarMonth.slice(0, 4));
  const calendarMonthNumber = Number(calendarMonth.slice(5, 7));
  const selectedCalendarEmails = useMemo(
    () => getEmailsForDate(sortedAllEmails, selectedCalendarDate),
    [sortedAllEmails, selectedCalendarDate]
  );
  const mailboxDatePreset = getMailboxDatePreset(allMailStartDate, allMailEndDate);
  const analysisSkippedReasonStats = useMemo(
    () => getAnalysisSkippedReasonStats(sortedAllEmails),
    [sortedAllEmails]
  );
  const filteredSpotlight = useMemo(
    () => getFilteredSpotlightEmails(sortedEmails, spotlightFilter, listQuery),
    [sortedEmails, spotlightFilter, listQuery]
  );
  const mailboxCategoryEmails = useMemo(
    () => getEmailsForMailboxCategory(sortedAllEmails, mailboxCategory, primaryMailAccountEmail),
    [sortedAllEmails, mailboxCategory, primaryMailAccountEmail]
  );
  const filteredAllEmails = useMemo(() => {
    return getFilteredMailboxEmails(mailboxCategoryEmails, {
      analysisFilter: mailboxAnalysisFilter,
      query: allMailQuery,
      senderQuery: allMailSenderQuery,
      startDate: allMailStartDate,
      endDate: allMailEndDate,
      searchBody: allMailSearchBody
    });
  }, [mailboxCategoryEmails, mailboxAnalysisFilter, allMailQuery, allMailSenderQuery, allMailStartDate, allMailEndDate, allMailSearchBody]);
  const mailboxCounts = useMemo(
    () => getMailboxCounts(sortedAllEmails, primaryMailAccountEmail),
    [sortedAllEmails, primaryMailAccountEmail]
  );
  const mailboxAnalysisCounts = useMemo(
    () => getMailboxAnalysisCounts(mailboxCategoryEmails),
    [mailboxCategoryEmails]
  );
  const allMailTotalPages = getTotalPages(filteredAllEmails.length, ALL_MAIL_PAGE_SIZE);
  const pagedAllEmails = useMemo(
    () => getPagedEmails(filteredAllEmails, allMailPage, ALL_MAIL_PAGE_SIZE),
    [filteredAllEmails, allMailPage]
  );

  return {
    allMailTotalPages,
    analysisQueueCounts,
    analysisQueueEmails,
    analysisSkippedReasonStats,
    calendarDays,
    calendarMonthNumber,
    calendarYear,
    filteredAllEmails,
    filteredSpotlight,
    mailboxAnalysisCounts,
    mailboxCounts,
    mailboxDatePreset,
    pagedAllEmails,
    processedTodayEmails,
    selectedCalendarEmails,
    sortedAllEmails,
    sortedEmails,
    tabCounts
  };
}
