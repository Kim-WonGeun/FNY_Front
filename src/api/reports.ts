import type {
  ReportType,
  WeeklyReport,
  WeeklyReportSummary,
  WeeklyWorkspaceResponse
} from '../types';
import { apiFetch } from './client';
import { readApiError, type ApiErrorParser } from './errors';

export type WeeklyReportCreateRequest = {
  reportType: ReportType;
  startDate: string;
  endDate: string;
};

export type WeeklyWorkspaceSaveRequest = {
  draftText: string;
  saveStatus: 'DRAFT' | 'SAVED';
  excludedSourceIds: string[];
};

export async function fetchWeeklyReports(mailAccountId: string, parseApiError: ApiErrorParser) {
  const response = await apiFetch(`/api/me/mail-accounts/${mailAccountId}/weekly-reports`);

  if (!response.ok) {
    throw await parseApiError(response);
  }

  return (await response.json()) as WeeklyReportSummary[];
}

export async function fetchWeeklyReport(reportId: string, parseApiError: ApiErrorParser) {
  const response = await apiFetch(`/api/me/weekly-reports/${reportId}`);

  if (!response.ok) {
    throw await parseApiError(response);
  }

  return (await response.json()) as WeeklyReport;
}

export async function createWeeklyReport(
  mailAccountId: string,
  request: WeeklyReportCreateRequest,
  parseApiError: ApiErrorParser
) {
  const params = new URLSearchParams({
    reportType: request.reportType,
    startDate: request.startDate,
    endDate: request.endDate
  });
  const response = await apiFetch(`/api/me/mail-accounts/${mailAccountId}/weekly-reports?${params.toString()}`, {
    method: 'POST'
  });

  if (!response.ok) {
    throw await parseApiError(response);
  }

  return (await response.json()) as WeeklyReport;
}

export async function fetchWeeklyWorkspace(reportId: string) {
  const response = await apiFetch(`/api/me/weekly-reports/${reportId}/workspace`);

  if (response.status === 204) {
    return null;
  }
  if (!response.ok) {
    throw new Error(await readApiError(response));
  }

  return (await response.json()) as WeeklyWorkspaceResponse;
}

export async function saveWeeklyReportWorkspace(reportId: string, request: WeeklyWorkspaceSaveRequest) {
  const response = await apiFetch(`/api/me/weekly-reports/${reportId}/workspace`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request)
  });

  if (!response.ok) {
    throw new Error(await readApiError(response));
  }

  return (await response.json()) as WeeklyWorkspaceResponse;
}

export async function archiveWeeklyReportWorkspace(reportId: string) {
  const response = await apiFetch(`/api/me/weekly-reports/${reportId}/workspace/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ saveStatus: 'ARCHIVED' })
  });

  if (!response.ok && response.status !== 204) {
    throw new Error(await readApiError(response));
  }
}
