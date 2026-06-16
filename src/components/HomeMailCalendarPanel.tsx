import { useEffect, useRef, type ReactNode } from 'react';
import { CALENDAR_MONTH_OPTIONS } from '../constants';
import type { EmailListItem } from '../types';
import {
  formatCalendarDate,
  formatCalendarMonth,
  shiftMonthKey,
  todayKey
} from '../utils/date';
import { EmptyState } from './common';

type CalendarDay = {
  dateKey: string;
  dayOfMonth: number;
  inCurrentMonth: boolean;
  stats: { total: number };
};

type HomeMailCalendarPanelProps = {
  calendarDays: CalendarDay[];
  calendarMonth: string;
  calendarMonthNumber: number;
  calendarPickerOpen: boolean;
  calendarYear: number;
  listScrollTop: number;
  renderEmail: (email: EmailListItem, index: number, key: string) => ReactNode;
  selectedCalendarDate: string;
  selectedCalendarEmails: EmailListItem[];
  onCalendarDateSelect: (dateKey: string) => void;
  onCalendarMonthChange: (monthKey: string) => void;
  onCalendarPickerOpenChange: (open: boolean) => void;
  onListScrollTopChange: (scrollTop: number) => void;
  onTodaySelect: () => void;
};

export function HomeMailCalendarPanel({
  calendarDays,
  calendarMonth,
  calendarMonthNumber,
  calendarPickerOpen,
  calendarYear,
  listScrollTop,
  renderEmail,
  selectedCalendarDate,
  selectedCalendarEmails,
  onCalendarDateSelect,
  onCalendarMonthChange,
  onCalendarPickerOpenChange,
  onListScrollTopChange,
  onTodaySelect
}: HomeMailCalendarPanelProps) {
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const list = listRef.current;
    if (!list) {
      return;
    }

    const frameId = window.requestAnimationFrame(() => {
      list.scrollTop = listScrollTop;
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [listScrollTop, selectedCalendarDate, selectedCalendarEmails.length]);

  const handleDateSelect = (dateKey: string) => {
    onListScrollTopChange(0);
    onCalendarDateSelect(dateKey);
  };

  const handleMonthChange = (monthKey: string) => {
    onListScrollTopChange(0);
    onCalendarMonthChange(monthKey);
  };

  return (
    <section className="mail-calendar-panel" aria-label="메일 캘린더">
      <div className="mail-calendar-card">
        <div className="mail-calendar-head">
          <div>
            <p className="eyebrow">메일 캘린더</p>
            <button type="button" className="mail-calendar-title-button" onClick={() => onCalendarPickerOpenChange(!calendarPickerOpen)} aria-expanded={calendarPickerOpen}>
              {formatCalendarMonth(calendarMonth)}
            </button>
          </div>
          <div className="mail-calendar-nav">
            <button type="button" onClick={() => handleMonthChange(shiftMonthKey(calendarMonth, -1))} aria-label="이전 달">
              이전
            </button>
            <button type="button" onClick={onTodaySelect}>
              오늘
            </button>
            <button type="button" onClick={() => handleMonthChange(shiftMonthKey(calendarMonth, 1))} aria-label="다음 달">
              다음
            </button>
          </div>
        </div>
        {calendarPickerOpen ? (
          <div className="mail-calendar-picker" aria-label="연도와 월 선택">
            <div className="mail-calendar-picker-year">
              <button type="button" onClick={() => handleMonthChange(`${calendarYear - 1}-${String(calendarMonthNumber).padStart(2, '0')}`)} aria-label="이전 연도">
                이전
              </button>
              <strong>{calendarYear}년</strong>
              <button type="button" onClick={() => handleMonthChange(`${calendarYear + 1}-${String(calendarMonthNumber).padStart(2, '0')}`)} aria-label="다음 연도">
                다음
              </button>
            </div>
            <div className="mail-calendar-month-grid">
              {CALENDAR_MONTH_OPTIONS.map((month) => {
                const selected = month === calendarMonthNumber;
                return (
                  <button
                    key={month}
                    type="button"
                    className={selected ? 'mail-calendar-month-active' : ''}
                    onClick={() => {
                      handleMonthChange(`${calendarYear}-${String(month).padStart(2, '0')}`);
                      onCalendarPickerOpenChange(false);
                    }}
                    aria-pressed={selected}
                  >
                    {month}월
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        <div className="mail-calendar-weekdays" aria-hidden="true">
          {['일', '월', '화', '수', '목', '금', '토'].map((day) => (
            <span key={day}>{day}</span>
          ))}
        </div>
        <div className="mail-calendar-grid">
          {calendarDays.map((day) => {
            const isSelected = day.dateKey === selectedCalendarDate;
            const isToday = day.dateKey === todayKey();
            const hasMail = day.stats.total > 0;

            return (
              <button
                type="button"
                key={day.dateKey}
                className={[
                  'mail-calendar-day',
                  day.inCurrentMonth ? '' : 'mail-calendar-day-muted',
                  isSelected ? 'mail-calendar-day-selected' : '',
                  isToday ? 'mail-calendar-day-today' : ''
                ].filter(Boolean).join(' ')}
                onClick={() => handleDateSelect(day.dateKey)}
              >
                <span className="mail-calendar-date">{day.dayOfMonth}</span>
                {hasMail ? <span className="mail-calendar-count">{day.stats.total}</span> : null}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mail-calendar-list">
        <div className="section-heading">
          <h2>{formatCalendarDate(selectedCalendarDate)}</h2>
          <p className="section-copy">
            {selectedCalendarEmails.length === 0
              ? '이 날짜에 표시할 메일이 없습니다.'
              : `${selectedCalendarEmails.length}건의 메일이 있습니다.`}
          </p>
        </div>
        <div
          ref={listRef}
          className="mail-table"
          role="list"
          onScroll={(event) => onListScrollTopChange(event.currentTarget.scrollTop)}
        >
          {selectedCalendarEmails.length === 0 ? (
            <EmptyState title="메일이 없습니다" description="다른 날짜를 선택하면 해당 날짜의 메일을 볼 수 있습니다." />
          ) : (
            selectedCalendarEmails.map((email, index) => renderEmail(email, index, `calendar-${email.id}`))
          )}
        </div>
      </div>
    </section>
  );
}
