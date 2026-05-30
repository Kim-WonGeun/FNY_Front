import { useCallback, useEffect, useMemo, useState } from 'react';
import { DEFAULT_WEEKLY_END_DATE, DEFAULT_WEEKLY_START_DATE } from '../constants';
import {
  archiveWeeklyReportWorkspace,
  createWeeklyReport,
  fetchWeeklyReport,
  fetchWeeklyReports,
  fetchWeeklyWorkspace,
  saveWeeklyReportWorkspace
} from '../api/reports';
import type { WeeklyReportControlsProps, WeeklyReportHistoryProps } from '../components/WeeklyReportsPage';
import type { WeeklyReportDraftProps, WeeklyReportSourcesProps } from '../components/WeeklyReportView';
import type {
  AuthSession,
  NavView,
  ReportType,
  WeeklyDraftViewMode,
  WeeklyLoadState,
  WeeklyReport,
  WeeklyReportSummary,
  WeeklyWorkspaceSaveMode,
  WeeklyWorkspaceSnapshot,
  WeeklyWorkspaceStatus
} from '../types';
import {
  buildWeeklyReportDraft,
  getIncludedWeeklyThreads,
  normalizeReportType,
  readWeeklyWorkspaceSnapshot,
  updateWeeklyHistoryWorkspaceStatus,
  weeklyWorkspaceStorageKey,
  workspaceSaveStatusFromMode,
  workspaceStatusFromResponse
} from '../utils/reports';

type UseWeeklyReportsOptions = {
  authSession: AuthSession | null;
  navView: NavView;
  userId: string;
  primaryMailAccountId: string | null;
  parseApiError: (response: Response, fallbackMessage?: string) => Promise<Error>;
  onOpenSourceEmail: (emailId: string) => void;
};

