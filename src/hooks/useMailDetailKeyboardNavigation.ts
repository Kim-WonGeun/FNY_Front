import { useEffect } from 'react';
import type { EmailListItem } from '../types';

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  const tagName = target.tagName.toLowerCase();
  return tagName === 'input' || tagName === 'textarea' || tagName === 'select' || target.isContentEditable;
}

type UseMailDetailKeyboardNavigationOptions = {
  nextEmail: EmailListItem | null;
  previousEmail: EmailListItem | null;
  onOpenEmail: (emailId: string) => void;
};

export function useMailDetailKeyboardNavigation({
  nextEmail,
  previousEmail,
  onOpenEmail
}: UseMailDetailKeyboardNavigationOptions) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || isEditableTarget(event.target)) {
        return;
      }
      if (event.key === 'ArrowLeft' && previousEmail) {
        event.preventDefault();
        onOpenEmail(previousEmail.id);
      }
      if (event.key === 'ArrowRight' && nextEmail) {
        event.preventDefault();
        onOpenEmail(nextEmail.id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextEmail, onOpenEmail, previousEmail]);
}
