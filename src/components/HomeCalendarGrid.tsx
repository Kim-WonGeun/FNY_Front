import { todayKey } from '../utils/date';

export type CalendarDay = {
  dateKey: string;
  dayOfMonth: number;
  inCurrentMonth: boolean;
  stats: { total: number };
};

type HomeCalendarGridProps = {
  calendarDays: CalendarDay[];
  selectedCalendarDate: string;
  onDateSelect: (dateKey: string) => void;
};

export function HomeCalendarGrid({
  calendarDays,
  selectedCalendarDate,
  onDateSelect
}: HomeCalendarGridProps) {
  return (
    <>
      <div className="mail-calendar-weekdays" aria-hidden="true">
        {['일', '월', '화', '수', '목', '금', '토'].map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>
      <div className="mail-calendar-grid">
        {calendarDays.map((day) => {
          const className = [
            'mail-calendar-day',
            day.inCurrentMonth ? '' : 'mail-calendar-day-muted',
            day.dateKey === selectedCalendarDate ? 'mail-calendar-day-selected' : '',
            day.dateKey === todayKey() ? 'mail-calendar-day-today' : ''
          ].filter(Boolean).join(' ');

          return (
            <button
              type="button"
              key={day.dateKey}
              className={className}
              onClick={() => onDateSelect(day.dateKey)}
            >
              <span className="mail-calendar-date">{day.dayOfMonth}</span>
            </button>
          );
        })}
      </div>
    </>
  );
}
