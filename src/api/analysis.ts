import type {
  AgentHealth,
  AnalysisFeedbackType,
  AnalysisJobCreateResult,
  AttentionStatus,
  EmailDetail,
  MailSyncResult
} from '../types';
import { readApiError } from './errors';

export async function fetchAgentHealth() {
  const response = await fetch('/api/agent/health');

  if (!response.ok) {
    throw new Error(await readApiError(response));
  }

  return (await response.json()) as AgentHealth;
}

export async function createEmailAnalysisJob(emailId: string) {
  const response = await fetch(`/api/emails/${emailId}/analysis-jobs`, { method: 'POST' });

  if (!response.ok) {
    throw new Error(await readApiError(response));
  }

  return (await response.json()) as AnalysisJobCreateResult;
}

export async function saveEmailAnalysisFeedback(
  analysisId: string,
  userId: string,
  feedbackType: AnalysisFeedbackType
) {
  const accepted = feedbackType === 'ACCEPTED';
  const response = await fetch(`/api/email-analyses/${analysisId}/feedbacks/${userId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      feedbackType,
      reasonCode: accepted ? 'GOOD_ANALYSIS' : 'NEEDS_REVIEW',
      memo: accepted ? '분석 결과가 적절합니다.' : '분석 결과 검토가 필요합니다.'
    })
  });

  if (!response.ok) {
    throw new Error(await readApiError(response));
  }
}

export async function patchAttentionStatus(emailId: string, status: AttentionStatus) {
  const response = await fetch(`/api/emails/${emailId}/attention-status?status=${status}`, {
    method: 'PATCH'
  });

  if (!response.ok) {
    throw new Error(await readApiError(response));
  }

  return (await response.json()) as EmailDetail;
}

export async function syncMailAccount(mailAccountId: string) {
  const response = await fetch(`/api/me/mail-accounts/${mailAccountId}/sync?limit=0`, {
    method: 'POST'
  });

  if (!response.ok) {
    throw new Error(await readApiError(response));
  }

  return (await response.json()) as MailSyncResult;
}
