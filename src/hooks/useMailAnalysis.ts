import type { Dispatch, MutableRefObject, SetStateAction } from 'react';
import {
  createEmailAnalysisJob,
  patchAttentionStatus
} from '../api/analysis';
import { fetchEmailDetail } from '../api/mailbox';
import type {
  AgentHealth,
  AnalysisFeedbackMessage,
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
  detailLoadErrorMessage,
  findDetailFallback
} from '../utils/mailDetailLoading';
import { toEmailListItem } from '../utils/mailDetail';
import {
  updateOverviewSpotlightEmail,
  upsertEmailListItem
} from '../utils/mailListUpdates';
import { normalizeEmailDetail } from '../utils/mailNormalizers';
import { useAgentHealthLoader } from './useAgentHealthLoader';
import { useAnalysisFeedback } from './useAnalysisFeedback';
import { useAnalysisHistoryLoader } from './useAnalysisHistoryLoader';

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
  const { saveAnalysisFeedback } = useAnalysisFeedback({
    userId,
    setAnalysisFeedbackSavingId,
    setAnalysisFeedbackMessages
  });
  const { loadAnalysisHistory } = useAnalysisHistoryLoader({
    analysisHistoryState,
    setAnalysisHistory,
    setAnalysisHistoryState
  });
  const { loadAgentHealth } = useAgentHealthLoader({ setAgentHealth });

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
      const detail = normalizeEmailDetail(data);
      const listItem = toEmailListItem(detail);
      setEmailDetail(detail);
      setAllEmails((current) => upsertEmailListItem(current, listItem));
      setOverview((current) => updateOverviewSpotlightEmail(current, listItem));
      setDetailLoadState('ready');
    } catch (error) {
      if (requestSeq !== detailRequestSeq.current) {
        return;
      }
      setEmailDetail(findDetailFallback(emailId, sortedEmails, allEmails));
      setDetailLoadState('fallback');
      setDetailErrorMessage(detailLoadErrorMessage(error));
    } finally {
      window.clearTimeout(timeoutId);
    }
  }

  async function refreshMailboxes() {
    await loadOverview(userId);
    if (navView === 'allMail') {
      await loadAllEmails(userId);
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
      await refreshMailboxes();
    } catch {
      setSyncState('error');
    } finally {
      setAnalysisRequestingId(null);
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
      await refreshMailboxes();
    } catch {
      await refreshMailboxes();
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
