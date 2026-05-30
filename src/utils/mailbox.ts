import type {
  AgentHealth,
  AnalysisQueueFilter,
  AnalysisJob,
  AttentionReason,
  AttentionStatus,
  EmailAnalysis,
  EmailDetail,
  EmailListItem,
  LoadState,
  MailboxAnalysisFilter,
  MailboxCategory,
  MailboxOverview,
  SpotlightFilter
} from '../types';
import { formatDate, toDateInputValue, todayKey } from './date';

export function normalizeOverview(data: MailboxOverview): MailboxOverview {
  return {
    ...data,
    spotlightEmails: normalizeEmailList(data.spotlightEmails)
  };
}

export function normalizeEmailList(emails: EmailListItem[]): EmailListItem[] {
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

export function normalizeEmailDetail(data: EmailDetail): EmailDetail {
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

export function getProcessedTodayEmails(emails: EmailListItem[]) {
  const today = todayKey();
  return emails
    .filter(
      (email) =>
        !isOpenAttentionStatus(email.attentionStatus) &&
        email.attentionStatusUpdatedAt &&
        toDateInputValue(new Date(email.attentionStatusUpdatedAt)) === today
    )
    .slice(0, 5);
}

export function getOpenSpotlightEmails(emails: EmailListItem[]) {
  return emails
    .filter((email) => isOpenAttentionStatus(email.attentionStatus))
    .sort((a, b) => scoreEmail(b) - scoreEmail(a));
}

export function sortEmailsByReceivedDesc(emails: EmailListItem[]) {
  return [...emails].sort((a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime());
}

export function getSpotlightTabCounts(emails: EmailListItem[]) {
  const urgent = (email: EmailListItem) =>
    email.attentionReasons.includes('HIGH_PRIORITY') || email.priorityLevel === 'P1';
  return {
    all: emails.length,
    urgent: emails.filter(urgent).length,
    reply: emails.filter((email) => email.needsReply).length,
    unread: emails.filter((email) => !email.read).length
  };
}

export function getFilteredSpotlightEmails(
  emails: EmailListItem[],
  filter: SpotlightFilter,
  query: string
) {
  let list = emails;
  if (filter === 'urgent') {
    list = list.filter(
      (email) => email.attentionReasons.includes('HIGH_PRIORITY') || email.priorityLevel === 'P1'
    );
  } else if (filter === 'reply') {
    list = list.filter((email) => email.needsReply);
  } else if (filter === 'unread') {
    list = list.filter((email) => !email.read);
  }

  const q = query.trim().toLowerCase();
  if (!q) {
    return list;
  }

  return list.filter(
    (email) =>
      email.subject.toLowerCase().includes(q) ||
      email.fromEmail.toLowerCase().includes(q) ||
      (email.fromName?.toLowerCase().includes(q) ?? false)
  );
}

export function getEmailsForMailboxCategory(
  emails: EmailListItem[],
  category: MailboxCategory,
  primaryMailAccountEmail: string | null
) {
  if (category === 'inbox') {
    return emails.filter((email) => email.fromEmail !== primaryMailAccountEmail);
  }
  if (category === 'sent') {
    return emails.filter((email) => email.fromEmail === primaryMailAccountEmail);
  }
  return emails;
}

export function getMailboxCounts(emails: EmailListItem[], primaryMailAccountEmail: string | null) {
  const sent = emails.filter((email) => email.fromEmail === primaryMailAccountEmail).length;
  return {
    all: emails.length,
    sent,
    inbox: emails.length - sent
  };
}

export function getTotalPages(itemCount: number, pageSize: number) {
  return Math.max(1, Math.ceil(itemCount / pageSize));
}

export function getPagedEmails(emails: EmailListItem[], page: number, pageSize: number) {
  const totalPages = getTotalPages(emails.length, pageSize);
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * pageSize;
  return emails.slice(start, start + pageSize);
}

export function getPageForEmailId(emails: EmailListItem[], emailId: string, pageSize: number) {
  const index = emails.findIndex((email) => email.id === emailId);
  return index >= 0 ? Math.floor(index / pageSize) + 1 : 1;
}

export function hasEmailId(emails: EmailListItem[], emailId: string | null | undefined) {
  return Boolean(emailId && emails.some((email) => email.id === emailId));
}

export function getFirstEmailId(emails: EmailListItem[]) {
  return emails[0]?.id ?? '';
}

export function resolveSelectedEmailId(emails: EmailListItem[], currentEmailId: string) {
  return hasEmailId(emails, currentEmailId) ? currentEmailId : getFirstEmailId(emails);
}

export function buildCalendarDayStats(emails: EmailListItem[]) {
  const stats = new Map<string, { total: number; unread: number; needsReply: number; attention: number }>();

  emails.forEach((email) => {
    const dateKey = toDateInputValue(new Date(email.receivedAt));
    const current = stats.get(dateKey) ?? { total: 0, unread: 0, needsReply: 0, attention: 0 };
    current.total += 1;
    if (!email.read) {
      current.unread += 1;
    }
    if (email.needsReply) {
      current.needsReply += 1;
    }
    if (isOpenAttentionStatus(email.attentionStatus)) {
      current.attention += 1;
    }
    stats.set(dateKey, current);
  });

  return stats;
}

export function getEmailsForDate(emails: EmailListItem[], dateKey: string) {
  return emails.filter((email) => toDateInputValue(new Date(email.receivedAt)) === dateKey);
}

export function getAnalysisQueueCounts(emails: EmailListItem[]) {
  const evaluated = emails.filter((email) => email.analysisCandidateEvaluatedAt);
  return {
    candidate: evaluated.filter(
      (email) => email.analysisEligible && isOpenAttentionStatus(email.attentionStatus)
    ).length,
    excluded: evaluated.filter((email) => !email.analysisEligible).length,
    done: evaluated.filter((email) => !isOpenAttentionStatus(email.attentionStatus)).length
  };
}

export function getAnalysisQueueEmails(emails: EmailListItem[], filter: AnalysisQueueFilter) {
  const evaluated = emails.filter((email) => email.analysisCandidateEvaluatedAt);
  if (filter === 'excluded') {
    return evaluated.filter((email) => !email.analysisEligible);
  }
  if (filter === 'done') {
    return evaluated.filter((email) => !isOpenAttentionStatus(email.attentionStatus));
  }
  return evaluated.filter(
    (email) => email.analysisEligible && isOpenAttentionStatus(email.attentionStatus)
  );
}

export function getMailboxAnalysisCounts(emails: EmailListItem[]) {
  return {
    all: emails.length,
    ...getAnalysisQueueCounts(emails)
  };
}

export function getAnalysisSkippedReasonStats(emails: EmailListItem[]) {
  const stats = new Map<string, number>();
  emails
    .filter((email) => email.analysisCandidateEvaluatedAt && !email.analysisEligible)
    .forEach((email) => {
      const reason = email.analysisSkippedReason || 'UNKNOWN';
      stats.set(reason, (stats.get(reason) ?? 0) + 1);
    });

  return Array.from(stats.entries())
    .map(([reason, count]) => ({ reason, count }))
    .sort((a, b) => b.count - a.count);
}

export function getEmailsForAnalysisFilter(emails: EmailListItem[], filter: MailboxAnalysisFilter) {
  if (filter === 'all') {
    return emails;
  }
  return getAnalysisQueueEmails(emails, filter);
}

type MailboxEmailFilterOptions = {
  analysisFilter: MailboxAnalysisFilter;
  query: string;
  senderQuery: string;
  startDate: string;
  endDate: string;
  searchBody: boolean;
};

export function getFilteredMailboxEmails(emails: EmailListItem[], options: MailboxEmailFilterOptions) {
  let list = getEmailsForAnalysisFilter(emails, options.analysisFilter);

  const q = options.searchBody ? '' : options.query.trim().toLowerCase();
  if (q) {
    list = list.filter(
      (email) =>
        email.subject.toLowerCase().includes(q) ||
        (email.shortSummary?.toLowerCase().includes(q) ?? false) ||
        (email.snippet?.toLowerCase().includes(q) ?? false)
    );
  }

  const senderQuery = options.senderQuery.trim().toLowerCase();
  if (senderQuery) {
    list = list.filter(
      (email) =>
        email.fromEmail.toLowerCase().includes(senderQuery) ||
        (email.fromName?.toLowerCase().includes(senderQuery) ?? false)
    );
  }

  if (options.startDate) {
    list = list.filter((email) => toDateInputValue(new Date(email.receivedAt)) >= options.startDate);
  }

  if (options.endDate) {
    list = list.filter((email) => toDateInputValue(new Date(email.receivedAt)) <= options.endDate);
  }

  return list;
}

export async function readApiError(response: Response) {
  try {
    const data = (await response.json()) as { code?: string; message?: string };
    const friendlyMessage = gmailErrorMessage(data.code, data.message);
    if (friendlyMessage) {
      return friendlyMessage;
    }
    return data.message || `API returned ${response.status}`;
  } catch {
    return `API returned ${response.status}`;
  }
}

export function gmailErrorMessage(code?: string, message?: string) {
  const messages: Record<string, string> = {
    GMAIL_SCOPE_INSUFFICIENT: 'Gmail 읽기 권한이 부족합니다. 로그아웃 후 Google 계정 권한을 다시 승인해 주세요.',
    GMAIL_TOKEN_INVALID: 'Google 로그인 토큰이 만료되었습니다. 다시 로그인해 주세요.',
    GMAIL_RATE_LIMITED: 'Gmail 요청 한도에 도달했습니다. 잠시 후 다시 동기화해 주세요.',
    GMAIL_SERVICE_DISABLED: 'Google Cloud 프로젝트에서 Gmail API가 꺼져 있습니다. Gmail API를 사용 설정한 뒤 다시 시도해 주세요.',
    GMAIL_TEMPORARY_FAILURE: 'Gmail API가 일시적으로 불안정합니다. 잠시 후 다시 시도해 주세요.',
    GMAIL_API_FAILED: 'Gmail API 요청에 실패했습니다. 잠시 후 다시 시도해 주세요.'
  };
  return code ? messages[code] ?? message : null;
}

export function getLatestAnalysisJob(detail: EmailDetail) {
  return [...detail.analysisJobs].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )[0] ?? null;
}

export function isAgentReady(agentHealth: AgentHealth | null) {
  return Boolean(agentHealth?.enabled && agentHealth.reachable);
}

export function agentHealthTone(agentHealth: AgentHealth | null, state: LoadState) {
  if (state === 'loading') {
    return 'checking';
  }
  if (!agentHealth) {
    return state === 'error' ? 'error' : 'unknown';
  }
  if (!agentHealth.enabled) {
    return 'disabled';
  }
  return agentHealth.reachable ? 'connected' : 'error';
}

export function agentHealthLabel(agentHealth: AgentHealth | null, state: LoadState) {
  if (state === 'loading') {
    return '확인 중';
  }
  if (!agentHealth) {
    return state === 'error' ? '확인 실패' : '상태 미확인';
  }
  if (!agentHealth.enabled) {
    return '분석 비활성화';
  }
  return agentHealth.reachable ? '연결됨' : '연결 안 됨';
}

export function canRequestAnalysis(detail: EmailDetail | null) {
  if (!detail) {
    return false;
  }
  const latestJob = getLatestAnalysisJob(detail);
  if (!latestJob) {
    return true;
  }
  return !['PENDING', 'RUNNING'].includes(latestJob.status);
}

export function analysisRequestButtonLabel(
  detail: EmailDetail | null,
  agentHealth: AgentHealth | null,
  statusLabel: string,
  submitting: boolean
) {
  if (submitting) {
    return '요청 중';
  }
  if (!isAgentReady(agentHealth)) {
    return agentHealth?.enabled === false ? '분석 비활성화' : 'Agent 준비 필요';
  }
  if (!detail) {
    return '분석 시작';
  }
  const latestJob = getLatestAnalysisJob(detail);
  if (latestJob?.status === 'PENDING' || latestJob?.status === 'RUNNING') {
    return '분석 중';
  }
  if (latestJob?.status === 'FAILED') {
    return '재시도';
  }
  if (detail.analysis) {
    return '다시 분석';
  }
  if (!detail.analysisEligible && detail.analysisCandidateEvaluatedAt) {
    return '수동 분석';
  }
  return statusLabel === 'Agent 대기' ? '다시 요청' : '분석 시작';
}

export function resolveAnalysisStatus(
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
    const running = latestJob.status === 'RUNNING';
    return {
      label: failed ? '분석 실패' : waitingAgent ? 'Agent 대기' : running ? '분석 중' : '분석 대기',
      tone: failed ? 'failed' : 'pending',
      description: failed
        ? latestJob.errorMessage || '분석 작업이 실패했습니다. 다시 분석을 요청할 수 있습니다.'
        : waitingAgent
          ? latestJob.errorMessage || 'Agent 서버가 준비되면 분석할 수 있습니다.'
          : running
            ? 'Agent가 메일 내용을 분석하고 있습니다.'
            : '분석 작업이 등록되어 결과를 기다리고 있습니다.'
    };
  }

  if (detail.analysis) {
    return {
      label: '분석 완료',
      tone: 'complete',
      description: detail.analysis.modelName
        ? `${detail.analysis.modelName} 기준 ${detail.analysis.analysisVersion}차 분석 결과입니다. 필요하면 다시 분석할 수 있습니다.`
        : `${detail.analysis.analysisVersion}차 분석 결과입니다. 필요하면 다시 분석할 수 있습니다.`
    };
  }

  if (!detail.analysisEligible && detail.analysisCandidateEvaluatedAt) {
    return {
      label: '자동 제외',
      tone: 'empty',
      description: analysisCandidateExplanation(detail)
    };
  }

  return {
    label: '분석 없음',
    tone: 'empty',
    description: '아직 이 메일의 요약, 점수, 액션이 생성되지 않았습니다.'
  };
}

export function compactAnalysisStatusDescription(
  status: ReturnType<typeof resolveAnalysisStatus>,
  latestJob: AnalysisJob | null,
  analysis: EmailAnalysis | null | undefined
) {
  if (status.tone === 'failed') {
    return '실패했습니다. 다시 요청할 수 있습니다.';
  }
  if (latestJob?.status === 'RUNNING') {
    return '분석 중입니다.';
  }
  if (latestJob && latestJob.status !== 'COMPLETED') {
    return '결과를 기다리고 있습니다.';
  }
  if (analysis) {
    return `${analysis.analysisVersion}차 분석 완료`;
  }
  return status.description;
}

export function analysisJobStatusLabel(status: string) {
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

export function parseCandidateReasons(value: string | null) {
  if (!value) {
    return [];
  }
  return value
    .split(',')
    .map((reason) => reason.trim())
    .filter(Boolean);
}

export function candidateReasonLabel(reason: string) {
  const labels: Record<string, string> = {
    UNREAD: '읽지 않은 메일',
    STARRED: '중요 표시',
    IMPORTANT_HEADER: '중요도 높음',
    HAS_ATTACHMENT: '첨부 포함',
    RECENT_3_DAYS: '최근 3일 수신',
    DIRECT_TO_ME: '직접 수신',
    ACTION_KEYWORD: '요청/회신 신호',
    MEETING_KEYWORD: '회의/일정 신호',
    INCIDENT_KEYWORD: '긴급/장애 신호',
    LOW_VALUE_CATEGORY: '프로모션 계열',
    AUTO_SENDER: '자동 발신',
    LOW_VALUE_CONTENT: '광고/알림성 내용',
    SELF_SENT: '내가 보낸 메일'
  };
  return labels[reason] ?? reason;
}

export function candidateReasonDescription(reason: string) {
  const labels: Record<string, string> = {
    UNREAD: '아직 읽지 않아 확인 가능성이 높은 메일입니다.',
    STARRED: '사용자가 중요 표시한 메일입니다.',
    IMPORTANT_HEADER: '발신자가 높은 중요도로 보낸 메일입니다.',
    HAS_ATTACHMENT: '검토가 필요한 첨부파일이 포함되어 있을 수 있습니다.',
    RECENT_3_DAYS: '최근에 도착한 메일이라 우선 확인 가능성이 높습니다.',
    DIRECT_TO_ME: '참조가 아니라 직접 받은 메일입니다.',
    ACTION_KEYWORD: '확인, 회신, 승인, 제출 같은 업무 표현이 감지되었습니다.',
    MEETING_KEYWORD: '회의, 일정, 참석 관련 신호가 있습니다.',
    INCIDENT_KEYWORD: '긴급, 장애, 오류 같은 대응 신호가 있습니다.',
    LOW_VALUE_CATEGORY: '프로모션/소셜/포럼처럼 업무 우선순위가 낮은 카테고리입니다.',
    AUTO_SENDER: '알림 계정이나 자동 발신 계열 주소로 보입니다.',
    LOW_VALUE_CONTENT: '광고, 뉴스레터, 인증번호, 로그인 알림 같은 내용이 감지되었습니다.',
    SELF_SENT: '내 계정에서 보낸 메일이라 자동 분석 우선순위를 조금 낮췄습니다.'
  };
  return labels[reason] ?? reason;
}

export function analysisSkippedReasonLabel(reason: string) {
  const labels: Record<string, string> = {
    OLD_MAIL: '최근 30일이 지난 메일이라 자동 분석에서 제외했습니다.',
    LOW_CANDIDATE_SCORE: '업무 처리 신호가 낮아 자동 분석에서 제외했습니다.',
    LOW_SIGNAL: '업무 처리 신호가 약해 우선 분석 대상에서 제외했습니다.',
    AUTOMATED_OR_PROMOTIONAL: '광고성 또는 자동 알림 메일로 판단해 자동 분석에서 제외했습니다.',
    UNKNOWN: '제외 사유가 아직 정리되지 않았습니다.'
  };
  return labels[reason] ?? reason;
}

export function analysisCandidateExplanation(detail: EmailDetail) {
  if (detail.analysisSkippedReason) {
    return analysisSkippedReasonLabel(detail.analysisSkippedReason);
  }

  const reasons = parseCandidateReasons(detail.analysisCandidateReasons)
    .filter((reason) => !reason.startsWith('LOW_') && reason !== 'AUTO_SENDER' && reason !== 'SELF_SENT')
    .slice(0, 3)
    .map(candidateReasonLabel);

  if (reasons.length === 0) {
    return '업무 관련 신호가 확인되어 자동 분석 대상으로 올렸습니다.';
  }

  return `${joinKoreanList(reasons)} 신호가 감지되어 자동 분석 대상으로 올렸습니다.`;
}

export function analysisListHint(email: EmailListItem) {
  if (!email.analysisCandidateEvaluatedAt) {
    return null;
  }

  if (!email.analysisEligible && email.analysisSkippedReason) {
    return analysisSkippedReasonShortLabel(email.analysisSkippedReason);
  }

  const reasons = parseCandidateReasons(email.analysisCandidateReasons)
    .filter((reason) => !reason.startsWith('LOW_') && reason !== 'AUTO_SENDER' && reason !== 'SELF_SENT')
    .slice(0, 2)
    .map(candidateReasonLabel);

  if (reasons.length === 0) {
    return '업무 관련 신호가 있어 분석 대상으로 분류됨';
  }

  return `${joinKoreanList(reasons)} 기준으로 분석 대상에 포함`;
}

export function visibleAttentionReasons(reasons: AttentionReason[]) {
  return reasons.slice(0, 2);
}

export function joinKoreanList(items: string[]) {
  if (items.length === 0) {
    return '';
  }
  if (items.length === 1) {
    return items[0];
  }
  if (items.length === 2) {
    return `${items[0]}, ${items[1]}`;
  }
  return `${items.slice(0, -1).join(', ')}, ${items[items.length - 1]}`;
}

export function analysisSkippedReasonShortLabel(reason: string) {
  const labels: Record<string, string> = {
    OLD_MAIL: '최근 30일 범위를 지나 분석에서 제외됨',
    LOW_CANDIDATE_SCORE: '업무 신호가 낮아 분석에서 제외됨',
    LOW_SIGNAL: '업무 신호가 약해 분석에서 제외됨',
    AUTOMATED_OR_PROMOTIONAL: '광고성 또는 자동 알림으로 분석에서 제외됨',
    UNKNOWN: '제외 사유 미정리'
  };
  return labels[reason] ?? analysisSkippedReasonLabel(reason);
}

export function providerLabel(provider: string | null | undefined) {
  const labels: Record<string, string> = {
    GOOGLE: 'Gmail',
    GMAIL: 'Gmail'
  };
  return labels[String(provider ?? '').toUpperCase()] ?? provider ?? '메일 계정';
}

export function syncStatusLabel(status: string | null | undefined) {
  const labels: Record<string, string> = {
    ACTIVE: '동기화 사용',
    PAUSED: '동기화 중지',
    ERROR: '동기화 오류'
  };
  return labels[String(status ?? '').toUpperCase()] ?? status ?? '상태 미확인';
}

export function normalizeAttentionStatus(status: string | null | undefined): AttentionStatus {
  if (status === 'REVIEWED' || status === 'COMPLETED' || status === 'DEFERRED') {
    return status;
  }
  return 'NEEDS_ATTENTION';
}

export function isOpenAttentionStatus(status: AttentionStatus | string | null | undefined) {
  return normalizeAttentionStatus(status) === 'NEEDS_ATTENTION';
}

export function attentionStatusLabel(status: AttentionStatus | string | null | undefined) {
  const labels: Record<AttentionStatus, string> = {
    NEEDS_ATTENTION: '확인 필요',
    REVIEWED: '확인 완료',
    COMPLETED: '처리 완료',
    DEFERRED: '보류'
  };
  return labels[normalizeAttentionStatus(status)];
}

export function attentionStatusDescription(detail: EmailDetail) {
  if (isOpenAttentionStatus(detail.attentionStatus)) {
    return '확인하거나 처리했다면 완료로 표시하세요. 완료된 메일은 홈 우선순위에서 빠집니다.';
  }
  const updatedAt = detail.attentionStatusUpdatedAt ? ` · ${formatDate(detail.attentionStatusUpdatedAt)}` : '';
  return `${attentionStatusLabel(detail.attentionStatus)} 상태입니다. 홈 우선순위에서 제외됨${updatedAt}`;
}

export function timeSensitivityLabel(value: string | null) {
  const labels: Record<string, string> = {
    IMMEDIATE: '즉시 처리',
    TODAY: '오늘 처리',
    THIS_WEEK: '이번 주 처리',
    NO_DEADLINE: '마감 없음'
  };
  return labels[value ?? ''] ?? '마감 없음';
}

export function priorityReasonLabel(reason: string) {
  const labels: Record<string, string> = {
    NEEDS_REPLY: '회신 필요',
    HAS_DEADLINE: '마감 있음',
    URGENT_KEYWORD: '긴급 표현',
    DIRECT_TO_ME: '직접 수신',
    IMPORTANT_HEADER: '중요 표시',
    ATTACHMENT: '첨부 있음',
    FINANCE_RELATED: '재무 관련',
    MEETING_RELATED: '일정 관련',
    APPROVAL_REQUIRED: '승인 필요',
    CUSTOMER_OR_CONTRACT: '고객/계약 관련',
    NO_STRONG_SIGNAL: '강한 신호 없음'
  };
  return labels[reason] ?? reason;
}

export function actionTypeLabel(actionType: string | null) {
  const labels: Record<string, string> = {
    REPLY: '회신',
    REVIEW: '검토',
    APPROVE: '승인',
    SCHEDULE: '일정',
    PAYMENT: '정산',
    FOLLOW_UP: '후속 조치',
    ARCHIVE: '보관'
  };
  return labels[actionType ?? ''] ?? '액션';
}

export function priorityLabel(priority: string) {
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

export function priorityDescription(priority: string) {
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

export function decodeHtmlEntities(value: string) {
  const textarea = document.createElement('textarea');
  textarea.innerHTML = value;
  return textarea.value;
}

export function buildMailHtmlDocument(bodyHtml: string, theme: 'light' | 'dark') {
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

export function createDetailFromListItem(email: EmailListItem | undefined): EmailDetail | null {
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
            ? ['HAS_DEADLINE']
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

export function scoreEmail(email: EmailListItem) {
  const priorityScore = email.priorityLevel === 'P1' ? 500 : email.priorityLevel === 'P2' ? 350 : email.priorityLevel === 'P3' ? 150 : 0;
  const replyScore = email.needsReply ? 120 : 0;
  const unreadScore = email.read ? 0 : 80;
  const starredScore = email.starred ? 60 : 0;
  const urgencyScore = email.urgencyScore ?? 0;
  const importanceScore = email.importanceScore ?? 0;

  return priorityScore + replyScore + unreadScore + starredScore + urgencyScore + importanceScore;
}
