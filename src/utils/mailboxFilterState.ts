import type { MailboxAnalysisFilter, MailboxCategory } from '../types';

type MailboxFilterState = {
  category: MailboxCategory;
  analysisFilter: MailboxAnalysisFilter;
  query: string;
  senderQuery: string;
  startDate: string;
  endDate: string;
  searchBody: boolean;
};

export function hasAnyMailboxFilter({
  category,
  analysisFilter,
  query,
  senderQuery,
  startDate,
  endDate,
  searchBody
}: MailboxFilterState) {
  return Boolean(
    category !== 'all' ||
      analysisFilter !== 'all' ||
      query.trim() ||
      senderQuery.trim() ||
      startDate ||
      endDate ||
      searchBody
  );
}

export function hasMailboxSearchFilter({
  query,
  senderQuery,
  startDate,
  endDate,
  searchBody
}: Pick<MailboxFilterState, 'query' | 'senderQuery' | 'startDate' | 'endDate' | 'searchBody'>) {
  return Boolean(query.trim() || senderQuery.trim() || startDate || endDate || searchBody);
}
