import type { AgentHealth, AttentionStatus, EmailDetail } from '../types';
import { isOpenAttentionStatus } from '../utils/mailAttention';
import { analysisRequestButtonLabel } from '../utils/mailAnalysisStatus';

export type AnalysisScoreItem = {
  label: string;
  value: number | null | undefined;
};

type AnalysisStatusControlsProps = {
  detail: EmailDetail | null;
  agentHealth: AgentHealth | null;
  statusLabel: string;
  submitting: boolean;
  canRequest: boolean;
  canUpdateAttention: boolean;
  candidateUpdating: boolean;
  scoreItems: AnalysisScoreItem[];
  onRequest: () => void;
  onUpdateAnalysisCandidate: (eligible: boolean) => void;
  onUpdateAttentionStatus: (status: AttentionStatus) => void;
};

export function AnalysisStatusControls({
  detail,
  agentHealth,
  statusLabel,
  submitting,
  canRequest,
  canUpdateAttention,
  candidateUpdating,
  scoreItems,
  onRequest,
  onUpdateAnalysisCandidate,
  onUpdateAttentionStatus
}: AnalysisStatusControlsProps) {
  if (!detail && scoreItems.length === 0) return null;

  return (
    <div className="analysis-status-controls">
      {detail ? (
        <div className="attention-status-actions">
          {isOpenAttentionStatus(detail.attentionStatus) ? (
            <>
              <AttentionButton status="REVIEWED" disabled={!canUpdateAttention} onUpdate={onUpdateAttentionStatus}>
                확인 완료
              </AttentionButton>
              <AttentionButton status="COMPLETED" disabled={!canUpdateAttention} onUpdate={onUpdateAttentionStatus}>
                처리 완료
              </AttentionButton>
              <AttentionButton
                status="DEFERRED"
                disabled={!canUpdateAttention}
                secondary
                onUpdate={onUpdateAttentionStatus}
              >
                보류
              </AttentionButton>
            </>
          ) : (
            <AttentionButton
              status="NEEDS_ATTENTION"
              disabled={!canUpdateAttention}
              secondary
              onUpdate={onUpdateAttentionStatus}
            >
              다시 표시
            </AttentionButton>
          )}
          <button type="button" className="analysis-request-btn" onClick={onRequest} disabled={!canRequest}>
            {analysisRequestButtonLabel(detail, agentHealth, statusLabel, submitting)}
          </button>
          {detail.analysisCandidateEvaluatedAt ? (
            <button
              type="button"
              className="analysis-request-btn analysis-request-secondary"
              onClick={() => onUpdateAnalysisCandidate(!detail.analysisEligible)}
              disabled={candidateUpdating}
            >
              {candidateUpdating ? '변경 중' : detail.analysisEligible ? '분석 제외' : '분석 대상 포함'}
            </button>
          ) : null}
        </div>
      ) : null}
      {scoreItems.length > 0 ? (
        <div className="analysis-score-strip" aria-label="분석 점수">
          {scoreItems.map((item) => (
            <div className="score score-compact" key={item.label}>
              <span>{item.label}</span>
              <strong>{item.value == null ? '-' : Math.round(item.value)}</strong>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function AttentionButton({
  status,
  disabled,
  secondary = false,
  onUpdate,
  children
}: {
  status: AttentionStatus;
  disabled: boolean;
  secondary?: boolean;
  onUpdate: (status: AttentionStatus) => void;
  children: string;
}) {
  return (
    <button
      type="button"
      className={`attention-resolve-btn${secondary ? ' attention-resolve-secondary' : ''}`}
      onClick={() => onUpdate(status)}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
