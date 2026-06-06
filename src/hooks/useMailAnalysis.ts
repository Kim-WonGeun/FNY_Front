import type { Dispatch, MutableRefObject, SetStateAction } from 'react';
import {
  createEmailAnalysisJob,
  fetchAgentHealth,
  patchAttentionStatus,
  saveEmailAnalysisFeedback
} from '../api/analysis';
import { fetchEmailAnalysisHistory, fetchEmailDetail } from '../api/mailbox';
import { sampleDetails } from '../data/sampleMailbox';
import type {
  AgentHealth,
  AnalysisFeedbackMessage,
  AnalysisFeedbackType,
  AttentionStatus,
  AuthSession,
  DetailLoadState,
  EmailAnalysis,
  EmailDetail,
  EmailListItem,
  LoadState,
  MailboxOverview,
  NavView
} from '../types';
import {
  updateDetailAttentionStatus,
  updateEmailAttentionStatus
} from '../utils/mailAttentionUpdates';
import {
  analysisFeedbackErrorMessage,
  analysisFeedbackSavedMessage,
  analysisFeedbackSavingMessage
} from '../utils/analysisFeedback';
import { createDetailFromListItem } from '../utils/mailContent';
import { normalizeEmailDetail } from '../utils/mailNormalizers';

type UseMailAnalysisOptions = {
  authSession: AuthSession | null;
  userId: string;
  navView: NavView;
  sortedEmails: EmailListItem[];
  allEmails: EmailListItem[];
  detailRequestSeq: MutableRefObject<number>;
  analysisHistoryState: Record<string, LoadState>;
  setOverview: Dispatch<SetStateAction<MailboxOverview>>;
  setAllEmails: Dispatch<SetStateAction<EmailListItem[]>>;
  setEmailDetail: Dispatch<SetStateAction<EmailDetail | null>>;
  setDetailLoadState: Dispatch<SetStateAction<DetailLoadState>>;
  setDetailErrorMessage: Dispatch<SetStateAction<string | null>>;
  setAnalysisHistory: Dispatch<SetStateAction<Record<string, EmailAnalysis[]>>>;
  setAnalysisHistoryState: Dispatch<SetStateAction<Record<string, LoadState>>>;
  setAgentHealth: Dispatch<SetStateAction<AgentHealth | null>>;
  setAnalysisRequestingId: Dispatch<SetStateAction<string | null>>;
  setAttentionUpdatingId: Dispatch<SetStateAction<string | null>>;
  setAnalysisFeedbackSavingId: Dispatch<SetStateAction<string | null>>;
  setAnalysisFeedbackMessages: Dispatch<SetStateAction<Record<string, AnalysisFeedbackMessage>>>;
  setSyncState: Dispatch<SetStateAction<LoadState>>;
  loadOverview: (targetUserId: string) => Promise<void>;
  loadAllEmails: (targetUserId: string, options?: { resetExpanded?: boolean }) => Promise<void>;
};

export function useMailAnalysis({
  authSession,
  userId,
  navView,
  sortedEmails,
  allEmails,
  detailRequestSeq,
  analysisHistoryState,
  setOverview,
  setAllEmails,
  setEmailDetail,
  setDetailLoadState,
  setDetailErrorMessage,
  setAnalysisHistory,
  setAnalysisHistoryState,
  setAgentHealth,
  setAnalysisRequestingId,
  setAttentionUpdatingId,
  setAnalysisFeedbackSavingId,
  setAnalysisFeedbackMessages,
  setSyncState,
  loadOverview,
  loadAllEmails
}: UseMailAnalysisOptions) {
  async function loadEmailDetail(emailId: string) {
    const requestSeq = detailRequestSeq.current + 1;
    detailRequestSeq.current = requestSeq;
    setDetailLoadState('loading');
    setDetailErrorMessage(null);
    setEmailDetail((current) => (current?.id === emailId ? current : null));

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 10000);

    try {
      const data = await fetchEmailDetail(emailId, controller.signal);
      if (requestSeq !== detailRequestSeq.current) {
        return;
      }
      setEmailDetail(normalizeEmailDetail(data));
      setDetailLoadState('ready');
    } catch (error) {
      if (requestSeq !== detailRequestSeq.current) {
        return;
      }
      const localFallback =
        createDetailFromListItem(
          sortedEmails.find((email) => email.id === emailId) ??
            allEmails.find((email) => email.id === emailId)
        ) ?? sampleDetails[emailId];
      setEmailDetail(
        localFallback && localFallback.id === emailId
          ? localFallback
          : null
      );
      setDetailLoadState('fallback');
      setDetailErrorMessage(
        error instanceof DOMException && error.name === 'AbortError'
          ? '메일 상세 요청 시간이 초과되었습니다.'
          : error instanceof Error
            ? error.message
            : 'Unknown error'
      );
    } finally {
      window.clearTimeout(timeoutId);
    }
  }

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

  async function loadAgentHealth() {
    try {
      const data = await fetchAgentHealth();
      setAgentHealth(data);
    } catch {
      setAgentHealth(null);
    }
  }

  async function requestEmailAnalysis(emailId: string) {
    setAnalysisRequestingId(emailId);
    setSyncState('loading');

    try {
      await createEmailAnalysisJob(emailId);
      setSyncState('ready');
      await loadAgentHealth();
      await loadEmailDetail(emailId);
      await loadOverview(userId);
      if (navView === 'allMail') {
        await loadAllEmails(userId);
      }
    } catch {
      setSyncState('error');
    } finally {
      setAnalysisRequestingId(null);
    }
  }

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

  async function updateAttentionStatus(emailId: string, status: AttentionStatus) {
    setAttentionUpdatingId(emailId);
    setSyncState('loading');
    applyAttentionStatusState(emailId, status);

    try {
      const detail = normalizeEmailDetail(await patchAttentionStatus(emailId, status));
      setEmailDetail(detail);
      applyAttentionStatusState(emailId, detail.attentionStatus, detail.attentionStatusUpdatedAt);
      setSyncState('ready');
      await loadOverview(userId);
      if (navView === 'allMail') {
        await loadAllEmails(userId);
      }
    } catch {
      await loadOverview(userId);
      if (navView === 'allMail') {
        await loadAllEmails(userId);
      }
      setSyncState('error');
    } finally {
      setAttentionUpdatingId(null);
    }
  }

  function applyAttentionStatusState(emailId: string, status: AttentionStatus, updatedAt?: string | null) {
    setOverview((current) => ({
      ...current,
      spotlightEmails: current.spotlightEmails.map((email) =>
        updateEmailAttentionStatus(email, emailId, status, updatedAt)
      )
    }));
    setAllEmails((current) => current.map((email) => updateEmailAttentionStatus(email, emailId, status, updatedAt)));
    setEmailDetail((current) =>
      updateDetailAttentionStatus(current, emailId, status, updatedAt)
    );
  }

  return {
    loadEmailDetail,
    loadAnalysisHistory,
    loadAgentHealth,
    requestEmailAnalysis,
    saveAnalysisFeedback,
    updateAttentionStatus
  };
}
