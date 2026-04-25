import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

type AttentionReason = 'HIGH_PRIORITY' | 'NEEDS_REPLY' | 'UNREAD' | 'STARRED' | 'HAS_DEADLINE';
type AttentionStatus = 'NEEDS_ATTENTION' | 'REVIEWED' | 'COMPLETED' | 'DEFERRED';

type EmailListItem = {
  id: string;
  subject: string;
  snippet: string | null;
  fromName: string | null;
  fromEmail: string;
  receivedAt: string;
  read: boolean;
  starred: boolean;
  hasAttachment: boolean;
  category: string | null;
  priorityLevel: string | null;
  importanceScore: number | null;
  urgencyScore: number | null;
  shortSummary: string | null;
  needsReply: boolean | null;
  analysisEligible: boolean;
  analysisCandidateScore: number | null;
  analysisCandidateReasons: string | null;
  analysisSkippedReason: string | null;
  analysisCandidateEvaluatedAt: string | null;
  attentionResolved: boolean;
  attentionResolvedAt: string | null;
  attentionStatus: AttentionStatus;
  attentionStatusUpdatedAt: string | null;
  attentionReasons: AttentionReason[];
};

type MailboxOverview = {
  userId: string;
  totalEmails: number;
  unreadEmails: number;
  needsReplyEmails: number;
  highPriorityEmails: number;
  pendingAnalysisJobs: number;
  spotlightEmails: EmailListItem[];
};

type LoadState = 'idle' | 'loading' | 'ready' | 'fallback' | 'error';
type DetailLoadState = 'idle' | 'loading' | 'ready' | 'fallback' | 'error';
type WeeklyLoadState = 'idle' | 'loading' | 'ready' | 'error';
type SpotlightFilter = 'all' | 'urgent' | 'reply' | 'unread';
type AnalysisQueueFilter = 'candidate' | 'excluded' | 'done';
type NavView = 'home' | 'weekly' | 'allMail';
type MailboxCategory = 'all' | 'inbox' | 'sent';
type MailboxAnalysisFilter = 'all' | 'candidate' | 'excluded' | 'done';
type ReportType = 'WEEKLY' | 'PROGRESS' | 'ISSUE';

type EmailAnalysis = {
  id: string;
  analysisVersion: number;
  modelName: string | null;
  promptVersion: string | null;
  shortSummary: string | null;
  detailedSummary: string | null;
  category: string | null;
  priorityLevel: string | null;
  importanceScore: number | null;
  urgencyScore: number | null;
  confidenceScore: number | null;
  needsReply: boolean | null;
  hasDeadline: boolean | null;
  deadlineAt: string | null;
  deadlineText: string | null;
  timeSensitivity: string | null;
  requiresAction: boolean | null;
  userTaskSummary: string | null;
  priorityReasonCodes: string[];
  suggestedAction: string | null;
  reasoning: string | null;
  status: string;
  analyzedAt: string;
};

type EmailActionItem = {
  id: string;
  actionText: string;
  actionType: string | null;
  priorityLevel: string | null;
  dueAt: string | null;
  completed: boolean;
};

type AnalysisJob = {
  id: string;
  jobType: string;
  status: string;
  priority: number;
  retryCount: number;
  maxRetries: number;
  workerId: string | null;
  errorMessage: string | null;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
};

type MailAccountSummary = {
  id: string;
  provider: string;
  accountEmail: string;
  accountName: string | null;
  primary: boolean;
  syncEnabled: boolean;
  syncStatus: string;
  lastSyncedAt: string | null;
};

type AuthSession = {
  userId: string;
  displayName: string | null;
  primaryEmail: string | null;
  mailAccountId: string;
  provider: string;
  accountEmail: string;
};

type MailSyncResult = {
  mailAccountId: string;
  requestedCount: number;
  fetchedCount: number;
  insertedCount: number;
  skippedCount: number;
  analysisRequestedCount: number;
  analysisCompletedCount: number;
  analysisSkippedCount: number;
  syncedAt: string;
};

type ApiErrorPayload = {
  code?: string;
  message?: string;
};

type AnalysisJobCreateResult = {
  jobId: string;
  status: string;
  message: string;
};

type WeeklyReportThread = {
  emailId: string;
  subject: string;
  oneLiner: string;
};

type WeeklyReportSummary = {
  reportId: string;
  reportType: ReportType;
  periodStart: string;
  periodEnd: string;
  emailCount: number;
  createdAt: string;
};

type WeeklyReport = {
  reportId: string;
  mailAccountId: string;
  reportType: ReportType;
  periodStart: string;
  periodEnd: string;
  emailCount: number;
  source: string;
  executiveSummary: string;
  highlights: string[];
  risksBlockers: string[];
  pendingDecisions: string[];
  nextWeekSuggestions: string[];
  threadSummaries: WeeklyReportThread[];
  modelName: string;
  promptVersion: string;
  createdAt: string;
};

type EmailDetail = {
  id: string;
  mailAccountId: string;
  accountEmail: string;
  provider: string;
  externalMessageId: string;
  externalThreadId: string | null;
  internetMessageId: string | null;
  subject: string;
  bodyText: string | null;
  bodyHtml: string | null;
  snippet: string | null;
  fromName: string | null;
  fromEmail: string;
  receivedAt: string;
  sentAt: string | null;
  read: boolean;
  starred: boolean;
  hasAttachment: boolean;
  importanceHeader: string | null;
  analysisEligible: boolean;
  analysisCandidateScore: number | null;
  analysisCandidateReasons: string | null;
  analysisSkippedReason: string | null;
  analysisCandidateEvaluatedAt: string | null;
  attentionResolved: boolean;
  attentionResolvedAt: string | null;
  attentionStatus: AttentionStatus;
  attentionStatusUpdatedAt: string | null;
  analysis: EmailAnalysis | null;
  actionItems: EmailActionItem[];
  analysisJobs: AnalysisJob[];
};

const DEFAULT_USER_ID = 'USR_260409_A00001';
const DEFAULT_PRIMARY_MAIL_ACCOUNT_ID = 'MAC_260409_A00001';
const AUTH_STORAGE_KEY = 'fny.auth.session';
const THEME_STORAGE_KEY = 'fny.theme';
const AUTO_SYNC_STORAGE_KEY_PREFIX = 'fny.autoSync';
const DEFAULT_WEEKLY_END_DATE = toDateInputValue(new Date());
const DEFAULT_WEEKLY_START_DATE = toDateInputValue(addDays(new Date(), -6));
const ALL_MAIL_PAGE_SIZE = 20;

const reasonLabel: Record<AttentionReason, string> = {
  HIGH_PRIORITY: '긴급',
  NEEDS_REPLY: '회신 필요',
  UNREAD: '읽지 않음',
  STARRED: '중요 표시',
  HAS_DEADLINE: '마감 있음'
};

const REPORT_TYPE_OPTIONS: Array<{
  value: ReportType;
  label: string;
  description: string;
  buttonLabel: string;
}> = [
  {
    value: 'WEEKLY',
    label: '주간보고',
    description: '금주실적, 차주계획, 특이사항 중심으로 정리합니다.',
    buttonLabel: '주간보고 생성'
  },
  {
    value: 'PROGRESS',
    label: '업무 진행 보고',
    description: '현재 진행 상황과 다음 액션을 중심으로 정리합니다.',
    buttonLabel: '업무 진행 보고 생성'
  },
  {
    value: 'ISSUE',
    label: '이슈 보고',
    description: '리스크, 장애, 확인 필요 항목을 우선 정리합니다.',
    buttonLabel: '이슈 보고 생성'
  }
];

const sampleOverview: MailboxOverview = {
  userId: DEFAULT_USER_ID,
  totalEmails: 3,
  unreadEmails: 2,
  needsReplyEmails: 2,
  highPriorityEmails: 3,
  pendingAnalysisJobs: 0,
  spotlightEmails: [
    {
      id: 'EML_260409_A00001',
      subject: '업무 요청 메일',
      snippet: '금일 중 확인 부탁드립니다.',
      fromName: '김부장',
      fromEmail: 'boss@test.com',
      receivedAt: new Date().toISOString(),
      read: false,
      starred: true,
      hasAttachment: false,
      category: 'REQUEST',
      priorityLevel: 'P1',
      importanceScore: 92,
      urgencyScore: 88,
      shortSummary: '오늘 안에 확인이 필요한 업무 요청 메일',
      needsReply: true,
      analysisEligible: true,
      analysisCandidateScore: 95,
      analysisCandidateReasons: 'UNREAD,STARRED,IMPORTANT_HEADER,ACTION_KEYWORD',
      analysisSkippedReason: null,
      analysisCandidateEvaluatedAt: new Date().toISOString(),
      attentionResolved: false,
      attentionResolvedAt: null,
      attentionStatus: 'NEEDS_ATTENTION',
      attentionStatusUpdatedAt: null,
      attentionReasons: ['HIGH_PRIORITY', 'NEEDS_REPLY', 'UNREAD', 'STARRED']
    },
    {
      id: 'EML_260409_A00003',
      subject: '보고 요청',
      snippet: '주간 보고서 제출 바랍니다.',
      fromName: '이팀장',
      fromEmail: 'leader@test.com',
      receivedAt: new Date(Date.now() - 1000 * 60 * 42).toISOString(),
      read: false,
      starred: false,
      hasAttachment: true,
      category: 'REPORT',
      priorityLevel: 'P2',
      importanceScore: 84,
      urgencyScore: 70,
      shortSummary: '주간 보고서 제출 요청',
      needsReply: true,
      analysisEligible: true,
      analysisCandidateScore: 75,
      analysisCandidateReasons: 'UNREAD,HAS_ATTACHMENT,ACTION_KEYWORD',
      analysisSkippedReason: null,
      analysisCandidateEvaluatedAt: new Date().toISOString(),
      attentionResolved: false,
      attentionResolvedAt: null,
      attentionStatus: 'NEEDS_ATTENTION',
      attentionStatusUpdatedAt: null,
      attentionReasons: ['HIGH_PRIORITY', 'NEEDS_REPLY', 'UNREAD']
    },
    {
      id: 'EML_260409_A00002',
      subject: '회의 일정 안내',
      snippet: '내일 오전 10시 회의 예정입니다.',
      fromName: '김과장',
      fromEmail: 'manager@test.com',
      receivedAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
      read: true,
      starred: false,
      hasAttachment: false,
      category: 'MEETING',
      priorityLevel: 'P2',
      importanceScore: 72,
      urgencyScore: 60,
      shortSummary: '내일 오전 회의 일정 안내',
      needsReply: false,
      analysisEligible: true,
      analysisCandidateScore: 40,
      analysisCandidateReasons: 'MEETING_KEYWORD,DIRECT_TO_ME',
      analysisSkippedReason: null,
      analysisCandidateEvaluatedAt: new Date().toISOString(),
      attentionResolved: false,
      attentionResolvedAt: null,
      attentionStatus: 'NEEDS_ATTENTION',
      attentionStatusUpdatedAt: null,
      attentionReasons: ['HIGH_PRIORITY']
    }
  ]
};

const sampleDetails: Record<string, EmailDetail> = {
  EML_260409_A00001: {
    id: 'EML_260409_A00001',
    mailAccountId: 'MAC_260409_A00001',
    accountEmail: 'user1@test.com',
    provider: 'GOOGLE',
    externalMessageId: 'MSG_MAC_1_1',
    externalThreadId: 'THR_MAC_1',
    internetMessageId: '<msg1@test.com>',
    subject: '업무 요청 메일',
    bodyText: '금일 중 확인 부탁드립니다.',
    bodyHtml: null,
    snippet: '금일 중 확인 부탁드립니다.',
    fromName: '김부장',
    fromEmail: 'boss@test.com',
    receivedAt: new Date().toISOString(),
    sentAt: new Date().toISOString(),
    read: false,
    starred: true,
    hasAttachment: false,
    importanceHeader: 'high',
    analysisEligible: true,
    analysisCandidateScore: 95,
    analysisCandidateReasons: 'UNREAD,STARRED,IMPORTANT_HEADER,ACTION_KEYWORD',
    analysisSkippedReason: null,
    analysisCandidateEvaluatedAt: new Date().toISOString(),
    attentionResolved: false,
    attentionResolvedAt: null,
    attentionStatus: 'NEEDS_ATTENTION',
    attentionStatusUpdatedAt: null,
    analysis: {
      id: 'ANL_260409_A00001',
      analysisVersion: 1,
      modelName: 'gpt-5.4-mini',
      promptVersion: 'v1',
      shortSummary: '오늘 안에 확인이 필요한 업무 요청 메일',
      detailedSummary: '상사가 금일 내 확인을 요청한 업무 메일입니다. 회신이 필요하고 처리 시점이 짧아 우선 확인해야 합니다.',
      category: 'REQUEST',
      priorityLevel: 'P1',
      importanceScore: 92,
      urgencyScore: 88,
      confidenceScore: 95,
      needsReply: true,
      hasDeadline: true,
      deadlineAt: null,
      deadlineText: '금일 중',
      timeSensitivity: 'TODAY',
      requiresAction: true,
      userTaskSummary: '메일 내용을 확인하고 오늘 안에 회신해야 합니다.',
      priorityReasonCodes: ['NEEDS_REPLY', 'DEADLINE_SIGNAL', 'HIGH_URGENCY'],
      suggestedAction: '내용 확인 후 회신',
      reasoning: '명시적인 확인 요청과 짧은 마감 시점이 있습니다.',
      status: 'COMPLETED',
      analyzedAt: new Date().toISOString()
    },
    actionItems: [
      {
        id: 'ACT_260409_A00001',
        actionText: '메일 내용 확인 및 회신',
        actionType: 'REPLY',
        priorityLevel: 'P1',
        dueAt: null,
        completed: false
      }
    ],
    analysisJobs: [
      {
        id: 'JOB_260409_A00001',
        jobType: 'EMAIL_ANALYSIS',
        status: 'COMPLETED',
        priority: 1,
        retryCount: 0,
        maxRetries: 3,
        workerId: 'sample-agent',
        errorMessage: null,
        startedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        createdAt: new Date().toISOString()
      }
    ]
  }
};

