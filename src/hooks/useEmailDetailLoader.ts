import type { Dispatch, MutableRefObject, SetStateAction } from 'react';
import { fetchEmailDetail } from '../api/mailbox';
import type {
  DetailLoadState,
  EmailDetail,
  EmailListItem,
  MailboxOverview
} from '../types';
import { toEmailListItem } from '../utils/mailDetail';
import { detailLoadErrorMessage, findDetailFallback } from '../utils/mailDetailLoading';
import { updateOverviewSpotlightEmail, upsertEmailListItem } from '../utils/mailListUpdates';
import { normalizeEmailDetail } from '../utils/mailNormalizers';

type UseEmailDetailLoaderOptions = {
  sortedEmails: EmailListItem[];
  allEmails: EmailListItem[];
  detailRequestSeq: MutableRefObject<number>;
  setOverview: Dispatch<SetStateAction<MailboxOverview>>;
  setAllEmails: Dispatch<SetStateAction<EmailListItem[]>>;
  setEmailDetail: Dispatch<SetStateAction<EmailDetail | null>>;
  setDetailLoadState: Dispatch<SetStateAction<DetailLoadState>>;
  setDetailErrorMessage: Dispatch<SetStateAction<string | null>>;
};

export function useEmailDetailLoader({
  sortedEmails,
  allEmails,
  detailRequestSeq,
  setOverview,
  setAllEmails,
  setEmailDetail,
  setDetailLoadState,
  setDetailErrorMessage
}: UseEmailDetailLoaderOptions) {
  async function loadEmailDetail(emailId: string) {
    const requestSeq = detailRequestSeq.current + 1;
    detailRequestSeq.current = requestSeq;
    setDetailLoadState('loading');
    setDetailErrorMessage(null);
    setEmailDetail((current) => (current?.id === emailId ? current : null));

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 10000);

    try {
      const detail = normalizeEmailDetail(await fetchEmailDetail(emailId, controller.signal));
      if (requestSeq !== detailRequestSeq.current) return;

      const listItem = toEmailListItem(detail);
      setEmailDetail(detail);
      setAllEmails((current) => upsertEmailListItem(current, listItem));
      setOverview((current) => updateOverviewSpotlightEmail(current, listItem));
      setDetailLoadState('ready');
    } catch (error) {
      if (requestSeq !== detailRequestSeq.current) return;

      setEmailDetail(findDetailFallback(emailId, sortedEmails, allEmails));
      setDetailLoadState('fallback');
      setDetailErrorMessage(detailLoadErrorMessage(error));
    } finally {
      window.clearTimeout(timeoutId);
    }
  }

  return { loadEmailDetail };
}
