import { ALL_MAIL_PAGE_SIZE } from '../constants';
import type {
  MailboxAnalysisFilter,
  MailboxCategory,
  MailboxDatePreset
} from '../types';
import { PaginationBar } from './common';
import { MailboxActiveFilters } from './MailboxActiveFilters';
import { MailboxAdvancedSearch } from './MailboxAdvancedSearch';
import { MailboxDateFilter } from './MailboxDateFilter';
import { MailboxFilterBar } from './MailboxFilterBar';
import { MailboxToolbar } from './MailboxToolbar';

type MailboxControlsPanelProps = {
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
};

export function MailboxControlsPanel({
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
  onResetFilters
}: MailboxControlsPanelProps) {
  return (
    <>
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

      <MailboxActiveFilters
        category={category}
        analysisFilter={analysisFilter}
        query={query}
        senderQuery={senderQuery}
        datePreset={datePreset}
        startDate={startDate}
        endDate={endDate}
        searchBody={searchBody}
        onCategoryChange={onCategoryChange}
        onAnalysisFilterChange={onAnalysisFilterChange}
        onQueryChange={onQueryChange}
        onDatePresetChange={onDatePresetChange}
        onSenderQueryChange={onSenderQueryChange}
        onStartDateChange={onStartDateChange}
        onEndDateChange={onEndDateChange}
        onSearchBodyChange={onSearchBodyChange}
        onResetFilters={onResetFilters}
      />

      <PaginationBar
        page={page}
        totalPages={totalPages}
        totalItems={filteredCount}
        pageSize={ALL_MAIL_PAGE_SIZE}
        onPageChange={onPageChange}
      />
    </>
  );
}
