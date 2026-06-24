import { useCallback, useEffect, useRef, useState } from 'react';
import type { WeeklyReportDraftProps, WeeklyReportSourcesProps } from '../components/WeeklyReportView';
import type {
  AuthSession,
  NavView,
  WeeklyDraftViewMode,
  WeeklyLoadState,
  WeeklyReport,
  WeeklyWorkspaceStatus
} from '../types';
import { useWeeklyReportGeneration } from './useWeeklyReportGeneration';
import { useWeeklyReportLifecycle } from './useWeeklyReportLifecycle';
import { useWeeklyHistory } from './useWeeklyHistory';
import { useWeeklyDraft } from './useWeeklyDraft';
import { useWeeklySourceSelection } from './useWeeklySourceSelection';
import { useWeeklyWorkspace } from './useWeeklyWorkspace';
import { normalizeReportType } from '../utils/reports';

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
  const [weeklyWorkspaceStatus, setWeeklyWorkspaceStatus] = useState<WeeklyWorkspaceStatus | null>(null);
  const [weeklyDraftViewMode, setWeeklyDraftViewMode] = useState<WeeklyDraftViewMode>('original');
  const [weeklySaveState, setWeeklySaveState] = useState<'idle' | 'draft-saved' | 'saved' | 'error'>('idle');
  const clearWeeklyWorkspaceRef = useRef<(reportId: string) => Promise<void>>(async () => {});
  const clearWeeklyWorkspace = useCallback(
    (reportId: string) => clearWeeklyWorkspaceRef.current(reportId),
    []
  );
  const {
    excludedWeeklySourceIds,
    setExcludedWeeklySourceIds,
    weeklySourcesOpen,
    setWeeklySourcesOpen,
    includedWeeklyThreads,
    toggleWeeklySource,
    includeAllWeeklySources,
    toggleWeeklySourcesOpen
  } = useWeeklySourceSelection(weeklyReport);

  const { controls, selectedReportType, setSelectedReportType } = useWeeklyReportGeneration({
    primaryMailAccountId,
    parseApiError,
    onGenerateStart: () => {
      setWeeklyLoadState('loading');
      setWeeklySourcesOpen(false);
      setWeeklyError(null);
    },
    onGenerateSuccess: async (report) => {
      setWeeklyReport(report);
      setWeeklySourcesOpen(false);
      setSelectedReportType(normalizeReportType(report.reportType));
      setWeeklyDraftViewMode('original');
      setWeeklyLoadState('ready');
      selectHistoryReport(report.reportId);
      await loadWeeklyHistory();
    },
    onGenerateError: (error) => {
      setWeeklyReport(null);
      setWeeklyLoadState('error');
      setWeeklyError(error instanceof Error ? error.message : 'Unknown error');
    }
  });

  const {
    weeklyCopyState,
    editableWeeklyDraft,
    setEditableWeeklyDraft,
    weeklyDraftDirty,
    setWeeklyDraftDirty,
    applySelectedSourcesToDraft,
    copyWeeklyReportDraft,
    changeEditableWeeklyDraft
  } = useWeeklyDraft({
    weeklyReport,
    selectedReportType,
    includedWeeklyThreads
  });

  const {
    history,
    loadWeeklyHistory,
    resetWeeklyHistory,
    selectHistoryReport,
    setWeeklyHistoryActionId,
    updateHistoryWorkspaceStatus
  } = useWeeklyHistory({
    authSession,
    navView,
    primaryMailAccountId,
    activeReportId: weeklyReport?.reportId ?? null,
    parseApiError,
    onOpenStart: () => {
      setWeeklySourcesOpen(false);
      setWeeklyLoadState('loading');
      setWeeklyError(null);
    },
    onOpenSuccess: (report) => {
      setWeeklyReport(report);
      setWeeklySourcesOpen(false);
      setSelectedReportType(normalizeReportType(report.reportType));
      setWeeklyDraftViewMode('original');
      setWeeklyLoadState('ready');
    },
    onOpenError: (error) => {
      setWeeklyReport(null);
      setWeeklyLoadState('error');
      setWeeklyError(error instanceof Error ? error.message : 'Unknown error');
    },
    onCloseAccepted: () => {
      setWeeklyReport(null);
      setWeeklySourcesOpen(false);
      setWeeklyLoadState('idle');
      setWeeklyError(null);
      setWeeklyDraftViewMode('original');
    },
    onHistoryError: (error) => {
      setWeeklyError(error instanceof Error ? error.message : 'Unknown error');
    },
    onClearWorkspace: clearWeeklyWorkspace
  });

  useWeeklyReportLifecycle({
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
  });

  const weeklyWorkspace = useWeeklyWorkspace({
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
  });
  clearWeeklyWorkspaceRef.current = weeklyWorkspace.clearWeeklyWorkspace;

  useEffect(() => {
    if (!weeklyReport) {
      return;
    }
    void weeklyWorkspace.loadWeeklyWorkspace(weeklyReport.reportId);
  }, [weeklyReport, weeklyWorkspace.loadWeeklyWorkspace]);

  const draft: WeeklyReportDraftProps = {
    workspaceStatus: weeklyWorkspaceStatus,
    viewMode: weeklyDraftViewMode,
    copyState: weeklyCopyState,
    saveState: weeklySaveState,
    text: editableWeeklyDraft,
    onSaveWorkspace: weeklyWorkspace.saveWeeklyWorkspace,
    onResetWorkspace: weeklyWorkspace.resetWeeklyWorkspace,
    onCopyReport: copyWeeklyReportDraft,
    onShowOriginal: weeklyWorkspace.showOriginalWeeklyDraft,
    onShowSaved: weeklyWorkspace.showSavedWeeklyDraft,
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
