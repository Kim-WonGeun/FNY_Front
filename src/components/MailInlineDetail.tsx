import { useEffect, useState } from 'react';
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
import { decodeHtmlEntities } from '../utils/mailContent';
import { AnalysisInsightSummary } from './AnalysisInsightSummary';
import { EmptyState } from './common';
import { AnalysisStatusCard } from './mailAnalysis';
import { OriginalMailBody } from './OriginalMailBody';

type MailInlineDetailProps = {
  email: EmailListItem;
  detail: EmailDetail | null;
  detailLoadState: DetailLoadState;
  detailErrorMessage: string | null;
  isLoading: boolean;
  theme: 'light' | 'dark';
  originalMailDefaultOpen: boolean;
  analysisSubmitting: boolean;
  agentHealth: AgentHealth | null;
  attentionUpdating: boolean;
  feedbackSavingId: string | null;
  feedbackMessages: Record<string, AnalysisFeedbackMessage>;
  analysisHistory: EmailAnalysis[];
  analysisHistoryState: LoadState;
  onRequestAnalysis: (emailId: string) => void;
  onUpdateAnalysisCandidate: (emailId: string, eligible: boolean) => void;
  onUpdateAttentionStatus: (emailId: string, status: AttentionStatus) => void;
  onSaveAnalysisFeedback: (analysisId: string, feedbackType: AnalysisFeedbackType) => void;
};

export function MailInlineDetail({
  email,
  detail,
  detailLoadState,
  detailErrorMessage,
  isLoading,
  theme,
  originalMailDefaultOpen,
  analysisSubmitting,
  agentHealth,
  attentionUpdating,
  feedbackSavingId,
  feedbackMessages,
  analysisHistory,
  analysisHistoryState,
  onRequestAnalysis,
  onUpdateAnalysisCandidate,
  onUpdateAttentionStatus,
  onSaveAnalysisFeedback
}: MailInlineDetailProps) {
  const analysis = detail?.analysis;
  const [originalMailOpen, setOriginalMailOpen] = useState(originalMailDefaultOpen);

  useEffect(() => {
    setOriginalMailOpen(originalMailDefaultOpen);
  }, [originalMailDefaultOpen, detail?.id]);

  return (
    <div className="mail-inline-detail">
      {isLoading ? (
        <EmptyState title="메일을 불러오는 중입니다" description="원문과 분석 정보를 준비하고 있습니다." />
      ) : (
        <>
          {detailLoadState === 'fallback' && detailErrorMessage ? (
            <p className="status-line" style={{ margin: 0 }}>
              임시 상세로 보고 있습니다. {detailErrorMessage}
            </p>
          ) : null}

          {detail ? <AnalysisInsightSummary detail={detail} /> : null}

          <div className="mail-inline-grid">
            <section className="mail-inline-section-wide">
              <p className="eyebrow">요약</p>
              <p className="mail-inline-summary">
                {analysis?.detailedSummary ||
                  analysis?.shortSummary ||
                  email.shortSummary ||
                  '분석 요약을 기다리고 있습니다.'}
              </p>
            </section>
            <section className="mail-inline-section-wide">
              <p className="eyebrow">메일 원문</p>
              {detail && originalMailOpen ? (
                <OriginalMailBody detail={detail} fallback={email.snippet} theme={theme} compact />
              ) : detail ? (
                <button type="button" className="mail-original-toggle" onClick={() => setOriginalMailOpen(true)}>
                  원문 보기
                </button>
              ) : (
                <p>{decodeHtmlEntities(email.snippet || '본문이 없습니다.')}</p>
              )}
            </section>
            <section className="mail-inline-section-wide">
              <p className="eyebrow">분석 상태</p>
              <AnalysisStatusCard
                detail={detail}
                loading={isLoading}
                submitting={analysisSubmitting}
                agentHealth={agentHealth}
                onRequest={() => onRequestAnalysis(email.id)}
                candidateUpdating={analysisSubmitting}
                onUpdateAnalysisCandidate={(eligible) => onUpdateAnalysisCandidate(email.id, eligible)}
                attentionUpdating={attentionUpdating}
                onUpdateAttentionStatus={(status) => onUpdateAttentionStatus(email.id, status)}
                feedbackSaving={Boolean(detail?.analysis && feedbackSavingId === detail.analysis.id)}
                feedbackMessage={detail?.analysis ? feedbackMessages[detail.analysis.id] ?? null : null}
                onSaveFeedback={onSaveAnalysisFeedback}
                analysisHistory={analysisHistory}
                analysisHistoryState={analysisHistoryState}
                compact
              />
            </section>
          </div>
        </>
      )}
    </div>
  );
}
