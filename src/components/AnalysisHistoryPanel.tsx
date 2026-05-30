import type { EmailAnalysis, LoadState } from '../types';
import { formatDate } from '../utils/date';
import { priorityLabel } from '../utils/mailbox';

type AnalysisHistoryPanelProps = {
  currentAnalysisId: string;
  history: EmailAnalysis[];
  state: LoadState;
  compact: boolean;
};

export function AnalysisHistoryPanel({ currentAnalysisId, history, state, compact }: AnalysisHistoryPanelProps) {
  const previous = history.filter((item) => item.id !== currentAnalysisId);

  return (
    <div className="analysis-history-panel">
      <div className="analysis-history-head">
        <span>분석 이력</span>
        <strong>{history.length > 0 ? `${history.length}개 버전` : state === 'loading' ? '불러오는 중' : '이력 없음'}</strong>
      </div>
      {state === 'error' ? <p>분석 이력을 불러오지 못했습니다.</p> : null}
      {previous.length > 0 ? (
        <div className="analysis-history-list">
          {previous.slice(0, compact ? 2 : 4).map((item) => (
            <div className="analysis-history-item" key={item.id}>
              <strong>{item.analysisVersion}차 분석</strong>
              <span>{priorityLabel(item.priorityLevel ?? 'WAITING')} · {formatDate(item.analyzedAt)}</span>
              <p>{item.shortSummary || item.suggestedAction || '요약 없음'}</p>
            </div>
          ))}
        </div>
      ) : state === 'ready' ? (
        <p>이전 분석 결과가 없습니다.</p>
      ) : null}
    </div>
  );
}
