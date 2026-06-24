import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  AgentHealth,
  AnalysisFeedbackMessage,
  AnalysisQueueFilter,
  AuthSession,
  DetailLoadState,
  EmailAnalysis,
  EmailDetail,
  EmailListItem,
  LoadState,
  MailAccountSummary,
  MailboxOverview,
  NavView,
} from './types';
import {
  ALL_MAIL_PAGE_SIZE,
  AUTH_STORAGE_KEY,
  DEFAULT_PRIMARY_MAIL_ACCOUNT_ID,
  DEFAULT_USER_ID
} from './constants';
import {
  autoSyncMarkerKey,
  readStoredAuthSession
} from './utils/storage';
import {
  getMailDetailIdFromPath,
  getViewFromPath,
  updateBrowserPath
} from './utils/appNavigation';
import { FilterChip } from './components/common';
import { AppHeader } from './components/AppHeader';
import { AppRoutes } from './components/AppRoutes';
import { AppSidebar } from './components/AppSidebar';
import { LoginScreen } from './components/LoginScreen';
import { buildHomeDashboardPageProps } from './components/buildHomeDashboardPageProps';
import { buildMailDetailPageProps } from './components/buildMailDetailPageProps';
import { buildMailboxPageProps } from './components/buildMailboxPageProps';
import { useAppPreferences } from './hooks/useAppPreferences';
import { useAppNavigation } from './hooks/useAppNavigation';
import { useApiErrorParser } from './hooks/useApiErrorParser';
import { useAllMailReload } from './hooks/useAllMailReload';
import { useAllMailControls } from './hooks/useAllMailControls';
import { useHomeDashboardControls } from './hooks/useHomeDashboardControls';
import { useMailAnalysis } from './hooks/useMailAnalysis';
import { useMailboxBootstrap } from './hooks/useMailboxBootstrap';
import { useMailboxDataLoaders } from './hooks/useMailboxDataLoaders';
import { useMailDetailEffects } from './hooks/useMailDetailEffects';
import { useMailDetailNavigation } from './hooks/useMailDetailNavigation';
import { useMailDetailSelection } from './hooks/useMailDetailSelection';
import { useMailSync } from './hooks/useMailSync';
import { useMailboxViews } from './hooks/useMailboxViews';
import { useWeeklyReports } from './hooks/useWeeklyReports';
import { getFirstEmailId, getPageForEmailId } from './utils/mailPagination';
import { sampleDetails, sampleOverview } from './data/sampleMailbox';

