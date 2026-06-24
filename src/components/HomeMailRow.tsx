import type {
  AgentHealth,
  AnalysisFeedbackMessage,
  AnalysisFeedbackType,
  AttentionStatus,
  DetailLoadState,
  EmailAnalysis,
  EmailDetail,
  EmailListItem,
  LoadState
} from '../types';
import { MailListRow } from './mail';

export type MailRowRuntimeProps = {
  detailLoadState: DetailLoadState;
  detailErrorMessage: string | null;
  theme: 'light' | 'dark';
  originalMailDefaultOpen: boolean;
  analysisRequestingId: string | null;
  agentHealth: AgentHealth | null;
  attentionUpdatingId: string | null;
  analysisFeedbackSavingId: string | null;
  analysisFeedbackMessages: Record<string, AnalysisFeedbackMessage>;
  analysisHistory: Record<string, EmailAnalysis[]>;
  analysisHistoryState: Record<string, LoadState>;
  onRequestAnalysis: (emailId: string) => void;
  onUpdateAnalysisCandidate: (emailId: string, eligible: boolean) => void;
  onUpdateAttentionStatus: (emailId: string, status: AttentionStatus) => void;
  onSaveAnalysisFeedback: (analysisId: string, feedbackType: AnalysisFeedbackType) => void;
};

type HomeMailRowProps = {
  email: EmailListItem;
  emailDetail: EmailDetail | null;
  expanded: boolean;
  index: number;
  runtime: MailRowRuntimeProps;
  onSelect: () => void;
};

export function HomeMailRow({
  email,
  emailDetail,
  expanded,
  index,
  runtime,
  onSelect
}: HomeMailRowProps) {
  return (
    <MailListRow
      email={email}
      index={index + 1}
      expanded={expanded}
      detail={expanded && emailDetail?.id === email.id ? emailDetail : null}
      detailLoadState={runtime.detailLoadState}
      detailErrorMessage={runtime.detailErrorMessage}
      theme={runtime.theme}
      originalMailDefaultOpen={runtime.originalMailDefaultOpen}
      analysisSubmitting={runtime.analysisRequestingId === email.id}
      agentHealth={runtime.agentHealth}
      attentionUpdating={runtime.attentionUpdatingId === email.id}
      onRequestAnalysis={runtime.onRequestAnalysis}
      onUpdateAnalysisCandidate={runtime.onUpdateAnalysisCandidate}
      onUpdateAttentionStatus={runtime.onUpdateAttentionStatus}
      feedbackSavingId={runtime.analysisFeedbackSavingId}
      feedbackMessages={runtime.analysisFeedbackMessages}
      onSaveAnalysisFeedback={runtime.onSaveAnalysisFeedback}
      analysisHistory={runtime.analysisHistory[email.id] ?? []}
      analysisHistoryState={runtime.analysisHistoryState[email.id] ?? 'idle'}
      onSelect={onSelect}
    />
  );
}
