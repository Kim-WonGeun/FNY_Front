import type { EmailDetail, EmailListItem } from '../types';
import { useState } from 'react';
import { patchMailboxState } from '../api/mailbox';
import { formatDate } from '../utils/date';

type MailDetailHeaderProps = {
  analysisHint: string | null;
  detail: EmailDetail | null;
  detailChips: string[];
  displayEmail: EmailListItem;
  nextEmail: EmailListItem | null;
  previousEmail: EmailListItem | null;
  receivedAt: string;
  onBack: () => void;
  onOpenEmail: (emailId: string) => void;
};

export function MailDetailHeader({
  analysisHint,
  detail,
  detailChips,
  displayEmail,
  nextEmail,
  previousEmail,
  receivedAt,
  onBack,
  onOpenEmail
}: MailDetailHeaderProps) {
  const [mailState, setMailState] = useState({
    read: displayEmail.read,
    starred: displayEmail.starred,
    archived: false
  });
  const [stateUpdating, setStateUpdating] = useState(false);
  const [stateMessage, setStateMessage] = useState<string | null>(null);

  const updateState = async (state: { read?: boolean; starred?: boolean; archived?: boolean }) => {
    setStateUpdating(true);
    setStateMessage(null);
    try {
      const updated = await patchMailboxState(displayEmail.id, state);
      setMailState({ read: updated.read, starred: updated.starred, archived: updated.archived });
      setStateMessage('메일 상태를 변경했습니다.');
    } catch (error) {
      setStateMessage(error instanceof Error ? error.message : '메일 상태를 변경하지 못했습니다.');
    } finally {
      setStateUpdating(false);
    }
  };

  return (
    <>
      <div className="mail-detail-toolbar">
        <button type="button" className="mail-detail-back" onClick={onBack}>
          메일 목록으로
        </button>
        <div className="mail-detail-toolbar-actions">
          <button type="button" className="mail-detail-nav-btn" disabled={stateUpdating} onClick={() => updateState({ read: !mailState.read })}>
            {mailState.read ? '읽지 않음' : '읽음'}
          </button>
          <button type="button" className="mail-detail-nav-btn" disabled={stateUpdating} onClick={() => updateState({ starred: !mailState.starred })}>
            {mailState.starred ? '별표 해제' : '별표'}
          </button>
          <button type="button" className="mail-detail-nav-btn" disabled={stateUpdating || mailState.archived} onClick={() => updateState({ archived: true })}>
            {mailState.archived ? '보관됨' : '보관'}
          </button>
          <button
            type="button"
            className="mail-detail-nav-btn"
            onClick={() => previousEmail && onOpenEmail(previousEmail.id)}
            disabled={!previousEmail}
            title={previousEmail?.subject ?? '이전 메일이 없습니다'}
          >
            이전
          </button>
          <button
            type="button"
            className="mail-detail-nav-btn"
            onClick={() => nextEmail && onOpenEmail(nextEmail.id)}
            disabled={!nextEmail}
            title={nextEmail?.subject ?? '다음 메일이 없습니다'}
          >
            다음
          </button>
          {receivedAt ? <time dateTime={receivedAt}>{formatDate(receivedAt)}</time> : null}
        </div>
      </div>
      {stateMessage ? <p className="mail-detail-state-message" role="status">{stateMessage}</p> : null}

      <div className="mail-detail-head">
        <div>
          <p className="eyebrow">메일 상세</p>
          <h2>{displayEmail.subject || detail?.subject || '(제목 없음)'}</h2>
          <p className="mail-detail-sender">
            {displayEmail.fromName ?? detail?.fromName ?? displayEmail.fromEmail ?? detail?.fromEmail ?? '발신자 정보 없음'}
            {(displayEmail.fromEmail ?? detail?.fromEmail) ? (
              <span>{displayEmail.fromEmail ?? detail?.fromEmail}</span>
            ) : null}
          </p>
          {analysisHint ? <p className="mail-detail-hint">{analysisHint}</p> : null}
          {detailChips.length > 0 ? (
            <div className="mail-detail-chip-row" aria-label="메일 상태">
              {detailChips.map((chip) => (
                <span key={chip}>{chip}</span>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}
