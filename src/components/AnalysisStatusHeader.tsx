import type { AgentHealth, AnalysisJob, AttentionStatus, EmailAnalysis, EmailDetail } from '../types';
import {
  agentHealthLabel,
  agentHealthTone,
  compactAnalysisStatusDescription,
  resolveAnalysisStatus
} from '../utils/mailAnalysisStatus';
import {
  AnalysisStatusControls,
  type AnalysisScoreItem
} from './AnalysisStatusControls';

type AnalysisStatus = ReturnType<typeof resolveAnalysisStatus>;

type AnalysisStatusHeaderProps = {
  detail: EmailDetail | null;
  status: AnalysisStatus;
  latestJob: AnalysisJob | null;
  analysis: EmailAnalysis | null | undefined;
  agentHealth: AgentHealth | null;
  compact: boolean;
  submitting: boolean;
  canRequest: boolean;
  canUpdateAttention: boolean;
  candidateUpdating: boolean;
  scoreItems: AnalysisScoreItem[];
  onRequest: () => void;
  onUpdateAnalysisCandidate: (eligible: boolean) => void;
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
  canRequest,
  canUpdateAttention,
  candidateUpdating,
  scoreItems,
  onRequest,
  onUpdateAnalysisCandidate,
  onUpdateAttentionStatus
}: AnalysisStatusHeaderProps) {
  return (
    <div className="analysis-status-topline">
      <div className="analysis-status-main">
        <span className={`analysis-status-badge analysis-status-${status.tone}`}>{status.label}</span>
        <p>{compact ? compactAnalysisStatusDescription(status, latestJob, analysis) : status.description}</p>
      </div>
      <AnalysisStatusControls
        detail={detail}
        agentHealth={agentHealth}
        statusLabel={status.label}
        submitting={submitting}
        canRequest={canRequest}
        canUpdateAttention={canUpdateAttention}
        candidateUpdating={candidateUpdating}
        scoreItems={scoreItems}
        onRequest={onRequest}
        onUpdateAnalysisCandidate={onUpdateAnalysisCandidate}
        onUpdateAttentionStatus={onUpdateAttentionStatus}
      />
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
