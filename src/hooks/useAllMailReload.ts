import { useEffect } from 'react';
import type { AuthSession, NavView } from '../types';

type UseAllMailReloadOptions = {
  allMailEndDate: string;
  allMailQuery: string;
  allMailSearchBody: boolean;
  allMailSenderQuery: string;
  allMailStartDate: string;
  authSession: AuthSession | null;
  loadAllEmails: (targetUserId: string, options?: { resetExpanded?: boolean }) => Promise<void>;
  navView: NavView;
  userId: string;
};

export function useAllMailReload({
  allMailEndDate,
  allMailQuery,
  allMailSearchBody,
  allMailSenderQuery,
  allMailStartDate,
  authSession,
  loadAllEmails,
  navView,
  userId
}: UseAllMailReloadOptions) {
  useEffect(() => {
    if (!authSession || navView !== 'allMail') {
      return;
    }
    void loadAllEmails(userId);
  }, [authSession, navView, userId]);

  useEffect(() => {
    if (!authSession || navView !== 'allMail') {
      return;
    }
    if (!allMailSearchBody) {
      void loadAllEmails(userId, { resetExpanded: false });
      return;
    }

    const timeoutId = window.setTimeout(() => {
      void loadAllEmails(userId, { resetExpanded: false });
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [authSession, navView, userId, allMailSearchBody, allMailQuery, allMailSenderQuery, allMailStartDate, allMailEndDate]);
}
