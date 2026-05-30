import {
  AUTH_STORAGE_KEY,
  AUTO_SYNC_STORAGE_KEY_PREFIX,
  MAIL_DENSITY_STORAGE_KEY,
  ORIGINAL_MAIL_OPEN_STORAGE_KEY,
  SIDEBAR_PINNED_STORAGE_KEY,
  THEME_STORAGE_KEY
} from '../constants';
import type { AuthSession, MailDensity } from '../types';

export function readStoredTheme(): 'light' | 'dark' {
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  return stored === 'dark' ? 'dark' : 'light';
}

export function readStoredMailDensity(): MailDensity {
  const stored = localStorage.getItem(MAIL_DENSITY_STORAGE_KEY);
  return stored === 'compact' ? 'compact' : 'comfortable';
}

export function readStoredOriginalMailOpen() {
  return localStorage.getItem(ORIGINAL_MAIL_OPEN_STORAGE_KEY) !== 'false';
}

export function readStoredSidebarPinned() {
  return localStorage.getItem(SIDEBAR_PINNED_STORAGE_KEY) !== 'false';
}

export function readStoredAuthSession(): AuthSession | null {
  try {
    const callbackSession = readAuthSessionFromCallback();
    if (callbackSession) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(callbackSession));
      window.history.replaceState({}, document.title, '/');
      return callbackSession;
    }

    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as Partial<AuthSession>;
    if (!parsed.userId || !parsed.mailAccountId || !parsed.accountEmail) {
      return null;
    }
    return {
      userId: parsed.userId,
      displayName: parsed.displayName ?? null,
      primaryEmail: parsed.primaryEmail ?? parsed.accountEmail,
      mailAccountId: parsed.mailAccountId,
      provider: parsed.provider ?? 'GOOGLE',
      accountEmail: parsed.accountEmail
    };
  } catch {
    return null;
  }
}

function readAuthSessionFromCallback(): AuthSession | null {
  if (window.location.pathname !== '/auth/callback') {
    return null;
  }

  const params = new URLSearchParams(window.location.search);
  const userId = params.get('userId');
  const mailAccountId = params.get('mailAccountId');
  const accountEmail = params.get('accountEmail');

  if (!userId || !mailAccountId || !accountEmail) {
    return null;
  }

  return {
    userId,
    displayName: params.get('displayName'),
    primaryEmail: params.get('primaryEmail') ?? accountEmail,
    mailAccountId,
    provider: params.get('provider') ?? 'GOOGLE',
    accountEmail
  };
}

export function autoSyncMarkerKey(mailAccountId: string) {
  return `${AUTO_SYNC_STORAGE_KEY_PREFIX}.${mailAccountId}`;
}
