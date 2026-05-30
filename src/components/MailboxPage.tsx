import { ALL_MAIL_PAGE_SIZE } from '../constants';
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
import { EmptyState, PaginationBar } from './common';
import { MailboxAdvancedSearch } from './MailboxAdvancedSearch';
import { MailboxDateFilter } from './MailboxDateFilter';
import { MailboxFilterBar } from './MailboxFilterBar';
import { MailboxLoadStatus } from './MailboxLoadStatus';
import { MailboxToolbar } from './MailboxToolbar';
import { MailListRow } from './mail';

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
  onToggleEmailDetail
}: MailboxPageProps) {
  const hasAnyFilter =
    category !== 'all' || analysisFilter !== 'all' || query.trim() || senderQuery.trim() || startDate || endDate;
  const hasSearchFilter = query.trim() || senderQuery.trim() || startDate || endDate;

  return (
    <div className="page-card mailbox-card" aria-label="메일함">
      <MailboxLoadStatus state={loadState} totalEmails={allEmailsCount} errorMessage={errorMessage} />

      <MailboxFilterBar
        category={category}
        analysisFilter={analysisFilter}
        statusFilterOpen={statusFilterOpen}
        mailboxCounts={mailboxCounts}
        analysisCounts={analysisCounts}
        onCategoryChange={onCategoryChange}
        onAnalysisFilterChange={onAnalysisFilterChange}
        onStatusFilterOpenChange={onStatusFilterOpenChange}
      />

      <MailboxToolbar advancedSearchOpen={advancedSearchOpen} onAdvancedSearchOpenChange={onAdvancedSearchOpenChange} />

      <MailboxDateFilter
        query={query}
        datePreset={datePreset}
        startDate={startDate}
        endDate={endDate}
        onQueryChange={onQueryChange}
        onDatePresetChange={onDatePresetChange}
      />

      {advancedSearchOpen ? (
        <MailboxAdvancedSearch
          senderQuery={senderQuery}
          startDate={startDate}
          endDate={endDate}
          searchBody={searchBody}
          onSenderQueryChange={onSenderQueryChange}
          onStartDateChange={onStartDateChange}
          onEndDateChange={onEndDateChange}
          onSearchBodyChange={onSearchBodyChange}
          onReset={onSearchReset}
        />
      ) : null}

      <PaginationBar
        page={page}
        totalPages={totalPages}
        totalItems={filteredCount}
        pageSize={ALL_MAIL_PAGE_SIZE}
        onPageChange={onPageChange}
      />

      <section className="all-mail-panel">
        <div className="mail-table" role="list">
          {pagedEmails.length === 0 ? (
            <EmptyState
              title="표시할 메일이 없습니다"
              description={
                hasSearchFilter
                  ? '검색어와 선택한 필터에 맞는 메일을 찾지 못했습니다.'
                  : '선택한 분류에 해당하는 메일이 없습니다.'
              }
              actionLabel={hasAnyFilter ? '전체 메일 보기' : undefined}
              onAction={onResetFilters}
            />
          ) : (
            pagedEmails.map((email, index) => (
              <MailListRow
                key={email.id}
                email={email}
                index={(page - 1) * ALL_MAIL_PAGE_SIZE + index + 1}
                expanded={email.id === expandedMailId}
                detail={email.id === expandedMailId && emailDetail?.id === email.id ? emailDetail : null}
                detailLoadState={detailLoadState}
                detailErrorMessage={detailErrorMessage}
                theme={theme}
                originalMailDefaultOpen={originalMailDefaultOpen}
                analysisSubmitting={analysisRequestingId === email.id}
                agentHealth={agentHealth}
                attentionUpdating={attentionUpdatingId === email.id}
                onRequestAnalysis={onRequestAnalysis}
                onUpdateAttentionStatus={onUpdateAttentionStatus}
                feedbackSavingId={analysisFeedbackSavingId}
                feedbackMessages={analysisFeedbackMessages}
                onSaveAnalysisFeedback={onSaveAnalysisFeedback}
                analysisHistory={analysisHistory[email.id] ?? []}
                analysisHistoryState={analysisHistoryState[email.id] ?? 'idle'}
                onSelect={() => onToggleEmailDetail(email.id)}
              />
            ))
          )}
        </div>
      </section>
    </div>
  );
}
