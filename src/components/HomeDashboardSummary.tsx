import type { AnalysisQueueFilter, LoadState, MailboxOverview, SpotlightFilter } from '../types';
import { FilterTab, Metric } from './common';

type HomeDashboardSummaryProps = {
  analysisQueueCounts: { candidate: number; excluded: number; done: number };
  errorMessage: string | null;
  loadState: LoadState;
  mailboxCounts: { all: number; inbox: number; sent: number };
  overview: MailboxOverview;
  spotlightFilter: SpotlightFilter;
  syncState: LoadState;
  tabCounts: Record<SpotlightFilter, number>;
  onSpotlightFilterChange: (filter: SpotlightFilter) => void;
  onSync: () => void;
};

export function HomeDashboardSummary({
  analysisQueueCounts,
  errorMessage,
  loadState,
  mailboxCounts,
  overview,
  spotlightFilter,
  syncState,
  tabCounts,
  onSpotlightFilterChange,
  onSync
}: HomeDashboardSummaryProps) {
  return (
    <>
      <section className="status-hero-card">
        <div>
          <p className="eyebrow">오늘의 메일</p>
          <h3>상태를 보고 바로 처리합니다.</h3>
          <p>동기화된 메일, 분석 상태, 우선 확인할 메일을 한 화면에서 봅니다.</p>
        </div>
        <button type="button" className="settings-action-btn" onClick={onSync} disabled={syncState === 'loading'}>
          {syncState === 'loading' ? '동기화 중' : '동기화'}
        </button>
      </section>

      <div className="status-line" role="status">
        {loadState === 'loading' && '메일함을 불러오는 중입니다.'}
        {loadState === 'ready' && '최신 메일 기준으로 정리했습니다.'}
        {loadState === 'fallback' && `서버 연결 전이라 샘플 데이터로 보고 있습니다. ${errorMessage ?? ''}`}
        {loadState === 'error' && '메일함을 불러오지 못했습니다.'}
      </div>

      <section className="status-metrics-grid" aria-label="메일 대시보드 지표">
        <Metric label="전체 메일" value={mailboxCounts.all} />
        <Metric label="읽지 않음" value={overview.unreadEmails} tone="blue" selected={spotlightFilter === 'unread'} onClick={() => onSpotlightFilterChange('unread')} />
        <Metric label="회신 필요" value={overview.needsReplyEmails} tone="red" selected={spotlightFilter === 'reply'} onClick={() => onSpotlightFilterChange('reply')} />
        <Metric label="중요 메일" value={overview.highPriorityEmails} tone="green" selected={spotlightFilter === 'urgent'} onClick={() => onSpotlightFilterChange('urgent')} />
        <Metric label="분석 대상" value={analysisQueueCounts.candidate} tone="blue" />
        <Metric label="분석 제외" value={analysisQueueCounts.excluded} />
        <Metric label="확인 완료" value={analysisQueueCounts.done} tone="green" />
        <Metric label="대기 작업" value={overview.pendingAnalysisJobs} tone="red" />
      </section>

      <div className="filter-tabs" role="tablist" aria-label="목록 필터">
        <FilterTab id="tab-all" selected={spotlightFilter === 'all'} onSelect={() => onSpotlightFilterChange('all')} label={`전체 (${tabCounts.all})`} />
        <FilterTab id="tab-urgent" selected={spotlightFilter === 'urgent'} onSelect={() => onSpotlightFilterChange('urgent')} label={`긴급 (${tabCounts.urgent})`} />
        <FilterTab id="tab-reply" selected={spotlightFilter === 'reply'} onSelect={() => onSpotlightFilterChange('reply')} label={`회신 필요 (${tabCounts.reply})`} />
        <FilterTab id="tab-unread" selected={spotlightFilter === 'unread'} onSelect={() => onSpotlightFilterChange('unread')} label={`읽지 않음 (${tabCounts.unread})`} />
      </div>
    </>
  );
}
