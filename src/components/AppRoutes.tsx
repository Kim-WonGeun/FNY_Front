import type { AuthSession, LoadState, MailAccountSummary, MailDensity, NavView, ReportType, WeeklyLoadState, WeeklyReport } from '../types';
import { AccountsPage } from './AccountsPage';
import { HomeDashboardPage, type HomeDashboardPageProps } from './HomeDashboardPage';
import { MailboxPage, type MailboxPageProps } from './MailboxPage';
import { SettingsPage } from './SettingsPage';
import {
  WeeklyReportsPage,
  type WeeklyReportControlsProps,
  type WeeklyReportHistoryProps
} from './WeeklyReportsPage';
import type { WeeklyReportDraftProps, WeeklyReportSourcesProps } from './WeeklyReportView';

type AppRoutesProps = {
  navView: NavView;
  homeDashboardProps: HomeDashboardPageProps;
  weekly: {
    primaryMailAccountId: string | null;
    weeklyReport: WeeklyReport | null;
    weeklyLoadState: WeeklyLoadState;
    weeklyError: string | null;
    selectedReportType: ReportType;
    includedWeeklyThreads: WeeklyReport['threadSummaries'];
    excludedWeeklySourceIds: string[];
    weeklyDraftDirty: boolean;
    history: WeeklyReportHistoryProps;
    controls: WeeklyReportControlsProps;
    draft: WeeklyReportDraftProps;
    sources: WeeklyReportSourcesProps;
  };
  accounts: {
    authSession: AuthSession;
    mailAccounts: MailAccountSummary[];
    primaryMailAccountId: string | null;
    primaryMailAccountEmail: string | null;
    syncState: LoadState;
    onSync: () => void;
  };
  settings: {
    theme: 'light' | 'dark';
    mailDensity: MailDensity;
    originalMailDefaultOpen: boolean;
    onThemeChange: (theme: 'light' | 'dark') => void;
    onMailDensityChange: (density: MailDensity) => void;
    onOriginalMailDefaultOpenChange: (open: boolean) => void;
    onLogout: () => void;
  };
  mailboxPageProps: MailboxPageProps;
};

export function AppRoutes({ navView, homeDashboardProps, weekly, accounts, settings, mailboxPageProps }: AppRoutesProps) {
  if (navView === 'home') {
    return <HomeDashboardPage {...homeDashboardProps} />;
  }

  if (navView === 'weekly') {
    return (
      <WeeklyReportsPage
        primaryMailAccountId={weekly.primaryMailAccountId}
        weeklyReport={weekly.weeklyReport}
        weeklyLoadState={weekly.weeklyLoadState}
        weeklyError={weekly.weeklyError}
        selectedReportType={weekly.selectedReportType}
        includedWeeklyThreads={weekly.includedWeeklyThreads}
        excludedWeeklySourceIds={weekly.excludedWeeklySourceIds}
        weeklyDraftDirty={weekly.weeklyDraftDirty}
        history={weekly.history}
        controls={weekly.controls}
        draft={weekly.draft}
        sources={weekly.sources}
      />
    );
  }

  if (navView === 'accounts') {
    return <AccountsPage {...accounts} />;
  }

  if (navView === 'settings') {
    return <SettingsPage {...settings} />;
  }

  return <MailboxPage {...mailboxPageProps} />;
}
