import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  AgentHealth,
  AnalysisFeedbackMessage,
  AnalysisQueueFilter,
  ApiErrorPayload,
  AuthSession,
  DetailLoadState,
  EmailAnalysis,
  EmailDetail,
  EmailListItem,
  LoadState,
  MailAccountSummary,
  MailboxAnalysisFilter,
  MailboxCategory,
  MailboxOverview,
  NavView,
  SpotlightFilter
} from './types';
import {
  ALL_MAIL_PAGE_SIZE,
  AUTH_STORAGE_KEY,
  DEFAULT_PRIMARY_MAIL_ACCOUNT_ID,
  DEFAULT_USER_ID
} from './constants';
import { todayKey } from './utils/date';
import {
  autoSyncMarkerKey,
  readStoredAuthSession
} from './utils/storage';
import {
  syncMailAccount
} from './api/analysis';
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
import type { MailboxPageProps } from './components/MailboxPage';
import { useAppPreferences } from './hooks/useAppPreferences';
import { useMailAnalysis } from './hooks/useMailAnalysis';
import { useMailboxViews } from './hooks/useMailboxViews';
import { useWeeklyReports } from './hooks/useWeeklyReports';
import {
  getFirstEmailId,
  getPageForEmailId,
  normalizeEmailList,
  normalizeOverview,
  resolveSelectedEmailId,
} from './utils/mailbox';
import { sampleDetails, sampleOverview } from './data/sampleMailbox';

