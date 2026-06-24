import { useCallback } from 'react';
import type { EmailListItem, NavView } from '../types';
import { updateBrowserPath } from '../utils/appNavigation';

type UseMailDetailNavigationOptions = {
  navView: NavView;
  mailDetailBackView: NavView;
  mailDetailSequence: EmailListItem[];
  filteredAllEmails: EmailListItem[];
  filteredSpotlight: EmailListItem[];
  sortedAllEmails: EmailListItem[];
  setSelectedEmailId: (emailId: string) => void;
  setExpandedMailId: (emailId: string | null) => void;
  setMailDetailBackView: (view: NavView) => void;
  setMailDetailSequence: (emails: EmailListItem[]) => void;
  setNavView: (view: NavView) => void;
  navigateToView: (view: Exclude<NavView, 'mailDetail'>) => void;
};

export function useMailDetailNavigation({
  navView,
  mailDetailBackView,
  mailDetailSequence,
  filteredAllEmails,
  filteredSpotlight,
  sortedAllEmails,
  setSelectedEmailId,
  setExpandedMailId,
  setMailDetailBackView,
  setMailDetailSequence,
  setNavView,
  navigateToView
}: UseMailDetailNavigationOptions) {
  const resolveDetailSequence = useCallback((backView: NavView) => {
    if (backView === 'allMail') return filteredAllEmails;
    if (backView === 'home') return filteredSpotlight;
    return sortedAllEmails;
  }, [filteredAllEmails, filteredSpotlight, sortedAllEmails]);

  const openEmailDetail = useCallback((
    emailId: string,
    options?: { backView?: NavView; sequence?: EmailListItem[] }
  ) => {
    const backView = options?.backView ?? (navView === 'mailDetail' ? mailDetailBackView : navView);
    const currentSequence = navView === 'mailDetail' ? mailDetailSequence : [];
    const sequence = options?.sequence ?? (
      currentSequence.some((email) => email.id === emailId)
        ? currentSequence
        : resolveDetailSequence(backView)
    );

    setSelectedEmailId(emailId);
    setExpandedMailId(null);
    setMailDetailBackView(backView);
    setMailDetailSequence(sequence.some((email) => email.id === emailId) ? sequence : []);
    setNavView('mailDetail');
    updateBrowserPath(`/mail/${encodeURIComponent(emailId)}`);
  }, [
    mailDetailBackView,
    mailDetailSequence,
    navView,
    resolveDetailSequence,
    setExpandedMailId,
    setMailDetailBackView,
    setMailDetailSequence,
    setNavView,
    setSelectedEmailId
  ]);

  const closeEmailDetail = useCallback(() => {
    setExpandedMailId(null);
    navigateToView(mailDetailBackView === 'mailDetail' ? 'allMail' : mailDetailBackView);
  }, [mailDetailBackView, navigateToView, setExpandedMailId]);

  return {
    closeEmailDetail,
    openEmailDetail,
    resolveDetailSequence,
    toggleEmailDetail: openEmailDetail
  };
}