export function useWeeklyReports({
  authSession,
  navView,
  userId,
  primaryMailAccountId,
  parseApiError,
  onOpenSourceEmail
}: UseWeeklyReportsOptions) {
  const [weeklyReport, setWeeklyReport] = useState<WeeklyReport | null>(null);
  const [weeklyLoadState, setWeeklyLoadState] = useState<WeeklyLoadState>('idle');
  const [weeklyError, setWeeklyError] = useState<string | null>(null);
  const [weeklyHistory, setWeeklyHistory] = useState<WeeklyReportSummary[]>([]);
  const [weeklyHistoryLoading, setWeeklyHistoryLoading] = useState(false);
  const [weeklyHistoryActionId, setWeeklyHistoryActionId] = useState<string | null>(null);
  const [weeklyHistoryOpen, setWeeklyHistoryOpen] = useState(true);
  const [selectedHistoryReportId, setSelectedHistoryReportId] = useState<string | null>(null);
  const [weeklyCopyState, setWeeklyCopyState] = useState<'idle' | 'done' | 'error'>('idle');
  const [selectedReportType, setSelectedReportType] = useState<ReportType>('WEEKLY');
  const [weeklyStartDate, setWeeklyStartDate] = useState(DEFAULT_WEEKLY_START_DATE);
  const [weeklyEndDate, setWeeklyEndDate] = useState(DEFAULT_WEEKLY_END_DATE);
  const [editableWeeklyDraft, setEditableWeeklyDraft] = useState('');
  const [weeklyDraftDirty, setWeeklyDraftDirty] = useState(false);
  const [excludedWeeklySourceIds, setExcludedWeeklySourceIds] = useState<string[]>([]);
  const [weeklySourcesOpen, setWeeklySourcesOpen] = useState(false);
  const [weeklyWorkspaceStatus, setWeeklyWorkspaceStatus] = useState<WeeklyWorkspaceStatus | null>(null);
  const [weeklyDraftViewMode, setWeeklyDraftViewMode] = useState<WeeklyDraftViewMode>('original');
  const [weeklySaveState, setWeeklySaveState] = useState<'idle' | 'draft-saved' | 'saved' | 'error'>('idle');

  const includedWeeklyThreads = useMemo(
    () => getIncludedWeeklyThreads(weeklyReport, excludedWeeklySourceIds),
    [weeklyReport, excludedWeeklySourceIds]
  );

  const weeklyDraftText = useMemo(() => {
    if (!weeklyReport) {
      return '';
    }
    return buildWeeklyReportDraft(weeklyReport, selectedReportType, includedWeeklyThreads);
  }, [weeklyReport, selectedReportType, includedWeeklyThreads]);

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
      setWeeklyWorkspaceStatus({ mode: snapshot.saveMode, savedAt: snapshot.savedAt, storage: 'local' });
      setWeeklyDraftViewMode('workspace');
    },
    [userId]
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
    [loadLocalWeeklyWorkspaceFallback]
  );

  const loadWeeklyHistory = useCallback(async () => {
    if (!primaryMailAccountId) {
      setWeeklyHistory([]);
      return;
    }
    setWeeklyHistoryLoading(true);
    try {
      const rows = await fetchWeeklyReports(primaryMailAccountId, parseApiError);
      setWeeklyHistory(rows);
    } catch (error) {
      if (authSession) {
        setWeeklyError(error instanceof Error ? error.message : 'Unknown error');
      }
      setWeeklyHistory([]);
    } finally {
      setWeeklyHistoryLoading(false);
    }
  }, [authSession, parseApiError, primaryMailAccountId]);

  useEffect(() => {
    if (!authSession) {
      return;
    }
    setWeeklyReport(null);
    setWeeklySourcesOpen(false);
    setWeeklyLoadState('idle');
    setWeeklyError(null);
    setWeeklyHistory([]);
    setSelectedHistoryReportId(null);
  }, [authSession, userId]);

  useEffect(() => {
    setWeeklyCopyState('idle');
  }, [weeklyReport]);

  useEffect(() => {
    setWeeklySaveState('idle');
  }, [weeklyReport]);

  useEffect(() => {
    if (!weeklyDraftDirty) {
      setEditableWeeklyDraft(weeklyDraftText);
    }
  }, [weeklyDraftText, weeklyDraftDirty]);

  useEffect(() => {
    setWeeklyDraftDirty(false);
    setExcludedWeeklySourceIds([]);
    setWeeklyWorkspaceStatus(null);
    setWeeklyDraftViewMode('original');
    setWeeklySourcesOpen(false);
  }, [weeklyReport, selectedReportType]);

  useEffect(() => {
    if (!weeklyReport) {
      return;
    }
    void loadWeeklyWorkspace(weeklyReport.reportId);
  }, [loadWeeklyWorkspace, weeklyReport]);

  useEffect(() => {
    if (!authSession || navView !== 'weekly' || !primaryMailAccountId) {
      return;
    }
    void loadWeeklyHistory();
  }, [authSession, navView, primaryMailAccountId, loadWeeklyHistory]);

  async function openWeeklyReportFromHistory(reportId: string) {
    setSelectedHistoryReportId(reportId);
    setWeeklySourcesOpen(false);
    setWeeklyLoadState('loading');
    setWeeklyError(null);
    try {
      const data = await fetchWeeklyReport(reportId, parseApiError);
      setWeeklyReport(data);
      setWeeklySourcesOpen(false);
      setSelectedReportType(normalizeReportType(data.reportType));
      setWeeklyDraftViewMode('original');
      setWeeklyLoadState('ready');
    } catch (error) {
      setWeeklyReport(null);
      setWeeklyLoadState('error');
      setWeeklyError(error instanceof Error ? error.message : 'Unknown error');
    }
  }

  function closeWeeklyReportFromHistory(reportId: string) {
    if (selectedHistoryReportId !== reportId && weeklyReport?.reportId !== reportId) {
      return;
    }

    setWeeklyReport(null);
    setSelectedHistoryReportId(null);
    setWeeklySourcesOpen(false);
    setWeeklyLoadState('idle');
    setWeeklyError(null);
    setWeeklyDraftViewMode('original');
  }

  async function generateWeeklyReport() {
    if (!primaryMailAccountId) {
      setWeeklyError('연결된 메일 계정이 없습니다.');
      setWeeklyLoadState('error');
      return;
    }

    setWeeklyLoadState('loading');
    setWeeklySourcesOpen(false);
    setWeeklyError(null);

    try {
      if (!weeklyStartDate || !weeklyEndDate) {
        throw new Error('시작일과 종료일을 모두 선택해 주세요.');
      }
      if (weeklyStartDate > weeklyEndDate) {
        throw new Error('시작일은 종료일보다 늦을 수 없습니다.');
      }

      const data = await createWeeklyReport(
        primaryMailAccountId,
        {
          reportType: selectedReportType,
          startDate: weeklyStartDate,
          endDate: weeklyEndDate
        },
        parseApiError
      );
      setWeeklyReport(data);
      setWeeklySourcesOpen(false);
      setSelectedReportType(normalizeReportType(data.reportType));
      setWeeklyDraftViewMode('original');
      setWeeklyLoadState('ready');
      setSelectedHistoryReportId(data.reportId);
      await loadWeeklyHistory();
    } catch (error) {
      setWeeklyReport(null);
      setWeeklyLoadState('error');
      setWeeklyError(error instanceof Error ? error.message : 'Unknown error');
    }
  }

  async function copyWeeklyReportDraft() {
    if (!editableWeeklyDraft) {
      return;
    }
    try {
      await navigator.clipboard.writeText(editableWeeklyDraft);
      setWeeklyCopyState('done');
    } catch {
      setWeeklyCopyState('error');
    }
  }

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
      setWeeklySaveState(mode === 'draft' ? 'draft-saved' : 'saved');
      setWeeklyDraftViewMode('workspace');
      setWeeklyHistory((current) =>
        updateWeeklyHistoryWorkspaceStatus(current, weeklyReport.reportId, workspace.saveStatus)
      );
      localStorage.removeItem(weeklyWorkspaceStorageKey(userId, weeklyReport.reportId));
    } catch {
      try {
        const snapshot: WeeklyWorkspaceSnapshot = {
          reportId: weeklyReport.reportId,
          reportType: selectedReportType,
          draftText: editableWeeklyDraft,
          excludedSourceIds: excludedWeeklySourceIds,
          saveMode: mode,
          savedAt: new Date().toISOString()
        };
        localStorage.setItem(weeklyWorkspaceStorageKey(userId, weeklyReport.reportId), JSON.stringify(snapshot));
        setWeeklyWorkspaceStatus({ mode, savedAt: snapshot.savedAt, storage: 'local' });
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
      setWeeklyHistory((current) => updateWeeklyHistoryWorkspaceStatus(current, reportId, 'NONE'));
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

  function toggleWeeklySource(emailId: string) {
    setExcludedWeeklySourceIds((current) =>
      current.includes(emailId) ? current.filter((id) => id !== emailId) : [...current, emailId]
    );
  }

  function includeAllWeeklySources() {
    setExcludedWeeklySourceIds([]);
  }

  function applySelectedSourcesToDraft() {
    setEditableWeeklyDraft(weeklyDraftText);
    setWeeklyDraftDirty(false);
  }

  function toggleWeeklyHistoryOpen() {
    setWeeklyHistoryOpen((current) => !current);
  }

  function toggleWeeklySourcesOpen() {
    setWeeklySourcesOpen((current) => !current);
  }

  function changeEditableWeeklyDraft(draft: string) {
    setEditableWeeklyDraft(draft);
    setWeeklyDraftDirty(true);
  }

  const history: WeeklyReportHistoryProps = {
    loading: weeklyHistoryLoading,
    items: weeklyHistory,
    open: weeklyHistoryOpen,
    actionId: weeklyHistoryActionId,
    selectedReportId: selectedHistoryReportId,
    onToggleOpen: toggleWeeklyHistoryOpen,
    onOpenReport: openWeeklyReportFromHistory,
    onCloseReport: closeWeeklyReportFromHistory,
    onClearWorkspace: clearWeeklyWorkspace
  };

  const controls: WeeklyReportControlsProps = {
    startDate: weeklyStartDate,
    endDate: weeklyEndDate,
    onReportTypeChange: setSelectedReportType,
    onStartDateChange: setWeeklyStartDate,
    onEndDateChange: setWeeklyEndDate,
    onGenerateReport: generateWeeklyReport
  };

  const draft: WeeklyReportDraftProps = {
    workspaceStatus: weeklyWorkspaceStatus,
    viewMode: weeklyDraftViewMode,
    copyState: weeklyCopyState,
    saveState: weeklySaveState,
    text: editableWeeklyDraft,
    onSaveWorkspace: saveWeeklyWorkspace,
    onResetWorkspace: resetWeeklyWorkspace,
    onCopyReport: copyWeeklyReportDraft,
    onShowOriginal: showOriginalWeeklyDraft,
    onShowSaved: showSavedWeeklyDraft,
    onChange: changeEditableWeeklyDraft
  };

  const sources: WeeklyReportSourcesProps = {
    open: weeklySourcesOpen,
    onToggleOpen: toggleWeeklySourcesOpen,
    onIncludeAll: includeAllWeeklySources,
    onApplySelectedToDraft: applySelectedSourcesToDraft,
    onOpenSourceEmail,
    onToggleSource: toggleWeeklySource
  };

  return {
    weeklyReport,
    weeklyLoadState,
    weeklyError,
    selectedReportType,
    includedWeeklyThreads,
    excludedWeeklySourceIds,
    weeklyDraftDirty,
    history,
    controls,
    draft,
    sources
  };
}
