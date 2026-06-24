import type { MailAccountSummary, MailboxAnalysisFilter, MailboxCategory } from '../types';
import { FilterChip, FilterTab } from './common';

export function MailboxFilterBar({
  category,
  analysisFilter,
  statusFilterOpen,
  mailboxCounts,
  analysisCounts,
  onCategoryChange,
  onAnalysisFilterChange,
  onStatusFilterOpenChange,
  mailAccounts,
  mailAccountId,
  onMailAccountChange
}: {
  category: MailboxCategory;
  analysisFilter: MailboxAnalysisFilter;
  statusFilterOpen: boolean;
  mailboxCounts: Record<MailboxCategory, number>;
  analysisCounts: Record<MailboxAnalysisFilter, number>;
  onCategoryChange: (category: MailboxCategory) => void;
  onAnalysisFilterChange: (filter: MailboxAnalysisFilter) => void;
  onStatusFilterOpenChange: (open: boolean) => void;
  mailAccounts: MailAccountSummary[];
  mailAccountId: string;
  onMailAccountChange: (accountId: string) => void;
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
        {mailAccounts.length > 1 ? (
          <label className="mailbox-account-filter">
            <span>메일 계정</span>
            <select value={mailAccountId} onChange={(event) => onMailAccountChange(event.target.value)}>
              <option value="all">전체 계정</option>
              {mailAccounts.filter((account) => account.syncEnabled).map((account) => (
                <option key={account.id} value={account.id}>{account.accountEmail}</option>
              ))}
            </select>
          </label>
        ) : null}
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
