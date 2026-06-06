import { useMailboxCalendarActions } from './useMailboxCalendarActions';
import { useMailboxDatePresetActions } from './useMailboxDatePresetActions';
import { useMailboxDerivedViews } from './useMailboxDerivedViews';
import { useMailboxViewGuards } from './useMailboxViewGuards';
import type {
  AnalysisQueueFilter,
  AuthSession,
  EmailListItem,
  MailboxAnalysisFilter,
  MailboxCategory,
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
  const derived = useMailboxDerivedViews({
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
  });

  useMailboxViewGuards({
    allMailEndDate,
    allMailPage,
    allMailQuery,
    allMailSenderQuery,
    allMailStartDate,
    allMailTotalPages: derived.allMailTotalPages,
    authSession,
    expandedMailId,
    filteredAllEmails: derived.filteredAllEmails,
    filteredSpotlight: derived.filteredSpotlight,
    mailboxAnalysisFilter,
    mailboxCategory,
    navView,
    selectedEmailId,
    userId,
    setAllMailPage,
    setExpandedMailId,
    setSelectedEmailId
  });

  const {
    changeCalendarMonth,
    selectCalendarDate,
    selectTodayInCalendar
  } = useMailboxCalendarActions({
    setCalendarMonth,
    setExpandedMailId,
    setSelectedCalendarDate
  });

  const { applyMailboxDatePreset } = useMailboxDatePresetActions({
    setAllMailAdvancedSearchOpen,
    setAllMailEndDate,
    setAllMailStartDate
  });

  return {
    ...derived,
    changeCalendarMonth,
    selectCalendarDate,
    selectTodayInCalendar,
    applyMailboxDatePreset
  };
}
