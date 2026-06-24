import type { MailboxAnalysisFilter, MailboxCategory, MailboxDatePreset } from '../types';

export type ActiveMailboxFilter = {
  key: string;
  label: string;
  value: string;
  onRemove: () => void;
};

export type MailboxActiveFilterOptions = {
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

export function buildMailboxActiveFilters(options: MailboxActiveFilterOptions) {
  const filters: ActiveMailboxFilter[] = [];
  const query = options.query.trim();
  const senderQuery = options.senderQuery.trim();

  if (options.category !== 'all') {
    filters.push({
      key: 'category',
      label: '메일함',
      value: categoryLabels[options.category],
      onRemove: () => options.onCategoryChange('all')
    });
  }
  if (options.analysisFilter !== 'all') {
    filters.push({
      key: 'analysis',
      label: '상태',
      value: analysisFilterLabels[options.analysisFilter],
      onRemove: () => options.onAnalysisFilterChange('all')
    });
  }
  if (query) {
    filters.push({ key: 'query', label: '검색', value: query, onRemove: () => options.onQueryChange('') });
  }
  if (senderQuery) {
    filters.push({
      key: 'sender',
      label: '발신자',
      value: senderQuery,
      onRemove: () => options.onSenderQueryChange('')
    });
  }
  if (options.datePreset !== 'all' || options.startDate || options.endDate) {
    filters.push({
      key: 'date',
      label: '기간',
      value: formatDateFilter(options.datePreset, options.startDate, options.endDate),
      onRemove: () => {
        options.onDatePresetChange('all');
        options.onStartDateChange('');
        options.onEndDateChange('');
      }
    });
  }
  if (options.searchBody) {
    filters.push({
      key: 'body',
      label: '범위',
      value: '메일 원문 포함',
      onRemove: () => options.onSearchBodyChange(false)
    });
  }

  return filters;
}

function formatDateFilter(datePreset: MailboxDatePreset, startDate: string, endDate: string) {
  if (datePreset !== 'custom') return datePresetLabels[datePreset];
  return `${startDate || '시작일 없음'} ~ ${endDate || '종료일 없음'}`;
}
