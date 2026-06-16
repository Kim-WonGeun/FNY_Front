import type { Dispatch, SetStateAction } from 'react';
import { saveEmailAnalysisFeedback } from '../api/analysis';
import type { AnalysisFeedbackMessage, AnalysisFeedbackType } from '../types';
import {
  analysisFeedbackErrorMessage,
  analysisFeedbackSavedMessage,
  analysisFeedbackSavingMessage
} from '../utils/analysisFeedback';

type UseAnalysisFeedbackOptions = {
  userId: string;
  setAnalysisFeedbackSavingId: Dispatch<SetStateAction<string | null>>;
  setAnalysisFeedbackMessages: Dispatch<SetStateAction<Record<string, AnalysisFeedbackMessage>>>;
};

export function useAnalysisFeedback({
  userId,
  setAnalysisFeedbackSavingId,
  setAnalysisFeedbackMessages
}: UseAnalysisFeedbackOptions) {
  async function saveAnalysisFeedback(analysisId: string, feedbackType: AnalysisFeedbackType) {
    setAnalysisFeedbackSavingId(analysisId);
    setAnalysisFeedbackMessages((current) => ({
      ...current,
      [analysisId]: analysisFeedbackSavingMessage(feedbackType)
    }));

    try {
      await saveEmailAnalysisFeedback(analysisId, userId, feedbackType);
      setAnalysisFeedbackMessages((current) => ({
        ...current,
        [analysisId]: analysisFeedbackSavedMessage(feedbackType)
      }));
    } catch (error) {
      setAnalysisFeedbackMessages((current) => ({
        ...current,
        [analysisId]: analysisFeedbackErrorMessage(error)
      }));
    } finally {
      setAnalysisFeedbackSavingId(null);
    }
  }

  return { saveAnalysisFeedback };
}
