import type {
  AnalysisQueueFilter,
  EmailDetail,
  EmailListItem,
  LoadState,
  MailboxOverview,
  MailSyncResult,
  SpotlightFilter
} from '../types';
import { useHomeMailRowRenderer } from '../hooks/useHomeMailRowRenderer';
import { HomeAnalysisQueuePanel } from './HomeAnalysisQueuePanel';
import { HomeDashboardSummary } from './HomeDashboardSummary';
import { HomeMailCalendarPanel } from './HomeMailCalendarPanel';
import type { MailRowRuntimeProps } from './HomeMailRow';
import { HomePriorityMailPanel } from './HomePriorityMailPanel';
import { HomeStatusInsights } from './HomeStatusInsights';

export type HomeDashboardPageProps = {
  syncState: LoadState;
  lastSyncResult: MailSyncResult | null;
  loadState: LoadState;
  errorMessage: string | null;
  overview: MailboxOverview;
  mailboxCounts: { all: number; inbox: number; sent: number };
  analysisQueueCounts: { candidate: number; excluded: number; done: number };
  tabCounts: Record<SpotlightFilter, number>;
  spotlightFilter: SpotlightFilter;
  listQuery: string;
  calendarMonth: string;
  calendarYear: number;
  calendarMonthNumber: number;
  calendarPickerOpen: boolean;
  calendarListScrollTop: number;
  calendarDays: Array<{
    dateKey: string;
    dayOfMonth: number;
    inCurrentMonth: boolean;
    stats: { total: number };
  }>;
  selectedCalendarDate: string;
  selectedCalendarEmails: EmailListItem[];
  filteredSpotlight: EmailListItem[];
  processedTodayEmails: EmailListItem[];
  analysisSkippedReasonStats: Array<{ reason: string; count: number }>;
  analysisQueueFilter: AnalysisQueueFilter;
  analysisQueueEmails: EmailListItem[];
  expandedMailId: string | null;
  emailDetail: EmailDetail | null;
  mailRow: MailRowRuntimeProps;
  onSync: () => void;
  onSpotlightFilterChange: (filter: SpotlightFilter) => void;
  onListQueryChange: (query: string) => void;
  onCalendarPickerOpenChange: (open: boolean) => void;
  onCalendarMonthChange: (monthKey: string) => void;
  onCalendarDateSelect: (dateKey: string) => void;
  onCalendarListScrollTopChange: (scrollTop: number) => void;
  onTodaySelect: () => void;
  onOpenEmail: (emailId: string, sequence?: EmailListItem[]) => void;
  onToggleEmailDetail: (emailId: string) => void;
  onAnalysisQueueFilterChange: (filter: AnalysisQueueFilter) => void;
  onOpenMailboxForAnalysis: (filter: AnalysisQueueFilter) => void;
};

export function HomeDashboardPage({
  syncState,
  lastSyncResult,
  loadState,
  errorMessage,
  overview,
  mailboxCounts,
  analysisQueueCounts,
  tabCounts,
  spotlightFilter,
  listQuery,
  calendarMonth,
  calendarYear,
  calendarMonthNumber,
  calendarPickerOpen,
  calendarListScrollTop,
  calendarDays,
  selectedCalendarDate,
  selectedCalendarEmails,
  filteredSpotlight,
  processedTodayEmails,
  analysisSkippedReasonStats,
  analysisQueueFilter,
  analysisQueueEmails,
  expandedMailId,
  emailDetail,
  mailRow,
  onSync,
  onSpotlightFilterChange,
  onListQueryChange,
  onCalendarPickerOpenChange,
  onCalendarMonthChange,
  onCalendarDateSelect,
  onCalendarListScrollTopChange,
  onTodaySelect,
  onOpenEmail,
  onToggleEmailDetail,
  onAnalysisQueueFilterChange,
  onOpenMailboxForAnalysis
}: HomeDashboardPageProps) {
  const renderMailRows = useHomeMailRowRenderer({ emailDetail, runtime: mailRow, onOpenEmail });

  return (
    <div className="status-dashboard" aria-label="홈 대시보드">
      <HomeDashboardSummary
        analysisQueueCounts={analysisQueueCounts}
        errorMessage={errorMessage}
        lastSyncResult={lastSyncResult}
        loadState={loadState}
        mailboxCounts={mailboxCounts}
        overview={overview}
        spotlightFilter={spotlightFilter}
        syncState={syncState}
        tabCounts={tabCounts}
        onSpotlightFilterChange={onSpotlightFilterChange}
        onSync={onSync}
      />

      <HomeMailCalendarPanel
        calendarDays={calendarDays}
        calendarMonth={calendarMonth}
        calendarMonthNumber={calendarMonthNumber}
        calendarPickerOpen={calendarPickerOpen}
        calendarYear={calendarYear}
        listScrollTop={calendarListScrollTop}
        renderEmail={renderMailRows(selectedCalendarEmails)}
        selectedCalendarDate={selectedCalendarDate}
        selectedCalendarEmails={selectedCalendarEmails}
        onCalendarDateSelect={onCalendarDateSelect}
        onListScrollTopChange={onCalendarListScrollTopChange}
        onCalendarMonthChange={onCalendarMonthChange}
        onCalendarPickerOpenChange={onCalendarPickerOpenChange}
        onTodaySelect={onTodaySelect}
      />

      <HomePriorityMailPanel
        filteredSpotlight={filteredSpotlight}
        listQuery={listQuery}
        renderEmail={renderMailRows(filteredSpotlight)}
        spotlightFilter={spotlightFilter}
        onListQueryChange={onListQueryChange}
        onSpotlightFilterChange={onSpotlightFilterChange}
      />

      <HomeStatusInsights
        analysisQueueCounts={analysisQueueCounts}
        analysisSkippedReasonStats={analysisSkippedReasonStats}
        processedTodayEmails={processedTodayEmails}
        onAnalysisQueueFilterChange={onAnalysisQueueFilterChange}
        onOpenEmail={onOpenEmail}
        onOpenMailboxForAnalysis={onOpenMailboxForAnalysis}
      />

      <HomeAnalysisQueuePanel
        analysisQueueCounts={analysisQueueCounts}
        analysisQueueEmails={analysisQueueEmails}
        analysisQueueFilter={analysisQueueFilter}
        renderEmail={renderMailRows(analysisQueueEmails)}
        onAnalysisQueueFilterChange={onAnalysisQueueFilterChange}
        onOpenMailboxForAnalysis={onOpenMailboxForAnalysis}
        onQueueProcessed={onSync}
      />
    </div>
  );
}
