import { useState } from 'react';
import type { AnalysisQueueFilter, SpotlightFilter } from '../types';
import { todayKey } from '../utils/date';

export function useHomeDashboardControls() {
  const [spotlightFilter, setSpotlightFilter] = useState<SpotlightFilter>('all');
  const [listQuery, setListQuery] = useState('');
  const [calendarMonth, setCalendarMonth] = useState(() => todayKey().slice(0, 7));
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(todayKey());
  const [calendarPickerOpen, setCalendarPickerOpen] = useState(false);
  const [analysisQueueFilter, setAnalysisQueueFilter] = useState<AnalysisQueueFilter>('candidate');

  return {
    analysisQueueFilter,
    calendarMonth,
    calendarPickerOpen,
    listQuery,
    selectedCalendarDate,
    setAnalysisQueueFilter,
    setCalendarMonth,
    setCalendarPickerOpen,
    setListQuery,
    setSelectedCalendarDate,
    setSpotlightFilter,
    spotlightFilter
  };
}
