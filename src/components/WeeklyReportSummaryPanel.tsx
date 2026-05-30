import type { ReportType, WeeklyReport } from '../types';
import { formatDate } from '../utils/date';
import { reportTypeLabel } from '../utils/reports';

type WeeklyReportSummaryPanelProps = {
  report: WeeklyReport;
  reportType: ReportType;
  includedCount: number;
};

export function WeeklyReportSummaryPanel({ report, reportType, includedCount }: WeeklyReportSummaryPanelProps) {
  return (
    <div className="weekly-report-summary">
      <p className="weekly-executive">{report.executiveSummary}</p>
      <div className="weekly-report-meta" aria-label="보고서 메타 정보">
        <span>{reportTypeLabel(reportType)}</span>
        <span>
          {report.periodStart.slice(0, 10)} ~ {report.periodEnd.slice(0, 10)}
        </span>
        <span>포함 메일 {includedCount}건</span>
        <span>생성 {formatDate(report.createdAt)}</span>
      </div>
    </div>
  );
}
