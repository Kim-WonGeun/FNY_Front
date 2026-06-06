import {
  DEFAULT_PRIMARY_MAIL_ACCOUNT_ID,
  DEFAULT_USER_ID
} from '../constants';
import type { MailAccountSummary } from '../types';

export function getPrimaryMailAccount(accounts: MailAccountSummary[]) {
  return accounts.find((account) => account.primary) ?? accounts[0] ?? null;
}

export function getFallbackMailAccount(targetUserId: string) {
  return {
    id: targetUserId === DEFAULT_USER_ID ? DEFAULT_PRIMARY_MAIL_ACCOUNT_ID : null,
    email: targetUserId === DEFAULT_USER_ID ? 'user1@test.com' : null
  };
}
