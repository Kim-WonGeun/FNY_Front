export type ApiErrorParser = (response: Response, fallbackMessage?: string) => Promise<Error>;

export async function readApiError(response: Response) {
  try {
    const data = (await response.json()) as { code?: string; message?: string };
    const friendlyMessage = gmailErrorMessage(data.code, data.message);
    if (friendlyMessage) {
      return friendlyMessage;
    }
    return data.message || `API returned ${response.status}`;
  } catch {
    return `API returned ${response.status}`;
  }
}

export function gmailErrorMessage(code?: string, message?: string) {
  const messages: Record<string, string> = {
    GMAIL_SCOPE_INSUFFICIENT: 'Gmail 읽기 권한이 부족합니다. 로그아웃 후 Google 계정 권한을 다시 승인해 주세요.',
    GMAIL_TOKEN_INVALID: 'Google 로그인 토큰이 만료되었습니다. 다시 로그인해 주세요.',
    GMAIL_RATE_LIMITED: 'Gmail 요청 한도에 도달했습니다. 잠시 후 다시 동기화해 주세요.',
    GMAIL_SERVICE_DISABLED: 'Google Cloud 프로젝트에서 Gmail API가 꺼져 있습니다. Gmail API를 사용 설정한 뒤 다시 시도해 주세요.',
    GMAIL_TEMPORARY_FAILURE: 'Gmail API가 일시적으로 불안정합니다. 잠시 후 다시 시도해 주세요.',
    GMAIL_API_FAILED: 'Gmail API 요청에 실패했습니다. 잠시 후 다시 시도해 주세요.'
  };
  return code ? messages[code] ?? message : null;
}
