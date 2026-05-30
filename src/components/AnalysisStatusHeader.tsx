import type { AgentHealth, AnalysisJob, AttentionStatus, EmailAnalysis, EmailDetail } from '../types';
import {
  agentHealthLabel,
  agentHealthTone,
  analysisRequestButtonLabel,
  compactAnalysisStatusDescription,
  isOpenAttentionStatus,
  resolveAnalysisStatus
} from '../utils/mailbox';

type AnalysisStatus = ReturnType<typeof resolveAnalysisStatus>;
type ScoreItem = {
  label: string;
  value: number | null | undefined;
};

type AnalysisStatusHeaderProps = {
  detail: EmailDetail | null;
  status: AnalysisStatus;
  latestJob: AnalysisJob | null;
  analysis: EmailAnalysis | null | undefined;
  agentHealth: AgentHealth | null;
  compact: boolean;
  submitting: boolean;
  attentionUpdating: boolean;
  canRequest: boolean;
  canUpdateAttention: boolean;
  scoreItems: ScoreItem[];
  onRequest: () => void;
  onUpdateAttentionStatus: (status: AttentionStatus) => void;
};

export function AnalysisStatusHeader({
  detail,
  status,
  latestJob,
  analysis,
  agentHealth,
  compact,
  submitting,
  attentionUpdating,
  canRequest,
  canUpdateAttention,
  scoreItems,
  onRequest,
  onUpdateAttentionStatus
}: AnalysisStatusHeaderProps) {
  return (
    <div className="analysis-status-topline">
      <div className="analysis-status-main">
        <span className={`analysis-status-badge analysis-status-${status.tone}`}>{status.label}</span>
        <p>{compact ? compactAnalysisStatusDescription(status, latestJob, analysis) : status.description}</p>
      </div>
      {detail ? (
        <div className="attention-status-actions">
          {isOpenAttentionStatus(detail.attentionStatus) ? (
            <>
              <button
                type="button"
                className="attention-resolve-btn"
                onClick={() => onUpdateAttentionStatus('REVIEWED')}
                disabled={!canUpdateAttention}
              >
                확인 완료
              </button>
              <button
                type="button"
                className="attention-resolve-btn"
                onClick={() => onUpdateAttentionStatus('COMPLETED')}
                disabled={!canUpdateAttention}
              >
                처리 완료
              </button>
              <button
                type="button"
                className="attention-resolve-btn attention-resolve-secondary"
                onClick={() => onUpdateAttentionStatus('DEFERRED')}
                disabled={!canUpdateAttention}
              >
                보류
              </button>
            </>
          ) : (
            <button
              type="button"
              className="attention-resolve-btn attention-resolve-secondary"
              onClick={() => onUpdateAttentionStatus('NEEDS_ATTENTION')}
              disabled={!canUpdateAttention}
            >
              다시 표시
            </button>
          )}
          <button type="button" className="analysis-request-btn" onClick={onRequest} disabled={!canRequest}>
            {analysisRequestButtonLabel(detail, agentHealth, status.label, submitting)}
          </button>
          {attentionUpdating ? <span className="attention-saving-text">저장 중</span> : null}
        </div>
      ) : null}
      {scoreItems.length > 0 ? (
        <div className="analysis-score-strip" aria-label="분석 점수">
          {scoreItems.map((item) => (
            <Score key={item.label} label={item.label} value={item.value} compact />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function AgentStatusNote({ agentHealth }: { agentHealth: AgentHealth | null }) {
  return (
    <div className={`agent-status-note agent-status-note-${agentHealthTone(agentHealth, 'ready')}`}>
      <strong>{agentHealthLabel(agentHealth, 'ready')}</strong>
      <span>{agentHealth?.message ?? 'Agent 상태를 확인한 뒤 분석을 시작할 수 있습니다.'}</span>
    </div>
  );
}

function Score({
  label,
  value,
  compact = false
}: {
  label: string;
  value: number | null | undefined;
  compact?: boolean;
}) {
  return (
    <div className={`score${compact ? ' score-compact' : ''}`}>
      <span>{label}</span>
      <strong>{value == null ? '-' : Math.round(value)}</strong>
    </div>
  );
}
