import { CALENDAR_MONTH_OPTIONS } from '../constants';

type HomeCalendarMonthPickerProps = {
  calendarMonthNumber: number;
  calendarYear: number;
  onClose: () => void;
  onMonthChange: (monthKey: string) => void;
};

export function HomeCalendarMonthPicker({
  calendarMonthNumber,
  calendarYear,
  onClose,
  onMonthChange
}: HomeCalendarMonthPickerProps) {
  const monthKey = (year: number, month: number) => `${year}-${String(month).padStart(2, '0')}`;

  return (
    <div className="mail-calendar-picker" aria-label="연도와 월 선택">
      <div className="mail-calendar-picker-year">
        <button
          type="button"
          onClick={() => onMonthChange(monthKey(calendarYear - 1, calendarMonthNumber))}
          aria-label="이전 연도"
        >
          이전
        </button>
        <strong>{calendarYear}년</strong>
        <button
          type="button"
          onClick={() => onMonthChange(monthKey(calendarYear + 1, calendarMonthNumber))}
          aria-label="다음 연도"
        >
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
                onMonthChange(monthKey(calendarYear, month));
                onClose();
              }}
              aria-pressed={selected}
            >
              {month}월
            </button>
          );
        })}
      </div>
    </div>
  );
}
