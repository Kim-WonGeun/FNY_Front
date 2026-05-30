import type { AuthSession, LoadState, MailAccountSummary } from '../types';
import { formatDate } from '../utils/date';
import { providerLabel, syncStatusLabel } from '../utils/mailbox';

export function AccountsPage({
  authSession,
  mailAccounts,
  primaryMailAccountId,
  primaryMailAccountEmail,
  syncState,
  onSync
}: {
  authSession: AuthSession;
  mailAccounts: MailAccountSummary[];
  primaryMailAccountId: string | null;
  primaryMailAccountEmail: string | null;
  syncState: LoadState;
  onSync: () => void;
}) {
  const accounts = mailAccounts.length > 0
    ? mailAccounts
    : [{
        id: primaryMailAccountId ?? 'current-account',
        provider: authSession.provider,
        accountEmail: primaryMailAccountEmail ?? authSession.accountEmail,
        accountName: authSession.displayName,
        primary: true,
        syncEnabled: true,
        syncStatus: 'ACTIVE',
        lastSyncedAt: null
      } satisfies MailAccountSummary];

  return (
    <div className="settings-page" aria-label="메일 계정">
      <section className="settings-card">
        <div className="settings-card-head">
          <div>
            <p className="eyebrow">메일 연동</p>
            <h3>연결된 계정</h3>
            <p>연동된 메일 계정과 동기화 상태를 확인합니다.</p>
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
        <div className="settings-row">
          <span>현재 계정</span>
          <strong>{authSession.accountEmail}</strong>
        </div>
        <div className="settings-account-list" aria-label="메일 계정 목록">
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
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
