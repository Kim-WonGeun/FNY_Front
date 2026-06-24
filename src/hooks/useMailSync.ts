import { useCallback, useEffect, useRef, useState } from 'react';
import { syncMailAccount } from '../api/analysis';
import { todayKey } from '../utils/date';
import { autoSyncMarkerKey } from '../utils/storage';
import type { AuthSession, LoadState, MailSyncResult, NavView } from '../types';

type UseMailSyncOptions = {
  authSession: AuthSession | null;
  loadAllEmails: (targetUserId: string, options?: { resetExpanded?: boolean }) => Promise<void>;
  loadOverview: (targetUserId: string) => Promise<void>;
  navView: NavView;
  primaryMailAccountId: string | null;
  userId: string;
};

export function useMailSync({
  authSession,
  loadAllEmails,
  loadOverview,
  navView,
  primaryMailAccountId,
  userId
}: UseMailSyncOptions) {
  const syncRequestInFlight = useRef(false);
  const [syncState, setSyncState] = useState<LoadState>('idle');
  const [lastSyncResult, setLastSyncResult] = useState<MailSyncResult | null>(null);
  const [autoSyncDone, setAutoSyncDone] = useState(false);

  const syncGmail = useCallback(async (options?: { silent?: boolean }) => {
    if (!primaryMailAccountId) {
      setSyncState('error');
      return;
    }
    if (syncRequestInFlight.current) {
      return;
    }
    syncRequestInFlight.current = true;

    if (!options?.silent) {
      setSyncState('loading');
    }
    try {
      const result = await syncMailAccount(primaryMailAccountId);
      setLastSyncResult(result);
      if (options?.silent && primaryMailAccountId) {
        localStorage.setItem(autoSyncMarkerKey(primaryMailAccountId), todayKey());
      }
      if (!options?.silent) {
        setSyncState('ready');
      }
      await loadOverview(userId);
      if (navView === 'allMail') {
        await loadAllEmails(userId);
      }
    } catch {
      if (!options?.silent) {
        setSyncState('error');
      }
    } finally {
      syncRequestInFlight.current = false;
    }
  }, [loadAllEmails, loadOverview, navView, primaryMailAccountId, userId]);

  useEffect(() => {
    if (!authSession || autoSyncDone || !primaryMailAccountId) {
      return;
    }
    const markerKey = autoSyncMarkerKey(primaryMailAccountId);
    if (localStorage.getItem(markerKey) === todayKey()) {
      setAutoSyncDone(true);
      return;
    }
    setAutoSyncDone(true);
    void syncGmail({ silent: true });
  }, [authSession, autoSyncDone, primaryMailAccountId, syncGmail]);

  return {
    resetAutoSync: useCallback(() => setAutoSyncDone(false), []),
    lastSyncResult,
    setSyncState,
    syncGmail,
    syncState
  };
}
