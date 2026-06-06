import type { ReactNode } from 'react';
import type { AnalysisQueueFilter, EmailListItem } from '../types';
import { EmptyState, FilterTab } from './common';

type HomeAnalysisQueuePanelProps = {
  analysisQueueCounts: { candidate: number; excluded: number; done: number };
  analysisQueueEmails: EmailListItem[];
  analysisQueueFilter: AnalysisQueueFilter;
  renderEmail: (email: EmailListItem, index: number, key: string) => ReactNode;
  onAnalysisQueueFilterChange: (filter: AnalysisQueueFilter) => void;
  onOpenMailboxForAnalysis: (filter: AnalysisQueueFilter) => void;
};

export function HomeAnalysisQueuePanel({
  analysisQueueCounts,
  analysisQueueEmails,
  analysisQueueFilter,
  renderEmail,
  onAnalysisQueueFilterChange,
  onOpenMailboxForAnalysis
}: HomeAnalysisQueuePanelProps) {
  return (
    <section className="analysis-queue-panel status-analysis-panel" aria-label="처리 상태">
      <div className="section-heading">
        <p className="eyebrow">자동 분류</p>
        <h2>처리 상태</h2>
        <p className="section-copy">상태별 메일을 확인하고 메일함에서 이어서 처리합니다.</p>
      </div>

      <div className="filter-tabs analysis-queue-tabs" role="tablist" aria-label="처리 상태 필터">
        <FilterTab id="analysis-candidate" selected={analysisQueueFilter === 'candidate'} onSelect={() => onAnalysisQueueFilterChange('candidate')} label={`분석 대상 (${analysisQueueCounts.candidate})`} />
        <FilterTab id="analysis-excluded" selected={analysisQueueFilter === 'excluded'} onSelect={() => onAnalysisQueueFilterChange('excluded')} label={`분석 제외 (${analysisQueueCounts.excluded})`} />
        <FilterTab id="analysis-done" selected={analysisQueueFilter === 'done'} onSelect={() => onAnalysisQueueFilterChange('done')} label={`확인 완료 (${analysisQueueCounts.done})`} />
      </div>

      <div className="analysis-queue-summary" role="status">
        {analysisQueueFilter === 'candidate' && '업무 처리 가능성이 높아 자동 분석 대상으로 남아 있는 메일입니다.'}
        {analysisQueueFilter === 'excluded' && '업무 신호가 낮거나 오래된 메일처럼 자동 분석에서 제외된 메일입니다.'}
        {analysisQueueFilter === 'done' && '사용자가 확인 완료, 처리 완료, 보류로 바꿔 홈 우선순위에서 빠진 메일입니다.'}
      </div>

      <div className="analysis-queue-actions">
        <button type="button" className="btn-weekly" onClick={() => onOpenMailboxForAnalysis(analysisQueueFilter)}>
          메일함에서 전체 보기
        </button>
      </div>

      <div className="mail-table" role="list">
        {analysisQueueEmails.length === 0 ? (
          <EmptyState title="해당 상태의 메일이 없습니다" description="다른 상태를 선택하거나 메일함에서 전체 메일을 확인해 보세요." actionLabel="메일함에서 보기" onAction={() => onOpenMailboxForAnalysis(analysisQueueFilter)} />
        ) : (
          analysisQueueEmails.slice(0, 8).map((email, index) => renderEmail(email, index, `analysis-${email.id}`))
        )}
      </div>
    </section>
  );
}
