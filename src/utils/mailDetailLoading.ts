import { sampleDetails } from '../data/sampleMailbox';
import type { EmailDetail, EmailListItem } from '../types';
import { createDetailFromListItem } from './mailContent';

export function detailLoadErrorMessage(error: unknown) {
  if (error instanceof DOMException && error.name === 'AbortError') {
    return '메일 상세 요청 시간이 초과되었습니다.';
  }
  if (error instanceof Error) {
    if (error.message.includes('404')) {
      return '메일을 찾을 수 없습니다. 동기화 상태를 확인한 뒤 다시 시도해 주세요.';
    }
    if (error.message.includes('500')) {
      return '메일 상세를 불러오지 못했습니다. 서버 상태를 확인한 뒤 다시 시도해 주세요.';
    }
    return error.message;
  }
  return 'Unknown error';
}

export function findDetailFallback(
  emailId: string,
  sortedEmails: EmailListItem[],
  allEmails: EmailListItem[]
): EmailDetail | null {
  const localFallback =
    createDetailFromListItem(
      sortedEmails.find((email) => email.id === emailId) ??
        allEmails.find((email) => email.id === emailId)
    ) ?? sampleDetails[emailId];

  return localFallback && localFallback.id === emailId ? localFallback : null;
}
