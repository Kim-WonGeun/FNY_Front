import type { EmailDetail, EmailListItem } from '../types';
import { attentionStatusLabel } from './mailAttention';
import { priorityLabel } from './mailboxLabels';

export function buildDetailChips(email: EmailListItem, detail: EmailDetail | null) {
  const chips = [
    email.read ? '읽음' : '읽지 않음',
    attentionStatusLabel(email.attentionStatus),
    priorityLabel(email.priorityLevel ?? 'WAITING'),
    email.analysisEligible ? '분석 대상' : '분석 제외'
  ];

  if (email.hasAttachment || detail?.hasAttachment) {
    chips.push('첨부 있음');
  }
  if (detail?.provider) {
    chips.push(detail.provider);
  }

  return chips;
}

export function toEmailListItem(detail: EmailDetail): EmailListItem {
  return {
    id: detail.id,
    subject: detail.subject,
    snippet: detail.snippet,
    fromName: detail.fromName,
    fromEmail: detail.fromEmail,
    receivedAt: detail.receivedAt,
    read: detail.read,
    starred: detail.starred,
    hasAttachment: detail.hasAttachment,
    category: detail.analysis?.category ?? null,
    priorityLevel: detail.analysis?.priorityLevel ?? null,
    importanceScore: detail.analysis?.importanceScore ?? null,
    urgencyScore: detail.analysis?.urgencyScore ?? null,
    shortSummary: detail.analysis?.shortSummary ?? null,
    needsReply: detail.analysis?.needsReply ?? null,
    analysisEligible: detail.analysisEligible,
    analysisCandidateScore: detail.analysisCandidateScore,
    analysisCandidateReasons: detail.analysisCandidateReasons,
    analysisSkippedReason: detail.analysisSkippedReason,
    analysisCandidateEvaluatedAt: detail.analysisCandidateEvaluatedAt,
    attentionResolved: detail.attentionResolved,
    attentionResolvedAt: detail.attentionResolvedAt,
    attentionStatus: detail.attentionStatus,
    attentionStatusUpdatedAt: detail.attentionStatusUpdatedAt,
    attentionReasons: []
  };
}
