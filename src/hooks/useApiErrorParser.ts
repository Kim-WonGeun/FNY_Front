import { useCallback } from 'react';
import type { ApiErrorPayload, AuthSession } from '../types';

export function useApiErrorParser(
  authSession: AuthSession | null,
  resetAuthSession: (message?: string) => void
) {
  return useCallback(async (response: Response, fallbackMessage?: string) => {
    let payload: ApiErrorPayload | null = null;
    try {
      payload = (await response.json()) as ApiErrorPayload;
    } catch {
      payload = null;
    }

    const message = payload?.message?.trim() || fallbackMessage || `API returned ${response.status}`;
    if (authSession && (response.status === 401 || response.status === 403)) {
      resetAuthSession('로그인 세션이 만료되었습니다. Gmail로 다시 로그인해 주세요.');
    }
    if (
      authSession &&
      response.status === 404 &&
      payload?.code === 'MAILBOX_RESOURCE_NOT_FOUND' &&
      message.includes('사용자를 찾을 수 없습니다')
    ) {
      resetAuthSession('서버가 다시 시작되어 로그인 세션이 초기화되었습니다. Gmail로 다시 로그인해 주세요.');
    }

    return new Error(message);
  }, [authSession, resetAuthSession]);
}
