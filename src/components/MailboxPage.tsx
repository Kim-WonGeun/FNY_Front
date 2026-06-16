import type {
  AgentHealth,
  AnalysisFeedbackMessage,
  AnalysisFeedbackType,
  AttentionStatus,
  DetailLoadState,
  EmailAnalysis,
  EmailDetail,
  EmailListItem,
  LoadState,
  MailboxAnalysisFilter,
  MailboxCategory,
  MailboxDatePreset
} from '../types';
import {
  hasAnyMailboxFilter,
  hasMailboxSearchFilter
} from '../utils/mailboxFilterState';
import { MailboxControlsPanel } from './MailboxControlsPanel';
import { MailboxEmailList } from './MailboxEmailList';
import { MailboxLoadStatus } from './MailboxLoadStatus';

export type MailboxPageProps = {
  loadState: LoadState;
  allEmailsCount: number;
  errorMessage: string | null;
  category: MailboxCategory;
  analysisFilter: MailboxAnalysisFilter;
  statusFilterOpen: boolean;
  mailboxCounts: { all: number; inbox: number; sent: number };
  analysisCounts: { all: number; candidate: number; excluded: number; done: number };
  advancedSearchOpen: boolean;
  query: string;
  senderQuery: string;
  datePreset: MailboxDatePreset;
  startDate: string;
  endDate: string;
  searchBody: boolean;
  page: number;
  totalPages: number;
  filteredCount: number;
  pagedEmails: EmailListItem[];
  selectedEmailId: string;
  scrollTop: number;
  expandedMailId: string | null;
  emailDetail: EmailDetail | null;
  detailLoadState: DetailLoadState;
  detailErrorMessage: string | null;
  theme: 'light' | 'dark';
  originalMailDefaultOpen: boolean;
  analysisRequestingId: string | null;
  agentHealth: AgentHealth | null;
  attentionUpdatingId: string | null;
  analysisFeedbackSavingId: string | null;
  analysisFeedbackMessages: Record<string, AnalysisFeedbackMessage>;
  analysisHistory: Record<string, EmailAnalysis[]>;
  analysisHistoryState: Record<string, LoadState>;
  onCategoryChange: (category: MailboxCategory) => void;
  onAnalysisFilterChange: (filter: MailboxAnalysisFilter) => void;
  onStatusFilterOpenChange: (open: boolean) => void;
  onAdvancedSearchOpenChange: (open: boolean) => void;
  onQueryChange: (query: string) => void;
  onDatePresetChange: (preset: MailboxDatePreset) => void;
  onSenderQueryChange: (query: string) => void;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onSearchBodyChange: (searchBody: boolean) => void;
  onSearchReset: () => void;
  onPageChange: (page: number) => void;
  onResetFilters: () => void;
  onRequestAnalysis: (emailId: string) => void;
  onUpdateAttentionStatus: (emailId: string, status: AttentionStatus) => void;
  onSaveAnalysisFeedback: (analysisId: string, feedbackType: AnalysisFeedbackType) => void;
  onToggleEmailDetail: (emailId: string) => void;
  onScrollTopChange: (scrollTop: number) => void;
};

export function MailboxPage({
  loadState,
  allEmailsCount,
  errorMessage,
  category,
  analysisFilter,
  statusFilterOpen,
  mailboxCounts,
  analysisCounts,
  advancedSearchOpen,
  query,
  senderQuery,
  datePreset,
  startDate,
  endDate,
  searchBody,
  page,
  totalPages,
  filteredCount,
  pagedEmails,
  selectedEmailId,
  scrollTop,
  expandedMailId,
  emailDetail,
  detailLoadState,
  detailErrorMessage,
  theme,
  originalMailDefaultOpen,
  analysisRequestingId,
  agentHealth,
  attentionUpdatingId,
  analysisFeedbackSavingId,
  analysisFeedbackMessages,
  analysisHistory,
  analysisHistoryState,
  onCategoryChange,
  onAnalysisFilterChange,
  onStatusFilterOpenChange,
  onAdvancedSearchOpenChange,
  onQueryChange,
  onDatePresetChange,
  onSenderQueryChange,
  onStartDateChange,
  onEndDateChange,
  onSearchBodyChange,
  onSearchReset,
  onPageChange,
  onResetFilters,
  onRequestAnalysis,
  onUpdateAttentionStatus,
  onSaveAnalysisFeedback,
  onToggleEmailDetail,
  onScrollTopChange
}: MailboxPageProps) {
  const filterState = { category, analysisFilter, query, senderQuery, startDate, endDate, searchBody };

  return (
    <div className="page-card mailbox-card" aria-label="메일함">
      <MailboxLoadStatus state={loadState} totalEmails={allEmailsCount} errorMessage={errorMessage} />

      <MailboxControlsPanel
        category={category}
        analysisFilter={analysisFilter}
        statusFilterOpen={statusFilterOpen}
        mailboxCounts={mailboxCounts}
        analysisCounts={analysisCounts}
        advancedSearchOpen={advancedSearchOpen}
        query={query}
        senderQuery={senderQuery}
        datePreset={datePreset}
        startDate={startDate}
        endDate={endDate}
        searchBody={searchBody}
        page={page}
        totalPages={totalPages}
        filteredCount={filteredCount}
        onCategoryChange={onCategoryChange}
        onAnalysisFilterChange={onAnalysisFilterChange}
        onStatusFilterOpenChange={onStatusFilterOpenChange}
        onAdvancedSearchOpenChange={onAdvancedSearchOpenChange}
        onQueryChange={onQueryChange}
        onDatePresetChange={onDatePresetChange}
        onSenderQueryChange={onSenderQueryChange}
        onStartDateChange={onStartDateChange}
        onEndDateChange={onEndDateChange}
        onSearchBodyChange={onSearchBodyChange}
        onSearchReset={onSearchReset}
        onPageChange={onPageChange}
        onResetFilters={onResetFilters}
      />

      <MailboxEmailList
        agentHealth={agentHealth}
        analysisFeedbackMessages={analysisFeedbackMessages}
        analysisFeedbackSavingId={analysisFeedbackSavingId}
        analysisHistory={analysisHistory}
        analysisHistoryState={analysisHistoryState}
        analysisRequestingId={analysisRequestingId}
        attentionUpdatingId={attentionUpdatingId}
        detailErrorMessage={detailErrorMessage}
        detailLoadState={detailLoadState}
        hasAnyFilter={hasAnyMailboxFilter(filterState)}
        hasSearchFilter={hasMailboxSearchFilter(filterState)}
        originalMailDefaultOpen={originalMailDefaultOpen}
        page={page}
        pagedEmails={pagedEmails}
        scrollTop={scrollTop}
        selectedEmailId={selectedEmailId}
        theme={theme}
        onResetFilters={onResetFilters}
        onRequestAnalysis={onRequestAnalysis}
        onSaveAnalysisFeedback={onSaveAnalysisFeedback}
        onScrollTopChange={onScrollTopChange}
        onToggleEmailDetail={onToggleEmailDetail}
        onUpdateAttentionStatus={onUpdateAttentionStatus}
      />
    </div>
  );
}
