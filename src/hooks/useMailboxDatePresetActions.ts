import type { MailboxDatePreset } from '../types';
import {
  addDays,
  toDateInputValue,
  todayKey
} from '../utils/date';

type UseMailboxDatePresetActionsOptions = {
  setAllMailAdvancedSearchOpen: (open: boolean) => void;
  setAllMailEndDate: (date: string) => void;
  setAllMailStartDate: (date: string) => void;
};

export function useMailboxDatePresetActions({
  setAllMailAdvancedSearchOpen,
  setAllMailEndDate,
  setAllMailStartDate
}: UseMailboxDatePresetActionsOptions) {
  const applyMailboxDatePreset = (preset: MailboxDatePreset) => {
    const today = todayKey();

    if (preset === 'all') {
      setAllMailStartDate('');
      setAllMailEndDate('');
      return;
    }

    if (preset === 'today') {
      setAllMailStartDate(today);
      setAllMailEndDate(today);
      return;
    }

    if (preset === 'week') {
      setAllMailStartDate(toDateInputValue(addDays(new Date(), -6)));
      setAllMailEndDate(today);
      return;
    }

    if (preset === 'month') {
      setAllMailStartDate(toDateInputValue(addDays(new Date(), -29)));
      setAllMailEndDate(today);
      return;
    }

    setAllMailAdvancedSearchOpen(true);
  };

  return { applyMailboxDatePreset };
}
