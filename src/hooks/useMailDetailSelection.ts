import type { EmailListItem, MailboxOverview, NavView } from '../types';
import { findAdjacentMailItems, findSelectedMailItem } from '../utils/mailSelection';

type UseMailDetailSelectionOptions = {
  selectedEmailId: string;
  allEmails: EmailListItem[];
  sortedEmails: EmailListItem[];
  overview: MailboxOverview;
  mailDetailSequence: EmailListItem[];
  mailDetailBackView: NavView;
  resolveDetailSequence: (backView: NavView) => EmailListItem[];
};

export function useMailDetailSelection({
  selectedEmailId,
  allEmails,
  sortedEmails,
  overview,
  mailDetailSequence,
  mailDetailBackView,
  resolveDetailSequence
}: UseMailDetailSelectionOptions) {
  const selectedMailItem =
    findSelectedMailItem(selectedEmailId, allEmails, sortedEmails, overview) ??
    mailDetailSequence.find((email) => email.id === selectedEmailId) ??
    null;
  const fallbackDetailSequence = resolveDetailSequence(mailDetailBackView);
  const detailEmailSequence = mailDetailSequence.some((email) => email.id === selectedEmailId)
    ? mailDetailSequence
    : fallbackDetailSequence;
  const { previousEmail, nextEmail } = findAdjacentMailItems(selectedEmailId, detailEmailSequence);

  return {
    selectedMailItem,
    previousEmail,
    nextEmail
  };
}
