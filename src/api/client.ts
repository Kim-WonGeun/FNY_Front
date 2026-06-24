import { AUTH_STORAGE_KEY } from '../constants';
import type { AuthSession } from '../types';

export function apiFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  const userId = readStoredUserId();

  if (userId && !headers.has('X-FNY-USER-ID')) {
    headers.set('X-FNY-USER-ID', userId);
  }

  return fetch(input, {
    ...init,
    headers,
    credentials: init.credentials ?? 'same-origin'
  });
}

function readStoredUserId() {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const session = JSON.parse(raw) as Partial<AuthSession>;
    return session.userId?.trim() || null;
  } catch {
    return null;
  }
}
