import { useCallback } from 'react';
import { fetchWeeklyWorkspace } from '../api/reports';
import type { WeeklyDraftViewMode, WeeklyWorkspaceStatus } from '../types';
import {
  readWeeklyWorkspaceSnapshot,
  workspaceStatusFromResponse,
  workspaceStatusFromSnapshot
} from '../utils/reports';

type UseWeeklyWorkspaceLoaderOptions = {
  userId: string;
  setEditableWeeklyDraft: (draft: string) => void;
  setExcludedWeeklySourceIds: (ids: string[]) => void;
  setWeeklyDraftDirty: (dirty: boolean) => void;
  setWeeklyWorkspaceStatus: (status: WeeklyWorkspaceStatus | null) => void;
  setWeeklyDraftViewMode: (mode: WeeklyDraftViewMode) => void;
};

export function useWeeklyWorkspaceLoader({
  userId,
  setEditableWeeklyDraft,
  setExcludedWeeklySourceIds,
  setWeeklyDraftDirty,
  setWeeklyWorkspaceStatus,
  setWeeklyDraftViewMode
}: UseWeeklyWorkspaceLoaderOptions) {
  const loadLocalFallback = useCallback((reportId: string) => {
    const snapshot = readWeeklyWorkspaceSnapshot(userId, reportId);
    if (!snapshot) {
      setWeeklyWorkspaceStatus(null);
      setWeeklyDraftViewMode('original');
      return;
    }

    setEditableWeeklyDraft(snapshot.draftText);
    setExcludedWeeklySourceIds(snapshot.excludedSourceIds);
    setWeeklyDraftDirty(true);
    setWeeklyWorkspaceStatus(workspaceStatusFromSnapshot(snapshot));
    setWeeklyDraftViewMode('workspace');
  }, [
    setEditableWeeklyDraft,
    setExcludedWeeklySourceIds,
    setWeeklyDraftDirty,
    setWeeklyDraftViewMode,
    setWeeklyWorkspaceStatus,
    userId
  ]);

  const loadWeeklyWorkspace = useCallback(async (reportId: string) => {
    try {
      const workspace = await fetchWeeklyWorkspace(reportId);
      if (!workspace) {
        loadLocalFallback(reportId);
        return;
      }

      setEditableWeeklyDraft(workspace.draftText);
      setExcludedWeeklySourceIds(workspace.excludedSourceIds ?? []);
      setWeeklyDraftDirty(true);
      setWeeklyWorkspaceStatus(workspaceStatusFromResponse(workspace));
      setWeeklyDraftViewMode('workspace');
    } catch {
      loadLocalFallback(reportId);
    }
  }, [
    loadLocalFallback,
    setEditableWeeklyDraft,
    setExcludedWeeklySourceIds,
    setWeeklyDraftDirty,
    setWeeklyDraftViewMode,
    setWeeklyWorkspaceStatus
  ]);

  return { loadWeeklyWorkspace };
}
