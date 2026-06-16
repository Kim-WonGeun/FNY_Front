import type { Dispatch, SetStateAction } from 'react';
import { fetchEmailAnalysisHistory } from '../api/mailbox';
import type { EmailAnalysis, LoadState } from '../types';

type UseAnalysisHistoryLoaderOptions = {
  analysisHistoryState: Record<string, LoadState>;
  setAnalysisHistory: Dispatch<SetStateAction<Record<string, EmailAnalysis[]>>>;
  setAnalysisHistoryState: Dispatch<SetStateAction<Record<string, LoadState>>>;
};

export function useAnalysisHistoryLoader({
  analysisHistoryState,
  setAnalysisHistory,
  setAnalysisHistoryState
}: UseAnalysisHistoryLoaderOptions) {
  async function loadAnalysisHistory(emailId: string) {
    if (analysisHistoryState[emailId] === 'loading') {
      return;
    }
    setAnalysisHistoryState((current) => ({ ...current, [emailId]: 'loading' }));
    try {
      const history = await fetchEmailAnalysisHistory(emailId);
      setAnalysisHistory((current) => ({ ...current, [emailId]: history }));
      setAnalysisHistoryState((current) => ({ ...current, [emailId]: 'ready' }));
    } catch {
      setAnalysisHistoryState((current) => ({ ...current, [emailId]: 'error' }));
    }
  }

  return { loadAnalysisHistory };
}
