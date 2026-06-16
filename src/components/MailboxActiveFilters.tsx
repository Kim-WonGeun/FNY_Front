import type { MailboxAnalysisFilter, MailboxCategory, MailboxDatePreset } from '../types';

type ActiveFilter = {
  key: string;
  label: string;
  value: string;
  onRemove: () => void;
};

type MailboxActiveFiltersProps = {
  category: MailboxCategory;
  analysisFilter: MailboxAnalysisFilter;
  query: string;
  senderQuery: string;
  datePreset: MailboxDatePreset;
  startDate: string;
  endDate: string;
  searchBody: boolean;
  onCategoryChange: (category: MailboxCategory) => void;
  onAnalysisFilterChange: (filter: MailboxAnalysisFilter) => void;
  onQueryChange: (query: string) => void;
  onDatePresetChange: (preset: MailboxDatePreset) => void;
  onSenderQueryChange: (query: string) => void;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onSearchBodyChange: (searchBody: boolean) => void;
  onResetFilters: () => void;
};

const categoryLabels: Record<MailboxCategory, string> = {
  all: '전체메일',
  inbox: '받은메일',
  sent: '보낸메일'
};

const analysisFilterLabels: Record<MailboxAnalysisFilter, string> = {
  all: '전체 상태',
  candidate: '분석 대상',
  excluded: '분석 제외',
  done: '확인 완료'
};

const datePresetLabels: Record<MailboxDatePreset, string> = {
  all: '전체 기간',
  today: '오늘',
  week: '최근 7일',
  month: '최근 30일',
  custom: '직접 지정'
};

export function MailboxActiveFilters({
  category,
  analysisFilter,
  query,
  senderQuery,
  datePreset,
  startDate,
  endDate,
  searchBody,
  onCategoryChange,
  onAnalysisFilterChange,
  onQueryChange,
  onDatePresetChange,
  onSenderQueryChange,
  onStartDateChange,
  onEndDateChange,
  onSearchBodyChange,
  onResetFilters
}: MailboxActiveFiltersProps) {
  const filters: ActiveFilter[] = [];
  const trimmedQuery = query.trim();
  const trimmedSenderQuery = senderQuery.trim();

  if (category !== 'all') {
    filters.push({
      key: 'category',
      label: '메일함',
      value: categoryLabels[category],
      onRemove: () => onCategoryChange('all')
    });
  }

  if (analysisFilter !== 'all') {
    filters.push({
      key: 'analysis',
      label: '상태',
      value: analysisFilterLabels[analysisFilter],
      onRemove: () => onAnalysisFilterChange('all')
    });
  }

  if (trimmedQuery) {
    filters.push({
      key: 'query',
      label: '검색',
      value: trimmedQuery,
      onRemove: () => onQueryChange('')
    });
  }

  if (trimmedSenderQuery) {
    filters.push({
      key: 'sender',
      label: '발신자',
      value: trimmedSenderQuery,
      onRemove: () => onSenderQueryChange('')
    });
  }

  if (datePreset !== 'all' || startDate || endDate) {
    filters.push({
      key: 'date',
      label: '기간',
      value: formatDateFilter(datePreset, startDate, endDate),
      onRemove: () => {
        onDatePresetChange('all');
        onStartDateChange('');
        onEndDateChange('');
      }
    });
  }

  if (searchBody) {
    filters.push({
      key: 'body',
      label: '범위',
      value: '메일 원문 포함',
      onRemove: () => onSearchBodyChange(false)
    });
  }

  if (filters.length === 0) {
    return null;
  }

  return (
    <section className="mailbox-active-filters" aria-label="적용된 필터">
      <div className="mailbox-active-filters-head">
        <span>적용된 조건</span>
        <button type="button" onClick={onResetFilters}>
          모두 해제
        </button>
      </div>
      <div className="mailbox-active-filter-list">
        {filters.map((filter) => (
          <button type="button" key={filter.key} onClick={filter.onRemove} title={`${filter.label} 조건 해제`}>
            <span>{filter.label}</span>
            <strong>{filter.value}</strong>
            <em aria-hidden="true">×</em>
          </button>
        ))}
      </div>
    </section>
  );
}

function formatDateFilter(datePreset: MailboxDatePreset, startDate: string, endDate: string) {
  if (datePreset !== 'custom') {
    return datePresetLabels[datePreset];
  }

  return `${startDate || '시작일 없음'} ~ ${endDate || '종료일 없음'}`;
}
