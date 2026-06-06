import type { AnalysisQueueFilter, EmailListItem } from '../types';
import { attentionStatusLabel } from '../utils/mailAttention';
import { analysisSkippedReasonShortLabel } from '../utils/mailboxLabels';
import { EmptyState } from './common';

type HomeStatusInsightsProps = {
  analysisQueueCounts: { candidate: number; excluded: number; done: number };
  analysisSkippedReasonStats: Array<{ reason: string; count: number }>;
  processedTodayEmails: EmailListItem[];
  onAnalysisQueueFilterChange: (filter: AnalysisQueueFilter) => void;
  onOpenEmail: (emailId: string, sequence?: EmailListItem[]) => void;
  onOpenMailboxForAnalysis: (filter: AnalysisQueueFilter) => void;
};

export function HomeStatusInsights({
  analysisQueueCounts,
  analysisSkippedReasonStats,
  processedTodayEmails,
  onAnalysisQueueFilterChange,
  onOpenEmail,
  onOpenMailboxForAnalysis
}: HomeStatusInsightsProps) {
  return (
    <section className="status-insight-grid" aria-label="처리 및 제외 현황">
      <div className="status-insight-panel">
        <div className="section-heading">
          <p className="eyebrow">오늘 처리</p>
          <h2>처리한 메일</h2>
          <p className="section-copy">오늘 확인 완료, 처리 완료, 보류로 바꾼 메일입니다.</p>
        </div>
        {processedTodayEmails.length === 0 ? (
          <EmptyState title="오늘 처리한 메일이 없습니다" description="확인 완료나 처리 완료로 바꾼 메일이 여기에 표시됩니다." actionLabel="처리 상태 보기" onAction={() => onAnalysisQueueFilterChange('done')} />
        ) : (
          <div className="status-processed-list">
            {processedTodayEmails.map((email) => (
              <button type="button" key={email.id} onClick={() => onOpenEmail(email.id, processedTodayEmails)}>
                <span>
                  <strong>{email.subject || '(제목 없음)'}</strong>
                  <small>{email.fromName ?? email.fromEmail}</small>
                </span>
                <em>{attentionStatusLabel(email.attentionStatus)}</em>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="status-insight-panel">
        <div className="section-heading">
          <p className="eyebrow">분석 제외</p>
          <h2>제외 사유</h2>
          <p className="section-copy">LLM 분석 대상에서 제외한 이유를 분포로 봅니다.</p>
        </div>
        {analysisSkippedReasonStats.length === 0 ? (
          <EmptyState title="분석 제외 사유가 없습니다" description="메일 동기화 후 1차 필터가 실행되면 제외 사유가 표시됩니다." actionLabel="분석 제외 보기" onAction={() => onAnalysisQueueFilterChange('excluded')} />
        ) : (
          <div className="status-reason-list">
            {analysisSkippedReasonStats.slice(0, 5).map((item) => {
              const percent = analysisQueueCounts.excluded === 0 ? 0 : Math.round((item.count / analysisQueueCounts.excluded) * 100);

              return (
                <button type="button" key={item.reason} onClick={() => onOpenMailboxForAnalysis('excluded')}>
                  <span>
                    <strong>{analysisSkippedReasonShortLabel(item.reason)}</strong>
                    <small>{item.count.toLocaleString('ko-KR')}건</small>
                  </span>
                  <span className="status-reason-meter" aria-hidden="true">
                    <i style={{ width: `${percent}%` }} />
                  </span>
                  <em>{percent}%</em>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
