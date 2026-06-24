import type { MailboxDatePreset } from '../types';
import { FilterChip } from './common';

export function MailboxDateFilter({
  query,
  datePreset,
  startDate,
  endDate,
  onQueryChange,
  onDatePresetChange
}: {
  query: string;
  datePreset: MailboxDatePreset;
  startDate: string;
  endDate: string;
  onQueryChange: (value: string) => void;
  onDatePresetChange: (preset: MailboxDatePreset) => void;
}) {
  return (
    <div className="mailbox-date-filter" aria-label="메일 검색과 기간 필터">
      <label className="mailbox-date-search" htmlFor="all-mail-search">
        <span>검색</span>
        <input
          id="all-mail-search"
          className="toolbar-search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="제목·요약 검색"
        />
      </label>
      <div className="mailbox-date-filter-main">
        <span className="mailbox-date-filter-label">기간</span>
        <div className="mailbox-filter-chips">
          <FilterChip
            selected={datePreset === 'all'}
            onSelect={() => onDatePresetChange('all')}
            label="전체"
          />
          <FilterChip
            selected={datePreset === 'today'}
            onSelect={() => onDatePresetChange('today')}
            label="오늘"
          />
          <FilterChip
            selected={datePreset === 'week'}
            onSelect={() => onDatePresetChange('week')}
            label="최근 7일"
          />
          <FilterChip
            selected={datePreset === 'month'}
            onSelect={() => onDatePresetChange('month')}
            label="최근 30일"
          />
          <FilterChip
            selected={datePreset === 'custom'}
            onSelect={() => onDatePresetChange('custom')}
            label="직접 지정"
          />
        </div>
      </div>
      {datePreset !== 'all' ? (
        <em>
          {startDate || '시작일 없음'} ~ {endDate || '종료일 없음'}
        </em>
      ) : null}
    </div>
  );
}
