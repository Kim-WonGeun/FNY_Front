import type {
  AgentHealth,
  AnalysisFeedbackMessage,
  AnalysisFeedbackType,
  AttentionStatus,
  EmailAnalysis,
  EmailDetail,
  LoadState
} from '../types';
import { actionTypeLabel } from '../utils/mailboxLabels';
import {
  canRequestAnalysis,
  getLatestAnalysisJob,
  isAgentReady,
  resolveAnalysisStatus
} from '../utils/mailAnalysisStatus';
import { AnalysisCandidatePanel } from './AnalysisCandidatePanel';
import { AnalysisFeedbackPanel } from './AnalysisFeedbackPanel';
import { AnalysisHistoryPanel } from './AnalysisHistoryPanel';
import { AnalysisMetaPanel } from './AnalysisMetaPanel';
import { AgentStatusNote, AnalysisStatusHeader } from './AnalysisStatusHeader';

type AnalysisStatusCardProps = {
  detail: EmailDetail | null;
  loading: boolean;
  submitting: boolean;
  agentHealth: AgentHealth | null;
  onRequest: () => void;
  candidateUpdating: boolean;
  onUpdateAnalysisCandidate: (eligible: boolean) => void;
  attentionUpdating: boolean;
  onUpdateAttentionStatus: (status: AttentionStatus) => void;
  feedbackSaving: boolean;
  feedbackMessage: AnalysisFeedbackMessage | null;
  onSaveFeedback: (analysisId: string, feedbackType: AnalysisFeedbackType) => void;
  analysisHistory: EmailAnalysis[];
  analysisHistoryState: LoadState;
  compact?: boolean;
};

export function AnalysisStatusCard({
  detail,
  loading,
  submitting,
  agentHealth,
  onRequest,
  candidateUpdating,
  onUpdateAnalysisCandidate,
  attentionUpdating,
  onUpdateAttentionStatus,
  feedbackSaving,
  feedbackMessage,
  onSaveFeedback,
  analysisHistory,
  analysisHistoryState,
  compact = false
}: AnalysisStatusCardProps) {
  const status = resolveAnalysisStatus(detail, loading, submitting);
  const latestJob = detail ? getLatestAnalysisJob(detail) : null;
  const agentReady = isAgentReady(agentHealth);
  const canRequest = Boolean(detail) && !loading && !submitting && agentReady && canRequestAnalysis(detail);
  const canUpdateAttention = Boolean(detail) && !loading && !attentionUpdating;
  const analysis = detail?.analysis;
  const firstActionItem = detail?.actionItems?.[0];
  const actionLabel = firstActionItem ? actionTypeLabel(firstActionItem.actionType) : '다음 할 일';
  const actionText = firstActionItem?.actionText || analysis?.suggestedAction || '아직 추출된 액션이 없습니다.';
  const scoreItems = [
    { label: '중요도', value: analysis?.importanceScore },
    { label: '긴급도', value: analysis?.urgencyScore },
    { label: '신뢰도', value: analysis?.confidenceScore },
    { label: detail?.analysisEligible ? '후보 점수' : '제외 점수', value: detail?.analysisCandidateScore }
  ].filter((item) => item.value != null);

  return (
    <div className={`analysis-status-card${compact ? ' analysis-status-card-compact' : ''}`}>
      <AnalysisStatusHeader
        detail={detail}
        status={status}
        latestJob={latestJob}
        analysis={analysis}
        agentHealth={agentHealth}
        compact={compact}
        submitting={submitting}
        canRequest={canRequest}
        canUpdateAttention={canUpdateAttention}
        candidateUpdating={candidateUpdating}
        scoreItems={scoreItems}
        onRequest={onRequest}
        onUpdateAnalysisCandidate={onUpdateAnalysisCandidate}
        onUpdateAttentionStatus={onUpdateAttentionStatus}
      />
      {!agentReady ? <AgentStatusNote agentHealth={agentHealth} /> : null}
      {!compact ? <AnalysisMetaPanel analysis={analysis} latestJob={latestJob} /> : null}
      {detail?.analysisCandidateEvaluatedAt ? (
        <AnalysisCandidatePanel detail={detail} compact={compact} />
      ) : null}
      {detail ? (
        <div className="analysis-action-summary">
          <span>{actionLabel}</span>
          <strong>{actionText}</strong>
        </div>
      ) : null}
      {analysis && canRequest && !compact ? (
        <div className="analysis-status-actions">
          <span className="analysis-rerun-hint">현재 결과를 유지한 채 새 분석으로 갱신합니다.</span>
        </div>
      ) : null}
      {analysis && !compact ? (
        <AnalysisFeedbackPanel
          analysisId={analysis.id}
          feedbackSaving={feedbackSaving}
          feedbackMessage={feedbackMessage}
          onSaveFeedback={onSaveFeedback}
        />
      ) : null}
      {analysis && !compact ? (
        <AnalysisHistoryPanel
          currentAnalysisId={analysis.id}
          history={analysisHistory}
          state={analysisHistoryState}
          compact={compact}
        />
      ) : null}
    </div>
  );
}
