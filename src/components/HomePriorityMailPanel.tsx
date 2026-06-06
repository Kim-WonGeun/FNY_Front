import type { ReactNode } from 'react';
import type { EmailListItem, SpotlightFilter } from '../types';
import { EmptyState } from './common';

type HomePriorityMailPanelProps = {
  filteredSpotlight: EmailListItem[];
  listQuery: string;
  renderEmail: (email: EmailListItem, index: number, key: string) => ReactNode;
  spotlightFilter: SpotlightFilter;
  onListQueryChange: (query: string) => void;
  onSpotlightFilterChange: (filter: SpotlightFilter) => void;
};

export function HomePriorityMailPanel({
  filteredSpotlight,
  listQuery,
  renderEmail,
  spotlightFilter,
  onListQueryChange,
  onSpotlightFilterChange
}: HomePriorityMailPanelProps) {
  return (
    <section className="focus-layout">
      <div className="priority-panel">
        <div className="section-heading priority-panel-heading">
          <p className="eyebrow">우선순위</p>
          <div className="priority-panel-title-row">
            <h2>확인할 메일</h2>
            <label className="sr-only" htmlFor="list-search">목록 검색</label>
            <input id="list-search" className="toolbar-search" value={listQuery} onChange={(event) => onListQueryChange(event.target.value)} placeholder="제목·발신자 검색" />
          </div>
        </div>

        <div className="mail-table" role="list">
          {filteredSpotlight.length === 0 ? (
            <EmptyState
              title="확인할 메일이 없습니다"
              description="현재 조건에 맞는 우선 확인 메일이 없습니다. 필터나 검색어를 바꿔보세요."
              actionLabel={spotlightFilter !== 'all' || listQuery.trim() ? '필터 초기화' : undefined}
              onAction={() => {
                onSpotlightFilterChange('all');
                onListQueryChange('');
              }}
            />
          ) : (
            filteredSpotlight.map((email, index) => renderEmail(email, index, email.id))
          )}
        </div>
      </div>
    </section>
  );
}
