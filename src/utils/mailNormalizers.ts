import type { EmailDetail, EmailListItem, MailboxOverview } from '../types';
import { normalizeAttentionStatus } from './mailAttention';

export function normalizeOverview(data: MailboxOverview): MailboxOverview {
  return {
    ...data,
    spotlightEmails: normalizeEmailList(data.spotlightEmails)
  };
}

export function normalizeEmailList(emails: EmailListItem[]): EmailListItem[] {
  return emails.map((email) => ({
    ...email,
    analysisEligible: email.analysisEligible ?? false,
    analysisCandidateScore: email.analysisCandidateScore ?? null,
    analysisCandidateReasons: email.analysisCandidateReasons ?? null,
    analysisSkippedReason: email.analysisSkippedReason ?? null,
    analysisCandidateEvaluatedAt: email.analysisCandidateEvaluatedAt ?? null,
    attentionResolved: email.attentionResolved ?? false,
    attentionResolvedAt: email.attentionResolvedAt ?? null,
    attentionStatus: normalizeAttentionStatus(email.attentionStatus),
    attentionStatusUpdatedAt: email.attentionStatusUpdatedAt ?? email.attentionResolvedAt ?? null,
    attentionReasons: email.attentionReasons ?? []
  }));
}

export function normalizeEmailDetail(data: EmailDetail): EmailDetail {
  return {
    ...data,
    analysis: data.analysis
      ? {
          ...data.analysis,
          priorityReasonCodes: data.analysis.priorityReasonCodes ?? []
        }
      : null,
    actionItems: data.actionItems ?? [],
    analysisEligible: data.analysisEligible ?? false,
    analysisCandidateScore: data.analysisCandidateScore ?? null,
    analysisCandidateReasons: data.analysisCandidateReasons ?? null,
    analysisSkippedReason: data.analysisSkippedReason ?? null,
    analysisCandidateEvaluatedAt: data.analysisCandidateEvaluatedAt ?? null,
    attentionResolved: data.attentionResolved ?? false,
    attentionResolvedAt: data.attentionResolvedAt ?? null,
    attentionStatus: normalizeAttentionStatus(data.attentionStatus),
    attentionStatusUpdatedAt: data.attentionStatusUpdatedAt ?? data.attentionResolvedAt ?? null,
    analysisJobs: data.analysisJobs ?? []
  };
}
