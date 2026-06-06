import { useCallback } from 'react';
import {
  archiveWeeklyReportWorkspace,
  fetchWeeklyWorkspace,
  saveWeeklyReportWorkspace
} from '../api/reports';
import type {
  ReportType,
  WeeklyDraftViewMode,
  WeeklyReport,
  WeeklyReportSummary,
  WeeklyWorkspaceSaveMode,
  WeeklyWorkspaceStatus
} from '../types';
import {
  buildWeeklyReportDraft,
  createWeeklyWorkspaceSnapshot,
  readWeeklyWorkspaceSnapshot,
  weeklySaveStateFromMode,
  weeklyWorkspaceStorageKey,
  workspaceSaveStatusFromMode,
  workspaceStatusFromResponse,
  workspaceStatusFromSnapshot
} from '../utils/reports';

type WeeklySaveState = 'idle' | 'draft-saved' | 'saved' | 'error';

type UseWeeklyWorkspaceOptions = {
  userId: string;
  weeklyReport: WeeklyReport | null;
  selectedReportType: ReportType;
  editableWeeklyDraft: string;
  excludedWeeklySourceIds: string[];
  setEditableWeeklyDraft: (draft: string) => void;
  setExcludedWeeklySourceIds: (ids: string[]) => void;
  setWeeklyDraftDirty: (dirty: boolean) => void;
  setWeeklyWorkspaceStatus: (status: WeeklyWorkspaceStatus | null) => void;
  setWeeklyDraftViewMode: (mode: WeeklyDraftViewMode) => void;
  setWeeklySaveState: (state: WeeklySaveState) => void;
  setWeeklyHistoryActionId: (reportId: string | null) => void;
  updateHistoryWorkspaceStatus: (
    reportId: string,
    workspaceStatus: WeeklyReportSummary['workspaceStatus']
  ) => void;
};

export function useWeeklyWorkspace({
  userId,
  weeklyReport,
  selectedReportType,
  editableWeeklyDraft,
  excludedWeeklySourceIds,
  setEditableWeeklyDraft,
  setExcludedWeeklySourceIds,
  setWeeklyDraftDirty,
  setWeeklyWorkspaceStatus,
  setWeeklyDraftViewMode,
  setWeeklySaveState,
  setWeeklyHistoryActionId,
  updateHistoryWorkspaceStatus
}: UseWeeklyWorkspaceOptions) {
  const loadLocalWeeklyWorkspaceFallback = useCallback(
    (reportId: string) => {
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
    },
    [
      setEditableWeeklyDraft,
      setExcludedWeeklySourceIds,
      setWeeklyDraftDirty,
      setWeeklyDraftViewMode,
      setWeeklyWorkspaceStatus,
      userId
    ]
  );

  const loadWeeklyWorkspace = useCallback(
    async (reportId: string) => {
      try {
        const workspace = await fetchWeeklyWorkspace(reportId);
        if (!workspace) {
          loadLocalWeeklyWorkspaceFallback(reportId);
          return;
        }
        setEditableWeeklyDraft(workspace.draftText);
        setExcludedWeeklySourceIds(workspace.excludedSourceIds ?? []);
        setWeeklyDraftDirty(true);
        setWeeklyWorkspaceStatus(workspaceStatusFromResponse(workspace));
        setWeeklyDraftViewMode('workspace');
      } catch {
        loadLocalWeeklyWorkspaceFallback(reportId);
      }
    },
    [
      loadLocalWeeklyWorkspaceFallback,
      setEditableWeeklyDraft,
      setExcludedWeeklySourceIds,
      setWeeklyDraftDirty,
      setWeeklyDraftViewMode,
      setWeeklyWorkspaceStatus
    ]
  );

  async function saveWeeklyWorkspace(mode: WeeklyWorkspaceSaveMode) {
    if (!weeklyReport) {
      return;
    }
    setWeeklySaveState('idle');
    try {
      const workspace = await saveWeeklyReportWorkspace(weeklyReport.reportId, {
        draftText: editableWeeklyDraft,
        saveStatus: workspaceSaveStatusFromMode(mode),
        excludedSourceIds: excludedWeeklySourceIds
      });
      setWeeklyWorkspaceStatus(workspaceStatusFromResponse(workspace));
      setWeeklySaveState(weeklySaveStateFromMode(mode));
      setWeeklyDraftViewMode('workspace');
      updateHistoryWorkspaceStatus(weeklyReport.reportId, workspace.saveStatus);
      localStorage.removeItem(weeklyWorkspaceStorageKey(userId, weeklyReport.reportId));
    } catch {
      try {
        const snapshot = createWeeklyWorkspaceSnapshot(
          weeklyReport,
          selectedReportType,
          editableWeeklyDraft,
          excludedWeeklySourceIds,
          mode
        );
        localStorage.setItem(weeklyWorkspaceStorageKey(userId, weeklyReport.reportId), JSON.stringify(snapshot));
        setWeeklyWorkspaceStatus(workspaceStatusFromSnapshot(snapshot));
        setWeeklyDraftViewMode('workspace');
      } finally {
        setWeeklySaveState('error');
      }
    }
  }

  function showOriginalWeeklyDraft() {
    if (!weeklyReport) {
      return;
    }
    setExcludedWeeklySourceIds([]);
    setEditableWeeklyDraft(buildWeeklyReportDraft(weeklyReport, selectedReportType, weeklyReport.threadSummaries));
    setWeeklyDraftDirty(false);
    setWeeklyDraftViewMode('original');
    setWeeklySaveState('idle');
  }

  function showSavedWeeklyDraft() {
    if (!weeklyReport) {
      return;
    }
    void loadWeeklyWorkspace(weeklyReport.reportId);
    setWeeklySaveState('idle');
  }

  async function resetWeeklyWorkspace() {
    if (!weeklyReport) {
      return;
    }
    await clearWeeklyWorkspace(weeklyReport.reportId);
  }

  async function clearWeeklyWorkspace(reportId: string) {
    setWeeklyHistoryActionId(reportId);
    setWeeklySaveState('idle');
    try {
      await archiveWeeklyReportWorkspace(reportId);
      localStorage.removeItem(weeklyWorkspaceStorageKey(userId, reportId));
      updateHistoryWorkspaceStatus(reportId, 'NONE');
      if (weeklyReport?.reportId === reportId) {
        setExcludedWeeklySourceIds([]);
        setEditableWeeklyDraft(buildWeeklyReportDraft(weeklyReport, selectedReportType, weeklyReport.threadSummaries));
        setWeeklyDraftDirty(false);
        setWeeklyWorkspaceStatus(null);
        setWeeklyDraftViewMode('original');
      }
      setWeeklySaveState('draft-saved');
    } catch {
      setWeeklySaveState('error');
    } finally {
      setWeeklyHistoryActionId(null);
    }
  }

  return {
    loadWeeklyWorkspace,
    saveWeeklyWorkspace,
    showOriginalWeeklyDraft,
    showSavedWeeklyDraft,
    resetWeeklyWorkspace,
    clearWeeklyWorkspace
  };
}
