import type { EmailDetail, EmailListItem, LoadState, MailAccountSummary, MailboxDatePreset } from '../types';
import type { UseAllMailControlsResult } from '../hooks/useAllMailControls';
import type { MailRowRuntimeProps } from './HomeMailRow';
import type { MailboxPageProps } from './MailboxPage';

type BuildMailboxPagePropsOptions = {
  loadState: LoadState;
  allEmailsCount: number;
  errorMessage: string | null;
  controls: UseAllMailControlsResult;
  mailboxCounts: { all: number; inbox: number; sent: number };
  analysisCounts: MailboxPageProps['analysisCounts'];
  datePreset: MailboxDatePreset;
  totalPages: number;
  filteredCount: number;
  pagedEmails: EmailListItem[];
  selectedEmailId: string;
  expandedMailId: string | null;
  emailDetail: EmailDetail | null;
  runtime: MailRowRuntimeProps;
  mailAccounts: MailAccountSummary[];
  applyMailboxDatePreset: (preset: MailboxDatePreset) => void;
  changeAllMailPage: (page: number) => void;
  onToggleEmailDetail: (emailId: string) => void;
};

export function buildMailboxPageProps({
  loadState,
  allEmailsCount,
  errorMessage,
  controls,
  mailboxCounts,
  analysisCounts,
  datePreset,
  totalPages,
  filteredCount,
  pagedEmails,
  selectedEmailId,
  expandedMailId,
  emailDetail,
  runtime,
  mailAccounts,
  applyMailboxDatePreset,
  changeAllMailPage,
  onToggleEmailDetail
}: BuildMailboxPagePropsOptions): MailboxPageProps {
  return {
    loadState,
    allEmailsCount,
    errorMessage,
    category: controls.mailboxCategory,
    analysisFilter: controls.mailboxAnalysisFilter,
    statusFilterOpen: controls.mailboxStatusFilterOpen,
    mailboxCounts,
    analysisCounts,
    advancedSearchOpen: controls.allMailAdvancedSearchOpen,
    query: controls.allMailQuery,
    senderQuery: controls.allMailSenderQuery,
    datePreset,
    startDate: controls.allMailStartDate,
    endDate: controls.allMailEndDate,
    searchBody: controls.allMailSearchBody,
    page: controls.allMailPage,
    totalPages,
    filteredCount,
    pagedEmails,
    selectedEmailId,
    scrollTop: controls.allMailScrollTop,
    expandedMailId,
    emailDetail,
    ...runtime,
    onCategoryChange: controls.setMailboxCategory,
    mailAccounts,
    mailAccountId: controls.mailboxAccountId,
    onMailAccountChange: (accountId) => {
      controls.setMailboxAccountId(accountId);
      controls.setAllMailPage(1);
      controls.setAllMailScrollTop(0);
    },
    onAnalysisFilterChange: controls.setMailboxAnalysisFilter,
    onStatusFilterOpenChange: controls.setMailboxStatusFilterOpen,
    onAdvancedSearchOpenChange: controls.setAllMailAdvancedSearchOpen,
    onQueryChange: controls.setAllMailQuery,
    onDatePresetChange: applyMailboxDatePreset,
    onSenderQueryChange: controls.setAllMailSenderQuery,
    onStartDateChange: controls.setAllMailStartDate,
    onEndDateChange: controls.setAllMailEndDate,
    onSearchBodyChange: controls.setAllMailSearchBody,
    onSearchReset: controls.resetAllMailSearchFields,
    onPageChange: changeAllMailPage,
    onResetFilters: controls.resetAllMailFilters,
    onRequestAnalysis: runtime.onRequestAnalysis,
    onUpdateAnalysisCandidate: runtime.onUpdateAnalysisCandidate,
    onUpdateAttentionStatus: runtime.onUpdateAttentionStatus,
    onSaveAnalysisFeedback: runtime.onSaveAnalysisFeedback,
    onToggleEmailDetail,
    onScrollTopChange: controls.setAllMailScrollTop
  };
}