sampleDetails.EML_260409_A00002 = {
  ...sampleDetails.EML_260409_A00001,
  id: 'EML_260409_A00002',
  subject: '회의 일정 안내',
  bodyText: '내일 오전 10시 회의 예정입니다.',
  snippet: '내일 오전 10시 회의 예정입니다.',
  fromName: '김과장',
  fromEmail: 'manager@test.com',
  read: true,
  starred: false,
  analysis: {
    ...sampleDetails.EML_260409_A00001.analysis!,
    id: 'ANL_260409_A00002',
    shortSummary: '내일 오전 회의 일정 안내',
    detailedSummary: '캘린더 등록이 필요한 회의 공지 메일입니다.',
    category: 'MEETING',
    priorityLevel: 'P2',
    importanceScore: 72,
    urgencyScore: 60,
    needsReply: false,
    suggestedAction: '회의 일정 캘린더 반영',
    reasoning: '시간 정보가 분명하고 액션이 단순합니다.'
  },
  actionItems: [
    {
      id: 'ACT_260409_A00002',
      actionText: '회의 일정 캘린더 등록',
      actionType: 'SCHEDULE',
      priorityLevel: 'P2',
      dueAt: null,
      completed: false
    }
  ]
};

sampleDetails.EML_260409_A00003 = {
  ...sampleDetails.EML_260409_A00001,
  id: 'EML_260409_A00003',
  subject: '보고 요청',
  bodyText: '주간 보고서 제출 바랍니다.',
  snippet: '주간 보고서 제출 바랍니다.',
  fromName: '이팀장',
  fromEmail: 'leader@test.com',
  starred: false,
  hasAttachment: true,
  analysis: {
    ...sampleDetails.EML_260409_A00001.analysis!,
    id: 'ANL_260409_A00003',
    shortSummary: '주간 보고서 제출 요청',
    detailedSummary: '정기 보고 제출 요청 메일입니다. 제출 액션이 필요합니다.',
    category: 'REPORT',
    priorityLevel: 'P2',
    importanceScore: 84,
    urgencyScore: 70,
    suggestedAction: '보고서 작성 및 제출',
    reasoning: '업무 제출 요청이며 회신 또는 제출 액션이 필요합니다.'
  },
  actionItems: [
    {
      id: 'ACT_260409_A00003',
      actionText: '주간 보고서 작성 및 제출',
      actionType: 'SUBMIT',
      priorityLevel: 'P2',
      dueAt: null,
      completed: false
    }
  ]
};

