import type {
  EmailAnalysis,
  EmailDetail,
  EmailListItem,
  MailAccountSummary,
  MailboxOverview,
  MailboxState,
  GmailConnectionStatus
} from '../types';
import { apiFetch } from './client';
import { readApiError, type ApiErrorParser } from './errors';

export type EmailSearchParams = {
  query: string;
  sender: string;
  startDate: string;
  endDate: string;
  searchBody: boolean;
};

export async function fetchMailboxOverview(parseApiError: ApiErrorParser) {
  const response = await apiFetch('/api/me/overview');

  if (!response.ok) {
    throw await parseApiError(response);
  }

  return (await response.json()) as MailboxOverview;
}

export async function fetchMailAccounts() {
  const response = await apiFetch('/api/me/mail-accounts');

  if (!response.ok) {
    throw new Error(await readApiError(response));
  }

  return (await response.json()) as MailAccountSummary[];
}

export async function setPrimaryMailAccount(mailAccountId: string) {
  const response = await apiFetch(`/api/me/mail-accounts/${mailAccountId}/primary`, { method: 'PATCH' });
  if (!response.ok) throw new Error(await readApiError(response));
  return (await response.json()) as MailAccountSummary;
}

export async function disconnectMailAccount(mailAccountId: string) {
  const response = await apiFetch(`/api/me/mail-accounts/${mailAccountId}`, { method: 'DELETE' });
  if (!response.ok) throw new Error(await readApiError(response));
  return (await response.json()) as MailAccountSummary;
}

export async function syncMailAccount(mailAccountId: string) {
  const response = await apiFetch(`/api/me/mail-accounts/${mailAccountId}/sync?limit=100`, { method: 'POST' });
  if (!response.ok) throw new Error(await readApiError(response));
  return response.json();
}

export async function beginGoogleAccountLink() {
  const response = await apiFetch('/api/me/mail-accounts/link/google', { method: 'POST' });
  if (!response.ok) throw new Error(await readApiError(response));
  return (await response.json()) as { authorizationUrl: string };
}

export async function checkGmailConnection(mailAccountId: string) {
  const response = await apiFetch(`/api/me/mail-accounts/${mailAccountId}/connection-status`);
  if (!response.ok) throw new Error(await readApiError(response));
  return (await response.json()) as GmailConnectionStatus;
}

export async function patchMailboxState(
  emailId: string,
  state: { read?: boolean; starred?: boolean; archived?: boolean }
) {
  const response = await apiFetch(`/api/emails/${emailId}/mailbox-state`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(state)
  });
  if (!response.ok) throw new Error(await readApiError(response));
  return (await response.json()) as MailboxState;
}

export async function fetchAllEmails(search: EmailSearchParams, parseApiError: ApiErrorParser) {
  const params = new URLSearchParams();

  if (search.searchBody) {
    if (search.query.trim()) {
      params.set('query', search.query.trim());
    }
    if (search.sender.trim()) {
      params.set('sender', search.sender.trim());
    }
    if (search.startDate) {
      params.set('startDate', search.startDate);
    }
    if (search.endDate) {
      params.set('endDate', search.endDate);
    }
    params.set('searchBody', 'true');
  }

  const queryString = params.toString();
  const response = await apiFetch(queryString ? `/api/me/emails?${queryString}` : '/api/me/emails');

  if (!response.ok) {
    throw await parseApiError(response);
  }

  return (await response.json()) as EmailListItem[];
}

export async function fetchEmailDetail(emailId: string, signal: AbortSignal) {
  const response = await apiFetch(`/api/emails/${emailId}`, { signal });

  if (!response.ok) {
    throw new Error(await readApiError(response));
  }

  return (await response.json()) as EmailDetail;
}

export async function fetchEmailAnalysisHistory(emailId: string) {
  const response = await apiFetch(`/api/emails/${emailId}/analyses`);

  if (!response.ok) {
    throw new Error(await readApiError(response));
  }

  return ((await response.json()) as EmailAnalysis[]).map((analysis) => ({
    ...analysis,
    priorityReasonCodes: analysis.priorityReasonCodes ?? []
  }));
}
