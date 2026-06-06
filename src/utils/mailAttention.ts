import type { AttentionStatus, EmailDetail, EmailListItem } from '../types';
import { formatDate } from './date';

export function normalizeAttentionStatus(status: string | null | undefined): AttentionStatus {
  if (status === 'REVIEWED' || status === 'COMPLETED' || status === 'DEFERRED') {
    return status;
  }
  return 'NEEDS_ATTENTION';
}

export function isOpenAttentionStatus(status: AttentionStatus | string | null | undefined) {
  return normalizeAttentionStatus(status) === 'NEEDS_ATTENTION';
}

export function attentionStatusLabel(status: AttentionStatus | string | null | undefined) {
  const labels: Record<AttentionStatus, string> = {
    NEEDS_ATTENTION: '확인 필요',
    REVIEWED: '확인 완료',
    COMPLETED: '처리 완료',
    DEFERRED: '보류'
  };
  return labels[normalizeAttentionStatus(status)];
}

export function attentionStatusDescription(detail: EmailDetail) {
  if (isOpenAttentionStatus(detail.attentionStatus)) {
    return '확인하거나 처리했다면 완료로 표시하세요. 완료된 메일은 홈 우선순위에서 빠집니다.';
  }
  const updatedAt = detail.attentionStatusUpdatedAt ? ` · ${formatDate(detail.attentionStatusUpdatedAt)}` : '';
  return `${attentionStatusLabel(detail.attentionStatus)} 상태입니다. 홈 우선순위에서 제외됨${updatedAt}`;
}

export function scoreEmail(email: EmailListItem) {
  const priorityScore = email.priorityLevel === 'P1' ? 500 : email.priorityLevel === 'P2' ? 350 : email.priorityLevel === 'P3' ? 150 : 0;
  const replyScore = email.needsReply ? 120 : 0;
  const unreadScore = email.read ? 0 : 80;
  const starredScore = email.starred ? 60 : 0;
  const urgencyScore = email.urgencyScore ?? 0;
  const importanceScore = email.importanceScore ?? 0;

  return priorityScore + replyScore + unreadScore + starredScore + urgencyScore + importanceScore;
}
