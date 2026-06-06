import type { AttentionStatus, EmailDetail, EmailListItem } from '../types';
import { isOpenAttentionStatus } from './mailAttention';

export function resolveAttentionUpdate(status: AttentionStatus, updatedAt?: string | null) {
  const resolved = !isOpenAttentionStatus(status);
  return {
    resolved,
    updatedAt: resolved ? updatedAt ?? new Date().toISOString() : null
  };
}

export function updateEmailAttentionStatus(
  email: EmailListItem,
  emailId: string,
  status: AttentionStatus,
  updatedAt?: string | null
) {
  if (email.id !== emailId) {
    return email;
  }
  const next = resolveAttentionUpdate(status, updatedAt);
  return {
    ...email,
    attentionResolved: next.resolved,
    attentionResolvedAt: next.updatedAt,
    attentionStatus: status,
    attentionStatusUpdatedAt: next.updatedAt
  };
}

export function updateDetailAttentionStatus(
  detail: EmailDetail | null,
  emailId: string,
  status: AttentionStatus,
  updatedAt?: string | null
) {
  if (detail?.id !== emailId) {
    return detail;
  }
  const next = resolveAttentionUpdate(status, updatedAt);
  return {
    ...detail,
    attentionResolved: next.resolved,
    attentionResolvedAt: next.updatedAt,
    attentionStatus: status,
    attentionStatusUpdatedAt: next.updatedAt
  };
}
