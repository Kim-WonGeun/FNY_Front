import type { AnalysisQueueFilter, EmailListItem, MailboxAnalysisFilter } from '../types';
import { isOpenAttentionStatus } from './mailAttention';

export function getAnalysisQueueCounts(emails: EmailListItem[]) {
  const evaluated = emails.filter((email) => email.analysisCandidateEvaluatedAt);
  return {
    candidate: evaluated.filter(
      (email) => email.analysisEligible && isOpenAttentionStatus(email.attentionStatus)
    ).length,
    excluded: evaluated.filter((email) => !email.analysisEligible).length,
    done: evaluated.filter((email) => !isOpenAttentionStatus(email.attentionStatus)).length
  };
}

export function getAnalysisQueueEmails(emails: EmailListItem[], filter: AnalysisQueueFilter) {
  const evaluated = emails.filter((email) => email.analysisCandidateEvaluatedAt);
  if (filter === 'excluded') {
    return evaluated.filter((email) => !email.analysisEligible);
  }
  if (filter === 'done') {
    return evaluated.filter((email) => !isOpenAttentionStatus(email.attentionStatus));
  }
  return evaluated.filter(
    (email) => email.analysisEligible && isOpenAttentionStatus(email.attentionStatus)
  );
}

export function getMailboxAnalysisCounts(emails: EmailListItem[]) {
  return {
    all: emails.length,
    ...getAnalysisQueueCounts(emails)
  };
}

export function getAnalysisSkippedReasonStats(emails: EmailListItem[]) {
  const stats = new Map<string, number>();
  emails
    .filter((email) => email.analysisCandidateEvaluatedAt && !email.analysisEligible)
    .forEach((email) => {
      const reason = email.analysisSkippedReason || 'UNKNOWN';
      stats.set(reason, (stats.get(reason) ?? 0) + 1);
    });

  return Array.from(stats.entries())
    .map(([reason, count]) => ({ reason, count }))
    .sort((a, b) => b.count - a.count);
}

export function getEmailsForAnalysisFilter(emails: EmailListItem[], filter: MailboxAnalysisFilter) {
  if (filter === 'all') {
    return emails;
  }
  return getAnalysisQueueEmails(emails, filter);
}
