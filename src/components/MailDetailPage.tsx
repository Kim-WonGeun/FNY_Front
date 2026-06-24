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
import { useMailDetailKeyboardNavigation } from '../hooks/useMailDetailKeyboardNavigation';
import { analysisListHint } from '../utils/mailAnalysisCandidate';
import { buildDetailChips, toEmailListItem } from '../utils/mailDetail';
import { MailDetailHeader } from './MailDetailHeader';
import { MailDetailRecovery } from './MailDetailRecovery';
import { MailInlineDetail } from './MailInlineDetail';

export type MailDetailPageProps = {
  email: EmailListItem | null;
  previousEmail: EmailListItem | null;
  nextEmail: EmailListItem | null;
  detail: EmailDetail | null;
  detailLoadState: DetailLoadState;
  detailErrorMessage: string | null;
  theme: 'light' | 'dark';
  originalMailDefaultOpen: boolean;
  analysisSubmitting: boolean;
  agentHealth: AgentHealth | null;
  attentionUpdating: boolean;
  feedbackSavingId: string | null;
  feedbackMessages: Record<string, AnalysisFeedbackMessage>;
  analysisHistory: EmailAnalysis[];
  analysisHistoryState: LoadState;
  onBack: () => void;
  onOpenEmail: (emailId: string) => void;
  onRetry: () => void;
  onRequestAnalysis: (emailId: string) => void;
  onUpdateAnalysisCandidate: (emailId: string, eligible: boolean) => void;
  onUpdateAttentionStatus: (emailId: string, status: AttentionStatus) => void;
  onSaveAnalysisFeedback: (analysisId: string, feedbackType: AnalysisFeedbackType) => void;
};

export function MailDetailPage({
  email,
  previousEmail,
  nextEmail,
  detail,
  detailLoadState,
  detailErrorMessage,
  theme,
  originalMailDefaultOpen,
  analysisSubmitting,
  agentHealth,
  attentionUpdating,
  feedbackSavingId,
  feedbackMessages,
  analysisHistory,
  analysisHistoryState,
  onBack,
  onOpenEmail,
  onRetry,
  onRequestAnalysis,
  onUpdateAnalysisCandidate,
  onUpdateAttentionStatus,
  onSaveAnalysisFeedback
}: MailDetailPageProps) {
  const displayEmail = email ?? (detail ? toEmailListItem(detail) : null);
  const isLoading = detailLoadState === 'loading';
  const receivedAt = displayEmail?.receivedAt ?? detail?.receivedAt ?? '';
  const analysisHint = displayEmail ? analysisListHint(displayEmail) : null;
  const detailChips = displayEmail ? buildDetailChips(displayEmail, detail) : [];

  useMailDetailKeyboardNavigation({ nextEmail, previousEmail, onOpenEmail });

  return (
    <div className="mail-detail-page" aria-label="메일 상세">
      {!displayEmail && !isLoading ? (
        <MailDetailRecovery errorMessage={detailErrorMessage} onBack={onBack} onRetry={onRetry} />
      ) : (
        <section className="mail-detail-card">
          {displayEmail ? (
            <MailDetailHeader
              analysisHint={analysisHint}
              detail={detail}
              detailChips={detailChips}
              displayEmail={displayEmail}
              nextEmail={nextEmail}
              previousEmail={previousEmail}
              receivedAt={receivedAt}
              onBack={onBack}
              onOpenEmail={onOpenEmail}
            />
          ) : null}

          {displayEmail ? (
            <MailInlineDetail
              email={displayEmail}
              detail={detail}
              detailLoadState={detailLoadState}
              detailErrorMessage={detailErrorMessage}
              isLoading={isLoading}
              theme={theme}
              originalMailDefaultOpen={originalMailDefaultOpen}
              analysisSubmitting={analysisSubmitting}
              agentHealth={agentHealth}
              attentionUpdating={attentionUpdating}
              feedbackSavingId={feedbackSavingId}
              feedbackMessages={feedbackMessages}
              analysisHistory={analysisHistory}
              analysisHistoryState={analysisHistoryState}
              onRequestAnalysis={onRequestAnalysis}
              onUpdateAnalysisCandidate={onUpdateAnalysisCandidate}
              onUpdateAttentionStatus={onUpdateAttentionStatus}
              onSaveAnalysisFeedback={onSaveAnalysisFeedback}
            />
          ) : (
            <p className="status-line" style={{ margin: 0 }}>
              메일 내용을 불러오는 중입니다.
            </p>
          )}
        </section>
      )}
    </div>
  );
}
