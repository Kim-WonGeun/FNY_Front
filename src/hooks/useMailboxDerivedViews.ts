import { useMemo } from 'react';
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
  getAnalysisSkippedReasonStats
} from '../utils/mailAnalysisQueue';
import {
  getFilteredSpotlightEmails,
  getOpenSpotlightEmails,
  getProcessedTodayEmails,
  getSpotlightTabCounts
} from '../utils/mailSpotlight';
import { sortEmailsByReceivedDesc } from '../utils/mailSorting';
import { useFilteredMailboxViews } from './useFilteredMailboxViews';
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
  mailboxAccountId: string;
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
  mailboxAccountId,
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
  const {
    filteredEmails: filteredAllEmails,
    mailboxCounts,
    mailboxAnalysisCounts,
    pagedEmails: pagedAllEmails,
    totalPages: allMailTotalPages
  } = useFilteredMailboxViews({
    sortedAllEmails,
    mailboxAccountId,
    mailboxCategory,
    primaryMailAccountEmail,
    mailboxAnalysisFilter,
    query: allMailQuery,
    senderQuery: allMailSenderQuery,
    startDate: allMailStartDate,
    endDate: allMailEndDate,
    searchBody: allMailSearchBody,
    page: allMailPage
  });

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