function App() {
  const detailRequestSeq = useRef(0);
  const syncRequestInFlight = useRef(false);
  const [authSession, setAuthSession] = useState<AuthSession | null>(() => readStoredAuthSession());
  const [theme, setTheme] = useState<'light' | 'dark'>(() => readStoredTheme());
  const [authState, setAuthState] = useState<LoadState>('idle');
  const [authError, setAuthError] = useState<string | null>(null);
  const [userId, setUserId] = useState(() => authSession?.userId ?? DEFAULT_USER_ID);
  const [overview, setOverview] = useState<MailboxOverview>(sampleOverview);
  const [loadState, setLoadState] = useState<LoadState>('idle');
  const [selectedEmailId, setSelectedEmailId] = useState(sampleOverview.spotlightEmails[0]?.id ?? '');
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
  const [weeklyReport, setWeeklyReport] = useState<WeeklyReport | null>(null);
  const [weeklyLoadState, setWeeklyLoadState] = useState<WeeklyLoadState>('idle');
  const [weeklyError, setWeeklyError] = useState<string | null>(null);
  const [navView, setNavView] = useState<NavView>('home');
  const [weeklyHistory, setWeeklyHistory] = useState<WeeklyReportSummary[]>([]);
  const [weeklyHistoryLoading, setWeeklyHistoryLoading] = useState(false);
  const [selectedHistoryReportId, setSelectedHistoryReportId] = useState<string | null>(null);
  const [weeklyCopyState, setWeeklyCopyState] = useState<'idle' | 'done' | 'error'>('idle');
  const [selectedReportType, setSelectedReportType] = useState<ReportType>('WEEKLY');
  const [weeklyStartDate, setWeeklyStartDate] = useState(DEFAULT_WEEKLY_START_DATE);
  const [weeklyEndDate, setWeeklyEndDate] = useState(DEFAULT_WEEKLY_END_DATE);
  const [allEmails, setAllEmails] = useState<EmailListItem[]>(sampleOverview.spotlightEmails);
  const [allMailLoadState, setAllMailLoadState] = useState<LoadState>('idle');
  const [allMailError, setAllMailError] = useState<string | null>(null);
  const [allMailQuery, setAllMailQuery] = useState('');
  const [expandedMailId, setExpandedMailId] = useState<string | null>(null);
  const [allMailPage, setAllMailPage] = useState(1);
  const [mailboxCategory, setMailboxCategory] = useState<MailboxCategory>('all');
  const [mailboxAnalysisFilter, setMailboxAnalysisFilter] = useState<MailboxAnalysisFilter>('all');
  const [analysisQueueFilter, setAnalysisQueueFilter] = useState<AnalysisQueueFilter>('candidate');
  const [syncState, setSyncState] = useState<LoadState>('idle');
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [autoSyncDone, setAutoSyncDone] = useState(false);
  const [analysisRequestingId, setAnalysisRequestingId] = useState<string | null>(null);
  const [attentionUpdatingId, setAttentionUpdatingId] = useState<string | null>(null);

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
      setOverview(sampleOverview);
      setAllEmails(sampleOverview.spotlightEmails);
      setSelectedEmailId(sampleOverview.spotlightEmails[0]?.id ?? '');
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
    document.documentElement.dataset.theme = theme;
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  useEffect(() => {
    if (!authSession) {
      return;
    }
    void loadOverview(userId);
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

  useEffect(() => {
    if (!authSession) {
      return;
    }
    setWeeklyReport(null);
    setWeeklyLoadState('idle');
    setWeeklyError(null);
    setWeeklyHistory([]);
    setSelectedHistoryReportId(null);
  }, [authSession, userId]);

  useEffect(() => {
    setWeeklyCopyState('idle');
  }, [weeklyReport]);

  useEffect(() => {
    if (selectedEmailId) {
      void loadEmailDetail(selectedEmailId);
    }
  }, [selectedEmailId]);

  const sortedEmails = useMemo(() => {
    return overview.spotlightEmails
      .filter((email) => isOpenAttentionStatus(email.attentionStatus))
      .sort((a, b) => scoreEmail(b) - scoreEmail(a));
  }, [overview.spotlightEmails]);

  const sortedAllEmails = useMemo(() => {
    return [...allEmails].sort((a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime());
  }, [allEmails]);

  const tabCounts = useMemo(() => {
    const urgent = (e: EmailListItem) =>
      e.attentionReasons.includes('HIGH_PRIORITY') || e.priorityLevel === 'P1';
    return {
      all: sortedEmails.length,
      urgent: sortedEmails.filter(urgent).length,
      reply: sortedEmails.filter((e) => e.needsReply).length,
      unread: sortedEmails.filter((e) => !e.read).length
    };
  }, [sortedEmails]);

  const analysisQueueCounts = useMemo(() => {
    const evaluated = sortedAllEmails.filter((email) => email.analysisCandidateEvaluatedAt);
    return {
      candidate: evaluated.filter(
        (email) => email.analysisEligible && isOpenAttentionStatus(email.attentionStatus)
      ).length,
      excluded: evaluated.filter((email) => !email.analysisEligible).length,
      done: evaluated.filter((email) => !isOpenAttentionStatus(email.attentionStatus)).length
    };
  }, [sortedAllEmails]);

  const analysisQueueEmails = useMemo(() => {
    const evaluated = sortedAllEmails.filter((email) => email.analysisCandidateEvaluatedAt);
    if (analysisQueueFilter === 'excluded') {
      return evaluated.filter((email) => !email.analysisEligible);
    }
    if (analysisQueueFilter === 'done') {
      return evaluated.filter((email) => !isOpenAttentionStatus(email.attentionStatus));
    }
    return evaluated.filter(
      (email) => email.analysisEligible && isOpenAttentionStatus(email.attentionStatus)
    );
  }, [sortedAllEmails, analysisQueueFilter]);

  const weeklyDraftText = useMemo(() => {
    if (!weeklyReport) {
      return '';
    }
    return buildWeeklyReportDraft(weeklyReport, selectedReportType);
  }, [weeklyReport, selectedReportType]);

  const selectedReportOption = useMemo(
    () => REPORT_TYPE_OPTIONS.find((option) => option.value === selectedReportType) ?? REPORT_TYPE_OPTIONS[0],
    [selectedReportType]
  );

  const weeklySections = useMemo(
    () => (weeklyReport ? buildReportSections(weeklyReport, selectedReportType) : []),
    [weeklyReport, selectedReportType]
  );

  const filteredSpotlight = useMemo(() => {
    let list = sortedEmails;
    if (spotlightFilter === 'urgent') {
      list = list.filter(
        (e) => e.attentionReasons.includes('HIGH_PRIORITY') || e.priorityLevel === 'P1'
      );
    } else if (spotlightFilter === 'reply') {
      list = list.filter((e) => e.needsReply);
    } else if (spotlightFilter === 'unread') {
      list = list.filter((e) => !e.read);
    }
    const q = listQuery.trim().toLowerCase();
    if (!q) {
      return list;
    }
    return list.filter(
      (e) =>
        e.subject.toLowerCase().includes(q) ||
        e.fromEmail.toLowerCase().includes(q) ||
        (e.fromName?.toLowerCase().includes(q) ?? false)
    );
  }, [sortedEmails, spotlightFilter, listQuery]);

  const filteredAllEmails = useMemo(() => {
    let list = sortedAllEmails;
    if (mailboxCategory === 'inbox') {
      list = list.filter((email) => email.fromEmail !== primaryMailAccountEmail);
    } else if (mailboxCategory === 'sent') {
      list = list.filter((email) => email.fromEmail === primaryMailAccountEmail);
    }

    if (mailboxAnalysisFilter === 'candidate') {
      list = list.filter(
        (email) => Boolean(email.analysisCandidateEvaluatedAt) && email.analysisEligible && isOpenAttentionStatus(email.attentionStatus)
      );
    } else if (mailboxAnalysisFilter === 'excluded') {
      list = list.filter((email) => Boolean(email.analysisCandidateEvaluatedAt) && !email.analysisEligible);
    } else if (mailboxAnalysisFilter === 'done') {
      list = list.filter(
        (email) => Boolean(email.analysisCandidateEvaluatedAt) && !isOpenAttentionStatus(email.attentionStatus)
      );
    }

    const q = allMailQuery.trim().toLowerCase();
    if (!q) {
      return list;
    }

    return list.filter(
      (email) =>
        email.subject.toLowerCase().includes(q) ||
        email.fromEmail.toLowerCase().includes(q) ||
        (email.fromName?.toLowerCase().includes(q) ?? false) ||
        (email.shortSummary?.toLowerCase().includes(q) ?? false)
    );
  }, [sortedAllEmails, mailboxCategory, primaryMailAccountEmail, mailboxAnalysisFilter, allMailQuery]);

  const mailboxCounts = useMemo(() => {
    const sent = sortedAllEmails.filter((email) => email.fromEmail === primaryMailAccountEmail).length;
    return {
      all: sortedAllEmails.length,
      sent,
      inbox: sortedAllEmails.length - sent
    };
  }, [sortedAllEmails, primaryMailAccountEmail]);

  const mailboxAnalysisCounts = useMemo(() => {
    const evaluated = sortedAllEmails.filter((email) => email.analysisCandidateEvaluatedAt);
    return {
      all: sortedAllEmails.length,
      candidate: evaluated.filter(
        (email) => email.analysisEligible && isOpenAttentionStatus(email.attentionStatus)
      ).length,
      excluded: evaluated.filter((email) => !email.analysisEligible).length,
      done: evaluated.filter((email) => !isOpenAttentionStatus(email.attentionStatus)).length
    };
  }, [sortedAllEmails]);

  const allMailTotalPages = Math.max(1, Math.ceil(filteredAllEmails.length / ALL_MAIL_PAGE_SIZE));
  const pagedAllEmails = useMemo(() => {
    const safePage = Math.min(allMailPage, allMailTotalPages);
    const start = (safePage - 1) * ALL_MAIL_PAGE_SIZE;
    return filteredAllEmails.slice(start, start + ALL_MAIL_PAGE_SIZE);
  }, [filteredAllEmails, allMailPage, allMailTotalPages]);

  useEffect(() => {
    if (!authSession) {
      return;
    }
    setAllMailPage(1);
    setExpandedMailId(null);
  }, [authSession, allMailQuery, mailboxCategory, mailboxAnalysisFilter, userId]);

  useEffect(() => {
    if (allMailPage > allMailTotalPages) {
      setAllMailPage(allMailTotalPages);
    }
  }, [allMailPage, allMailTotalPages]);

  useEffect(() => {
    if (
      filteredSpotlight.length > 0 &&
      !filteredSpotlight.some((email) => email.id === selectedEmailId)
    ) {
      setSelectedEmailId(filteredSpotlight[0].id);
    }
  }, [filteredSpotlight, selectedEmailId]);

  useEffect(() => {
    if (
      navView === 'allMail' &&
      filteredAllEmails.length > 0 &&
      expandedMailId &&
      !filteredAllEmails.some((email) => email.id === expandedMailId)
    ) {
      setExpandedMailId(null);
    }
  }, [navView, filteredAllEmails, expandedMailId]);

  async function loadOverview(targetUserId: string) {
    setLoadState('loading');
    setErrorMessage(null);

    try {
      const response = await fetch(`/api/users/${targetUserId}/overview`);

      if (!response.ok) {
        throw await parseApiError(response);
      }

      const data = (await response.json()) as MailboxOverview;
      const normalized = normalizeOverview(data);
      setOverview(normalized);
      setSelectedEmailId((current) =>
        normalized.spotlightEmails.some((email) => email.id === current)
          ? current
          : normalized.spotlightEmails[0]?.id || ''
      );
      setLoadState('ready');

      try {
        const accountResponse = await fetch(`/api/users/${targetUserId}/mail-accounts`);
        if (accountResponse.ok) {
          const accounts = (await accountResponse.json()) as MailAccountSummary[];
          const primary = accounts.find((a) => a.primary) ?? accounts[0];
          setPrimaryMailAccountId(primary?.id ?? null);
          setPrimaryMailAccountEmail(primary?.accountEmail ?? null);
        } else {
          setPrimaryMailAccountId(
            targetUserId === DEFAULT_USER_ID ? DEFAULT_PRIMARY_MAIL_ACCOUNT_ID : null
          );
          setPrimaryMailAccountEmail(targetUserId === DEFAULT_USER_ID ? 'user1@test.com' : null);
        }
      } catch {
        setPrimaryMailAccountId(
          targetUserId === DEFAULT_USER_ID ? DEFAULT_PRIMARY_MAIL_ACCOUNT_ID : null
        );
        setPrimaryMailAccountEmail(targetUserId === DEFAULT_USER_ID ? 'user1@test.com' : null);
      }
      void loadAllEmails(targetUserId, { resetExpanded: false });
    } catch (error) {
      setOverview({ ...sampleOverview, userId: targetUserId });
      setAllEmails(sampleOverview.spotlightEmails);
      setSelectedEmailId(sampleOverview.spotlightEmails[0]?.id ?? '');
      setLoadState('fallback');
      setErrorMessage(error instanceof Error ? error.message : 'Unknown error');
      setPrimaryMailAccountId(
        targetUserId === DEFAULT_USER_ID ? DEFAULT_PRIMARY_MAIL_ACCOUNT_ID : null
      );
      setPrimaryMailAccountEmail(targetUserId === DEFAULT_USER_ID ? 'user1@test.com' : null);
    }
  }

  const loadWeeklyHistory = useCallback(async () => {
    if (!primaryMailAccountId) {
      setWeeklyHistory([]);
      return;
    }
    setWeeklyHistoryLoading(true);
    try {
      const response = await fetch(
        `/api/users/${userId}/mail-accounts/${primaryMailAccountId}/weekly-reports`
      );
      if (!response.ok) {
        const apiError = await parseApiError(response);
        if (authSession) {
          setWeeklyError(apiError.message);
        }
        setWeeklyHistory([]);
        return;
      }
      const rows = (await response.json()) as WeeklyReportSummary[];
      setWeeklyHistory(rows);
    } catch {
      setWeeklyHistory([]);
    } finally {
      setWeeklyHistoryLoading(false);
    }
  }, [userId, primaryMailAccountId]);

  useEffect(() => {
    if (!authSession || navView !== 'weekly' || !primaryMailAccountId) {
      return;
    }
    void loadWeeklyHistory();
  }, [authSession, navView, primaryMailAccountId, loadWeeklyHistory]);

  useEffect(() => {
    if (!authSession || navView !== 'allMail') {
      return;
    }
    void loadAllEmails(userId);
  }, [authSession, navView, userId]);

  async function loadAllEmails(targetUserId: string, options?: { resetExpanded?: boolean }) {
    setAllMailLoadState('loading');
    setAllMailError(null);

    try {
      const response = await fetch(`/api/users/${targetUserId}/emails`);

      if (!response.ok) {
        throw await parseApiError(response);
      }

      const data = (await response.json()) as EmailListItem[];
      const normalized = normalizeEmailList(data);
      setAllEmails(normalized);
      setAllMailPage(1);
      if (options?.resetExpanded !== false) {
        setExpandedMailId(null);
      }
      setSelectedEmailId((current) =>
        normalized.some((email) => email.id === current) ? current : normalized[0]?.id || ''
      );
      setAllMailLoadState('ready');
    } catch (error) {
      setAllEmails(sampleOverview.spotlightEmails);
      setAllMailPage(1);
      setExpandedMailId(null);
      setSelectedEmailId(sampleOverview.spotlightEmails[0]?.id ?? '');
      setAllMailLoadState('fallback');
      setAllMailError(error instanceof Error ? error.message : 'Unknown error');
    }
  }

  async function openWeeklyReportFromHistory(reportId: string) {
    setSelectedHistoryReportId(reportId);
    setWeeklyLoadState('loading');
    setWeeklyError(null);
    try {
      const response = await fetch(`/api/users/${userId}/weekly-reports/${reportId}`);
      if (!response.ok) {
        throw await parseApiError(response);
      }
      const data = (await response.json()) as WeeklyReport;
      setWeeklyReport(data);
      setSelectedReportType(normalizeReportType(data.reportType));
      setWeeklyLoadState('ready');
    } catch (error) {
      setWeeklyReport(null);
      setWeeklyLoadState('error');
      setWeeklyError(error instanceof Error ? error.message : 'Unknown error');
    }
  }

  async function generateWeeklyReport() {
    if (!primaryMailAccountId) {
      setWeeklyError('연결된 메일 계정이 없습니다.');
      setWeeklyLoadState('error');
      return;
    }

    setWeeklyLoadState('loading');
    setWeeklyError(null);

    try {
      if (!weeklyStartDate || !weeklyEndDate) {
        throw new Error('시작일과 종료일을 모두 선택해 주세요.');
      }
      if (weeklyStartDate > weeklyEndDate) {
        throw new Error('시작일은 종료일보다 늦을 수 없습니다.');
      }

      const params = new URLSearchParams({
        reportType: selectedReportType,
        startDate: weeklyStartDate,
        endDate: weeklyEndDate
      });
      const response = await fetch(
        `/api/users/${userId}/mail-accounts/${primaryMailAccountId}/weekly-reports?${params.toString()}`,
        { method: 'POST' }
      );

      if (!response.ok) {
        throw await parseApiError(response);
      }

      const data = (await response.json()) as WeeklyReport;
      setWeeklyReport(data);
      setSelectedReportType(normalizeReportType(data.reportType));
      setWeeklyLoadState('ready');
      setSelectedHistoryReportId(data.reportId);
      await loadWeeklyHistory();
    } catch (error) {
      setWeeklyReport(null);
      setWeeklyLoadState('error');
      setWeeklyError(error instanceof Error ? error.message : 'Unknown error');
    }
  }

  async function copyWeeklyReportDraft() {
    if (!weeklyDraftText) {
      return;
    }
    try {
      await navigator.clipboard.writeText(weeklyDraftText);
      setWeeklyCopyState('done');
    } catch {
      setWeeklyCopyState('error');
    }
  }

  async function loadEmailDetail(emailId: string) {
    const requestSeq = detailRequestSeq.current + 1;
    detailRequestSeq.current = requestSeq;
    setDetailLoadState('loading');
    setDetailErrorMessage(null);
    setEmailDetail((current) => (current?.id === emailId ? current : null));

    try {
      const response = await fetch(`/api/emails/${emailId}`);

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }

      const data = (await response.json()) as EmailDetail;
      if (requestSeq !== detailRequestSeq.current) {
        return;
      }
      setEmailDetail(normalizeEmailDetail(data));
      setDetailLoadState('ready');
    } catch (error) {
      if (requestSeq !== detailRequestSeq.current) {
        return;
      }
      const localFallback =
        createDetailFromListItem(
          sortedEmails.find((email) => email.id === emailId) ??
            allEmails.find((email) => email.id === emailId)
        ) ?? sampleDetails[emailId];
      setEmailDetail(
        authSession && localFallback && localFallback.id === emailId
          ? localFallback
          : sampleDetails[emailId] ?? localFallback
      );
      setDetailLoadState('fallback');
      setDetailErrorMessage(error instanceof Error ? error.message : 'Unknown error');
    }
  }

  async function requestEmailAnalysis(emailId: string) {
    setAnalysisRequestingId(emailId);
    setSyncState('loading');
    setSyncMessage('메일 분석을 요청하는 중입니다.');

    try {
      const response = await fetch(`/api/emails/${emailId}/analysis-jobs`, { method: 'POST' });
      if (!response.ok) {
        throw new Error(await readApiError(response));
      }

      const result = (await response.json()) as AnalysisJobCreateResult;
      setSyncState('ready');
      setSyncMessage(result.message || '분석 작업을 요청했습니다.');
      await loadEmailDetail(emailId);
      await loadOverview(userId);
      if (navView === 'allMail') {
        await loadAllEmails(userId);
      }
    } catch (error) {
      setSyncState('error');
      setSyncMessage(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setAnalysisRequestingId(null);
    }
  }

  async function updateAttentionStatus(emailId: string, status: AttentionStatus) {
    setAttentionUpdatingId(emailId);
    setSyncState('loading');
    setSyncMessage(
      isOpenAttentionStatus(status)
        ? '우선순위 목록에 다시 올리는 중입니다.'
        : `${attentionStatusLabel(status)} 상태로 저장하는 중입니다.`
    );
    applyAttentionStatusState(emailId, status);

    try {
      const response = await fetch(`/api/emails/${emailId}/attention-status?status=${status}`, {
        method: 'PATCH'
      });
      if (!response.ok) {
        throw new Error(await readApiError(response));
      }

      const detail = normalizeEmailDetail((await response.json()) as EmailDetail);
      setEmailDetail(detail);
      applyAttentionStatusState(emailId, detail.attentionStatus, detail.attentionStatusUpdatedAt);
      setSyncState('ready');
      setSyncMessage(
        isOpenAttentionStatus(detail.attentionStatus)
          ? '다시 확인 대상으로 표시했습니다.'
          : `${attentionStatusLabel(detail.attentionStatus)} 상태입니다. 홈 우선순위에서 제외됩니다.`
      );
      await loadOverview(userId);
      if (navView === 'allMail') {
        await loadAllEmails(userId);
      }
    } catch (error) {
      await loadOverview(userId);
      if (navView === 'allMail') {
        await loadAllEmails(userId);
      }
      setSyncState('error');
      setSyncMessage(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setAttentionUpdatingId(null);
    }
  }

  function applyAttentionStatusState(emailId: string, status: AttentionStatus, updatedAt?: string | null) {
    const resolved = !isOpenAttentionStatus(status);
    const nextUpdatedAt = resolved ? updatedAt ?? new Date().toISOString() : null;
    const update = (email: EmailListItem): EmailListItem =>
      email.id === emailId
        ? {
            ...email,
            attentionResolved: resolved,
            attentionResolvedAt: nextUpdatedAt,
            attentionStatus: status,
            attentionStatusUpdatedAt: nextUpdatedAt
          }
        : email;

    setOverview((current) => ({
      ...current,
      spotlightEmails: current.spotlightEmails.map(update)
    }));
    setAllEmails((current) => current.map(update));
    setEmailDetail((current) =>
      current?.id === emailId
        ? {
            ...current,
            attentionResolved: resolved,
            attentionResolvedAt: nextUpdatedAt,
            attentionStatus: status,
            attentionStatusUpdatedAt: nextUpdatedAt
          }
        : current
    );
  }

  async function syncGmail(options?: { silent?: boolean }) {
    if (!primaryMailAccountId) {
      setSyncState('error');
      setSyncMessage('연결된 Gmail 계정이 없습니다.');
      return;
    }
    if (syncRequestInFlight.current) {
      return;
    }
    syncRequestInFlight.current = true;

    setSyncState('loading');
    setSyncMessage(options?.silent ? '로그인한 Gmail의 최근 메일을 불러오는 중입니다.' : 'Gmail에서 최근 메일을 가져오는 중입니다.');
    try {
      const response = await fetch(
        `/api/users/${userId}/mail-accounts/${primaryMailAccountId}/sync?limit=0`,
        { method: 'POST' }
      );
      if (!response.ok) {
        throw new Error(await readApiError(response));
      }

      const result = (await response.json()) as MailSyncResult;
      if (options?.silent && primaryMailAccountId) {
        localStorage.setItem(autoSyncMarkerKey(primaryMailAccountId), todayKey());
      }
      setSyncState('ready');
      setSyncMessage(
        `Gmail 동기화 완료: ${result.insertedCount}건 추가, ${result.skippedCount}건 건너뜀, 최근 30일 ${result.analysisCompletedCount}건 분석 완료, ${result.analysisSkippedCount}건 분석 제외`
      );
      await loadOverview(userId);
      if (navView === 'allMail') {
        await loadAllEmails(userId);
      }
    } catch (error) {
      setSyncState('error');
      setSyncMessage(error instanceof Error ? error.message : 'Unknown error');
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
    setAllMailPage(1);
    setExpandedMailId(null);
    setNavView('allMail');
  }

  function openReportSourceEmail(emailId: string) {
    const index = sortedAllEmails.findIndex((email) => email.id === emailId);
    setMailboxCategory('all');
    setMailboxAnalysisFilter('all');
    setAllMailQuery('');
    setSelectedEmailId(emailId);
    setExpandedMailId(emailId);
    setAllMailPage(index >= 0 ? Math.floor(index / ALL_MAIL_PAGE_SIZE) + 1 : 1);
    setNavView('allMail');
  }

  function logout() {
    resetAuthSession();
  }

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
    <div className="app-shell">
      <aside className="app-sidebar" aria-label="주요 메뉴">
        <div className="sidebar-brand">
          <div className="sidebar-logo" aria-hidden="true">
            F
          </div>
          <div className="sidebar-brand-text">
            <h1>FNY</h1>
            <p>Mail Intelligence</p>
          </div>
        </div>

        <nav className="sidebar-nav" aria-label="메일 내비게이션">
          <button
            type="button"
            className={`sidebar-link${navView === 'home' ? ' sidebar-link-active' : ''}`}
            onClick={() => setNavView('home')}
            aria-current={navView === 'home' ? 'page' : undefined}
          >
            <span className="sidebar-link-icon">
              <IconLayoutDashboard size={20} />
              홈
            </span>
            <IconChevron size={16} />
          </button>
          <button
            type="button"
            className={`sidebar-link${navView === 'allMail' ? ' sidebar-link-active' : ''}`}
            onClick={() => setNavView('allMail')}
            aria-current={navView === 'allMail' ? 'page' : undefined}
          >
            <span className="sidebar-link-icon">
              <IconInbox size={20} />
              메일함
            </span>
            <IconChevron size={16} />
          </button>
          <button type="button" className="sidebar-link">
            <span className="sidebar-link-icon">
              <IconSparkles size={20} />
              분석 작업
            </span>
            {overview.pendingAnalysisJobs > 0 ? (
              <span className="sidebar-badge">{overview.pendingAnalysisJobs}</span>
            ) : (
              <IconChevron size={16} />
            )}
          </button>
          <button
            type="button"
            className={`sidebar-link${navView === 'weekly' ? ' sidebar-link-active' : ''}`}
            onClick={() => setNavView('weekly')}
            aria-current={navView === 'weekly' ? 'page' : undefined}
          >
            <span className="sidebar-link-icon">
              <IconWeeklyReport size={20} />
              보고서 생성
            </span>
            <IconChevron size={16} />
          </button>

          <p className="sidebar-section-label">기타</p>
          <button type="button" className="sidebar-link">
            <span className="sidebar-link-icon">
              <IconSettings size={20} />
              설정
            </span>
            <IconChevron size={16} />
          </button>
          <button type="button" className="sidebar-link">
            <span className="sidebar-link-icon">
              <IconHelp size={20} />
              도움말
            </span>
            <IconChevron size={16} />
          </button>
        </nav>

      </aside>

      <div className="app-main-wrap">
        <header className="app-main-header">
          <div className="app-main-header-text">
            <p className="breadcrumb">
              {navView === 'home' && '메일함 · 홈 · 처리 우선'}
              {navView === 'weekly' && '메일함 · 보고서 생성'}
              {navView === 'allMail' && '메일함'}
            </p>
            <h2>
              {navView === 'home' && '지금 먼저 볼 메일'}
              {navView === 'weekly' && '보고서 생성'}
              {navView === 'allMail' && '메일함'}
            </h2>
          </div>
          <div className="header-actions">
            <button
              type="button"
              className="theme-toggle"
              onClick={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))}
              role="switch"
              aria-pressed={theme === 'dark'}
              aria-checked={theme === 'dark'}
              aria-label={theme === 'dark' ? '라이트 모드로 전환' : '다크 모드로 전환'}
            >
              <span className="theme-toggle-track" aria-hidden="true">
                <span className="theme-toggle-thumb" />
              </span>
            </button>
            <button
              type="button"
              className="sync-btn"
              onClick={() => void syncGmail()}
              disabled={syncState === 'loading'}
            >
              {syncState === 'loading' ? '동기화 중' : 'Gmail 동기화'}
            </button>
            <button type="button" className="icon-btn" aria-label="검색 (목록 필터는 아래 검색창 사용)">
              <IconSearch size={20} />
            </button>
            <button type="button" className="icon-btn" aria-label="알림">
              <IconBell size={20} />
            </button>
            <div className="header-user">
              <div className="header-user-avatar" aria-hidden="true">
                {(authSession.displayName || authSession.accountEmail).slice(0, 2).toUpperCase()}
              </div>
              <div className="header-user-info">
                <strong>{authSession.displayName || 'Gmail 사용자'}</strong>
                <span title={authSession.accountEmail}>{authSession.accountEmail}</span>
              </div>
              <button type="button" className="header-logout" onClick={logout}>
                로그아웃
              </button>
            </div>
          </div>
        </header>

        <main className="app-main">
          {syncMessage ? (
            <div className={`sync-status sync-status-${syncState}`} role="status">
              {syncMessage}
            </div>
          ) : null}
          {navView === 'home' ? (
          <div className="page-card" aria-label="메일 우선 처리 대시보드">
            <div className="status-line" role="status">
              {loadState === 'loading' && '메일함을 불러오는 중입니다.'}
              {loadState === 'ready' && '서버 데이터로 정렬했습니다.'}
              {loadState === 'fallback' && `서버 연결 전이라 샘플 데이터로 보고 있습니다. ${errorMessage ?? ''}`}
              {loadState === 'error' && '메일함을 불러오지 못했습니다.'}
            </div>

            <section className="metrics" aria-label="메일함 요약">
              <Metric
                label="전체 메일"
                value={overview.totalEmails}
                selected={spotlightFilter === 'all'}
                onClick={() => setSpotlightFilter('all')}
              />
              <Metric
                label="읽지 않음"
                value={overview.unreadEmails}
                tone="blue"
                selected={spotlightFilter === 'unread'}
                onClick={() => setSpotlightFilter('unread')}
              />
              <Metric
                label="회신 필요"
                value={overview.needsReplyEmails}
                tone="red"
                selected={spotlightFilter === 'reply'}
                onClick={() => setSpotlightFilter('reply')}
              />
              <Metric
                label="중요 메일"
                value={overview.highPriorityEmails}
                tone="green"
                selected={spotlightFilter === 'urgent'}
                onClick={() => setSpotlightFilter('urgent')}
              />
            </section>

            <div className="filter-tabs" role="tablist" aria-label="목록 필터">
              <FilterTab
                id="tab-all"
                selected={spotlightFilter === 'all'}
                onSelect={() => setSpotlightFilter('all')}
                label={`전체 (${tabCounts.all})`}
              />
              <FilterTab
                id="tab-urgent"
                selected={spotlightFilter === 'urgent'}
                onSelect={() => setSpotlightFilter('urgent')}
                label={`긴급 (${tabCounts.urgent})`}
              />
              <FilterTab
                id="tab-reply"
                selected={spotlightFilter === 'reply'}
                onSelect={() => setSpotlightFilter('reply')}
                label={`회신 필요 (${tabCounts.reply})`}
              />
              <FilterTab
                id="tab-unread"
                selected={spotlightFilter === 'unread'}
                onSelect={() => setSpotlightFilter('unread')}
                label={`읽지 않음 (${tabCounts.unread})`}
              />
            </div>

            <div className="list-toolbar">
              <span className="list-toolbar-note">우선순위 점수 기준 정렬</span>
              <label className="sr-only" htmlFor="list-search">
                목록 검색
              </label>
              <input
                id="list-search"
                className="toolbar-search"
                value={listQuery}
                onChange={(e) => setListQuery(e.target.value)}
                placeholder="제목·발신자 검색"
              />
            </div>

            <section className="focus-layout">
              <div className="priority-panel">
                <div className="section-heading">
                  <p className="eyebrow">Priority queue</p>
                  <h2>처리 우선순위</h2>
                </div>

                <div className="mail-table" role="list">
                  {filteredSpotlight.length === 0 ? (
                    <p className="status-line" style={{ margin: 0 }}>
                      조건에 맞는 메일이 없습니다.
                    </p>
                  ) : (
                    filteredSpotlight.map((email, index) => (
                      <MailListRow
                        key={email.id}
                        email={email}
                        index={index + 1}
                        expanded={email.id === expandedMailId}
                        detail={email.id === expandedMailId && emailDetail?.id === email.id ? emailDetail : null}
                        detailLoadState={detailLoadState}
                        detailErrorMessage={detailErrorMessage}
                        theme={theme}
                        analysisSubmitting={analysisRequestingId === email.id}
                        onRequestAnalysis={requestEmailAnalysis}
                        attentionUpdating={attentionUpdatingId === email.id}
                        onUpdateAttentionStatus={updateAttentionStatus}
                        onSelect={() => {
                          setSelectedEmailId(email.id);
                          setExpandedMailId((current) => (current === email.id ? null : email.id));
                        }}
                      />
                    ))
                  )}
                </div>
              </div>
            </section>

            <section className="analysis-queue-panel" aria-label="분석 대상 큐">
              <div className="section-heading">
                <p className="eyebrow">Analysis queue</p>
                <h2>분석 대상 큐</h2>
                <p className="section-copy">
                  최근 메일 중 자동 분석 대상으로 오른 메일과 제외된 메일, 확인을 마친 메일을 한 번에 볼 수 있습니다.
                </p>
              </div>

              <div className="filter-tabs analysis-queue-tabs" role="tablist" aria-label="분석 큐 필터">
                <FilterTab
                  id="analysis-candidate"
                  selected={analysisQueueFilter === 'candidate'}
                  onSelect={() => setAnalysisQueueFilter('candidate')}
                  label={`분석 대상 (${analysisQueueCounts.candidate})`}
                />
                <FilterTab
                  id="analysis-excluded"
                  selected={analysisQueueFilter === 'excluded'}
                  onSelect={() => setAnalysisQueueFilter('excluded')}
                  label={`분석 제외 (${analysisQueueCounts.excluded})`}
                />
                <FilterTab
                  id="analysis-done"
                  selected={analysisQueueFilter === 'done'}
                  onSelect={() => setAnalysisQueueFilter('done')}
                  label={`확인 완료 (${analysisQueueCounts.done})`}
                />
              </div>

              <div className="analysis-queue-summary" role="status">
                {analysisQueueFilter === 'candidate' &&
                  '업무 처리 가능성이 높아 자동 분석 대상으로 남아 있는 메일입니다.'}
                {analysisQueueFilter === 'excluded' &&
                  '업무 신호가 낮거나 오래된 메일처럼 자동 분석에서 제외된 메일입니다.'}
                {analysisQueueFilter === 'done' &&
                  '사용자가 확인 완료, 처리 완료, 보류로 바꿔 홈 우선순위에서 빠진 메일입니다.'}
              </div>

              <div className="analysis-queue-actions">
                <button
                  type="button"
                  className="btn-weekly"
                  onClick={() => openMailboxForAnalysis(analysisQueueFilter)}
                >
                  메일함에서 전체 보기
                </button>
              </div>

              <div className="mail-table" role="list">
                {analysisQueueEmails.length === 0 ? (
                  <p className="status-line" style={{ margin: 0 }}>
                    해당 상태의 메일이 없습니다.
                  </p>
                ) : (
                  analysisQueueEmails.slice(0, 8).map((email, index) => (
                    <MailListRow
                      key={`analysis-${email.id}`}
                      email={email}
                      index={index + 1}
                      expanded={email.id === expandedMailId}
                      detail={email.id === expandedMailId && emailDetail?.id === email.id ? emailDetail : null}
                      detailLoadState={detailLoadState}
                      detailErrorMessage={detailErrorMessage}
                      theme={theme}
                      analysisSubmitting={analysisRequestingId === email.id}
                      onRequestAnalysis={requestEmailAnalysis}
                      attentionUpdating={attentionUpdatingId === email.id}
                      onUpdateAttentionStatus={updateAttentionStatus}
                      onSelect={() => {
                        setSelectedEmailId(email.id);
                        setExpandedMailId((current) => (current === email.id ? null : email.id));
                      }}
                    />
                  ))
                )}
              </div>
            </section>
          </div>
          ) : navView === 'weekly' ? (
          <div className="page-card" aria-label="보고서 생성">
            <div className="status-line" role="status">
              {!primaryMailAccountId && '메일 계정이 없어 주간 요약을 만들 수 없습니다.'}
              {primaryMailAccountId && weeklyHistoryLoading && '이전 요약 목록을 불러오는 중입니다.'}
              {primaryMailAccountId && !weeklyHistoryLoading && weeklyHistory.length === 0 && weeklyLoadState !== 'loading'
                ? '아직 저장된 주간 요약이 없습니다. 아래에서 새로 생성해 보세요.'
                : null}
            </div>

            <div className="weekly-layout">
              {primaryMailAccountId && weeklyHistory.length > 0 ? (
                <aside className="weekly-sidebar" aria-label="저장된 주간 요약">
                  <h4 className="weekly-sidebar-title">최근 요약</h4>
                  <ul className="weekly-sidebar-list">
                    {weeklyHistory.map((row) => (
                      <li key={row.reportId}>
                        <button
                          type="button"
                          className={`weekly-history-item${
                            selectedHistoryReportId === row.reportId ? ' weekly-history-item-active' : ''
                          }`}
                          onClick={() => void openWeeklyReportFromHistory(row.reportId)}
                        >
                          <span className="weekly-history-meta">
                            생성 {formatDate(row.createdAt)}
                          </span>
                          <span className="weekly-history-snippet">
                            {reportTypeLabel(row.reportType)} · {row.periodStart.slice(0, 10)} ~ {row.periodEnd.slice(0, 10)}
                          </span>
                          <span className="weekly-history-detail">포함 메일 {row.emailCount}건</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </aside>
              ) : null}

              <div className="weekly-main">
                <section className="weekly-card weekly-card-embedded" aria-label="주간보고 생성">
                  <div className="weekly-card-head">
                    <div>
                      <h4>{selectedReportOption.label} 생성</h4>
                      <p>{selectedReportOption.description}</p>
                    </div>
                    <div className="weekly-controls">
                      <label>
                        보고서 종류
                        <select
                          value={selectedReportType}
                          onChange={(event) => setSelectedReportType(event.target.value as ReportType)}
                        >
                          {REPORT_TYPE_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label>
                        시작일
                        <input
                          type="date"
                          value={weeklyStartDate}
                          onChange={(event) => setWeeklyStartDate(event.target.value)}
                        />
                      </label>
                      <label>
                        종료일
                        <input
                          type="date"
                          value={weeklyEndDate}
                          onChange={(event) => setWeeklyEndDate(event.target.value)}
                        />
                      </label>
                      <button
                        type="button"
                        className="btn-weekly"
                        onClick={() => void generateWeeklyReport()}
                        disabled={!primaryMailAccountId || weeklyLoadState === 'loading'}
                      >
                        {weeklyLoadState === 'loading' ? '생성 중…' : selectedReportOption.buttonLabel}
                      </button>
                    </div>
                  </div>
                  {weeklyLoadState === 'error' && weeklyError ? (
                    <p className="status-line" style={{ margin: 0 }}>
                      주간 요약을 만들지 못했습니다. {weeklyError}
                    </p>
                  ) : null}
                  {weeklyReport ? (
                    <>
                      <div className="weekly-report-topline">
                        <p className="weekly-executive">{weeklyReport.executiveSummary}</p>
                        <div className="weekly-draft-card">
                          <div className="weekly-draft-head">
                            <div>
                              <h5>{selectedReportOption.label} 초안</h5>
                              <p>바로 붙여 넣을 수 있게 선택한 보고서 형식에 맞춰 정리했습니다.</p>
                            </div>
                            <button type="button" className="btn-weekly" onClick={() => void copyWeeklyReportDraft()}>
                              보고서 복사
                            </button>
                          </div>
                          {weeklyCopyState === 'done' ? (
                            <p className="weekly-copy-status">보고서 초안을 클립보드에 복사했습니다.</p>
                          ) : null}
                          {weeklyCopyState === 'error' ? (
                            <p className="weekly-copy-status weekly-copy-status-error">클립보드 복사에 실패했습니다.</p>
                          ) : null}
                          <pre className="weekly-draft-text">{weeklyDraftText}</pre>
                        </div>
                      </div>

                      <div className="weekly-columns">
                        {weeklySections.map((section) => (
                          <WeeklySectionCard
                            key={section.title}
                            title={section.title}
                            description={section.description}
                            items={section.items}
                          />
                        ))}
                      </div>
                      <div className="weekly-thread-block">
                        <div className="weekly-thread-head">
                          <div>
                            <h5>근거 메일</h5>
                            <p>보고서 문안에 반영된 메일 흐름을 바로 확인할 수 있습니다.</p>
                          </div>
                        </div>
                        <div className="weekly-thread-cards">
                          {weeklyReport.threadSummaries.map((t) => (
                            <button
                              type="button"
                              className="weekly-thread-card"
                              key={t.emailId}
                              onClick={() => openReportSourceEmail(t.emailId)}
                            >
                              <strong>{t.subject || '(제목 없음)'}</strong>
                              <span>{t.oneLiner || '근거 요약이 없습니다.'}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                      <p className="weekly-meta">
                        {weeklyReport.emailCount}건 기준 · 소스 {weeklyReport.source} · {weeklyReport.modelName}{' '}
                        ({weeklyReport.promptVersion}) · 생성 {weeklyReport.createdAt}
                      </p>
                    </>
                  ) : weeklyLoadState === 'idle' && !weeklyError ? (
                    <p className="status-line" style={{ margin: 0 }}>
                      목록에서 이전 결과를 선택하거나, 새 주간보고를 생성해 주세요.
                    </p>
                  ) : null}
                </section>
              </div>
            </div>
          </div>
          ) : (
          <div className="page-card mailbox-card" aria-label="메일함">
            <div className="status-line" role="status">
              {allMailLoadState === 'loading' && '메일함을 불러오는 중입니다.'}
              {allMailLoadState === 'ready' && `${allEmails.length}건을 불러왔습니다.`}
              {allMailLoadState === 'fallback' && `서버 연결 전이라 샘플 데이터로 보고 있습니다. ${allMailError ?? ''}`}
              {allMailLoadState === 'error' && '메일함을 불러오지 못했습니다.'}
            </div>

            <div className="filter-tabs" role="tablist" aria-label="메일함 분류">
              <FilterTab
                id="mailbox-all"
                selected={mailboxCategory === 'all'}
                onSelect={() => setMailboxCategory('all')}
                label={`전체메일 (${mailboxCounts.all})`}
              />
              <FilterTab
                id="mailbox-inbox"
                selected={mailboxCategory === 'inbox'}
                onSelect={() => setMailboxCategory('inbox')}
                label={`받은메일 (${mailboxCounts.inbox})`}
              />
              <FilterTab
                id="mailbox-sent"
                selected={mailboxCategory === 'sent'}
                onSelect={() => setMailboxCategory('sent')}
                label={`보낸메일 (${mailboxCounts.sent})`}
              />
            </div>

            <div className="filter-tabs mailbox-analysis-tabs" role="tablist" aria-label="메일함 분석 상태 필터">
              <FilterTab
                id="mailbox-analysis-all"
                selected={mailboxAnalysisFilter === 'all'}
                onSelect={() => setMailboxAnalysisFilter('all')}
                label={`전체 상태 (${mailboxAnalysisCounts.all})`}
              />
              <FilterTab
                id="mailbox-analysis-candidate"
                selected={mailboxAnalysisFilter === 'candidate'}
                onSelect={() => setMailboxAnalysisFilter('candidate')}
                label={`분석 대상 (${mailboxAnalysisCounts.candidate})`}
              />
              <FilterTab
                id="mailbox-analysis-excluded"
                selected={mailboxAnalysisFilter === 'excluded'}
                onSelect={() => setMailboxAnalysisFilter('excluded')}
                label={`분석 제외 (${mailboxAnalysisCounts.excluded})`}
              />
              <FilterTab
                id="mailbox-analysis-done"
                selected={mailboxAnalysisFilter === 'done'}
                onSelect={() => setMailboxAnalysisFilter('done')}
                label={`확인 완료 (${mailboxAnalysisCounts.done})`}
              />
            </div>

            <div className="list-toolbar">
              <span className="list-toolbar-note">최신 메일 순서</span>
              <label className="sr-only" htmlFor="all-mail-search">
                메일함 검색
              </label>
              <input
                id="all-mail-search"
                className="toolbar-search"
                value={allMailQuery}
                onChange={(event) => setAllMailQuery(event.target.value)}
                placeholder="제목·발신자·요약 검색"
              />
            </div>

            <div className="pagination-bar" aria-label="전체 메일 페이지">
              <span>
                {filteredAllEmails.length === 0
                  ? '0건'
                  : `${(allMailPage - 1) * ALL_MAIL_PAGE_SIZE + 1}-${Math.min(
                      allMailPage * ALL_MAIL_PAGE_SIZE,
                      filteredAllEmails.length
                    )} / ${filteredAllEmails.length}건`}
              </span>
              <div>
                <button
                  type="button"
                  onClick={() => {
                    setAllMailPage((page) => Math.max(1, page - 1));
                    setExpandedMailId(null);
                  }}
                  disabled={allMailPage <= 1}
                >
                  이전
                </button>
                <strong>
                  {allMailPage} / {allMailTotalPages}
                </strong>
                <button
                  type="button"
                  onClick={() => {
                    setAllMailPage((page) => Math.min(allMailTotalPages, page + 1));
                    setExpandedMailId(null);
                  }}
                  disabled={allMailPage >= allMailTotalPages}
                >
                  다음
                </button>
              </div>
            </div>

            <section className="all-mail-panel">
                <div className="mail-table" role="list">
                  {pagedAllEmails.length === 0 ? (
                    <p className="status-line" style={{ margin: 0 }}>
                      조건에 맞는 메일이 없습니다.
                    </p>
                  ) : (
                    pagedAllEmails.map((email, index) => (
                      <MailListRow
                        key={email.id}
                        email={email}
                        index={(allMailPage - 1) * ALL_MAIL_PAGE_SIZE + index + 1}
                        expanded={email.id === expandedMailId}
                        detail={email.id === expandedMailId && emailDetail?.id === email.id ? emailDetail : null}
                        detailLoadState={detailLoadState}
                        detailErrorMessage={detailErrorMessage}
                        theme={theme}
                        analysisSubmitting={analysisRequestingId === email.id}
                        onRequestAnalysis={requestEmailAnalysis}
                        attentionUpdating={attentionUpdatingId === email.id}
                        onUpdateAttentionStatus={updateAttentionStatus}
                        onSelect={() => {
                          setSelectedEmailId(email.id);
                          setExpandedMailId((current) => (current === email.id ? null : email.id));
                        }}
                      />
                    ))
                  )}
                </div>
            </section>
          </div>
          )}
        </main>
      </div>
    </div>
  );
}

function LoginScreen({
  loading,
  errorMessage,
  onGmailLogin
}: {
  loading: boolean;
  errorMessage: string | null;
  onGmailLogin: () => void;
}) {
  return (
    <main className="login-page" aria-label="로그인">
      <section className="login-visual" aria-hidden="true">
        <div className="login-mail-stack">
          <div className="login-mail-card login-mail-card-top">
            <span>긴급 승인 요청</span>
            <strong>오늘 중 승인 여부 확인 부탁드립니다.</strong>
          </div>
          <div className="login-mail-card login-mail-card-middle">
            <span>보고서 생성</span>
            <strong>금주실적과 차주계획 초안 준비</strong>
          </div>
          <div className="login-mail-card login-mail-card-bottom">
            <span>고객 미팅</span>
            <strong>후속 액션 3건 확인 필요</strong>
          </div>
        </div>
      </section>

      <section className="login-panel">
        <div className="login-brand">
          <div className="login-logo">F</div>
          <div>
            <h1>FNY Mail</h1>
            <p>Gmail 계정으로 메일 분석을 시작합니다.</p>
          </div>
        </div>

        <div className="login-copy">
          <p className="eyebrow">Gmail 연동</p>
          <h2>처리할 메일부터 보고서 초안까지</h2>
          <p>
            연결된 Gmail의 메일을 바탕으로 우선 확인할 메일과 보고서 생성에 필요한 내용을 정리합니다.
          </p>
        </div>

        <button
          type="button"
          className="gmail-login-button"
          onClick={onGmailLogin}
          disabled={loading}
        >
          <IconGoogle size={20} />
          {loading ? 'Gmail 연결 중' : 'Gmail로 시작하기'}
        </button>

        {errorMessage ? (
          <p className="login-error">Gmail 연결을 시작하지 못했습니다. {errorMessage}</p>
        ) : (
          <p className="login-note">Google 계정 권한 승인 후 메일함으로 이동합니다.</p>
        )}
      </section>
    </main>
  );
}

function FilterTab({
  id,
  selected,
  onSelect,
  label
}: {
  id: string;
  selected: boolean;
  onSelect: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="tab"
      id={id}
      aria-selected={selected}
      className={`filter-tab${selected ? ' filter-tab-active' : ''}`}
      onClick={onSelect}
    >
      {label}
    </button>
  );
}

function IconGoogle({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M21.6 12.2c0-.7-.1-1.3-.2-1.9H12v3.6h5.4a4.6 4.6 0 01-2 3v2.5h3.2c1.9-1.7 3-4.2 3-7.2z"
      />
      <path
        fill="#34A853"
        d="M12 22c2.7 0 5-0.9 6.6-2.5l-3.2-2.5c-.9.6-2 .9-3.4.9-2.6 0-4.8-1.8-5.6-4.1H3.1v2.6A10 10 0 0012 22z"
      />
      <path
        fill="#FBBC05"
        d="M6.4 13.8a6 6 0 010-3.6V7.6H3.1a10 10 0 000 8.8l3.3-2.6z"
      />
      <path
        fill="#EA4335"
        d="M12 6.1c1.5 0 2.8.5 3.8 1.5l2.8-2.8A9.6 9.6 0 0012 2a10 10 0 00-8.9 5.6l3.3 2.6C7.2 7.9 9.4 6.1 12 6.1z"
      />
    </svg>
  );
}

function IconChevron({ size = 16 }: { size?: number }) {
  return (
    <svg
      className="sidebar-chevron"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M9 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconLayoutDashboard({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 13h7V4H4v9zm0 7h7v-5H4v5zm9 0h7V11h-7v9zm0-16v5h7V4h-7z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconInbox({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 5h16v6.5l-3 3H7l-3-3V5z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path d="M4 11.5h5a2 2 0 004 0h7" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

function IconSparkles({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 3l1.2 4.2L17 8.5l-3.8 1.3L12 14l-1.2-4.2L7 8.5l3.8-1.3L12 3zM5 15l.7 2.3L8 18l-2.3.7L5 21l-.7-2.3L2 18l2.3-.7L5 15zM17 16l.6 1.8 1.8.6-1.8.6-.6 1.8-.6-1.8-1.8-.6 1.8-.6.6-1.8z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconWeeklyReport({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M8 4h12v14H8V4z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path d="M8 8h12M12 4v14" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      <path
        d="M4 8h3v12H4V8z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path d="M4 12h3" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

function IconSettings({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 15.5a3.5 3.5 0 100-7 3.5 3.5 0 000 7z"
        stroke="currentColor"
        strokeWidth="1.75"
      />
      <path
        d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.6a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9c.26.604.852.997 1.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconHelp({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M9.09 9a3 3 0 115.82 1c0 2-3 2-3 4M12 17h.01"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.75" />
    </svg>
  );
}

function IconSearch({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.75" />
      <path d="M16 16l4.5 4.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

function IconBell({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 22a2.5 2.5 0 002.45-2h-4.9A2.5 2.5 0 0012 22zM18 16v-5a6 6 0 10-12 0v5l-2 2h16l-2-2z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Metric({
  label,
  value,
  tone = 'default',
  selected = false,
  onClick
}: {
  label: string;
  value: number;
  tone?: 'default' | 'blue' | 'red' | 'green';
  selected?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      className={`metric metric-${tone}${selected ? ' metric-selected' : ''}`}
      onClick={onClick}
      aria-pressed={selected}
    >
      <span>{label}</span>
      <strong>{value.toLocaleString('ko-KR')}</strong>
    </button>
  );
}

function EmailRow({
  email,
  rank,
  selected,
  onSelect
}: {
  email: EmailListItem;
  rank: number;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button className={`email-row ${selected ? 'email-row-selected' : ''}`} type="button" onClick={onSelect}>
      <div className="rank">{rank}</div>
      <div className="email-content">
        <div className="email-head">
          <div>
            <p className="sender">{email.fromName ?? email.fromEmail}</p>
            <h3>{email.subject}</h3>
          </div>
          <PriorityBadge priority={email.priorityLevel} />
        </div>

        <p className="summary">{email.shortSummary || email.snippet || '요약 대기 중입니다.'}</p>

        <div className="email-meta">
          <span>{formatDate(email.receivedAt)}</span>
          {email.category && <span>{email.category}</span>}
          {email.hasAttachment && <span>첨부 있음</span>}
        </div>

        <div className="reason-list" aria-label="우선 노출 이유">
          {email.attentionReasons.map((reason) => (
            <span key={reason}>{reasonLabel[reason] ?? reason}</span>
          ))}
        </div>
      </div>
    </button>
  );
}

function MailListRow({
  email,
  index,
  expanded,
  detail,
  detailLoadState,
  detailErrorMessage,
  theme,
  analysisSubmitting,
  onRequestAnalysis,
  attentionUpdating,
  onUpdateAttentionStatus,
  onSelect
}: {
  email: EmailListItem;
  index: number;
  expanded: boolean;
  detail: EmailDetail | null;
  detailLoadState: DetailLoadState;
  detailErrorMessage: string | null;
  theme: 'light' | 'dark';
  analysisSubmitting: boolean;
  onRequestAnalysis: (emailId: string) => void;
  attentionUpdating: boolean;
  onUpdateAttentionStatus: (emailId: string, status: AttentionStatus) => void;
  onSelect: () => void;
}) {
  const analysis = detail?.analysis;
  const isLoading = expanded && detailLoadState === 'loading';

  return (
    <div className={`mail-list-item${expanded ? ' mail-list-item-expanded' : ''}`} role="listitem">
      <button
        className="mail-list-row"
        type="button"
        onClick={onSelect}
        aria-expanded={expanded}
      >
        <span className="mail-list-index">{index}</span>
        <span className="mail-list-main">
          <strong>{email.subject}</strong>
          <span>{email.shortSummary || email.snippet || '요약 대기 중입니다.'}</span>
        </span>
        <span className="mail-list-sender">
          <strong>{email.fromName ?? email.fromEmail}</strong>
          <span>{email.fromEmail}</span>
        </span>
        <span className="mail-list-meta">
          {!isOpenAttentionStatus(email.attentionStatus) ? (
            <span className="resolved-pill">{attentionStatusLabel(email.attentionStatus)}</span>
          ) : null}
          <PriorityBadge priority={email.priorityLevel} />
          <span>{formatDate(email.receivedAt)}</span>
        </span>
      </button>

      {expanded ? (
        <div className="mail-inline-detail">
          {isLoading ? (
            <p className="status-line" style={{ margin: 0 }}>
              메일 내용을 불러오는 중입니다.
            </p>
          ) : (
            <>
              {detailLoadState === 'fallback' && detailErrorMessage ? (
                <p className="status-line" style={{ margin: 0 }}>
                  임시 상세로 보고 있습니다. {detailErrorMessage}
                </p>
              ) : null}

              <div className="mail-inline-grid">
                <section>
                  <p className="eyebrow">Analysis Status</p>
                  <AnalysisStatusCard
                    detail={detail}
                    loading={isLoading}
                    submitting={analysisSubmitting}
                    onRequest={() => onRequestAnalysis(email.id)}
                    attentionUpdating={attentionUpdating}
                    onUpdateAttentionStatus={(status) => onUpdateAttentionStatus(email.id, status)}
                    compact
                  />
                </section>
                <section>
                  <p className="eyebrow">Original Mail</p>
                  {detail ? (
                    <OriginalMailBody detail={detail} fallback={email.snippet} theme={theme} compact />
                  ) : (
                    <p>{decodeHtmlEntities(email.snippet || '본문이 없습니다.')}</p>
                  )}
                </section>
                <section>
                  <p className="eyebrow">Summary</p>
                  <p>
                    {analysis?.detailedSummary ||
                      analysis?.shortSummary ||
                      email.shortSummary ||
                      '분석 요약을 기다리고 있습니다.'}
                  </p>
                </section>
                <section>
                  <p className="eyebrow">Scores</p>
                  <div className="inline-score-list">
                    <Score label="중요도" value={analysis?.importanceScore ?? email.importanceScore} />
                    <Score label="긴급도" value={analysis?.urgencyScore ?? email.urgencyScore} />
                    <Score label="신뢰도" value={analysis?.confidenceScore} />
                  </div>
                </section>
                <section>
                  <p className="eyebrow">Action Items</p>
                  {detail?.actionItems && detail.actionItems.length > 0 ? (
                    <div className="action-list">
                      {detail.actionItems.map((item) => (
                        <div className="action-item" key={item.id}>
                          <span>{item.actionType ?? 'ACTION'}</span>
                          <p>{item.actionText}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p>{analysis?.suggestedAction || '추출된 액션이 없습니다.'}</p>
                  )}
                </section>
              </div>
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}

function EmailDetailPanel({
  detail,
  loadState,
  errorMessage,
  theme,
  analysisSubmitting,
  onRequestAnalysis,
  attentionUpdating,
  onUpdateAttentionStatus
}: {
  detail: EmailDetail | null;
  loadState: DetailLoadState;
  errorMessage: string | null;
  theme: 'light' | 'dark';
  analysisSubmitting: boolean;
  onRequestAnalysis: (emailId: string) => void;
  attentionUpdating: boolean;
  onUpdateAttentionStatus: (emailId: string, status: AttentionStatus) => void;
}) {
  if (!detail) {
    return (
      <aside className="detail-panel">
        <div className="section-heading">
          <p className="eyebrow">Mail Detail</p>
          <h2>메일을 선택하세요</h2>
        </div>
      </aside>
    );
  }

  const analysis = detail.analysis;

  return (
    <aside className="detail-panel" aria-label="메일 상세">
      <div className="detail-status">
        {loadState === 'loading' && '상세를 불러오는 중입니다.'}
        {loadState === 'ready' && '서버 상세 데이터입니다.'}
        {loadState === 'fallback' && `샘플 상세로 보고 있습니다. ${errorMessage ?? ''}`}
      </div>

      <div className="section-heading">
        <p className="eyebrow">Mail Detail</p>
        <h2>{detail.subject}</h2>
      </div>

      <div className="detail-sender">
        <span>{detail.fromName ?? detail.fromEmail}</span>
        <strong>{detail.fromEmail}</strong>
      </div>

      <AnalysisStatusCard
        detail={detail}
        loading={loadState === 'loading'}
        submitting={analysisSubmitting}
        onRequest={() => onRequestAnalysis(detail.id)}
        attentionUpdating={attentionUpdating}
        onUpdateAttentionStatus={(status) => onUpdateAttentionStatus(detail.id, status)}
      />

      <div className="score-grid">
        <Score label="중요도" value={analysis?.importanceScore} />
        <Score label="긴급도" value={analysis?.urgencyScore} />
        <Score label="신뢰도" value={analysis?.confidenceScore} />
      </div>

      <section className="detail-block">
        <p className="eyebrow">Summary</p>
        <p>{analysis?.detailedSummary || analysis?.shortSummary || detail.snippet || '분석 요약을 기다리고 있습니다.'}</p>
      </section>

      {analysis ? (
        <section className="detail-block analysis-insight">
          <p className="eyebrow">My Task</p>
          <strong>{analysis.userTaskSummary || analysis.suggestedAction || '필요 시 내용을 확인하세요.'}</strong>
          <div className="analysis-insight-grid">
            <span>액션 {analysis.requiresAction ? '필요' : '불필요'}</span>
            <span>{timeSensitivityLabel(analysis.timeSensitivity)}</span>
            {analysis.deadlineText ? <span>{analysis.deadlineText}</span> : null}
          </div>
          {analysis.priorityReasonCodes.length > 0 ? (
            <div className="priority-reason-list" aria-label="우선순위 판단 사유">
              {analysis.priorityReasonCodes.map((reason) => (
                <span key={reason}>{priorityReasonLabel(reason)}</span>
              ))}
            </div>
          ) : null}
        </section>
      ) : null}

      {analysis?.suggestedAction && (
        <section className="detail-block action-callout">
          <p className="eyebrow">Suggested Action</p>
          <strong>{analysis.suggestedAction}</strong>
        </section>
      )}

      <section className="detail-block">
        <p className="eyebrow">Action Items</p>
        <div className="action-list">
          {detail.actionItems.length > 0 ? (
            detail.actionItems.map((item) => (
              <div className="action-item" key={item.id}>
                <span>{item.actionType ?? 'ACTION'}</span>
                <p>{item.actionText}</p>
              </div>
            ))
          ) : (
            <p>추출된 액션이 없습니다.</p>
          )}
        </div>
      </section>

      <section className="detail-block">
        <p className="eyebrow">Reasoning</p>
        <p>{analysis?.reasoning || '판단 사유가 아직 없습니다.'}</p>
      </section>

      <section className="detail-block original-mail">
        <p className="eyebrow">Original Mail</p>
        <OriginalMailBody detail={detail} theme={theme} />
      </section>
    </aside>
  );
}

function WeeklySectionCard({
  title,
  description,
  items
}: {
  title: string;
  description: string;
  items: string[];
}) {
  return (
    <div className="weekly-section-card">
      <div className="weekly-section-head">
        <h5>{title}</h5>
        <p>{description}</p>
      </div>
      <ul className="weekly-list">
        {items.length > 0 ? items.map((line, index) => <li key={`${title}-${index}`}>{line}</li>) : <li>정리된 내용이 없습니다.</li>}
      </ul>
    </div>
  );
}

function AnalysisStatusCard({
  detail,
  loading,
  submitting,
  onRequest,
  attentionUpdating,
  onUpdateAttentionStatus,
  compact = false
}: {
  detail: EmailDetail | null;
  loading: boolean;
  submitting: boolean;
  onRequest: () => void;
  attentionUpdating: boolean;
  onUpdateAttentionStatus: (status: AttentionStatus) => void;
  compact?: boolean;
}) {
  const status = resolveAnalysisStatus(detail, loading, submitting);
  const latestJob = detail ? getLatestAnalysisJob(detail) : null;
  const canRequest = Boolean(detail) && !loading && !submitting;
  const canUpdateAttention = Boolean(detail) && !loading && !attentionUpdating;

  return (
    <div className={`analysis-status-card${compact ? ' analysis-status-card-compact' : ''}`}>
      <div className="analysis-status-main">
        <span className={`analysis-status-badge analysis-status-${status.tone}`}>{status.label}</span>
        <p>{status.description}</p>
      </div>
      {latestJob ? (
        <dl className="analysis-job-meta">
          <div>
            <dt>최근 작업</dt>
            <dd>{analysisJobStatusLabel(latestJob.status)}</dd>
          </div>
          <div>
            <dt>요청 시각</dt>
            <dd>{formatDate(latestJob.createdAt)}</dd>
          </div>
        </dl>
      ) : null}
      {detail?.analysisCandidateEvaluatedAt ? (
        <div className="candidate-panel">
          <div className="candidate-score-line">
            <span>{detail.analysisEligible ? '자동 분석 대상' : '자동 분석 제외'}</span>
            <strong>{detail.analysisCandidateScore ?? 0}점</strong>
          </div>
          {detail.analysisSkippedReason ? (
            <p>{analysisSkippedReasonLabel(detail.analysisSkippedReason)}</p>
          ) : null}
          {parseCandidateReasons(detail.analysisCandidateReasons).length > 0 ? (
            <div className="candidate-reason-list" aria-label="분석 후보 판단 사유">
              {parseCandidateReasons(detail.analysisCandidateReasons).map((reason) => (
                <span key={reason}>{candidateReasonLabel(reason)}</span>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
      {detail ? (
        <div className="attention-resolve-panel">
          <div>
            <span>{attentionStatusLabel(detail.attentionStatus)}</span>
            <p>
              {!isOpenAttentionStatus(detail.attentionStatus)
                ? `홈 우선순위에서 제외됨${detail.attentionStatusUpdatedAt ? ` · ${formatDate(detail.attentionStatusUpdatedAt)}` : ''}`
                : '확인하거나 처리했다면 완료로 표시하세요.'}
            </p>
          </div>
          <div className="attention-status-actions">
            {isOpenAttentionStatus(detail.attentionStatus) ? (
              <>
                <button
                  type="button"
                  className="attention-resolve-btn"
                  onClick={() => onUpdateAttentionStatus('REVIEWED')}
                  disabled={!canUpdateAttention}
                >
                  확인 완료
                </button>
                <button
                  type="button"
                  className="attention-resolve-btn"
                  onClick={() => onUpdateAttentionStatus('COMPLETED')}
                  disabled={!canUpdateAttention}
                >
                  처리 완료
                </button>
                <button
                  type="button"
                  className="attention-resolve-btn attention-resolve-secondary"
                  onClick={() => onUpdateAttentionStatus('DEFERRED')}
                  disabled={!canUpdateAttention}
                >
                  보류
                </button>
              </>
            ) : (
              <button
                type="button"
                className="attention-resolve-btn attention-resolve-secondary"
                onClick={() => onUpdateAttentionStatus('NEEDS_ATTENTION')}
                disabled={!canUpdateAttention}
              >
                다시 표시
              </button>
            )}
            {attentionUpdating ? <span className="attention-saving-text">저장 중</span> : null}
          </div>
        </div>
      ) : null}
      <div className="analysis-status-actions">
        <button type="button" className="analysis-request-btn" onClick={onRequest} disabled={!canRequest}>
          {submitting ? '요청 중' : detail?.analysis ? '다시 분석' : '분석 요청'}
        </button>
      </div>
    </div>
  );
}

function OriginalMailBody({
  detail,
  fallback,
  theme,
  compact = false
}: {
  detail: EmailDetail;
  fallback?: string | null;
  theme: 'light' | 'dark';
  compact?: boolean;
}) {
  if (detail.bodyHtml && detail.bodyHtml.trim()) {
    return (
      <iframe
        className={`original-mail-frame${compact ? ' original-mail-frame-compact' : ''}`}
        title={`${detail.subject} 원문`}
        sandbox=""
        srcDoc={buildMailHtmlDocument(detail.bodyHtml, theme)}
      />
    );
  }

  return (
    <p className="original-mail-text">
      {decodeHtmlEntities(detail.bodyText || detail.snippet || fallback || '본문이 없습니다.')}
    </p>
  );
}

function Score({ label, value }: { label: string; value: number | null | undefined }) {
  return (
    <div className="score">
      <span>{label}</span>
      <strong>{value == null ? '-' : Math.round(value)}</strong>
    </div>
  );
}

function PriorityBadge({ priority }: { priority: string | null }) {
  const normalized = (priority ?? 'WAITING').toUpperCase();
  const label = priorityLabel(normalized);
  const description = priorityDescription(normalized);
  return (
    <span className={`priority priority-${normalized.toLowerCase()}`} title={description}>
      {label}
    </span>
  );
}

function normalizeOverview(data: MailboxOverview): MailboxOverview {
  return {
    ...data,
    spotlightEmails: normalizeEmailList(data.spotlightEmails)
  };
}

function normalizeEmailList(emails: EmailListItem[]): EmailListItem[] {
  return emails.map((email) => ({
    ...email,
    analysisEligible: email.analysisEligible ?? false,
    analysisCandidateScore: email.analysisCandidateScore ?? null,
    analysisCandidateReasons: email.analysisCandidateReasons ?? null,
    analysisSkippedReason: email.analysisSkippedReason ?? null,
    analysisCandidateEvaluatedAt: email.analysisCandidateEvaluatedAt ?? null,
    attentionResolved: email.attentionResolved ?? false,
    attentionResolvedAt: email.attentionResolvedAt ?? null,
    attentionStatus: normalizeAttentionStatus(email.attentionStatus),
    attentionStatusUpdatedAt: email.attentionStatusUpdatedAt ?? email.attentionResolvedAt ?? null,
    attentionReasons: email.attentionReasons ?? []
  }));
}

function normalizeEmailDetail(data: EmailDetail): EmailDetail {
  return {
    ...data,
    analysis: data.analysis
      ? {
          ...data.analysis,
          priorityReasonCodes: data.analysis.priorityReasonCodes ?? []
        }
      : null,
    actionItems: data.actionItems ?? [],
    analysisEligible: data.analysisEligible ?? false,
    analysisCandidateScore: data.analysisCandidateScore ?? null,
    analysisCandidateReasons: data.analysisCandidateReasons ?? null,
    analysisSkippedReason: data.analysisSkippedReason ?? null,
    analysisCandidateEvaluatedAt: data.analysisCandidateEvaluatedAt ?? null,
    attentionResolved: data.attentionResolved ?? false,
    attentionResolvedAt: data.attentionResolvedAt ?? null,
    attentionStatus: normalizeAttentionStatus(data.attentionStatus),
    attentionStatusUpdatedAt: data.attentionStatusUpdatedAt ?? data.attentionResolvedAt ?? null,
    analysisJobs: data.analysisJobs ?? []
  };
}

async function readApiError(response: Response) {
  try {
    const data = (await response.json()) as { message?: string };
    return data.message || `API returned ${response.status}`;
  } catch {
    return `API returned ${response.status}`;
  }
}

function getLatestAnalysisJob(detail: EmailDetail) {
  return [...detail.analysisJobs].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )[0] ?? null;
}

function resolveAnalysisStatus(
  detail: EmailDetail | null,
  loading: boolean,
  submitting: boolean
): {
  label: string;
  tone: 'complete' | 'pending' | 'failed' | 'empty';
  description: string;
} {
  if (loading || submitting) {
    return {
      label: '분석 요청 중',
      tone: 'pending',
      description: '메일 내용을 분석 작업으로 전달하고 있습니다.'
    };
  }

  if (!detail) {
    return {
      label: '대기',
      tone: 'empty',
      description: '메일을 선택하면 분석 상태를 확인할 수 있습니다.'
    };
  }

  const latestJob = getLatestAnalysisJob(detail);
  if (latestJob && latestJob.status !== 'COMPLETED') {
    const failed = latestJob.status === 'FAILED';
    const waitingAgent = latestJob.status === 'WAITING_AGENT';
    return {
      label: failed ? '분석 실패' : waitingAgent ? 'Agent 대기' : '분석 대기',
      tone: failed ? 'failed' : 'pending',
      description: failed
        ? latestJob.errorMessage || '분석 작업이 실패했습니다. 다시 분석을 요청할 수 있습니다.'
        : waitingAgent
          ? latestJob.errorMessage || 'Agent 서버가 준비되면 분석할 수 있습니다.'
        : '분석 작업이 등록되어 결과를 기다리고 있습니다.'
    };
  }

  if (detail.analysis) {
    return {
      label: '분석 완료',
      tone: 'complete',
      description: detail.analysis.modelName
        ? `${detail.analysis.modelName} 기준으로 분석했습니다.`
        : '메일 분석 결과가 준비되었습니다.'
    };
  }

  return {
    label: '분석 없음',
    tone: 'empty',
    description: '아직 이 메일의 요약, 점수, 액션이 생성되지 않았습니다.'
  };
}

function analysisJobStatusLabel(status: string) {
  if (status === 'COMPLETED') {
    return '완료';
  }
  if (status === 'PENDING') {
    return '대기';
  }
  if (status === 'FAILED') {
    return '실패';
  }
  if (status === 'RUNNING') {
    return '진행 중';
  }
  if (status === 'WAITING_AGENT') {
    return 'Agent 대기';
  }
  return status;
}

function parseCandidateReasons(value: string | null) {
  if (!value) {
    return [];
  }
  return value
    .split(',')
    .map((reason) => reason.trim())
    .filter(Boolean);
}

function candidateReasonLabel(reason: string) {
  const labels: Record<string, string> = {
    UNREAD: '읽지 않음',
    STARRED: '중요 표시',
    IMPORTANT_HEADER: '중요 헤더',
    HAS_ATTACHMENT: '첨부 있음',
    RECENT_3_DAYS: '최근 3일',
    DIRECT_TO_ME: '직접 수신',
    ACTION_KEYWORD: '요청/회신 키워드',
    MEETING_KEYWORD: '회의/일정 키워드',
    INCIDENT_KEYWORD: '긴급/장애 키워드',
    LOW_VALUE_CATEGORY: '낮은 가치 카테고리',
    AUTO_SENDER: '자동 발신자',
    LOW_VALUE_CONTENT: '광고/알림성 내용'
  };
  return labels[reason] ?? reason;
}

function analysisSkippedReasonLabel(reason: string) {
  const labels: Record<string, string> = {
    OLD_MAIL: '최근 30일이 지난 메일이라 자동 분석에서 제외했습니다.',
    LOW_CANDIDATE_SCORE: '업무 처리 신호가 낮아 자동 분석에서 제외했습니다.'
  };
  return labels[reason] ?? reason;
}

function buildReportSections(report: WeeklyReport, reportType: ReportType) {
  if (reportType === 'PROGRESS') {
    return [
      {
        title: '주요 진행 내용',
        description: '현재까지 진행된 핵심 업무와 진척 상황입니다.',
        items: report.highlights
      },
      {
        title: '진행 중 이슈',
        description: '계속 추적해야 할 이슈와 리스크입니다.',
        items: report.risksBlockers
      },
      {
        title: '결정 필요 사항',
        description: '회신, 승인, 검토가 필요한 항목입니다.',
        items: report.pendingDecisions
      },
      {
        title: '다음 액션',
        description: '바로 이어서 실행할 다음 단계입니다.',
        items: report.nextWeekSuggestions
      }
    ];
  }

  if (reportType === 'ISSUE') {
    return [
      {
        title: '핵심 이슈',
        description: '우선 공유해야 할 장애, 리스크, 특이사항입니다.',
        items: report.risksBlockers
      },
      {
        title: '현재 영향',
        description: '이번 기간 동안 확인된 진행 상황과 영향 범위입니다.',
        items: report.highlights
      },
      {
        title: '확인 필요',
        description: '추가 판단이나 대응이 필요한 항목입니다.',
        items: report.pendingDecisions
      },
      {
        title: '후속 조치',
        description: '이슈 대응을 위해 이어서 진행할 작업입니다.',
        items: report.nextWeekSuggestions
      }
    ];
  }

  return [
    {
      title: '금주실적',
      description: '이번 주에 완료했거나 의미 있는 진척이 확인된 내용입니다.',
      items: report.highlights
    },
    {
      title: '특이사항',
      description: '장애, 일정 지연, 리스크처럼 따로 공유할 내용입니다.',
      items: report.risksBlockers
    },
    {
      title: '확인 필요',
      description: '회신, 승인, 검토처럼 다음 판단이 필요한 내용입니다.',
      items: report.pendingDecisions
    },
    {
      title: '차주계획',
      description: '다음 주 이어서 처리하거나 준비할 업무입니다.',
      items: report.nextWeekSuggestions
    }
  ];
}

function buildWeeklyReportDraft(report: WeeklyReport, reportType: ReportType) {
  const sections = buildReportSections(report, reportType);

  const body = sections
    .map((section) =>
      `${section.title}\n${section.items.length > 0 ? section.items.map((item) => `- ${item}`).join('\n') : '- 해당 사항 없음'}`
    )
    .join('\n\n');

  const title =
    reportType === 'PROGRESS' ? '업무 진행 보고 초안' : reportType === 'ISSUE' ? '이슈 보고 초안' : '주간보고 초안';

  return [`[${title}]`, '', `요약`, report.executiveSummary, '', body].join('\n');
}

function normalizeReportType(value: string | null | undefined): ReportType {
  if (value === 'PROGRESS' || value === 'ISSUE') {
    return value;
  }
  return 'WEEKLY';
}

function reportTypeLabel(reportType: ReportType | string | null | undefined) {
  const normalized = normalizeReportType(reportType);
  return REPORT_TYPE_OPTIONS.find((option) => option.value === normalized)?.label ?? '주간보고';
}

function normalizeAttentionStatus(status: string | null | undefined): AttentionStatus {
  if (status === 'REVIEWED' || status === 'COMPLETED' || status === 'DEFERRED') {
    return status;
  }
  return 'NEEDS_ATTENTION';
}

function isOpenAttentionStatus(status: AttentionStatus | string | null | undefined) {
  return normalizeAttentionStatus(status) === 'NEEDS_ATTENTION';
}

function attentionStatusLabel(status: AttentionStatus | string | null | undefined) {
  const labels: Record<AttentionStatus, string> = {
    NEEDS_ATTENTION: '확인 필요',
    REVIEWED: '확인 완료',
    COMPLETED: '처리 완료',
    DEFERRED: '보류'
  };
  return labels[normalizeAttentionStatus(status)];
}

function timeSensitivityLabel(value: string | null) {
  const labels: Record<string, string> = {
    IMMEDIATE: '즉시 처리',
    TODAY: '오늘 처리',
    THIS_WEEK: '이번 주 처리',
    NO_DEADLINE: '마감 없음'
  };
  return labels[value ?? ''] ?? '마감 없음';
}

function priorityReasonLabel(reason: string) {
  const labels: Record<string, string> = {
    HIGH_URGENCY: '긴급도 높음',
    NEEDS_REPLY: '회신 필요',
    DEADLINE_SIGNAL: '마감 신호',
    URGENT_CATEGORY: '긴급 메일',
    FINANCE_RELATED: '재무 관련',
    MEETING_RELATED: '일정 관련',
    BUSINESS_IMPACT: '업무 영향',
    NO_STRONG_SIGNAL: '강한 신호 없음'
  };
  return labels[reason] ?? reason;
}

function priorityLabel(priority: string) {
  if (priority === 'P1') {
    return '매우 중요';
  }
  if (priority === 'P2') {
    return '중요';
  }
  if (priority === 'P3') {
    return '일반';
  }
  return '분석 대기';
}

function priorityDescription(priority: string) {
  if (priority === 'P1') {
    return '바로 확인이 필요한 메일';
  }
  if (priority === 'P2') {
    return '오늘 안에 확인하면 좋은 메일';
  }
  if (priority === 'P3') {
    return '일반 확인 대상 메일';
  }
  return '아직 우선순위 분석이 완료되지 않았습니다.';
}

function decodeHtmlEntities(value: string) {
  const textarea = document.createElement('textarea');
  textarea.innerHTML = value;
  return textarea.value;
}

function buildMailHtmlDocument(bodyHtml: string, theme: 'light' | 'dark') {
  const isDark = theme === 'dark';
  const textColor = isDark ? '#eef3f6' : '#1a2332';
  const backgroundColor = isDark ? '#1d2226' : '#ffffff';

  return `<!doctype html>
<html>
<head>
  <base target="_blank">
  <style>
    html {
      color: ${textColor};
      background: ${backgroundColor};
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      font-size: 14px;
      line-height: 1.6;
      overflow-wrap: anywhere;
    }
    body {
      margin: 0;
      padding: 0;
    }
    img {
      max-width: 100%;
      height: auto;
    }
    table {
      max-width: 100%;
    }
  </style>
</head>
<body>${bodyHtml}</body>
</html>`;
}

function readStoredTheme(): 'light' | 'dark' {
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  return stored === 'dark' ? 'dark' : 'light';
}

function readStoredAuthSession(): AuthSession | null {
  try {
    const callbackSession = readAuthSessionFromCallback();
    if (callbackSession) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(callbackSession));
      window.history.replaceState({}, document.title, '/');
      return callbackSession;
    }

    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as Partial<AuthSession>;
    if (!parsed.userId || !parsed.mailAccountId || !parsed.accountEmail) {
      return null;
    }
    return {
      userId: parsed.userId,
      displayName: parsed.displayName ?? null,
      primaryEmail: parsed.primaryEmail ?? parsed.accountEmail,
      mailAccountId: parsed.mailAccountId,
      provider: parsed.provider ?? 'GOOGLE',
      accountEmail: parsed.accountEmail
    };
  } catch {
    return null;
  }
}

function readAuthSessionFromCallback(): AuthSession | null {
  if (window.location.pathname !== '/auth/callback') {
    return null;
  }

  const params = new URLSearchParams(window.location.search);
  const userId = params.get('userId');
  const mailAccountId = params.get('mailAccountId');
  const accountEmail = params.get('accountEmail');

  if (!userId || !mailAccountId || !accountEmail) {
    return null;
  }

  return {
    userId,
    displayName: params.get('displayName'),
    primaryEmail: params.get('primaryEmail') ?? accountEmail,
    mailAccountId,
    provider: params.get('provider') ?? 'GOOGLE',
    accountEmail
  };
}

function createDetailFromListItem(email: EmailListItem | undefined): EmailDetail | null {
  if (!email) {
    return null;
  }

  const hasAnalysisSnapshot = Boolean(
    email.shortSummary ||
      email.category ||
      email.priorityLevel ||
      email.importanceScore != null ||
      email.urgencyScore != null ||
      email.needsReply != null
  );

  return {
    id: email.id,
    mailAccountId: '',
    accountEmail: '',
    provider: '',
    externalMessageId: email.id,
    externalThreadId: null,
    internetMessageId: null,
    subject: email.subject,
    bodyText: email.snippet,
    bodyHtml: null,
    snippet: email.snippet,
    fromName: email.fromName,
    fromEmail: email.fromEmail,
    receivedAt: email.receivedAt,
    sentAt: null,
    read: email.read,
    starred: email.starred,
    hasAttachment: email.hasAttachment,
    importanceHeader: null,
    analysisEligible: email.analysisEligible,
    analysisCandidateScore: email.analysisCandidateScore,
    analysisCandidateReasons: email.analysisCandidateReasons,
    analysisSkippedReason: email.analysisSkippedReason,
    analysisCandidateEvaluatedAt: email.analysisCandidateEvaluatedAt,
    attentionResolved: email.attentionResolved,
    attentionResolvedAt: email.attentionResolvedAt,
    attentionStatus: email.attentionStatus,
    attentionStatusUpdatedAt: email.attentionStatusUpdatedAt,
    analysis: hasAnalysisSnapshot
      ? {
          id: `${email.id}_analysis`,
          analysisVersion: 1,
          modelName: null,
          promptVersion: null,
          shortSummary: email.shortSummary,
          detailedSummary: email.shortSummary,
          category: email.category,
          priorityLevel: email.priorityLevel,
          importanceScore: email.importanceScore,
          urgencyScore: email.urgencyScore,
      confidenceScore: null,
      needsReply: email.needsReply,
      hasDeadline: email.attentionReasons.includes('HAS_DEADLINE'),
      deadlineAt: null,
      deadlineText: null,
      timeSensitivity: email.attentionReasons.includes('HAS_DEADLINE') ? 'THIS_WEEK' : 'NO_DEADLINE',
      requiresAction: Boolean(email.needsReply || email.attentionReasons.includes('HAS_DEADLINE')),
      userTaskSummary: email.needsReply ? '메일 내용을 확인하고 회신 필요 여부를 판단해야 합니다.' : '필요 시 메일 내용을 확인하면 됩니다.',
      priorityReasonCodes: email.attentionReasons.includes('HAS_DEADLINE')
        ? ['DEADLINE_SIGNAL']
        : email.needsReply
          ? ['NEEDS_REPLY']
          : [],
      suggestedAction: email.needsReply ? '내용 확인 후 회신' : '내용 확인',
          reasoning: '목록 응답을 기준으로 만든 임시 상세입니다.',
          status: 'READY',
          analyzedAt: new Date().toISOString()
        }
      : null,
    actionItems: email.needsReply
      ? [
          {
            id: `${email.id}_action`,
            actionText: '메일 내용 확인 및 회신',
            actionType: 'REPLY',
            priorityLevel: email.priorityLevel,
            dueAt: null,
            completed: false
          }
        ]
      : [],
    analysisJobs: []
  };
}

function scoreEmail(email: EmailListItem) {
  const priorityScore = email.priorityLevel === 'P1' ? 500 : email.priorityLevel === 'P2' ? 350 : email.priorityLevel === 'P3' ? 150 : 0;
  const replyScore = email.needsReply ? 120 : 0;
  const unreadScore = email.read ? 0 : 80;
  const starredScore = email.starred ? 60 : 0;
  const urgencyScore = email.urgencyScore ?? 0;
  const importanceScore = email.importanceScore ?? 0;

  return priorityScore + replyScore + unreadScore + starredScore + urgencyScore + importanceScore;
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function toDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function todayKey() {
  return toDateInputValue(new Date());
}

function autoSyncMarkerKey(mailAccountId: string) {
  return `${AUTO_SYNC_STORAGE_KEY_PREFIX}.${mailAccountId}`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('ko-KR', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(value));
}

export default App;
