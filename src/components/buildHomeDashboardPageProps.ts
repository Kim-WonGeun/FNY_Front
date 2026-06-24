import type {
  EmailDetail,
  EmailListItem,
  LoadState,
  MailboxOverview,
  MailSyncResult,
  SpotlightFilter
} from '../types';
import type { UseHomeDashboardControlsResult } from '../hooks/useHomeDashboardControls';
import type { MailRowRuntimeProps } from './HomeMailRow';
import type { HomeDashboardPageProps } from './HomeDashboardPage';

type BuildHomeDashboardPagePropsOptions = {
  syncState: LoadState;
  lastSyncResult: MailSyncResult | null;
  loadState: LoadState;
  errorMessage: string | null;
  overview: MailboxOverview;
  mailboxCounts: { all: number; inbox: number; sent: number };
  analysisQueueCounts: HomeDashboardPageProps['analysisQueueCounts'];
  tabCounts: Record<SpotlightFilter, number>;
  controls: UseHomeDashboardControlsResult;
  calendarYear: number;
  calendarMonthNumber: number;
  calendarDays: HomeDashboardPageProps['calendarDays'];
  selectedCalendarEmails: EmailListItem[];
  filteredSpotlight: EmailListItem[];
  processedTodayEmails: EmailListItem[];
  analysisSkippedReasonStats: HomeDashboardPageProps['analysisSkippedReasonStats'];
  analysisQueueEmails: EmailListItem[];
  expandedMailId: string | null;
  emailDetail: EmailDetail | null;
  mailRow: MailRowRuntimeProps;
  syncGmail: () => Promise<void>;
  changeCalendarMonth: (monthKey: string) => void;
  selectCalendarDate: (dateKey: string) => void;
  selectTodayInCalendar: () => void;
  openEmailDetail: (emailId: string, options?: { backView?: 'home'; sequence?: EmailListItem[] }) => void;
  toggleEmailDetail: (emailId: string) => void;
  openMailboxForAnalysis: HomeDashboardPageProps['onOpenMailboxForAnalysis'];
};

export function buildHomeDashboardPageProps({
  syncState,
  lastSyncResult,
  loadState,
  errorMessage,
  overview,
  mailboxCounts,
  analysisQueueCounts,
  tabCounts,
  controls,
  calendarYear,
  calendarMonthNumber,
  calendarDays,
  selectedCalendarEmails,
  filteredSpotlight,
  processedTodayEmails,
  analysisSkippedReasonStats,
  analysisQueueEmails,
  expandedMailId,
  emailDetail,
  mailRow,
  syncGmail,
  changeCalendarMonth,
  selectCalendarDate,
  selectTodayInCalendar,
  openEmailDetail,
  toggleEmailDetail,
  openMailboxForAnalysis
}: BuildHomeDashboardPagePropsOptions): HomeDashboardPageProps {
  return {
    syncState,
    lastSyncResult,
    loadState,
    errorMessage,
    overview,
    mailboxCounts,
    analysisQueueCounts,
    tabCounts,
    spotlightFilter: controls.spotlightFilter,
    listQuery: controls.listQuery,
    calendarMonth: controls.calendarMonth,
    calendarYear,
    calendarMonthNumber,
    calendarPickerOpen: controls.calendarPickerOpen,
    calendarListScrollTop: controls.calendarListScrollTop,
    calendarDays,
    selectedCalendarDate: controls.selectedCalendarDate,
    selectedCalendarEmails,
    filteredSpotlight,
    processedTodayEmails,
    analysisSkippedReasonStats,
    analysisQueueFilter: controls.analysisQueueFilter,
    analysisQueueEmails,
    expandedMailId,
    emailDetail,
    mailRow,
    onSync: () => void syncGmail(),
    onSpotlightFilterChange: controls.setSpotlightFilter,
    onListQueryChange: controls.setListQuery,
    onCalendarPickerOpenChange: controls.setCalendarPickerOpen,
    onCalendarMonthChange: changeCalendarMonth,
    onCalendarDateSelect: selectCalendarDate,
    onCalendarListScrollTopChange: controls.setCalendarListScrollTop,
    onTodaySelect: () => {
      controls.setCalendarListScrollTop(0);
      selectTodayInCalendar();
    },
    onOpenEmail: (emailId, sequence) => openEmailDetail(emailId, { backView: 'home', sequence }),
    onToggleEmailDetail: toggleEmailDetail,
    onAnalysisQueueFilterChange: controls.setAnalysisQueueFilter,
    onOpenMailboxForAnalysis: openMailboxForAnalysis
  };
}
