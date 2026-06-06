import { useEffect, useMemo, useState } from 'react';
import type {
  ReportType,
  WeeklyReport,
} from '../types';
import { buildWeeklyReportDraft } from '../utils/reports';

type UseWeeklyDraftOptions = {
  weeklyReport: WeeklyReport | null;
  selectedReportType: ReportType;
  includedWeeklyThreads: WeeklyReport['threadSummaries'];
};

export function useWeeklyDraft({
  weeklyReport,
  selectedReportType,
  includedWeeklyThreads,
}: UseWeeklyDraftOptions) {
  const [weeklyCopyState, setWeeklyCopyState] = useState<'idle' | 'done' | 'error'>('idle');
  const [editableWeeklyDraft, setEditableWeeklyDraft] = useState('');
  const [weeklyDraftDirty, setWeeklyDraftDirty] = useState(false);

  const weeklyDraftText = useMemo(() => {
    if (!weeklyReport) {
      return '';
    }
    return buildWeeklyReportDraft(weeklyReport, selectedReportType, includedWeeklyThreads);
  }, [weeklyReport, selectedReportType, includedWeeklyThreads]);

  useEffect(() => {
    setWeeklyCopyState('idle');
  }, [weeklyReport]);

  useEffect(() => {
    if (!weeklyDraftDirty) {
      setEditableWeeklyDraft(weeklyDraftText);
    }
  }, [weeklyDraftText, weeklyDraftDirty]);

  function applySelectedSourcesToDraft() {
    setEditableWeeklyDraft(weeklyDraftText);
    setWeeklyDraftDirty(false);
  }

  function changeEditableWeeklyDraft(draft: string) {
    setEditableWeeklyDraft(draft);
    setWeeklyDraftDirty(true);
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

  return {
    weeklyCopyState,
    editableWeeklyDraft,
    setEditableWeeklyDraft,
    weeklyDraftDirty,
    setWeeklyDraftDirty,
    applySelectedSourcesToDraft,
    copyWeeklyReportDraft,
    changeEditableWeeklyDraft
  };
}
