import type { LoadState } from '../types';

export function MailboxLoadStatus({
  state,
  totalEmails,
  errorMessage
}: {
  state: LoadState;
  totalEmails: number;
  errorMessage: string | null;
}) {
  return (
    <div className="status-line" role="status">
      {state === 'loading' && '메일함을 불러오는 중입니다.'}
      {state === 'ready' && `${totalEmails}건을 불러왔습니다.`}
      {state === 'fallback' && `서버 연결 전이라 샘플 데이터로 보고 있습니다. ${errorMessage ?? ''}`}
      {state === 'error' && '메일함을 불러오지 못했습니다.'}
    </div>
  );
}
