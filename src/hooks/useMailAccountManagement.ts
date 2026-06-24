import { useEffect, useState } from 'react';
import {
  beginGoogleAccountLink,
  checkGmailConnection,
  disconnectMailAccount,
  setPrimaryMailAccount,
  syncMailAccount
} from '../api/mailbox';
import type { AuthSession, GmailConnectionStatus, MailAccountSummary } from '../types';

type MailAccountAction = 'sync' | 'primary' | 'disconnect';

type UseMailAccountManagementOptions = {
  authSession: AuthSession;
  mailAccounts: MailAccountSummary[];
  primaryMailAccountId: string | null;
  primaryMailAccountEmail: string | null;
};

export function useMailAccountManagement({
  authSession,
  mailAccounts,
  primaryMailAccountId,
  primaryMailAccountEmail
}: UseMailAccountManagementOptions) {
  const initialAccounts = mailAccounts.length > 0
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
  const [accounts, setAccounts] = useState(initialAccounts);
  const [workingAccountId, setWorkingAccountId] = useState<string | null>(null);
  const [accountMessage, setAccountMessage] = useState<string | null>(null);
  const [connectionStates, setConnectionStates] = useState<Record<string, GmailConnectionStatus>>({});

  useEffect(() => {
    setAccounts(initialAccounts);
  }, [mailAccounts, primaryMailAccountId, primaryMailAccountEmail]);

  async function runAccountAction(accountId: string, action: MailAccountAction) {
    setWorkingAccountId(accountId);
    setAccountMessage(null);
    try {
      if (action === 'sync') {
        await syncMailAccount(accountId);
        setAccountMessage('계정 동기화를 완료했습니다.');
      } else if (action === 'primary') {
        await setPrimaryMailAccount(accountId);
        setAccounts((current) => current.map((item) => ({ ...item, primary: item.id === accountId })));
        setAccountMessage('대표 메일 계정을 변경했습니다.');
      } else {
        await disconnectMailAccount(accountId);
        setAccounts((current) => current.map((item) => item.id === accountId
          ? { ...item, primary: false, syncEnabled: false, syncStatus: 'DISCONNECTED' }
          : item));
        setAccountMessage('메일 계정 연결을 해제했습니다.');
      }
    } catch (error) {
      setAccountMessage(error instanceof Error ? error.message : '계정 작업을 완료하지 못했습니다.');
    } finally {
      setWorkingAccountId(null);
    }
  }

  async function linkMailAccount() {
    setAccountMessage(null);
    try {
      const { authorizationUrl } = await beginGoogleAccountLink();
      window.location.href = `http://localhost:8080${authorizationUrl}`;
    } catch (error) {
      setAccountMessage(error instanceof Error ? error.message : '메일 계정 연결을 시작하지 못했습니다.');
    }
  }

  async function checkConnection(accountId: string) {
    setWorkingAccountId(accountId);
    setAccountMessage(null);
    try {
      const result = await checkGmailConnection(accountId);
      setConnectionStates((current) => ({ ...current, [accountId]: result }));
      setAccountMessage(result.message);
    } catch (error) {
      setAccountMessage(error instanceof Error ? error.message : '연결 상태를 확인하지 못했습니다.');
    } finally {
      setWorkingAccountId(null);
    }
  }

  return {
    accounts,
    accountMessage,
    connectionStates,
    workingAccountId,
    checkConnection,
    linkMailAccount,
    runAccountAction
  };
}
