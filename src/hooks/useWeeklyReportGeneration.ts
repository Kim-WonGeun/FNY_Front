import { useState } from 'react';
import { DEFAULT_WEEKLY_END_DATE, DEFAULT_WEEKLY_START_DATE } from '../constants';
import { createWeeklyReport } from '../api/reports';
import type { WeeklyReportControlsProps } from '../components/WeeklyReportsPage';
import type { ReportType, WeeklyReport } from '../types';

type UseWeeklyReportGenerationOptions = {
  primaryMailAccountId: string | null;
  parseApiError: (response: Response, fallbackMessage?: string) => Promise<Error>;
  onGenerateStart: () => void;
  onGenerateSuccess: (report: WeeklyReport) => Promise<void> | void;
  onGenerateError: (error: unknown) => void;
};

export function useWeeklyReportGeneration({
  primaryMailAccountId,
  parseApiError,
  onGenerateStart,
  onGenerateSuccess,
  onGenerateError
}: UseWeeklyReportGenerationOptions) {
  const [selectedReportType, setSelectedReportType] = useState<ReportType>('WEEKLY');
  const [weeklyStartDate, setWeeklyStartDate] = useState(DEFAULT_WEEKLY_START_DATE);
  const [weeklyEndDate, setWeeklyEndDate] = useState(DEFAULT_WEEKLY_END_DATE);

  async function generateWeeklyReport() {
    if (!primaryMailAccountId) {
      onGenerateError(new Error('연결된 메일 계정이 없습니다.'));
      return;
    }

    onGenerateStart();

    try {
      if (!weeklyStartDate || !weeklyEndDate) {
        throw new Error('시작일과 종료일을 모두 선택해 주세요.');
      }
      if (weeklyStartDate > weeklyEndDate) {
        throw new Error('시작일은 종료일보다 늦을 수 없습니다.');
      }

      const report = await createWeeklyReport(
        primaryMailAccountId,
        {
          reportType: selectedReportType,
          startDate: weeklyStartDate,
          endDate: weeklyEndDate
        },
        parseApiError
      );
      await onGenerateSuccess(report);
    } catch (error) {
      onGenerateError(error);
    }
  }

  const controls: WeeklyReportControlsProps = {
    startDate: weeklyStartDate,
    endDate: weeklyEndDate,
    onReportTypeChange: setSelectedReportType,
    onStartDateChange: setWeeklyStartDate,
    onEndDateChange: setWeeklyEndDate,
    onGenerateReport: generateWeeklyReport
  };

  return {
    controls,
    selectedReportType,
    setSelectedReportType
  };
}
