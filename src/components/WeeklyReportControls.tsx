import { REPORT_TYPE_OPTIONS } from '../constants';
import type { ReportType, WeeklyLoadState } from '../types';

type WeeklyReportControlsProps = {
  primaryMailAccountId: string | null;
  weeklyLoadState: WeeklyLoadState;
  selectedReportType: ReportType;
  weeklyStartDate: string;
  weeklyEndDate: string;
  onReportTypeChange: (reportType: ReportType) => void;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onGenerateWeeklyReport: () => void;
};

export function WeeklyReportControls({
  primaryMailAccountId,
  weeklyLoadState,
  selectedReportType,
  weeklyStartDate,
  weeklyEndDate,
  onReportTypeChange,
  onStartDateChange,
  onEndDateChange,
  onGenerateWeeklyReport
}: WeeklyReportControlsProps) {
  const selectedReportOption =
    REPORT_TYPE_OPTIONS.find((option) => option.value === selectedReportType) ?? REPORT_TYPE_OPTIONS[0];

  return (
    <div className="weekly-card-head">
      <div>
        <h4>{selectedReportOption.label} 생성</h4>
        <p>{selectedReportOption.description}</p>
      </div>
      <div className="weekly-controls">
        <label>
          보고서 종류
          <select value={selectedReportType} onChange={(event) => onReportTypeChange(event.target.value as ReportType)}>
            {REPORT_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          시작일
          <input type="date" value={weeklyStartDate} onChange={(event) => onStartDateChange(event.target.value)} />
        </label>
        <label>
          종료일
          <input type="date" value={weeklyEndDate} onChange={(event) => onEndDateChange(event.target.value)} />
        </label>
        <button
          type="button"
          className="btn-weekly"
          onClick={onGenerateWeeklyReport}
          disabled={!primaryMailAccountId || weeklyLoadState === 'loading'}
        >
          {weeklyLoadState === 'loading' ? '생성 중…' : selectedReportOption.buttonLabel}
        </button>
      </div>
    </div>
  );
}
