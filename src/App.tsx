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
import {
  fetchAllEmails,
  fetchMailAccounts,
  fetchMailboxOverview
} from './api/mailbox';
import { FilterChip } from './components/common';
import { AppHeader } from './components/AppHeader';
import { AppRoutes } from './components/AppRoutes';
import { AppSidebar } from './components/AppSidebar';
import type { HomeDashboardPageProps } from './components/HomeDashboardPage';
import { LoginScreen } from './components/LoginScreen';
import type { MailDetailPageProps } from './components/MailDetailPage';
import type { MailboxPageProps } from './components/MailboxPage';
import { useAppPreferences } from './hooks/useAppPreferences';
import { useAppNavigation } from './hooks/useAppNavigation';
import { useApiErrorParser } from './hooks/useApiErrorParser';
import { useAllMailReload } from './hooks/useAllMailReload';
import { useAllMailControls } from './hooks/useAllMailControls';
import { useHomeDashboardControls } from './hooks/useHomeDashboardControls';
import { useMailAnalysis } from './hooks/useMailAnalysis';
import { useMailboxBootstrap } from './hooks/useMailboxBootstrap';
import { useMailDetailEffects } from './hooks/useMailDetailEffects';
import { useMailSync } from './hooks/useMailSync';
import { useMailboxViews } from './hooks/useMailboxViews';
import { useWeeklyReports } from './hooks/useWeeklyReports';
import {
  getFirstEmailId,
  getPageForEmailId,
  resolveSelectedEmailId
} from './utils/mailPagination';
import {
  getFallbackMailAccount,
  getPrimaryMailAccount
} from './utils/mailAccounts';
import { findAdjacentMailItems, findSelectedMailItem } from './utils/mailSelection';
import {
  normalizeEmailList,
  normalizeOverview
} from './utils/mailNormalizers';
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
  const {
    analysisQueueFilter,
    calendarListScrollTop,
    calendarMonth,
    calendarPickerOpen,
    listQuery,
    selectedCalendarDate,
    setAnalysisQueueFilter,
    setCalendarMonth,
    setCalendarPickerOpen,
    setCalendarListScrollTop,
    setListQuery,
    setSelectedCalendarDate,
    setSpotlightFilter,
    spotlightFilter
  } = useHomeDashboardControls();
  const {
    allMailAdvancedSearchOpen,
    allMailEndDate,
    allMailPage,
    allMailQuery,
    allMailSearchBody,
    allMailSenderQuery,
    allMailStartDate,
    allMailScrollTop,
    mailboxAnalysisFilter,
    mailboxCategory,
    mailboxStatusFilterOpen,
    prepareAnalysisFilter,
    prepareReportSourceOpen,
    resetAllMailFilters,
    resetAllMailSearchFields,
    setAllMailAdvancedSearchOpen,
    setAllMailEndDate,
    setAllMailPage,
    setAllMailQuery,
    setAllMailSearchBody,
    setAllMailSenderQuery,
    setAllMailStartDate,
    setAllMailScrollTop,
    setMailboxAnalysisFilter,
    setMailboxCategory,
    setMailboxStatusFilterOpen
  } = useAllMailControls();

  const {
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
      resetAutoSync();
    },
    [primaryMailAccountId, resetAutoSync]
  );

  const navigateToView = useAppNavigation({
    setExpandedMailId,
    setMailDetailBackView,
    setNavView,
    setSelectedEmailId
  });

  const parseApiError = useApiErrorParser(authSession, resetAuthSession);

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
    spotlightFilter,
    listQuery,
    calendarMonth,
    selectedCalendarDate,
    allMailQuery,
    allMailSenderQuery,
    allMailStartDate,
    allMailEndDate,
    allMailSearchBody,
    allMailPage,
    mailboxCategory,
    mailboxAnalysisFilter,
    analysisQueueFilter,
    setCalendarMonth,
    setSelectedCalendarDate,
    setAllMailStartDate,
    setAllMailEndDate,
    setAllMailAdvancedSearchOpen,
    setAllMailPage,
    setSelectedEmailId,
    setExpandedMailId
  });

  const {
    loadEmailDetail,
    loadAnalysisHistory,
    loadAgentHealth,
    requestEmailAnalysis,
    saveAnalysisFeedback,
    updateAttentionStatus
  } = useMailAnalysis({
    authSession,
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

  async function loadOverview(targetUserId: string) {
    setLoadState('loading');
    setErrorMessage(null);

    try {
      const data = await fetchMailboxOverview(parseApiError);
      const normalized = normalizeOverview(data);
      setOverview(normalized);
      setSelectedEmailId((current) =>
        navView === 'mailDetail' ? current : resolveSelectedEmailId(normalized.spotlightEmails, current)
      );
      setLoadState('ready');

      try {
        const accounts = await fetchMailAccounts();
        const primary = getPrimaryMailAccount(accounts);
        setMailAccounts(accounts);
        setPrimaryMailAccountId(primary?.id ?? null);
        setPrimaryMailAccountEmail(primary?.accountEmail ?? null);
      } catch {
        const fallbackAccount = getFallbackMailAccount(targetUserId);
        setMailAccounts([]);
        setPrimaryMailAccountId(fallbackAccount.id);
        setPrimaryMailAccountEmail(fallbackAccount.email);
      }
      void loadAllEmails(targetUserId, { resetExpanded: false });
    } catch (error) {
      const fallbackAccount = getFallbackMailAccount(targetUserId);
      setOverview({ ...sampleOverview, userId: targetUserId });
      setAllEmails((current) => (navView === 'mailDetail' ? current : sampleOverview.spotlightEmails));
      setSelectedEmailId((current) =>
        navView === 'mailDetail' ? current : getFirstEmailId(sampleOverview.spotlightEmails)
      );
      setLoadState('fallback');
      setErrorMessage(error instanceof Error ? error.message : 'Unknown error');
      setPrimaryMailAccountId(fallbackAccount.id);
      setPrimaryMailAccountEmail(fallbackAccount.email);
      setMailAccounts([]);
    }
  }

  useAllMailReload({
    allMailEndDate,
    allMailQuery,
    allMailSearchBody,
    allMailSenderQuery,
    allMailStartDate,
    authSession,
    loadAllEmails,
    navView,
    userId
  });

  async function loadAllEmails(targetUserId: string, options?: { resetExpanded?: boolean }) {
    setAllMailLoadState('loading');
    setAllMailError(null);

    try {
      const data = await fetchAllEmails(
        {
          query: allMailQuery,
          sender: allMailSenderQuery,
          startDate: allMailStartDate,
          endDate: allMailEndDate,
          searchBody: allMailSearchBody
        },
        parseApiError
      );
      const normalized = normalizeEmailList(data);
      setAllEmails(normalized);
      setAllMailPage(1);
      if (options?.resetExpanded !== false) {
        setExpandedMailId(null);
      }
      setSelectedEmailId((current) =>
        navView === 'mailDetail' ? current : resolveSelectedEmailId(normalized, current)
      );
      setAllMailLoadState('ready');
    } catch (error) {
      setAllEmails((current) => (navView === 'mailDetail' ? current : sampleOverview.spotlightEmails));
      setAllMailPage(1);
      setExpandedMailId(null);
      setSelectedEmailId((current) =>
        navView === 'mailDetail' ? current : getFirstEmailId(sampleOverview.spotlightEmails)
      );
      setAllMailLoadState('fallback');
      setAllMailError(error instanceof Error ? error.message : 'Unknown error');
    }
  }

  async function startGmailLogin() {
    setAuthState('loading');
    setAuthError(null);
    window.location.href = '/oauth2/authorization/google';
  }

  function openMailboxForAnalysis(filter: AnalysisQueueFilter) {
    prepareAnalysisFilter(filter);
    setExpandedMailId(null);
    navigateToView('allMail');
  }

  function toggleEmailDetail(emailId: string) {
    openEmailDetail(emailId);
  }

  function resolveDetailSequence(backView: NavView) {
    if (backView === 'allMail') {
      return filteredAllEmails;
    }
    if (backView === 'home') {
      return filteredSpotlight;
    }
    return sortedAllEmails;
  }

  function openEmailDetail(emailId: string, options?: { backView?: NavView; sequence?: EmailListItem[] }) {
    const backView = options?.backView ?? (navView === 'mailDetail' ? mailDetailBackView : navView);
    const currentDetailSequence = navView === 'mailDetail' ? mailDetailSequence : [];
    const sequence = options?.sequence ??
      (currentDetailSequence.some((email) => email.id === emailId) ? currentDetailSequence : resolveDetailSequence(backView));

    setSelectedEmailId(emailId);
    setExpandedMailId(null);
    setMailDetailBackView(backView);
    setMailDetailSequence(sequence.some((email) => email.id === emailId) ? sequence : []);
    setNavView('mailDetail');
    updateBrowserPath(`/mail/${encodeURIComponent(emailId)}`);
  }

  function closeEmailDetail() {
    setExpandedMailId(null);
    navigateToView(mailDetailBackView === 'mailDetail' ? 'allMail' : mailDetailBackView);
  }

  function changeAllMailPage(page: number) {
    setAllMailPage(page);
    setAllMailScrollTop(0);
    setExpandedMailId(null);
  }

  function openReportSourceEmail(emailId: string) {
    const page = getPageForEmailId(sortedAllEmails, emailId, ALL_MAIL_PAGE_SIZE);
    prepareReportSourceOpen(page);
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
    onUpdateAttentionStatus: updateAttentionStatus,
    onSaveAnalysisFeedback: saveAnalysisFeedback
  };

  const selectedMailItem =
    findSelectedMailItem(selectedEmailId, allEmails, sortedEmails, overview) ??
    mailDetailSequence.find((email) => email.id === selectedEmailId) ??
    null;
  const fallbackDetailSequence = resolveDetailSequence(mailDetailBackView);
  const detailEmailSequence = mailDetailSequence.some((email) => email.id === selectedEmailId)
    ? mailDetailSequence
    : fallbackDetailSequence;
  const { previousEmail, nextEmail } = findAdjacentMailItems(selectedEmailId, detailEmailSequence);

  const homeDashboardProps: HomeDashboardPageProps = {
    syncState,
    loadState,
    errorMessage,
    overview,
    mailboxCounts,
    analysisQueueCounts,
    tabCounts,
    spotlightFilter,
    listQuery,
    calendarMonth,
    calendarYear,
    calendarMonthNumber,
    calendarPickerOpen,
    calendarListScrollTop,
    calendarDays,
    selectedCalendarDate,
    selectedCalendarEmails,
    filteredSpotlight,
    processedTodayEmails,
    analysisSkippedReasonStats,
    analysisQueueFilter,
    analysisQueueEmails,
    expandedMailId,
    emailDetail,
    mailRow: mailRowRuntimeProps,
    onSync: () => void syncGmail(),
    onSpotlightFilterChange: setSpotlightFilter,
    onListQueryChange: setListQuery,
    onCalendarPickerOpenChange: setCalendarPickerOpen,
    onCalendarMonthChange: changeCalendarMonth,
    onCalendarDateSelect: selectCalendarDate,
    onCalendarListScrollTopChange: setCalendarListScrollTop,
    onTodaySelect: () => {
      setCalendarListScrollTop(0);
      selectTodayInCalendar();
    },
    onOpenEmail: (emailId, sequence) => openEmailDetail(emailId, { backView: 'home', sequence }),
    onToggleEmailDetail: toggleEmailDetail,
    onAnalysisQueueFilterChange: setAnalysisQueueFilter,
    onOpenMailboxForAnalysis: openMailboxForAnalysis
  };

  const mailboxPageProps: MailboxPageProps = {
    loadState: allMailLoadState,
    allEmailsCount: allEmails.length,
    errorMessage: allMailError,
    category: mailboxCategory,
    analysisFilter: mailboxAnalysisFilter,
    statusFilterOpen: mailboxStatusFilterOpen,
    mailboxCounts,
    analysisCounts: mailboxAnalysisCounts,
    advancedSearchOpen: allMailAdvancedSearchOpen,
    query: allMailQuery,
    senderQuery: allMailSenderQuery,
    datePreset: mailboxDatePreset,
    startDate: allMailStartDate,
    endDate: allMailEndDate,
    searchBody: allMailSearchBody,
    page: allMailPage,
    totalPages: allMailTotalPages,
    filteredCount: filteredAllEmails.length,
    pagedEmails: pagedAllEmails,
    selectedEmailId,
    scrollTop: allMailScrollTop,
    expandedMailId,
    emailDetail,
    ...mailRowRuntimeProps,
    onCategoryChange: setMailboxCategory,
    onAnalysisFilterChange: setMailboxAnalysisFilter,
    onStatusFilterOpenChange: setMailboxStatusFilterOpen,
    onAdvancedSearchOpenChange: setAllMailAdvancedSearchOpen,
    onQueryChange: setAllMailQuery,
    onDatePresetChange: applyMailboxDatePreset,
    onSenderQueryChange: setAllMailSenderQuery,
    onStartDateChange: setAllMailStartDate,
    onEndDateChange: setAllMailEndDate,
    onSearchBodyChange: setAllMailSearchBody,
    onSearchReset: resetAllMailSearchFields,
    onPageChange: changeAllMailPage,
    onResetFilters: resetAllMailFilters,
    onRequestAnalysis: requestEmailAnalysis,
    onUpdateAttentionStatus: updateAttentionStatus,
    onSaveAnalysisFeedback: saveAnalysisFeedback,
    onToggleEmailDetail: toggleEmailDetail,
    onScrollTopChange: setAllMailScrollTop
  };

  const mailDetailPageProps: MailDetailPageProps = {
    email: selectedMailItem,
    previousEmail,
    nextEmail,
    detail: emailDetail?.id === selectedEmailId ? emailDetail : null,
    detailLoadState,
    detailErrorMessage,
    theme,
    originalMailDefaultOpen,
    analysisSubmitting: analysisRequestingId === selectedEmailId,
    agentHealth,
    attentionUpdating: attentionUpdatingId === selectedEmailId,
    feedbackSavingId: analysisFeedbackSavingId,
    feedbackMessages: analysisFeedbackMessages,
    analysisHistory: selectedEmailId ? analysisHistory[selectedEmailId] ?? [] : [],
    analysisHistoryState: selectedEmailId ? analysisHistoryState[selectedEmailId] ?? 'idle' : 'idle',
    onBack: closeEmailDetail,
    onOpenEmail: openEmailDetail,
    onRetry: () => {
      if (selectedEmailId) {
        void loadEmailDetail(selectedEmailId);
      }
    },
    onRequestAnalysis: requestEmailAnalysis,
    onUpdateAttentionStatus: updateAttentionStatus,
    onSaveAnalysisFeedback: saveAnalysisFeedback
  };

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
