import { useEffect, useMemo } from 'react';
import { ALL_MAIL_PAGE_SIZE } from '../constants';
import {
  addDays,
  buildCalendarDays,
  getMailboxDatePreset,
  toDateInputValue,
  todayKey
} from '../utils/date';
import {
  buildCalendarDayStats,
  getAnalysisQueueCounts,
  getAnalysisQueueEmails,
  getAnalysisSkippedReasonStats,
  getEmailsForDate,
  getEmailsForMailboxCategory,
  getFilteredMailboxEmails,
  getFilteredSpotlightEmails,
  getFirstEmailId,
  getMailboxAnalysisCounts,
  getMailboxCounts,
  getOpenSpotlightEmails,
  getPagedEmails,
  getProcessedTodayEmails,
  getSpotlightTabCounts,
  getTotalPages,
  hasEmailId,
  sortEmailsByReceivedDesc
} from '../utils/mailbox';
import type {
  AnalysisQueueFilter,
  AuthSession,
  EmailListItem,
  MailboxAnalysisFilter,
  MailboxCategory,
  MailboxDatePreset,
  MailboxOverview,
  NavView,
  SpotlightFilter
} from '../types';

type UseMailboxViewsOptions = {
  authSession: AuthSession | null;
  navView: NavView;
  userId: string;
  overview: MailboxOverview;
  allEmails: EmailListItem[];
  primaryMailAccountEmail: string | null;
  selectedEmailId: string;
  expandedMailId: string | null;
  spotlightFilter: SpotlightFilter;
  listQuery: string;
  calendarMonth: string;
  selectedCalendarDate: string;
  allMailQuery: string;
  allMailSenderQuery: string;
  allMailStartDate: string;
  allMailEndDate: string;
  allMailSearchBody: boolean;
  allMailPage: number;
  mailboxCategory: MailboxCategory;
  mailboxAnalysisFilter: MailboxAnalysisFilter;
  analysisQueueFilter: AnalysisQueueFilter;
  setCalendarMonth: (monthKey: string) => void;
  setSelectedCalendarDate: (dateKey: string) => void;
  setAllMailStartDate: (date: string) => void;
  setAllMailEndDate: (date: string) => void;
  setAllMailAdvancedSearchOpen: (open: boolean) => void;
  setAllMailPage: (page: number) => void;
  setSelectedEmailId: (emailId: string) => void;
  setExpandedMailId: (emailId: string | null) => void;
};

export function useMailboxViews({
  authSession,
  navView,
  userId,
  overview,
  allEmails,
  primaryMailAccountEmail,
  selectedEmailId,
  expandedMailId,
  spotlightFilter,
  listQuery,
  calendarMonth,
  selectedCalendarDate,
  allMailQuery,
  allMailSenderQuery,
  allMailStartDate,
  allMailEndDate,
  allMailSearchBody,
  allMailPage,
  mailboxCategory,
  mailboxAnalysisFilter,
  analysisQueueFilter,
  setCalendarMonth,
  setSelectedCalendarDate,
  setAllMailStartDate,
  setAllMailEndDate,
  setAllMailAdvancedSearchOpen,
  setAllMailPage,
  setSelectedEmailId,
  setExpandedMailId
}: UseMailboxViewsOptions) {
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

  useEffect(() => {
    if (!authSession) {
      return;
    }
    setAllMailPage(1);
    setExpandedMailId(null);
  }, [authSession, allMailQuery, allMailSenderQuery, allMailStartDate, allMailEndDate, mailboxCategory, mailboxAnalysisFilter, userId]);

  useEffect(() => {
    if (allMailPage > allMailTotalPages) {
      setAllMailPage(allMailTotalPages);
    }
  }, [allMailPage, allMailTotalPages]);

  useEffect(() => {
    if (filteredSpotlight.length > 0 && !hasEmailId(filteredSpotlight, selectedEmailId)) {
      setSelectedEmailId(getFirstEmailId(filteredSpotlight));
    }
  }, [filteredSpotlight, selectedEmailId]);

  useEffect(() => {
    if (
      navView === 'allMail' &&
      filteredAllEmails.length > 0 &&
      expandedMailId &&
      !hasEmailId(filteredAllEmails, expandedMailId)
    ) {
      setExpandedMailId(null);
    }
  }, [navView, filteredAllEmails, expandedMailId]);

  const changeCalendarMonth = (monthKey: string) => {
    setCalendarMonth(monthKey);
    setSelectedCalendarDate(`${monthKey}-01`);
    setExpandedMailId(null);
  };

  const selectCalendarDate = (dateKey: string) => {
    setSelectedCalendarDate(dateKey);
    setCalendarMonth(dateKey.slice(0, 7));
    setExpandedMailId(null);
  };

  const selectTodayInCalendar = () => {
    const today = todayKey();
    setCalendarMonth(today.slice(0, 7));
    setSelectedCalendarDate(today);
  };

  const applyMailboxDatePreset = (preset: MailboxDatePreset) => {
    const today = todayKey();

    if (preset === 'all') {
      setAllMailStartDate('');
      setAllMailEndDate('');
      return;
    }

    if (preset === 'today') {
      setAllMailStartDate(today);
      setAllMailEndDate(today);
      return;
    }

    if (preset === 'week') {
      setAllMailStartDate(toDateInputValue(addDays(new Date(), -6)));
      setAllMailEndDate(today);
      return;
    }

    if (preset === 'month') {
      setAllMailStartDate(toDateInputValue(addDays(new Date(), -29)));
      setAllMailEndDate(today);
      return;
    }

    setAllMailAdvancedSearchOpen(true);
  };

  return {
    sortedEmails,
    sortedAllEmails,
    tabCounts,
    analysisQueueCounts,
    analysisQueueEmails,
    processedTodayEmails,
    calendarDays,
    calendarYear,
    calendarMonthNumber,
    selectedCalendarEmails,
    mailboxDatePreset,
    analysisSkippedReasonStats,
    filteredSpotlight,
    filteredAllEmails,
    mailboxCounts,
    mailboxAnalysisCounts,
    allMailTotalPages,
    pagedAllEmails,
    changeCalendarMonth,
    selectCalendarDate,
    selectTodayInCalendar,
    applyMailboxDatePreset
  };
}
