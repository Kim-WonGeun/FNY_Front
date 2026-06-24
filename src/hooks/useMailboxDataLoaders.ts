import { useCallback, type Dispatch, type SetStateAction } from 'react';
import { fetchAllEmails, fetchMailAccounts, fetchMailboxOverview } from '../api/mailbox';
import { sampleOverview } from '../data/sampleMailbox';
import type {
  EmailListItem,
  LoadState,
  MailAccountSummary,
  MailboxOverview,
  NavView
} from '../types';
import { getFallbackMailAccount, getPrimaryMailAccount } from '../utils/mailAccounts';
import { normalizeEmailList, normalizeOverview } from '../utils/mailNormalizers';
import { getFirstEmailId, resolveSelectedEmailId } from '../utils/mailPagination';

type UseMailboxDataLoadersOptions = {
  navView: NavView;
  query: string;
  senderQuery: string;
  startDate: string;
  endDate: string;
  searchBody: boolean;
  parseApiError: (response: Response, fallbackMessage?: string) => Promise<Error>;
  setOverview: Dispatch<SetStateAction<MailboxOverview>>;
  setLoadState: Dispatch<SetStateAction<LoadState>>;
  setErrorMessage: Dispatch<SetStateAction<string | null>>;
  setAllEmails: Dispatch<SetStateAction<EmailListItem[]>>;
  setAllMailLoadState: Dispatch<SetStateAction<LoadState>>;
  setAllMailError: Dispatch<SetStateAction<string | null>>;
  setAllMailPage: Dispatch<SetStateAction<number>>;
  setExpandedMailId: Dispatch<SetStateAction<string | null>>;
  setSelectedEmailId: Dispatch<SetStateAction<string>>;
  setMailAccounts: Dispatch<SetStateAction<MailAccountSummary[]>>;
  setPrimaryMailAccountId: Dispatch<SetStateAction<string | null>>;
  setPrimaryMailAccountEmail: Dispatch<SetStateAction<string | null>>;
};

export function useMailboxDataLoaders({
  navView,
  query,
  senderQuery,
  startDate,
  endDate,
  searchBody,
  parseApiError,
  setOverview,
  setLoadState,
  setErrorMessage,
  setAllEmails,
  setAllMailLoadState,
  setAllMailError,
  setAllMailPage,
  setExpandedMailId,
  setSelectedEmailId,
  setMailAccounts,
  setPrimaryMailAccountId,
  setPrimaryMailAccountEmail
}: UseMailboxDataLoadersOptions) {
  const loadAllEmails = useCallback(async (
    _targetUserId: string,
    options?: { resetExpanded?: boolean }
  ) => {
    setAllMailLoadState('loading');
    setAllMailError(null);

    try {
      const data = await fetchAllEmails({ query, sender: senderQuery, startDate, endDate, searchBody }, parseApiError);
      const normalized = normalizeEmailList(data);
      setAllEmails(normalized);
      setAllMailPage(1);
      if (options?.resetExpanded !== false) setExpandedMailId(null);
      setSelectedEmailId((current) =>
        navView === 'mailDetail' ? current : resolveSelectedEmailId(normalized, current)
      );
      setAllMailLoadState('ready');
    } catch (error) {
      setAllEmails((current) => (navView === 'mailDetail' ? current : sampleOverview.spotlightEmails));
      setAllMailPage(1);
      setExpandedMailId(null);
      setSelectedEmailId((current) =>
        navView === 'mailDetail' ? current : getFirstEmailId(sampleOverview.spotlightEmails)
      );
      setAllMailLoadState('fallback');
      setAllMailError(error instanceof Error ? error.message : 'Unknown error');
    }
  }, [endDate, navView, parseApiError, query, searchBody, senderQuery, startDate]);

  const loadOverview = useCallback(async (targetUserId: string) => {
    setLoadState('loading');
    setErrorMessage(null);

    try {
      const normalized = normalizeOverview(await fetchMailboxOverview(parseApiError));
      setOverview(normalized);
      setSelectedEmailId((current) =>
        navView === 'mailDetail' ? current : resolveSelectedEmailId(normalized.spotlightEmails, current)
      );
      setLoadState('ready');

      try {
        const accounts = await fetchMailAccounts();
        const primary = getPrimaryMailAccount(accounts);
        setMailAccounts(accounts);
        setPrimaryMailAccountId(primary?.id ?? null);
        setPrimaryMailAccountEmail(primary?.accountEmail ?? null);
      } catch {
        const fallback = getFallbackMailAccount(targetUserId);
        setMailAccounts([]);
        setPrimaryMailAccountId(fallback.id);
        setPrimaryMailAccountEmail(fallback.email);
      }
      void loadAllEmails(targetUserId, { resetExpanded: false });
    } catch (error) {
      const fallback = getFallbackMailAccount(targetUserId);
      setOverview({ ...sampleOverview, userId: targetUserId });
      setAllEmails((current) => (navView === 'mailDetail' ? current : sampleOverview.spotlightEmails));
      setSelectedEmailId((current) =>
        navView === 'mailDetail' ? current : getFirstEmailId(sampleOverview.spotlightEmails)
      );
      setLoadState('fallback');
      setErrorMessage(error instanceof Error ? error.message : 'Unknown error');
      setPrimaryMailAccountId(fallback.id);
      setPrimaryMailAccountEmail(fallback.email);
      setMailAccounts([]);
    }
  }, [loadAllEmails, navView, parseApiError]);

  return { loadAllEmails, loadOverview };
}
