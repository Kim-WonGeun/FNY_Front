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
        <section className="mail-detail-recovery" role="status">
          <div className="empty-state-mark" aria-hidden="true">
            <span />
          </div>
          <strong>메일을 찾을 수 없습니다</strong>
          <p>
            {detailErrorMessage
              ? detailErrorMessage
              : '메일 목록이 아직 준비되지 않았거나 삭제된 메일일 수 있습니다.'}
          </p>
          <div className="mail-detail-recovery-actions">
            <button type="button" className="mail-detail-back" onClick={onRetry}>
              다시 불러오기
            </button>
            <button type="button" className="mail-detail-nav-btn" onClick={onBack}>
              메일함으로 이동
            </button>
          </div>
        </section>
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
