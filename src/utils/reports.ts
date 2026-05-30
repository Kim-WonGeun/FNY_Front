import { REPORT_TYPE_OPTIONS, WEEKLY_WORKSPACE_STORAGE_KEY_PREFIX } from '../constants';
import type {
  ReportType,
  WeeklyReport,
  WeeklyReportSummary,
  WeeklyReportThread,
  WeeklyWorkspaceResponse,
  WeeklyWorkspaceSaveMode,
  WeeklyWorkspaceSnapshot,
  WeeklyWorkspaceStatus
} from '../types';

export function buildReportSections(report: WeeklyReport, reportType: ReportType) {
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

export function buildWeeklyReportDraft(
  report: WeeklyReport,
  reportType: ReportType,
  threadSummaries: WeeklyReportThread[] = report.threadSummaries
) {
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

export function getIncludedWeeklyThreads(
  report: WeeklyReport | null,
  excludedSourceIds: string[]
) {
  if (!report) {
    return [];
  }
  return report.threadSummaries.filter((thread) => !excludedSourceIds.includes(thread.emailId));
}

export function workspaceSaveStatusFromMode(mode: WeeklyWorkspaceSaveMode) {
  return mode === 'saved' ? 'SAVED' : 'DRAFT';
}

export function workspaceStatusFromResponse(workspace: WeeklyWorkspaceResponse): WeeklyWorkspaceStatus {
  return {
    mode: workspace.saveStatus === 'SAVED' ? 'saved' : 'draft',
    savedAt: workspace.savedAt,
    storage: 'server'
  };
}

export function updateWeeklyHistoryWorkspaceStatus(
  items: WeeklyReportSummary[],
  reportId: string,
  workspaceStatus: WeeklyReportSummary['workspaceStatus']
) {
  return items.map((item) =>
    item.reportId === reportId ? { ...item, workspaceStatus } : item
  );
}

export function weeklyWorkspaceStorageKey(userId: string, reportId: string) {
  return `${WEEKLY_WORKSPACE_STORAGE_KEY_PREFIX}:${userId}:${reportId}`;
}

export function readWeeklyWorkspaceSnapshot(userId: string, reportId: string): WeeklyWorkspaceSnapshot | null {
  try {
    const raw = localStorage.getItem(weeklyWorkspaceStorageKey(userId, reportId));
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as Partial<WeeklyWorkspaceSnapshot>;
    if (!parsed.reportId || typeof parsed.draftText !== 'string' || !parsed.savedAt) {
      return null;
    }
    return {
      reportId: parsed.reportId,
      reportType: normalizeReportType(parsed.reportType),
      draftText: parsed.draftText,
      excludedSourceIds: Array.isArray(parsed.excludedSourceIds) ? parsed.excludedSourceIds : [],
      saveMode: parsed.saveMode === 'saved' ? 'saved' : 'draft',
      savedAt: parsed.savedAt
    };
  } catch {
    return null;
  }
}

export function normalizeReportType(value: string | null | undefined): ReportType {
  if (value === 'PROGRESS' || value === 'ISSUE') {
    return value;
  }
  return 'WEEKLY';
}

export function reportTypeLabel(reportType: ReportType | string | null | undefined) {
  const normalized = normalizeReportType(reportType);
  return REPORT_TYPE_OPTIONS.find((option) => option.value === normalized)?.label ?? '주간보고';
}

export function normalizeWorkspaceStatus(status: string | null | undefined) {
  if (status === 'DRAFT' || status === 'SAVED') {
    return status;
  }
  return 'NONE';
}

export function workspaceStatusLabel(status: string | null | undefined) {
  const labels: Record<string, string> = {
    NONE: '원본',
    DRAFT: '편집 중',
    SAVED: '저장 완료'
  };
  return labels[normalizeWorkspaceStatus(status)];
}

export function reportSectionLabel(section: string | null | undefined) {
  const labels: Record<string, string> = {
    HIGHLIGHT: '금주실적',
    PROGRESS: '진행사항',
    NEXT_PLAN: '차주계획',
    ISSUE: '특이사항',
    PENDING_DECISION: '확인필요',
    AGENT: '분석 출처'
  };
  return labels[section ?? ''] ?? '참고 메일';
}
