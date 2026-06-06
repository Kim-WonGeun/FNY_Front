import { useCallback, useEffect, useState } from 'react';
import { fetchWeeklyReport, fetchWeeklyReports } from '../api/reports';
import type { WeeklyReportHistoryProps } from '../components/WeeklyReportsPage';
import type { AuthSession, NavView, WeeklyReport, WeeklyReportSummary } from '../types';
import { updateWeeklyHistoryWorkspaceStatus } from '../utils/reports';

type UseWeeklyHistoryOptions = {
  authSession: AuthSession | null;
  navView: NavView;
  primaryMailAccountId: string | null;
  activeReportId: string | null;
  parseApiError: (response: Response, fallbackMessage?: string) => Promise<Error>;
  onOpenStart: () => void;
  onOpenSuccess: (report: WeeklyReport) => void;
  onOpenError: (error: unknown) => void;
  onCloseAccepted: () => void;
  onHistoryError: (error: unknown) => void;
  onClearWorkspace: (reportId: string) => void;
};

export function useWeeklyHistory({
  authSession,
  navView,
  primaryMailAccountId,
  activeReportId,
  parseApiError,
  onOpenStart,
  onOpenSuccess,
  onOpenError,
  onCloseAccepted,
  onHistoryError,
  onClearWorkspace
}: UseWeeklyHistoryOptions) {
  const [weeklyHistory, setWeeklyHistory] = useState<WeeklyReportSummary[]>([]);
  const [weeklyHistoryLoading, setWeeklyHistoryLoading] = useState(false);
  const [weeklyHistoryActionId, setWeeklyHistoryActionId] = useState<string | null>(null);
  const [weeklyHistoryOpen, setWeeklyHistoryOpen] = useState(true);
  const [selectedHistoryReportId, setSelectedHistoryReportId] = useState<string | null>(null);

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
        onHistoryError(error);
      }
      setWeeklyHistory([]);
    } finally {
      setWeeklyHistoryLoading(false);
    }
  }, [authSession, parseApiError, primaryMailAccountId]);

  useEffect(() => {
    if (!authSession || navView !== 'weekly' || !primaryMailAccountId) {
      return;
    }
    void loadWeeklyHistory();
  }, [authSession, navView, primaryMailAccountId, loadWeeklyHistory]);

  async function openWeeklyReportFromHistory(reportId: string) {
    setSelectedHistoryReportId(reportId);
    onOpenStart();
    try {
      const report = await fetchWeeklyReport(reportId, parseApiError);
      onOpenSuccess(report);
    } catch (error) {
      onOpenError(error);
    }
  }

  function closeWeeklyReportFromHistory(reportId: string) {
    if (selectedHistoryReportId !== reportId && activeReportId !== reportId) {
      return;
    }
    setSelectedHistoryReportId(null);
    onCloseAccepted();
  }

  function resetWeeklyHistory() {
    setWeeklyHistory([]);
    setSelectedHistoryReportId(null);
  }

  function selectHistoryReport(reportId: string) {
    setSelectedHistoryReportId(reportId);
  }

  function updateHistoryWorkspaceStatus(reportId: string, workspaceStatus: WeeklyReportSummary['workspaceStatus']) {
    setWeeklyHistory((current) => updateWeeklyHistoryWorkspaceStatus(current, reportId, workspaceStatus));
  }

  function toggleWeeklyHistoryOpen() {
    setWeeklyHistoryOpen((current) => !current);
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
    onClearWorkspace
  };

  return {
    history,
    loadWeeklyHistory,
    resetWeeklyHistory,
    selectHistoryReport,
    setWeeklyHistoryActionId,
    updateHistoryWorkspaceStatus
  };
}
