import type { MailboxAnalysisFilter, MailboxCategory } from '../types';
import { FilterChip, FilterTab } from './common';

export function MailboxFilterBar({
  category,
  analysisFilter,
  statusFilterOpen,
  mailboxCounts,
  analysisCounts,
  onCategoryChange,
  onAnalysisFilterChange,
  onStatusFilterOpenChange
}: {
  category: MailboxCategory;
  analysisFilter: MailboxAnalysisFilter;
  statusFilterOpen: boolean;
  mailboxCounts: Record<MailboxCategory, number>;
  analysisCounts: Record<MailboxAnalysisFilter, number>;
  onCategoryChange: (category: MailboxCategory) => void;
  onAnalysisFilterChange: (filter: MailboxAnalysisFilter) => void;
  onStatusFilterOpenChange: (open: boolean) => void;
}) {
  const selectCategory = (nextCategory: MailboxCategory) => {
    onCategoryChange(nextCategory);
    onStatusFilterOpenChange(true);
  };

  return (
    <>
      <div className="mailbox-filter-bar">
        <div className="filter-tabs mailbox-category-tabs" role="tablist" aria-label="메일함 분류">
          <FilterTab
            id="mailbox-all"
            selected={category === 'all'}
            onSelect={() => selectCategory('all')}
            label={`전체메일 (${mailboxCounts.all})`}
          />
          <FilterTab
            id="mailbox-inbox"
            selected={category === 'inbox'}
            onSelect={() => selectCategory('inbox')}
            label={`받은메일 (${mailboxCounts.inbox})`}
          />
          <FilterTab
            id="mailbox-sent"
            selected={category === 'sent'}
            onSelect={() => selectCategory('sent')}
            label={`보낸메일 (${mailboxCounts.sent})`}
          />
        </div>
      </div>
      {statusFilterOpen ? (
        <div className="mailbox-analysis-filter" aria-label="분석 상태 필터">
          <div className="mailbox-analysis-filter-head">
            <span>상태 필터</span>
            <button type="button" onClick={() => onStatusFilterOpenChange(false)}>
              닫기
            </button>
          </div>
          <div className="mailbox-filter-chips">
            <FilterChip
              selected={analysisFilter === 'all'}
              onSelect={() => onAnalysisFilterChange('all')}
              label={`전체 ${analysisCounts.all}`}
            />
            <FilterChip
              selected={analysisFilter === 'candidate'}
              onSelect={() => onAnalysisFilterChange('candidate')}
              label={`분석 대상 ${analysisCounts.candidate}`}
            />
            <FilterChip
              selected={analysisFilter === 'excluded'}
              onSelect={() => onAnalysisFilterChange('excluded')}
              label={`분석 제외 ${analysisCounts.excluded}`}
            />
            <FilterChip
              selected={analysisFilter === 'done'}
              onSelect={() => onAnalysisFilterChange('done')}
              label={`확인 완료 ${analysisCounts.done}`}
            />
          </div>
        </div>
      ) : null}
    </>
  );
}
