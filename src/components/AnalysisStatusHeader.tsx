import type { AgentHealth, AnalysisJob, AttentionStatus, EmailAnalysis, EmailDetail } from '../types';
import { attentionStatusLabel, isOpenAttentionStatus } from '../utils/mailAttention';
import {
  agentHealthLabel,
  agentHealthTone,
  analysisRequestButtonLabel,
  compactAnalysisStatusDescription,
  resolveAnalysisStatus
} from '../utils/mailAnalysisStatus';

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
      {detail || scoreItems.length > 0 ? (
        <div className="analysis-status-controls">
          {detail ? (
            <div className="attention-status-actions">
              <span className="attention-current-state">
                {attentionUpdating ? '상태 저장 중' : attentionStatusLabel(detail.attentionStatus)}
              </span>
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
