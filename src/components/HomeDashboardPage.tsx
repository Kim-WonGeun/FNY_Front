import type {
  AnalysisQueueFilter,
  EmailDetail,
  EmailListItem,
  LoadState,
  MailboxOverview,
  SpotlightFilter
} from '../types';
import { HomeAnalysisQueuePanel } from './HomeAnalysisQueuePanel';
import { HomeDashboardSummary } from './HomeDashboardSummary';
import { HomeMailCalendarPanel } from './HomeMailCalendarPanel';
import { HomeMailRow, type MailRowRuntimeProps } from './HomeMailRow';
import { HomePriorityMailPanel } from './HomePriorityMailPanel';
import { HomeStatusInsights } from './HomeStatusInsights';

export type HomeDashboardPageProps = {
  syncState: LoadState;
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
  onTodaySelect: () => void;
  onOpenEmail: (emailId: string, sequence?: EmailListItem[]) => void;
  onToggleEmailDetail: (emailId: string) => void;
  onAnalysisQueueFilterChange: (filter: AnalysisQueueFilter) => void;
  onOpenMailboxForAnalysis: (filter: AnalysisQueueFilter) => void;
};

export function HomeDashboardPage({
  syncState,
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
  onTodaySelect,
  onOpenEmail,
  onToggleEmailDetail,
  onAnalysisQueueFilterChange,
  onOpenMailboxForAnalysis
}: HomeDashboardPageProps) {
  const renderMailRow = (email: EmailListItem, index: number, expanded: boolean, onSelect: () => void, key: string) => (
    <HomeMailRow
      key={key}
      email={email}
      index={index}
      expanded={expanded}
      emailDetail={emailDetail}
      runtime={mailRow}
      onSelect={onSelect}
    />
  );

  return (
    <div className="status-dashboard" aria-label="홈 대시보드">
      <HomeDashboardSummary
        analysisQueueCounts={analysisQueueCounts}
        errorMessage={errorMessage}
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
        renderEmail={(email, index, key) =>
          renderMailRow(email, index, false, () => onOpenEmail(email.id, selectedCalendarEmails), key)
        }
        selectedCalendarDate={selectedCalendarDate}
        selectedCalendarEmails={selectedCalendarEmails}
        onCalendarDateSelect={onCalendarDateSelect}
        onCalendarMonthChange={onCalendarMonthChange}
        onCalendarPickerOpenChange={onCalendarPickerOpenChange}
        onTodaySelect={onTodaySelect}
      />

      <HomePriorityMailPanel
        filteredSpotlight={filteredSpotlight}
        listQuery={listQuery}
        renderEmail={(email, index, key) =>
          renderMailRow(email, index, false, () => onOpenEmail(email.id, filteredSpotlight), key)
        }
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
        renderEmail={(email, index, key) =>
          renderMailRow(email, index, false, () => onOpenEmail(email.id, analysisQueueEmails), key)
        }
        onAnalysisQueueFilterChange={onAnalysisQueueFilterChange}
        onOpenMailboxForAnalysis={onOpenMailboxForAnalysis}
      />
    </div>
  );
}
