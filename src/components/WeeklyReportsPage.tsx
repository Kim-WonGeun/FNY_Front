import type {
  ReportType,
  WeeklyLoadState,
  WeeklyReport,
  WeeklyReportSummary
} from '../types';
import { WeeklyHistorySidebar } from './WeeklyHistorySidebar';
import { WeeklyReportControls } from './WeeklyReportControls';
import { WeeklyReportView, type WeeklyReportDraftProps, type WeeklyReportSourcesProps } from './WeeklyReportView';

export type WeeklyReportHistoryProps = {
  loading: boolean;
  items: WeeklyReportSummary[];
  open: boolean;
  actionId: string | null;
  selectedReportId: string | null;
  onToggleOpen: () => void;
  onOpenReport: (reportId: string) => void;
  onCloseReport: (reportId: string) => void;
  onClearWorkspace: (reportId: string) => void;
};

export type WeeklyReportControlsProps = {
  startDate: string;
  endDate: string;
  onReportTypeChange: (reportType: ReportType) => void;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onGenerateReport: () => void;
};

type WeeklyReportsPageProps = {
  primaryMailAccountId: string | null;
  weeklyReport: WeeklyReport | null;
  weeklyLoadState: WeeklyLoadState;
  weeklyError: string | null;
  selectedReportType: ReportType;
  includedWeeklyThreads: WeeklyReport['threadSummaries'];
  excludedWeeklySourceIds: string[];
  weeklyDraftDirty: boolean;
  history: WeeklyReportHistoryProps;
  controls: WeeklyReportControlsProps;
  draft: WeeklyReportDraftProps;
  sources: WeeklyReportSourcesProps;
};

export function WeeklyReportsPage({
  primaryMailAccountId,
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
}: WeeklyReportsPageProps) {
  return (
    <div className="page-card" aria-label="보고서 생성">
      <div className="status-line" role="status">
        {!primaryMailAccountId && '메일 계정이 없어 주간 요약을 만들 수 없습니다.'}
        {primaryMailAccountId && history.loading && '이전 요약 목록을 불러오는 중입니다.'}
        {primaryMailAccountId && !history.loading && history.items.length === 0 && weeklyLoadState !== 'loading'
          ? '아직 저장된 주간 요약이 없습니다. 아래에서 새로 생성해 보세요.'
          : null}
      </div>

      <div className="weekly-layout">
        {primaryMailAccountId && history.items.length > 0 ? (
          <WeeklyHistorySidebar
            weeklyHistory={history.items}
            weeklyHistoryOpen={history.open}
            weeklyHistoryActionId={history.actionId}
            selectedHistoryReportId={history.selectedReportId}
            weeklyReport={weeklyReport}
            weeklyLoadState={weeklyLoadState}
            onToggleHistoryOpen={history.onToggleOpen}
            onOpenHistoryReport={history.onOpenReport}
            onCloseHistoryReport={history.onCloseReport}
            onClearWeeklyWorkspace={history.onClearWorkspace}
          />
        ) : null}

        <div className="weekly-main">
          <section className="weekly-card weekly-card-embedded" aria-label="주간보고 생성">
            <WeeklyReportControls
              primaryMailAccountId={primaryMailAccountId}
              weeklyLoadState={weeklyLoadState}
              selectedReportType={selectedReportType}
              weeklyStartDate={controls.startDate}
              weeklyEndDate={controls.endDate}
              onReportTypeChange={controls.onReportTypeChange}
              onStartDateChange={controls.onStartDateChange}
              onEndDateChange={controls.onEndDateChange}
              onGenerateWeeklyReport={controls.onGenerateReport}
            />
            {weeklyLoadState === 'error' && weeklyError ? (
              <p className="status-line" style={{ margin: 0 }}>
                주간 요약을 만들지 못했습니다. {weeklyError}
              </p>
            ) : null}
            {weeklyReport ? (
              <WeeklyReportView
                report={weeklyReport}
                reportType={selectedReportType}
                includedThreads={includedWeeklyThreads}
                excludedSourceIds={excludedWeeklySourceIds}
                draftDirty={weeklyDraftDirty}
                draft={draft}
                sources={sources}
              />
            ) : weeklyLoadState === 'idle' && !weeklyError ? (
              <p className="status-line" style={{ margin: 0 }}>
                목록에서 이전 결과를 선택하거나, 새 주간보고를 생성해 주세요.
              </p>
            ) : null}
          </section>
        </div>
      </div>
    </div>
  );
}
