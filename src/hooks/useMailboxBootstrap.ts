import { useEffect } from 'react';
import type { AuthSession } from '../types';

type UseMailboxBootstrapOptions = {
  authSession: AuthSession | null;
  loadAgentHealth: () => Promise<void>;
  loadOverview: (targetUserId: string) => Promise<void>;
  userId: string;
};

export function useMailboxBootstrap({
  authSession,
  loadAgentHealth,
  loadOverview,
  userId
}: UseMailboxBootstrapOptions) {
  useEffect(() => {
    if (!authSession) {
      return;
    }
    void loadOverview(userId);
    void loadAgentHealth();
  }, [authSession, userId]);
}