function App() {
  const detailRequestSeq = useRef(0);
  const initialDetailEmailId = getMailDetailIdFromPath();
  const [authSession, setAuthSession] = useState<AuthSession | null>(() => readStoredAuthSession());
  const {
    theme,
    setTheme,
    mailDensity,
    setMailDensity,
    originalMailDefaultOpen,
    setOriginalMailDefaultOpen,
    sidebarPinned,
    setSidebarPinned
  } = useAppPreferences();
  const [authState, setAuthState] = useState<LoadState>('idle');
  const [authError, setAuthError] = useState<string | null>(null);
  const [userId, setUserId] = useState(() => authSession?.userId ?? DEFAULT_USER_ID);
  const [overview, setOverview] = useState<MailboxOverview>(sampleOverview);
  const [loadState, setLoadState] = useState<LoadState>('idle');
  const [selectedEmailId, setSelectedEmailId] = useState(initialDetailEmailId ?? getFirstEmailId(sampleOverview.spotlightEmails));
  const [emailDetail, setEmailDetail] = useState<EmailDetail | null>(sampleDetails.EML_260409_A00001);
  const [detailLoadState, setDetailLoadState] = useState<DetailLoadState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [detailErrorMessage, setDetailErrorMessage] = useState<string | null>(null);
  const [primaryMailAccountId, setPrimaryMailAccountId] = useState<string | null>(
    authSession?.mailAccountId ?? DEFAULT_PRIMARY_MAIL_ACCOUNT_ID
  );
  const [primaryMailAccountEmail, setPrimaryMailAccountEmail] = useState<string | null>(
    authSession?.accountEmail ?? 'user1@test.com'
  );
  const [mailAccounts, setMailAccounts] = useState<MailAccountSummary[]>([]);
  const [navView, setNavView] = useState<NavView>(() => getViewFromPath());
  const [mailDetailBackView, setMailDetailBackView] = useState<NavView>('allMail');
  const [mailDetailSequence, setMailDetailSequence] = useState<EmailListItem[]>([]);
  const [allEmails, setAllEmails] = useState<EmailListItem[]>(sampleOverview.spotlightEmails);
  const [allMailLoadState, setAllMailLoadState] = useState<LoadState>('idle');
  const [allMailError, setAllMailError] = useState<string | null>(null);
  const [expandedMailId, setExpandedMailId] = useState<string | null>(null);
  const [analysisRequestingId, setAnalysisRequestingId] = useState<string | null>(null);
  const [attentionUpdatingId, setAttentionUpdatingId] = useState<string | null>(null);
  const [agentHealth, setAgentHealth] = useState<AgentHealth | null>(null);
  const [analysisFeedbackSavingId, setAnalysisFeedbackSavingId] = useState<string | null>(null);
  const [analysisFeedbackMessages, setAnalysisFeedbackMessages] = useState<Record<string, AnalysisFeedbackMessage>>({});
  const [analysisHistory, setAnalysisHistory] = useState<Record<string, EmailAnalysis[]>>({});
  const [analysisHistoryState, setAnalysisHistoryState] = useState<Record<string, LoadState>>({});
  const homeControls = useHomeDashboardControls();
  const allMailControls = useAllMailControls();

  const resetAutoSyncRef = useRef<() => void>(() => {});
  const resetAuthSession = useCallback(
    (message?: string) => {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      if (primaryMailAccountId) {
        localStorage.removeItem(autoSyncMarkerKey(primaryMailAccountId));
      }
      setAuthSession(null);
      setUserId(DEFAULT_USER_ID);
      setPrimaryMailAccountId(DEFAULT_PRIMARY_MAIL_ACCOUNT_ID);
      setPrimaryMailAccountEmail('user1@test.com');
      setMailAccounts([]);
      setOverview(sampleOverview);
      setAllEmails(sampleOverview.spotlightEmails);
      setSelectedEmailId(getFirstEmailId(sampleOverview.spotlightEmails));
      setEmailDetail(sampleDetails.EML_260409_A00001);
      setNavView('home');
      updateBrowserPath('/', true);
      setAuthState('idle');
      setAuthError(message ?? null);
      resetAutoSyncRef.current();
    },
    [primaryMailAccountId]
  );

  const parseApiError = useApiErrorParser(authSession, resetAuthSession);
  const { loadAllEmails, loadOverview } = useMailboxDataLoaders({
    navView,
    query: allMailControls.allMailQuery,
    senderQuery: allMailControls.allMailSenderQuery,
    startDate: allMailControls.allMailStartDate,
    endDate: allMailControls.allMailEndDate,
    searchBody: allMailControls.allMailSearchBody,
    parseApiError,
    setOverview,
    setLoadState,
    setErrorMessage,
    setAllEmails,
    setAllMailLoadState,
    setAllMailError,
    setAllMailPage: allMailControls.setAllMailPage,
    setExpandedMailId,
    setSelectedEmailId,
    setMailAccounts,
    setPrimaryMailAccountId,
    setPrimaryMailAccountEmail
  });
  const {
    lastSyncResult,
    resetAutoSync,
    setSyncState,
    syncGmail,
    syncState
  } = useMailSync({
    authSession,
    loadAllEmails,
    loadOverview,
    navView,
    primaryMailAccountId,
    userId
  });
  resetAutoSyncRef.current = resetAutoSync;

  const navigateToView = useAppNavigation({
    setExpandedMailId,
    setMailDetailBackView,
    setNavView,
    setSelectedEmailId
  });

  const {
    sortedEmails,
    sortedAllEmails,
    tabCounts,
    analysisQueueCounts,
    analysisQueueEmails,
    processedTodayEmails,
    calendarDays,
    calendarYear,
    calendarMonthNumber,
    selectedCalendarEmails,
    mailboxDatePreset,
    analysisSkippedReasonStats,
    filteredSpotlight,
    filteredAllEmails,
    mailboxCounts,
    mailboxAnalysisCounts,
    allMailTotalPages,
    pagedAllEmails,
    changeCalendarMonth,
    selectCalendarDate,
    selectTodayInCalendar,
    applyMailboxDatePreset
  } = useMailboxViews({
    authSession,
    navView,
    userId,
    overview,
    allEmails,
    primaryMailAccountEmail,
    selectedEmailId,
    expandedMailId,
    spotlightFilter: homeControls.spotlightFilter,
    listQuery: homeControls.listQuery,
    calendarMonth: homeControls.calendarMonth,
    selectedCalendarDate: homeControls.selectedCalendarDate,
    allMailQuery: allMailControls.allMailQuery,
    allMailSenderQuery: allMailControls.allMailSenderQuery,
    allMailStartDate: allMailControls.allMailStartDate,
    allMailEndDate: allMailControls.allMailEndDate,
    allMailSearchBody: allMailControls.allMailSearchBody,
    allMailPage: allMailControls.allMailPage,
    mailboxCategory: allMailControls.mailboxCategory,
    mailboxAnalysisFilter: allMailControls.mailboxAnalysisFilter,
    mailboxAccountId: allMailControls.mailboxAccountId,
    analysisQueueFilter: homeControls.analysisQueueFilter,
    setCalendarMonth: homeControls.setCalendarMonth,
    setSelectedCalendarDate: homeControls.setSelectedCalendarDate,
    setAllMailStartDate: allMailControls.setAllMailStartDate,
    setAllMailEndDate: allMailControls.setAllMailEndDate,
    setAllMailAdvancedSearchOpen: allMailControls.setAllMailAdvancedSearchOpen,
    setAllMailPage: allMailControls.setAllMailPage,
    setSelectedEmailId,
    setExpandedMailId
  });

  const {
    closeEmailDetail,
    openEmailDetail,
    resolveDetailSequence,
    toggleEmailDetail
  } = useMailDetailNavigation({
    navView,
    mailDetailBackView,
    mailDetailSequence,
    filteredAllEmails,
    filteredSpotlight,
    sortedAllEmails,
    setSelectedEmailId,
    setExpandedMailId,
    setMailDetailBackView,
    setMailDetailSequence,
    setNavView,
    navigateToView
  });

  const {
    loadEmailDetail,
    loadAnalysisHistory,
    loadAgentHealth,
    requestEmailAnalysis,
    saveAnalysisFeedback,
    updateAnalysisCandidate,
    updateAttentionStatus
  } = useMailAnalysis({
    userId,
    navView,
    sortedEmails,
    allEmails,
    detailRequestSeq,
    analysisHistoryState,
    setOverview,
    setAllEmails,
    setEmailDetail,
    setDetailLoadState,
    setDetailErrorMessage,
    setAnalysisHistory,
    setAnalysisHistoryState,
    setAgentHealth,
    setAnalysisRequestingId,
    setAttentionUpdatingId,
    setAnalysisFeedbackSavingId,
    setAnalysisFeedbackMessages,
    setSyncState,
    loadOverview,
    loadAllEmails
  });

  useMailDetailEffects({
    emailDetail,
    expandedMailId,
    loadAnalysisHistory,
    loadEmailDetail,
    navView,
    selectedEmailId
  });

  useMailboxBootstrap({
    authSession,
    loadAgentHealth,
    loadOverview,
    userId
  });

  useAllMailReload({
    allMailEndDate: allMailControls.allMailEndDate,
    allMailQuery: allMailControls.allMailQuery,
    allMailSearchBody: allMailControls.allMailSearchBody,
    allMailSenderQuery: allMailControls.allMailSenderQuery,
    allMailStartDate: allMailControls.allMailStartDate,
    authSession,
    loadAllEmails,
    navView,
    userId
  });

  async function startGmailLogin() {
    setAuthState('loading');
    setAuthError(null);
    window.location.href = '/oauth2/authorization/google';
  }

  function openMailboxForAnalysis(filter: AnalysisQueueFilter) {
    allMailControls.prepareAnalysisFilter(filter);
    setExpandedMailId(null);
    navigateToView('allMail');
  }

  function changeAllMailPage(page: number) {
    allMailControls.setAllMailPage(page);
    allMailControls.setAllMailScrollTop(0);
    setExpandedMailId(null);
  }

  function openReportSourceEmail(emailId: string) {
    const page = getPageForEmailId(sortedAllEmails, emailId, ALL_MAIL_PAGE_SIZE);
    allMailControls.prepareReportSourceOpen(page);
    openEmailDetail(emailId, {
      backView: navView === 'mailDetail' ? mailDetailBackView : navView,
      sequence: sortedAllEmails
    });
  }

  function logout() {
    resetAuthSession();
  }

  const weeklyReports = useWeeklyReports({
    authSession,
    navView,
    userId,
    primaryMailAccountId,
    parseApiError,
    onOpenSourceEmail: openReportSourceEmail
  });

  const mailRowRuntimeProps = {
    detailLoadState,
    detailErrorMessage,
    theme,
    originalMailDefaultOpen,
    analysisRequestingId,
    agentHealth,
    attentionUpdatingId,
    analysisFeedbackSavingId,
    analysisFeedbackMessages,
    analysisHistory,
    analysisHistoryState,
    onRequestAnalysis: requestEmailAnalysis,
    onUpdateAnalysisCandidate: updateAnalysisCandidate,
    onUpdateAttentionStatus: updateAttentionStatus,
    onSaveAnalysisFeedback: saveAnalysisFeedback
  };

  const { selectedMailItem, previousEmail, nextEmail } = useMailDetailSelection({
    selectedEmailId,
    allEmails,
    sortedEmails,
    overview,
    mailDetailSequence,
    mailDetailBackView,
    resolveDetailSequence
  });

  const homeDashboardProps = buildHomeDashboardPageProps({
    syncState,
    lastSyncResult,
    loadState,
    errorMessage,
    overview,
    mailboxCounts,
    analysisQueueCounts,
    tabCounts,
    controls: homeControls,
    calendarYear,
    calendarMonthNumber,
    calendarDays,
    selectedCalendarEmails,
    filteredSpotlight,
    processedTodayEmails,
    analysisSkippedReasonStats,
    analysisQueueEmails,
    expandedMailId,
    emailDetail,
    mailRow: mailRowRuntimeProps,
    syncGmail,
    changeCalendarMonth,
    selectCalendarDate,
    selectTodayInCalendar,
    openEmailDetail,
    toggleEmailDetail,
    openMailboxForAnalysis
  });

  const mailboxPageProps = buildMailboxPageProps({
    loadState: allMailLoadState,
    allEmailsCount: allEmails.length,
    errorMessage: allMailError,
    controls: allMailControls,
    mailboxCounts,
    analysisCounts: mailboxAnalysisCounts,
    datePreset: mailboxDatePreset,
    totalPages: allMailTotalPages,
    filteredCount: filteredAllEmails.length,
    pagedEmails: pagedAllEmails,
    selectedEmailId,
    expandedMailId,
    emailDetail,
    runtime: mailRowRuntimeProps,
    mailAccounts,
    applyMailboxDatePreset,
    changeAllMailPage,
    onToggleEmailDetail: toggleEmailDetail
  });

  const mailDetailPageProps = buildMailDetailPageProps({
    email: selectedMailItem,
    previousEmail,
    nextEmail,
    emailDetail,
    selectedEmailId,
    runtime: mailRowRuntimeProps,
    onBack: closeEmailDetail,
    onOpenEmail: openEmailDetail,
    loadEmailDetail
  });

  if (!authSession) {
    return (
      <LoginScreen
        loading={authState === 'loading'}
        errorMessage={authError}
        onGmailLogin={() => void startGmailLogin()}
      />
    );
  }

  return (
    <div className={`app-shell density-${mailDensity}${sidebarPinned ? ' sidebar-pinned' : ' sidebar-collapsed'}`}>
      <AppSidebar
        navView={navView}
        sidebarPinned={sidebarPinned}
        onNavViewChange={(view) => {
          if (view !== 'mailDetail') {
            navigateToView(view);
          }
        }}
        onSidebarPinnedChange={setSidebarPinned}
      />

      <div className="app-main-wrap">
        <AppHeader navView={navView} authSession={authSession} onLogout={logout} />

        <main className="app-main">
          <AppRoutes
            navView={navView}
            homeDashboardProps={homeDashboardProps}
            weekly={{
              primaryMailAccountId,
              ...weeklyReports
            }}
            accounts={{
              authSession,
              mailAccounts,
              primaryMailAccountId,
              primaryMailAccountEmail,
              syncState,
              lastSyncResult,
              onSync: () => void syncGmail()
            }}
            settings={{
              theme,
              mailDensity,
              originalMailDefaultOpen,
              onThemeChange: setTheme,
              onMailDensityChange: setMailDensity,
              onOriginalMailDefaultOpenChange: setOriginalMailDefaultOpen,
              onLogout: logout
            }}
            mailDetailPageProps={mailDetailPageProps}
            mailboxPageProps={mailboxPageProps}
          />
        </main>
      </div>
    </div>
  );
}

export default App;
