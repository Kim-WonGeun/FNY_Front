import type { OperationSummary } from '../types';
import { apiFetch } from './client';
import { readApiError } from './errors';

export async function fetchOperationSummary() {
  const response = await apiFetch('/api/me/operations');
  if (!response.ok) throw new Error(await readApiError(response));
  return (await response.json()) as OperationSummary;
}