function App() {
  const detailRequestSeq = useRef(0);
  const syncRequestInFlight = useRef(false);
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
  const [selectedEmailId, setSelectedEmailId] = useState(getFirstEmailId(sampleOverview.spotlightEmails));
  const [emailDetail, setEmailDetail] = useState<EmailDetail | null>(sampleDetails.EML_260409_A00001);
  const [detailLoadState, setDetailLoadState] = useState<DetailLoadState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [detailErrorMessage, setDetailErrorMessage] = useState<string | null>(null);
  const [spotlightFilter, setSpotlightFilter] = useState<SpotlightFilter>('all');
  const [listQuery, setListQuery] = useState('');
  const [primaryMailAccountId, setPrimaryMailAccountId] = useState<string | null>(
    authSession?.mailAccountId ?? DEFAULT_PRIMARY_MAIL_ACCOUNT_ID
  );
  const [primaryMailAccountEmail, setPrimaryMailAccountEmail] = useState<string | null>(
    authSession?.accountEmail ?? 'user1@test.com'
  );
  const [mailAccounts, setMailAccounts] = useState<MailAccountSummary[]>([]);
  const [navView, setNavView] = useState<NavView>('home');
  const [allEmails, setAllEmails] = useState<EmailListItem[]>(sampleOverview.spotlightEmails);
  const [allMailLoadState, setAllMailLoadState] = useState<LoadState>('idle');
  const [allMailError, setAllMailError] = useState<string | null>(null);
  const [allMailQuery, setAllMailQuery] = useState('');
  const [allMailSenderQuery, setAllMailSenderQuery] = useState('');
  const [allMailStartDate, setAllMailStartDate] = useState('');
  const [allMailEndDate, setAllMailEndDate] = useState('');
  const [allMailSearchBody, setAllMailSearchBody] = useState(false);
  const [allMailAdvancedSearchOpen, setAllMailAdvancedSearchOpen] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(() => todayKey().slice(0, 7));
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(todayKey());
  const [calendarPickerOpen, setCalendarPickerOpen] = useState(false);
  const [expandedMailId, setExpandedMailId] = useState<string | null>(null);
  const [allMailPage, setAllMailPage] = useState(1);
  const [mailboxCategory, setMailboxCategory] = useState<MailboxCategory>('all');
  const [mailboxAnalysisFilter, setMailboxAnalysisFilter] = useState<MailboxAnalysisFilter>('all');
  const [mailboxStatusFilterOpen, setMailboxStatusFilterOpen] = useState(false);
  const [analysisQueueFilter, setAnalysisQueueFilter] = useState<AnalysisQueueFilter>('candidate');
  const [syncState, setSyncState] = useState<LoadState>('idle');
  const [autoSyncDone, setAutoSyncDone] = useState(false);
  const [analysisRequestingId, setAnalysisRequestingId] = useState<string | null>(null);
  const [attentionUpdatingId, setAttentionUpdatingId] = useState<string | null>(null);
  const [agentHealth, setAgentHealth] = useState<AgentHealth | null>(null);
  const [analysisFeedbackSavingId, setAnalysisFeedbackSavingId] = useState<string | null>(null);
  const [analysisFeedbackMessages, setAnalysisFeedbackMessages] = useState<Record<string, AnalysisFeedbackMessage>>({});
  const [analysisHistory, setAnalysisHistory] = useState<Record<string, EmailAnalysis[]>>({});
  const [analysisHistoryState, setAnalysisHistoryState] = useState<Record<string, LoadState>>({});

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
      setAuthState('idle');
      setAuthError(message ?? null);
      setAutoSyncDone(false);
    },
    [primaryMailAccountId]
  );

  const parseApiError = useCallback(async (response: Response, fallbackMessage?: string) => {
    let payload: ApiErrorPayload | null = null;
    try {
      payload = (await response.json()) as ApiErrorPayload;
    } catch {
      payload = null;
    }

    const message = payload?.message?.trim() || fallbackMessage || `API returned ${response.status}`;
    if (authSession && (response.status === 401 || response.status === 403)) {
      resetAuthSession('로그인 세션이 만료되었습니다. Gmail로 다시 로그인해 주세요.');
    }
    if (
      authSession &&
      response.status === 404 &&
      payload?.code === 'MAILBOX_RESOURCE_NOT_FOUND' &&
      message.includes('사용자를 찾을 수 없습니다')
    ) {
      resetAuthSession('서버가 다시 시작되어 로그인 세션이 초기화되었습니다. Gmail로 다시 로그인해 주세요.');
    }

    return new Error(message);
  }, [authSession, resetAuthSession]);

  useEffect(() => {
    if (!authSession) {
      return;
    }
    void loadOverview(userId);
    void loadAgentHealth();
  }, [authSession, userId]);

  useEffect(() => {
    if (!authSession || autoSyncDone || !primaryMailAccountId) {
      return;
    }
    const markerKey = autoSyncMarkerKey(primaryMailAccountId);
    if (localStorage.getItem(markerKey) === todayKey()) {
      setAutoSyncDone(true);
      return;
    }
    setAutoSyncDone(true);
    void syncGmail({ silent: true });
  }, [authSession, autoSyncDone, primaryMailAccountId]);

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

  useEffect(() => {
    if (selectedEmailId && expandedMailId === selectedEmailId) {
      void loadEmailDetail(selectedEmailId);
    }
  }, [selectedEmailId, expandedMailId]);

  useEffect(() => {
    if (expandedMailId && emailDetail?.id === expandedMailId && emailDetail.analysis) {
      void loadAnalysisHistory(expandedMailId);
    }
  }, [expandedMailId, emailDetail?.id, emailDetail?.analysis?.id]);

  async function loadOverview(targetUserId: string) {
    setLoadState('loading');
    setErrorMessage(null);

    try {
      const data = await fetchMailboxOverview(parseApiError);
      const normalized = normalizeOverview(data);
      setOverview(normalized);
      setSelectedEmailId((current) => resolveSelectedEmailId(normalized.spotlightEmails, current));
      setLoadState('ready');

      try {
        const accounts = await fetchMailAccounts();
        const primary = accounts.find((a) => a.primary) ?? accounts[0];
        setMailAccounts(accounts);
        setPrimaryMailAccountId(primary?.id ?? null);
        setPrimaryMailAccountEmail(primary?.accountEmail ?? null);
      } catch {
        setMailAccounts([]);
        setPrimaryMailAccountId(
          targetUserId === DEFAULT_USER_ID ? DEFAULT_PRIMARY_MAIL_ACCOUNT_ID : null
        );
        setPrimaryMailAccountEmail(targetUserId === DEFAULT_USER_ID ? 'user1@test.com' : null);
      }
      void loadAllEmails(targetUserId, { resetExpanded: false });
    } catch (error) {
      setOverview({ ...sampleOverview, userId: targetUserId });
      setAllEmails(sampleOverview.spotlightEmails);
      setSelectedEmailId(getFirstEmailId(sampleOverview.spotlightEmails));
      setLoadState('fallback');
      setErrorMessage(error instanceof Error ? error.message : 'Unknown error');
      setPrimaryMailAccountId(
        targetUserId === DEFAULT_USER_ID ? DEFAULT_PRIMARY_MAIL_ACCOUNT_ID : null
      );
      setPrimaryMailAccountEmail(targetUserId === DEFAULT_USER_ID ? 'user1@test.com' : null);
      setMailAccounts([]);
    }
  }

  useEffect(() => {
    if (!authSession || navView !== 'allMail') {
      return;
    }
    void loadAllEmails(userId);
  }, [authSession, navView, userId]);

  useEffect(() => {
    if (!authSession || navView !== 'allMail') {
      return;
    }
    if (!allMailSearchBody) {
      void loadAllEmails(userId, { resetExpanded: false });
      return;
    }

    const timeoutId = window.setTimeout(() => {
      void loadAllEmails(userId, { resetExpanded: false });
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [authSession, navView, userId, allMailSearchBody, allMailQuery, allMailSenderQuery, allMailStartDate, allMailEndDate]);

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
      setSelectedEmailId((current) => resolveSelectedEmailId(normalized, current));
      setAllMailLoadState('ready');
    } catch (error) {
      setAllEmails(sampleOverview.spotlightEmails);
      setAllMailPage(1);
      setExpandedMailId(null);
      setSelectedEmailId(getFirstEmailId(sampleOverview.spotlightEmails));
      setAllMailLoadState('fallback');
      setAllMailError(error instanceof Error ? error.message : 'Unknown error');
    }
  }

  async function syncGmail(options?: { silent?: boolean }) {
    if (!primaryMailAccountId) {
      setSyncState('error');
      return;
    }
    if (syncRequestInFlight.current) {
      return;
    }
    syncRequestInFlight.current = true;

    setSyncState('loading');
    try {
      await syncMailAccount(primaryMailAccountId);
      if (options?.silent && primaryMailAccountId) {
        localStorage.setItem(autoSyncMarkerKey(primaryMailAccountId), todayKey());
      }
      setSyncState('ready');
      await loadOverview(userId);
      if (navView === 'allMail') {
        await loadAllEmails(userId);
      }
    } catch (error) {
      setSyncState('error');
    } finally {
      syncRequestInFlight.current = false;
    }
  }

  async function startGmailLogin() {
    setAuthState('loading');
    setAuthError(null);
    window.location.href = '/oauth2/authorization/google';
  }

  function openMailboxForAnalysis(filter: AnalysisQueueFilter) {
    setMailboxCategory('all');
    setMailboxAnalysisFilter(filter);
    setMailboxStatusFilterOpen(true);
    setAllMailPage(1);
    setExpandedMailId(null);
    setNavView('allMail');
  }

  function resetAllMailSearchFields() {
    setAllMailQuery('');
    setAllMailSenderQuery('');
    setAllMailStartDate('');
    setAllMailEndDate('');
    setAllMailSearchBody(false);
  }

  function toggleEmailDetail(emailId: string) {
    setSelectedEmailId(emailId);
    setExpandedMailId((current) => (current === emailId ? null : emailId));
  }

  function changeAllMailPage(page: number) {
    setAllMailPage(page);
    setExpandedMailId(null);
  }

  function openReportSourceEmail(emailId: string) {
    setMailboxCategory('all');
    setMailboxAnalysisFilter('all');
    setMailboxStatusFilterOpen(false);
    resetAllMailSearchFields();
    setSelectedEmailId(emailId);
    setExpandedMailId(emailId);
    setAllMailPage(getPageForEmailId(sortedAllEmails, emailId, ALL_MAIL_PAGE_SIZE));
    setNavView('allMail');
  }

  function resetAllMailFilters() {
    setMailboxCategory('all');
    setMailboxAnalysisFilter('all');
    resetAllMailSearchFields();
    setAllMailPage(1);
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
    onTodaySelect: selectTodayInCalendar,
    onOpenEmail: openReportSourceEmail,
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
    onToggleEmailDetail: toggleEmailDetail
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
        onNavViewChange={setNavView}
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
            mailboxPageProps={mailboxPageProps}
          />
        </main>
      </div>
    </div>
  );
}

export default App;
