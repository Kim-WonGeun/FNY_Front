import type { NavView } from '../types';

export const viewPaths: Record<Exclude<NavView, 'mailDetail'>, string> = {
  home: '/',
  weekly: '/reports',
  allMail: '/mailbox',
  accounts: '/accounts',
  settings: '/settings'
};

export function getMailDetailIdFromPath(pathname = window.location.pathname) {
  if (!pathname.startsWith('/mail/')) {
    return null;
  }
  const emailId = pathname.slice('/mail/'.length).split('/')[0];
  return emailId ? decodeURIComponent(emailId) : null;
}

export function getViewFromPath(pathname = window.location.pathname): NavView {
  if (getMailDetailIdFromPath(pathname)) {
    return 'mailDetail';
  }
  if (pathname.startsWith('/reports')) {
    return 'weekly';
  }
  if (pathname.startsWith('/mailbox')) {
    return 'allMail';
  }
  if (pathname.startsWith('/accounts')) {
    return 'accounts';
  }
  if (pathname.startsWith('/settings')) {
    return 'settings';
  }
  return 'home';
}

export function updateBrowserPath(path: string, replace = false) {
  if (window.location.pathname === path) {
    return;
  }
  const nextUrl = `${path}${window.location.search}${window.location.hash}`;
  if (replace) {
    window.history.replaceState(null, '', nextUrl);
    return;
  }
  window.history.pushState(null, '', nextUrl);
}
