import type { EmailDetail, EmailListItem } from '../types';
import type { MailRowRuntimeProps } from './HomeMailRow';
import type { MailDetailPageProps } from './MailDetailPage';

type BuildMailDetailPagePropsOptions = {
  email: EmailListItem | null;
  previousEmail: EmailListItem | null;
  nextEmail: EmailListItem | null;
  emailDetail: EmailDetail | null;
  selectedEmailId: string;
  runtime: MailRowRuntimeProps;
  onBack: () => void;
  onOpenEmail: (emailId: string) => void;
  loadEmailDetail: (emailId: string) => Promise<void>;
};

export function buildMailDetailPageProps({
  email,
  previousEmail,
  nextEmail,
  emailDetail,
  selectedEmailId,
  runtime,
  onBack,
  onOpenEmail,
  loadEmailDetail
}: BuildMailDetailPagePropsOptions): MailDetailPageProps {
  return {
    email,
    previousEmail,
    nextEmail,
    detail: emailDetail?.id === selectedEmailId ? emailDetail : null,
    detailLoadState: runtime.detailLoadState,
    detailErrorMessage: runtime.detailErrorMessage,
    theme: runtime.theme,
    originalMailDefaultOpen: runtime.originalMailDefaultOpen,
    analysisSubmitting: runtime.analysisRequestingId === selectedEmailId,
    agentHealth: runtime.agentHealth,
    attentionUpdating: runtime.attentionUpdatingId === selectedEmailId,
    feedbackSavingId: runtime.analysisFeedbackSavingId,
    feedbackMessages: runtime.analysisFeedbackMessages,
    analysisHistory: runtime.analysisHistory[selectedEmailId] ?? [],
    analysisHistoryState: runtime.analysisHistoryState[selectedEmailId] ?? 'idle',
    onBack,
    onOpenEmail,
    onRetry: () => void loadEmailDetail(selectedEmailId),
    onRequestAnalysis: runtime.onRequestAnalysis,
    onUpdateAnalysisCandidate: runtime.onUpdateAnalysisCandidate,
    onUpdateAttentionStatus: runtime.onUpdateAttentionStatus,
    onSaveAnalysisFeedback: runtime.onSaveAnalysisFeedback
  };
}
