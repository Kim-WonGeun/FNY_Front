import type { Dispatch, SetStateAction } from 'react';
import { patchAnalysisCandidate } from '../api/analysis';
import type { EmailDetail, EmailListItem, LoadState, MailboxOverview } from '../types';
import { toEmailListItem } from '../utils/mailDetail';
import { updateOverviewSpotlightEmail, upsertEmailListItem } from '../utils/mailListUpdates';
import { normalizeEmailDetail } from '../utils/mailNormalizers';

type UseAnalysisCandidateUpdateOptions = {
  setOverview: Dispatch<SetStateAction<MailboxOverview>>;
  setAllEmails: Dispatch<SetStateAction<EmailListItem[]>>;
  setEmailDetail: Dispatch<SetStateAction<EmailDetail | null>>;
  setAnalysisRequestingId: Dispatch<SetStateAction<string | null>>;
  setSyncState: Dispatch<SetStateAction<LoadState>>;
  refreshMailboxes: () => Promise<void>;
};

export function useAnalysisCandidateUpdate({
  setOverview,
  setAllEmails,
  setEmailDetail,
  setAnalysisRequestingId,
  setSyncState,
  refreshMailboxes
}: UseAnalysisCandidateUpdateOptions) {
  async function updateAnalysisCandidate(emailId: string, eligible: boolean) {
    setAnalysisRequestingId(emailId);
    setSyncState('loading');

    try {
      const detail = normalizeEmailDetail(await patchAnalysisCandidate(emailId, eligible));
      const listItem = toEmailListItem(detail);
      setEmailDetail(detail);
      setAllEmails((current) => upsertEmailListItem(current, listItem));
      setOverview((current) => updateOverviewSpotlightEmail(current, listItem));
      setSyncState('ready');
      await refreshMailboxes();
    } catch {
      setSyncState('error');
    } finally {
      setAnalysisRequestingId(null);
    }
  }

  return { updateAnalysisCandidate };
}
