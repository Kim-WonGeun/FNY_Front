import { useEffect, useState } from 'react';
import {
  MAIL_DENSITY_STORAGE_KEY,
  ORIGINAL_MAIL_OPEN_STORAGE_KEY,
  SIDEBAR_PINNED_STORAGE_KEY,
  THEME_STORAGE_KEY
} from '../constants';
import type { MailDensity } from '../types';
import {
  readStoredMailDensity,
  readStoredOriginalMailOpen,
  readStoredSidebarPinned,
  readStoredTheme
} from '../utils/storage';

export function useAppPreferences() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => readStoredTheme());
  const [mailDensity, setMailDensity] = useState<MailDensity>(() => readStoredMailDensity());
  const [originalMailDefaultOpen, setOriginalMailDefaultOpen] = useState(() => readStoredOriginalMailOpen());
  const [sidebarPinned, setSidebarPinned] = useState(() => readStoredSidebarPinned());

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem(MAIL_DENSITY_STORAGE_KEY, mailDensity);
  }, [mailDensity]);

  useEffect(() => {
    localStorage.setItem(ORIGINAL_MAIL_OPEN_STORAGE_KEY, String(originalMailDefaultOpen));
  }, [originalMailDefaultOpen]);

  useEffect(() => {
    localStorage.setItem(SIDEBAR_PINNED_STORAGE_KEY, String(sidebarPinned));
  }, [sidebarPinned]);

  return {
    theme,
    setTheme,
    mailDensity,
    setMailDensity,
    originalMailDefaultOpen,
    setOriginalMailDefaultOpen,
    sidebarPinned,
    setSidebarPinned
  };
}
