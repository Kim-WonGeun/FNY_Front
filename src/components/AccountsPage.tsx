import type { AuthSession, LoadState, MailAccountSummary, MailSyncResult } from '../types';
import { useMailAccountManagement } from '../hooks/useMailAccountManagement';
import { formatDate } from '../utils/date';
import { providerLabel, syncStatusLabel } from '../utils/mailboxLabels';

export function AccountsPage({
  authSession,
  mailAccounts,
  primaryMailAccountId,
  primaryMailAccountEmail,
  syncState,
  lastSyncResult,
  onSync
}: {
  authSession: AuthSession;
  mailAccounts: MailAccountSummary[];
  primaryMailAccountId: string | null;
  primaryMailAccountEmail: string | null;
  syncState: LoadState;
  lastSyncResult: MailSyncResult | null;
  onSync: () => void;
}) {
  const {
    accounts,
    accountMessage,
    connectionStates,
    workingAccountId,
    checkConnection,
    linkMailAccount,
    runAccountAction
  } = useMailAccountManagement({
    authSession,
    mailAccounts,
    primaryMailAccountId,
    primaryMailAccountEmail
  });

  return (
    <div className="settings-page" aria-label="메일 계정">
      <section className="settings-card">
        <div className="settings-card-head">
          <div>
            <p className="eyebrow">메일 연동</p>
            <h3>연결된 계정</h3>
            <p>연동된 메일 계정과 권한, 동기화 상태를 확인합니다.</p>
          </div>
          <button
            type="button"
            className="settings-action-btn"
            onClick={onSync}
            disabled={syncState === 'loading'}
          >
            {syncState === 'loading' ? '동기화 중' : '동기화'}
          </button>
        </div>
        <p className="settings-sub-status">
          {syncState === 'loading'
            ? '최신 메일을 가져오는 중입니다.'
            : syncState === 'error'
              ? '동기화에 실패했습니다. 권한 또는 연결 상태를 확인해 주세요.'
              : lastSyncResult
                ? `마지막 동기화 ${formatDate(lastSyncResult.syncedAt)} · 추가 ${lastSyncResult.insertedCount}건 · 건너뜀 ${lastSyncResult.skippedCount}건`
                : '필요할 때 직접 최신 메일을 가져올 수 있습니다.'}
        </p>
        <div className="settings-row">
          <span>로그인 계정</span>
          <strong>{authSession.accountEmail}</strong>
        </div>
        <div className="settings-account-list" aria-label="메일 계정 목록">
          {accounts.length === 0 ? (
            <div className="settings-account-empty">
              <strong>연결된 메일 계정이 없습니다.</strong>
              <span>메일 계정을 추가하면 받은 메일, 분석 대상, 보고서 생성에 사용할 수 있습니다.</span>
            </div>
          ) : null}
          {accounts.map((account) => (
            <div className="settings-account-item" key={account.id}>
              <div>
                <strong>{account.accountEmail}</strong>
                <span>
                  {[providerLabel(account.provider), account.accountName].filter(Boolean).join(' · ')}
                </span>
              </div>
              <div className="settings-account-badges">
                {account.primary ? <span>대표</span> : null}
                <span>{account.syncEnabled ? syncStatusLabel(account.syncStatus) : '동기화 꺼짐'}</span>
                {account.lastSyncedAt ? <span>{formatDate(account.lastSyncedAt)}</span> : null}
                {connectionStates[account.id] ? <span>{connectionStates[account.id].message}</span> : null}
              </div>
              <div className="settings-account-actions">
                <button type="button" onClick={() => runAccountAction(account.id, 'sync')} disabled={!account.syncEnabled || workingAccountId === account.id}>동기화</button>
                <button type="button" onClick={() => checkConnection(account.id)} disabled={!account.syncEnabled || workingAccountId === account.id}>권한 확인</button>
                {connectionStates[account.id]?.requiresReauthorization ? (
                  <button type="button" className="is-primary" onClick={linkMailAccount}>다시 연결</button>
                ) : null}
                {!account.primary && account.syncEnabled ? <button type="button" onClick={() => runAccountAction(account.id, 'primary')} disabled={workingAccountId === account.id}>대표 지정</button> : null}
                {account.syncEnabled ? <button type="button" className="is-danger" onClick={() => runAccountAction(account.id, 'disconnect')} disabled={workingAccountId === account.id}>연결 해제</button> : null}
              </div>
            </div>
          ))}
        </div>
        {accountMessage ? <p className="settings-save-status">{accountMessage}</p> : null}
        <button type="button" className="settings-add-account" onClick={linkMailAccount}>메일 계정 추가</button>
      </section>
    </div>
  );
}
