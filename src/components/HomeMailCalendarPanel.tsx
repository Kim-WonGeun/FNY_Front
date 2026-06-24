import { useEffect, useRef, type ReactNode } from 'react';
import type { EmailListItem } from '../types';
import {
  formatCalendarDate,
  formatCalendarMonth,
  shiftMonthKey
} from '../utils/date';
import { EmptyState } from './common';
import { HomeCalendarGrid, type CalendarDay } from './HomeCalendarGrid';
import { HomeCalendarMonthPicker } from './HomeCalendarMonthPicker';

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
          <HomeCalendarMonthPicker
            calendarMonthNumber={calendarMonthNumber}
            calendarYear={calendarYear}
            onClose={() => onCalendarPickerOpenChange(false)}
            onMonthChange={handleMonthChange}
          />
        ) : null}
        <HomeCalendarGrid
          calendarDays={calendarDays}
          selectedCalendarDate={selectedCalendarDate}
          onDateSelect={handleDateSelect}
        />
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
