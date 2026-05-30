import type { WeeklyLoadState, WeeklyReport, WeeklyReportSummary } from '../types';
import { formatDate } from '../utils/date';
import { normalizeWorkspaceStatus, reportTypeLabel, workspaceStatusLabel } from '../utils/reports';

type WeeklyHistorySidebarProps = {
  weeklyHistory: WeeklyReportSummary[];
  weeklyHistoryOpen: boolean;
  weeklyHistoryActionId: string | null;
  selectedHistoryReportId: string | null;
  weeklyReport: WeeklyReport | null;
  weeklyLoadState: WeeklyLoadState;
  onToggleHistoryOpen: () => void;
  onOpenHistoryReport: (reportId: string) => void;
  onCloseHistoryReport: (reportId: string) => void;
  onClearWeeklyWorkspace: (reportId: string) => void;
};

export function WeeklyHistorySidebar({
  weeklyHistory,
  weeklyHistoryOpen,
  weeklyHistoryActionId,
  selectedHistoryReportId,
  weeklyReport,
  weeklyLoadState,
  onToggleHistoryOpen,
  onOpenHistoryReport,
  onCloseHistoryReport,
  onClearWeeklyWorkspace
}: WeeklyHistorySidebarProps) {
  return (
    <aside className={`weekly-sidebar${weeklyHistoryOpen ? '' : ' weekly-sidebar-collapsed'}`} aria-label="저장된 주간 요약">
      <div className="weekly-sidebar-head">
        <h4 className="weekly-sidebar-title">최근 요약</h4>
        <button
          type="button"
          className="weekly-history-toggle"
          onClick={onToggleHistoryOpen}
          aria-expanded={weeklyHistoryOpen}
        >
          {weeklyHistoryOpen ? '접기' : `펼치기 (${weeklyHistory.length})`}
        </button>
      </div>
      {weeklyHistoryOpen ? (
        <ul className="weekly-sidebar-list">
          {weeklyHistory.map((row) => {
            const normalizedWorkspaceStatus = normalizeWorkspaceStatus(row.workspaceStatus);
            const hasWorkspace = normalizedWorkspaceStatus !== 'NONE';
            const actionLoading = weeklyHistoryActionId === row.reportId;
            const isCurrentReportOpen = weeklyReport?.reportId === row.reportId && weeklyLoadState === 'ready';

            return (
              <li key={row.reportId}>
                <div
                  className={`weekly-history-card${
                    selectedHistoryReportId === row.reportId ? ' weekly-history-item-active' : ''
                  }`}
                >
                  <button
                    type="button"
                    className="weekly-history-item"
                    onClick={() => onOpenHistoryReport(row.reportId)}
                  >
                    <span className="weekly-history-meta">생성 {formatDate(row.createdAt)}</span>
                    <span className="weekly-history-snippet">
                      {reportTypeLabel(row.reportType)} · {row.periodStart.slice(0, 10)} ~ {row.periodEnd.slice(0, 10)}
                    </span>
                    <span className="weekly-history-detail">
                      포함 메일 {row.emailCount}건
                      <span className={`weekly-history-status weekly-history-status-${normalizedWorkspaceStatus.toLowerCase()}`}>
                        {workspaceStatusLabel(row.workspaceStatus)}
                      </span>
                    </span>
                  </button>
                  <div className="weekly-history-actions">
                    <button
                      type="button"
                      onClick={() => {
                        if (isCurrentReportOpen) {
                          onCloseHistoryReport(row.reportId);
                          return;
                        }

                        onOpenHistoryReport(row.reportId);
                      }}
                    >
                      {isCurrentReportOpen ? '닫기' : '열기'}
                    </button>
                    {hasWorkspace ? (
                      <button
                        type="button"
                        className="weekly-history-action-danger"
                        disabled={actionLoading}
                        onClick={() => onClearWeeklyWorkspace(row.reportId)}
                      >
                        {actionLoading ? '처리 중' : '저장본 비우기'}
                      </button>
                    ) : null}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      ) : null}
    </aside>
  );
}
