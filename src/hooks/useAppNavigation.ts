import { useCallback, useEffect } from 'react';
import type { NavView } from '../types';
import {
  getMailDetailIdFromPath,
  getViewFromPath,
  updateBrowserPath,
  viewPaths
} from '../utils/appNavigation';

type UseAppNavigationOptions = {
  setExpandedMailId: (emailId: string | null) => void;
  setMailDetailBackView: (view: NavView) => void;
  setNavView: (view: NavView) => void;
  setSelectedEmailId: (emailId: string) => void;
};

export function useAppNavigation({
  setExpandedMailId,
  setMailDetailBackView,
  setNavView,
  setSelectedEmailId
}: UseAppNavigationOptions) {
  const navigateToView = useCallback((view: Exclude<NavView, 'mailDetail'>, options?: { replace?: boolean }) => {
    setExpandedMailId(null);
    setNavView(view);
    updateBrowserPath(viewPaths[view], options?.replace);
  }, [setExpandedMailId, setNavView]);

  useEffect(() => {
    const handlePopState = () => {
      const detailEmailId = getMailDetailIdFromPath();
      if (detailEmailId) {
        setSelectedEmailId(detailEmailId);
        setExpandedMailId(null);
        setMailDetailBackView('allMail');
        setNavView('mailDetail');
        return;
      }
      setExpandedMailId(null);
      setNavView(getViewFromPath());
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [setExpandedMailId, setMailDetailBackView, setNavView, setSelectedEmailId]);

  return navigateToView;
}
