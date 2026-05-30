import type { AnalysisFeedbackMessage, AnalysisFeedbackType } from '../types';

type AnalysisFeedbackPanelProps = {
  analysisId: string;
  feedbackSaving: boolean;
  feedbackMessage: AnalysisFeedbackMessage | null;
  onSaveFeedback: (analysisId: string, feedbackType: AnalysisFeedbackType) => void;
};

export function AnalysisFeedbackPanel({
  analysisId,
  feedbackSaving,
  feedbackMessage,
  onSaveFeedback
}: AnalysisFeedbackPanelProps) {
  return (
    <div className="analysis-feedback-panel">
      <div>
        <span>분석 피드백</span>
        <p>결과가 맞는지 알려주면 다음 분석 개선에 활용할 수 있습니다.</p>
      </div>
      <div className="analysis-feedback-actions">
        <button type="button" onClick={() => onSaveFeedback(analysisId, 'ACCEPTED')} disabled={feedbackSaving}>
          분석이 맞아요
        </button>
        <button
          type="button"
          className="analysis-feedback-secondary"
          onClick={() => onSaveFeedback(analysisId, 'NEEDS_FIX')}
          disabled={feedbackSaving}
        >
          수정이 필요해요
        </button>
      </div>
      {feedbackMessage ? (
        <p className={`analysis-feedback-message analysis-feedback-message-${feedbackMessage.tone}`}>
          {feedbackSaving ? '저장 중입니다.' : feedbackMessage.text}
        </p>
      ) : null}
    </div>
  );
}
