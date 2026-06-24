import { useEffect } from 'react';
import type {
  AuthSession,
  ReportType,
  WeeklyDraftViewMode,
  WeeklyLoadState,
  WeeklyReport,
  WeeklyWorkspaceStatus
} from '../types';

type UseWeeklyReportLifecycleOptions = {
  authSession: AuthSession | null;
  userId: string;
  weeklyReport: WeeklyReport | null;
  selectedReportType: ReportType;
  resetWeeklyHistory: () => void;
  setWeeklyReport: (report: WeeklyReport | null) => void;
  setWeeklySourcesOpen: (open: boolean) => void;
  setWeeklyLoadState: (state: WeeklyLoadState) => void;
  setWeeklyError: (error: string | null) => void;
  setWeeklySaveState: (state: 'idle') => void;
  setWeeklyDraftDirty: (dirty: boolean) => void;
  setExcludedWeeklySourceIds: (ids: string[]) => void;
  setWeeklyWorkspaceStatus: (status: WeeklyWorkspaceStatus | null) => void;
  setWeeklyDraftViewMode: (mode: WeeklyDraftViewMode) => void;
};

export function useWeeklyReportLifecycle({
  authSession,
  userId,
  weeklyReport,
  selectedReportType,
  resetWeeklyHistory,
  setWeeklyReport,
  setWeeklySourcesOpen,
  setWeeklyLoadState,
  setWeeklyError,
  setWeeklySaveState,
  setWeeklyDraftDirty,
  setExcludedWeeklySourceIds,
  setWeeklyWorkspaceStatus,
  setWeeklyDraftViewMode
}: UseWeeklyReportLifecycleOptions) {
  useEffect(() => {
    if (!authSession) return;

    setWeeklyReport(null);
    setWeeklySourcesOpen(false);
    setWeeklyLoadState('idle');
    setWeeklyError(null);
    resetWeeklyHistory();
  }, [authSession, userId]);

  useEffect(() => {
    setWeeklySaveState('idle');
  }, [weeklyReport]);

  useEffect(() => {
    setWeeklyDraftDirty(false);
    setExcludedWeeklySourceIds([]);
    setWeeklyWorkspaceStatus(null);
    setWeeklyDraftViewMode('original');
    setWeeklySourcesOpen(false);
  }, [weeklyReport, selectedReportType]);
}
