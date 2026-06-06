export type AttentionReason = 'HIGH_PRIORITY' | 'NEEDS_REPLY' | 'UNREAD' | 'STARRED' | 'HAS_DEADLINE';
export type AttentionStatus = 'NEEDS_ATTENTION' | 'REVIEWED' | 'COMPLETED' | 'DEFERRED';
export type AnalysisFeedbackType = 'ACCEPTED' | 'NEEDS_FIX';

export type EmailListItem = {
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

export type MailboxOverview = {
  userId: string;
  totalEmails: number;
  unreadEmails: number;
  needsReplyEmails: number;
  highPriorityEmails: number;
  pendingAnalysisJobs: number;
  spotlightEmails: EmailListItem[];
};

export type LoadState = 'idle' | 'loading' | 'ready' | 'fallback' | 'error';
export type DetailLoadState = 'idle' | 'loading' | 'ready' | 'fallback' | 'error';
export type WeeklyLoadState = 'idle' | 'loading' | 'ready' | 'error';
export type SpotlightFilter = 'all' | 'urgent' | 'reply' | 'unread';
export type AnalysisQueueFilter = 'candidate' | 'excluded' | 'done';
export type NavView = 'home' | 'weekly' | 'allMail' | 'mailDetail' | 'accounts' | 'settings';
export type MailboxCategory = 'all' | 'inbox' | 'sent';
export type MailboxAnalysisFilter = 'all' | 'candidate' | 'excluded' | 'done';
export type MailboxDatePreset = 'all' | 'today' | 'week' | 'month' | 'custom';
export type ReportType = 'WEEKLY' | 'PROGRESS' | 'ISSUE';
export type MailDensity = 'comfortable' | 'compact';

export type EmailAnalysis = {
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

export type EmailActionItem = {
  id: string;
  actionText: string;
  actionType: string | null;
  priorityLevel: string | null;
  dueAt: string | null;
  completed: boolean;
};

export type AnalysisJob = {
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

export type MailAccountSummary = {
  id: string;
  provider: string;
  accountEmail: string;
  accountName: string | null;
  primary: boolean;
  syncEnabled: boolean;
  syncStatus: string;
  lastSyncedAt: string | null;
};

export type AuthSession = {
  userId: string;
  displayName: string | null;
  primaryEmail: string | null;
  mailAccountId: string;
  provider: string;
  accountEmail: string;
};

export type MailSyncResult = {
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

export type ApiErrorPayload = {
  code?: string;
  message?: string;
};

export type AnalysisJobCreateResult = {
  jobId: string;
  status: string;
  message: string;
};

export type AnalysisFeedbackMessage = {
  tone: 'success' | 'error';
  text: string;
};

export type AgentHealth = {
  enabled: boolean;
  reachable: boolean;
  status: 'CONNECTED' | 'UNREACHABLE' | 'DISABLED' | string;
  baseUrl: string;
  message: string;
  checkedAt: string;
};

export type WeeklyReportThread = {
  emailId: string;
  subject: string;
  oneLiner: string;
  fromEmail: string | null;
  receivedAt: string | null;
  reportSection: string | null;
  evidenceText: string | null;
};

export type WeeklyReportSummary = {
  reportId: string;
  reportType: ReportType;
  periodStart: string;
  periodEnd: string;
  emailCount: number;
  createdAt: string;
  workspaceStatus: 'NONE' | 'DRAFT' | 'SAVED' | string;
};

export type WeeklyReport = {
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

export type WeeklyWorkspaceSaveMode = 'draft' | 'saved';
export type WeeklyDraftViewMode = 'original' | 'workspace';

export type WeeklyWorkspaceStatus = {
  mode: WeeklyWorkspaceSaveMode;
  savedAt: string;
  storage: 'server' | 'local';
};

export type WeeklyWorkspaceSnapshot = {
  reportId: string;
  reportType: ReportType;
  draftText: string;
  excludedSourceIds: string[];
  saveMode: WeeklyWorkspaceSaveMode;
  savedAt: string;
};

export type WeeklyWorkspaceResponse = {
  reportId: string;
  userId: string;
  draftText: string;
  saveStatus: 'DRAFT' | 'SAVED' | string;
  excludedSourceIds: string[];
  savedAt: string;
};

export type EmailDetail = {
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
