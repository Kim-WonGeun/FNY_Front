import type { AnalysisFeedbackMessage, AnalysisFeedbackType } from '../types';

export function analysisFeedbackSavingMessage(feedbackType: AnalysisFeedbackType): AnalysisFeedbackMessage {
  return {
    tone: 'success',
    text: feedbackType === 'ACCEPTED'
      ? '긍정 피드백을 저장하는 중입니다.'
      : '수정 필요 피드백을 저장하는 중입니다.'
  };
}

export function analysisFeedbackSavedMessage(feedbackType: AnalysisFeedbackType): AnalysisFeedbackMessage {
  return {
    tone: 'success',
    text: feedbackType === 'ACCEPTED'
      ? '분석이 맞다는 피드백을 저장했습니다.'
      : '수정 필요 피드백을 저장했습니다.'
  };
}

export function analysisFeedbackErrorMessage(error: unknown): AnalysisFeedbackMessage {
  return {
    tone: 'error',
    text: error instanceof Error ? error.message : '피드백 저장에 실패했습니다.'
  };
}
