import { todayKey } from '../utils/date';

type UseMailboxCalendarActionsOptions = {
  setCalendarMonth: (monthKey: string) => void;
  setExpandedMailId: (emailId: string | null) => void;
  setSelectedCalendarDate: (dateKey: string) => void;
};

export function useMailboxCalendarActions({
  setCalendarMonth,
  setExpandedMailId,
  setSelectedCalendarDate
}: UseMailboxCalendarActionsOptions) {
  const changeCalendarMonth = (monthKey: string) => {
    setCalendarMonth(monthKey);
    setSelectedCalendarDate(`${monthKey}-01`);
    setExpandedMailId(null);
  };

  const selectCalendarDate = (dateKey: string) => {
    setSelectedCalendarDate(dateKey);
    setCalendarMonth(dateKey.slice(0, 7));
    setExpandedMailId(null);
  };

  const selectTodayInCalendar = () => {
    const today = todayKey();
    setCalendarMonth(today.slice(0, 7));
    setSelectedCalendarDate(today);
  };

  return {
    changeCalendarMonth,
    selectCalendarDate,
    selectTodayInCalendar
  };
}
