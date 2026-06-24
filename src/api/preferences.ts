import type { AnalysisPreference } from '../types';
import { apiFetch } from './client';
import { readApiError } from './errors';

export async function fetchAnalysisPreference() {
  const response = await apiFetch('/api/me/analysis-preferences');
  if (!response.ok) throw new Error(await readApiError(response));
  return (await response.json()) as AnalysisPreference;
}

export async function saveAnalysisPreference(preference: AnalysisPreference) {
  const response = await apiFetch('/api/me/analysis-preferences', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(preference)
  });
  if (!response.ok) throw new Error(await readApiError(response));
  return (await response.json()) as AnalysisPreference;
}
