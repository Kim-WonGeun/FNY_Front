import { useMemo, useState } from 'react';
import type { WeeklyReportSummary } from '../types';
import {
  normalizeWorkspaceStatus,
  reportTypeLabel,
  workspaceStatusLabel
} from '../utils/reports';

type WeeklyHistoryStatusFilter = 'all' | 'draft' | 'saved';

export function useWeeklyHistoryFilters(history: WeeklyReportSummary[]) {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<WeeklyHistoryStatusFilter>('all');

  const filteredHistory = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return history.filter((row) => {
      const workspaceStatus = normalizeWorkspaceStatus(row.workspaceStatus);
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'draft' && workspaceStatus === 'DRAFT') ||
        (statusFilter === 'saved' && workspaceStatus === 'SAVED');
      const searchable = [
        reportTypeLabel(row.reportType),
        row.periodStart,
        row.periodEnd,
        String(row.emailCount),
        workspaceStatusLabel(row.workspaceStatus)
      ].join(' ').toLowerCase();

      return matchesStatus && (!normalizedQuery || searchable.includes(normalizedQuery));
    });
  }, [history, query, statusFilter]);

  return { query, setQuery, statusFilter, setStatusFilter, filteredHistory };
}
