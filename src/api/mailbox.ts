import type {
  EmailAnalysis,
  EmailDetail,
  EmailListItem,
  MailAccountSummary,
  MailboxOverview
} from '../types';
import { readApiError, type ApiErrorParser } from './errors';

export type EmailSearchParams = {
  query: string;
  sender: string;
  startDate: string;
  endDate: string;
  searchBody: boolean;
};

export async function fetchMailboxOverview(parseApiError: ApiErrorParser) {
  const response = await fetch('/api/me/overview');

  if (!response.ok) {
    throw await parseApiError(response);
  }

  return (await response.json()) as MailboxOverview;
}

export async function fetchMailAccounts() {
  const response = await fetch('/api/me/mail-accounts');

  if (!response.ok) {
    throw new Error(await readApiError(response));
  }

  return (await response.json()) as MailAccountSummary[];
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
  const response = await fetch(queryString ? `/api/me/emails?${queryString}` : '/api/me/emails');

  if (!response.ok) {
    throw await parseApiError(response);
  }

  return (await response.json()) as EmailListItem[];
}

export async function fetchEmailDetail(emailId: string, signal: AbortSignal) {
  const response = await fetch(`/api/emails/${emailId}`, { signal });

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`);
  }

  return (await response.json()) as EmailDetail;
}

export async function fetchEmailAnalysisHistory(emailId: string) {
  const response = await fetch(`/api/emails/${emailId}/analyses`);

  if (!response.ok) {
    throw new Error(await readApiError(response));
  }

  return ((await response.json()) as EmailAnalysis[]).map((analysis) => ({
    ...analysis,
    priorityReasonCodes: analysis.priorityReasonCodes ?? []
  }));
}
