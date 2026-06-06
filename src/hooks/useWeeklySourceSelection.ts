import { useMemo, useState } from 'react';
import type { WeeklyReport } from '../types';
import { getIncludedWeeklyThreads } from '../utils/reports';

export function useWeeklySourceSelection(weeklyReport: WeeklyReport | null) {
  const [excludedWeeklySourceIds, setExcludedWeeklySourceIds] = useState<string[]>([]);
  const [weeklySourcesOpen, setWeeklySourcesOpen] = useState(false);

  const includedWeeklyThreads = useMemo(
    () => getIncludedWeeklyThreads(weeklyReport, excludedWeeklySourceIds),
    [weeklyReport, excludedWeeklySourceIds]
  );

  function toggleWeeklySource(emailId: string) {
    setExcludedWeeklySourceIds((current) =>
      current.includes(emailId) ? current.filter((id) => id !== emailId) : [...current, emailId]
    );
  }

  function includeAllWeeklySources() {
    setExcludedWeeklySourceIds([]);
  }

  function toggleWeeklySourcesOpen() {
    setWeeklySourcesOpen((current) => !current);
  }

  return {
    excludedWeeklySourceIds,
    setExcludedWeeklySourceIds,
    weeklySourcesOpen,
    setWeeklySourcesOpen,
    includedWeeklyThreads,
    toggleWeeklySource,
    includeAllWeeklySources,
    toggleWeeklySourcesOpen
  };
}
