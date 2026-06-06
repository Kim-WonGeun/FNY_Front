import { useEffect } from 'react';
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
import { formatDate } from '../utils/date';
import { attentionStatusLabel } from '../utils/mailAttention';
import { analysisListHint } from '../utils/mailAnalysisCandidate';
import { priorityLabel } from '../utils/mailboxLabels';
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
  const canMovePrevious = Boolean(previousEmail);
  const canMoveNext = Boolean(nextEmail);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || isEditableTarget(event.target)) {
        return;
      }
      if (event.key === 'ArrowLeft' && previousEmail) {
        event.preventDefault();
        onOpenEmail(previousEmail.id);
      }
      if (event.key === 'ArrowRight' && nextEmail) {
        event.preventDefault();
        onOpenEmail(nextEmail.id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextEmail, onOpenEmail, previousEmail]);

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
          <div className="mail-detail-toolbar">
            <button type="button" className="mail-detail-back" onClick={onBack}>
              메일 목록으로
            </button>
            <div className="mail-detail-toolbar-actions">
              <button
                type="button"
                className="mail-detail-nav-btn"
                onClick={() => previousEmail && onOpenEmail(previousEmail.id)}
                disabled={!canMovePrevious}
                title={previousEmail?.subject ?? '이전 메일이 없습니다'}
              >
                이전
              </button>
              <button
                type="button"
                className="mail-detail-nav-btn"
                onClick={() => nextEmail && onOpenEmail(nextEmail.id)}
                disabled={!canMoveNext}
                title={nextEmail?.subject ?? '다음 메일이 없습니다'}
              >
                다음
              </button>
              {receivedAt ? <time dateTime={receivedAt}>{formatDate(receivedAt)}</time> : null}
            </div>
          </div>

          <div className="mail-detail-head">
            <div>
              <p className="eyebrow">메일 상세</p>
              <h2>{displayEmail?.subject || detail?.subject || '(제목 없음)'}</h2>
              <p className="mail-detail-sender">
                {displayEmail?.fromName ?? detail?.fromName ?? displayEmail?.fromEmail ?? detail?.fromEmail ?? '발신자 정보 없음'}
                {(displayEmail?.fromEmail ?? detail?.fromEmail) ? (
                  <span>{displayEmail?.fromEmail ?? detail?.fromEmail}</span>
                ) : null}
              </p>
              {analysisHint ? <p className="mail-detail-hint">{analysisHint}</p> : null}
              {detailChips.length > 0 ? (
                <div className="mail-detail-chip-row" aria-label="메일 상태">
                  {detailChips.map((chip) => (
                    <span key={chip}>{chip}</span>
                  ))}
                </div>
              ) : null}
            </div>
          </div>

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

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  const tagName = target.tagName.toLowerCase();
  return tagName === 'input' || tagName === 'textarea' || tagName === 'select' || target.isContentEditable;
}

function buildDetailChips(email: EmailListItem, detail: EmailDetail | null) {
  const chips = [
    email.read ? '읽음' : '읽지 않음',
    attentionStatusLabel(email.attentionStatus),
    priorityLabel(email.priorityLevel ?? 'WAITING'),
    email.analysisEligible ? '분석 대상' : '분석 제외'
  ];

  if (email.hasAttachment || detail?.hasAttachment) {
    chips.push('첨부 있음');
  }
  if (detail?.provider) {
    chips.push(detail.provider);
  }

  return chips;
}

function toEmailListItem(detail: EmailDetail): EmailListItem {
  return {
    id: detail.id,
    subject: detail.subject,
    snippet: detail.snippet,
    fromName: detail.fromName,
    fromEmail: detail.fromEmail,
    receivedAt: detail.receivedAt,
    read: detail.read,
    starred: detail.starred,
    hasAttachment: detail.hasAttachment,
    category: detail.analysis?.category ?? null,
    priorityLevel: detail.analysis?.priorityLevel ?? null,
    importanceScore: detail.analysis?.importanceScore ?? null,
    urgencyScore: detail.analysis?.urgencyScore ?? null,
    shortSummary: detail.analysis?.shortSummary ?? null,
    needsReply: detail.analysis?.needsReply ?? null,
    analysisEligible: detail.analysisEligible,
    analysisCandidateScore: detail.analysisCandidateScore,
    analysisCandidateReasons: detail.analysisCandidateReasons,
    analysisSkippedReason: detail.analysisSkippedReason,
    analysisCandidateEvaluatedAt: detail.analysisCandidateEvaluatedAt,
    attentionResolved: detail.attentionResolved,
    attentionResolvedAt: detail.attentionResolvedAt,
    attentionStatus: detail.attentionStatus,
    attentionStatusUpdatedAt: detail.attentionStatusUpdatedAt,
    attentionReasons: []
  };
}
