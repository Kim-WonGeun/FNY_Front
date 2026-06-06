import { useEffect } from 'react';
import type { AuthSession, EmailListItem, MailboxAnalysisFilter, MailboxCategory, NavView } from '../types';
import {
  getFirstEmailId,
  hasEmailId
} from '../utils/mailPagination';

type UseMailboxViewGuardsOptions = {
  allMailEndDate: string;
  allMailPage: number;
  allMailQuery: string;
  allMailSenderQuery: string;
  allMailStartDate: string;
  allMailTotalPages: number;
  authSession: AuthSession | null;
  expandedMailId: string | null;
  filteredAllEmails: EmailListItem[];
  filteredSpotlight: EmailListItem[];
  mailboxAnalysisFilter: MailboxAnalysisFilter;
  mailboxCategory: MailboxCategory;
  navView: NavView;
  selectedEmailId: string;
  userId: string;
  setAllMailPage: (page: number) => void;
  setExpandedMailId: (emailId: string | null) => void;
  setSelectedEmailId: (emailId: string) => void;
};

export function useMailboxViewGuards({
  allMailEndDate,
  allMailPage,
  allMailQuery,
  allMailSenderQuery,
  allMailStartDate,
  allMailTotalPages,
  authSession,
  expandedMailId,
  filteredAllEmails,
  filteredSpotlight,
  mailboxAnalysisFilter,
  mailboxCategory,
  navView,
  selectedEmailId,
  userId,
  setAllMailPage,
  setExpandedMailId,
  setSelectedEmailId
}: UseMailboxViewGuardsOptions) {
  useEffect(() => {
    if (!authSession) {
      return;
    }
    setAllMailPage(1);
    setExpandedMailId(null);
  }, [authSession, allMailQuery, allMailSenderQuery, allMailStartDate, allMailEndDate, mailboxCategory, mailboxAnalysisFilter, userId]);

  useEffect(() => {
    if (allMailPage > allMailTotalPages) {
      setAllMailPage(allMailTotalPages);
    }
  }, [allMailPage, allMailTotalPages]);

  useEffect(() => {
    if (navView !== 'mailDetail' && filteredSpotlight.length > 0 && !hasEmailId(filteredSpotlight, selectedEmailId)) {
      setSelectedEmailId(getFirstEmailId(filteredSpotlight));
    }
  }, [filteredSpotlight, navView, selectedEmailId]);

  useEffect(() => {
    if (
      navView === 'allMail' &&
      filteredAllEmails.length > 0 &&
      expandedMailId &&
      !hasEmailId(filteredAllEmails, expandedMailId)
    ) {
      setExpandedMailId(null);
    }
  }, [navView, filteredAllEmails, expandedMailId]);
}
