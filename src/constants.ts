import type { AttentionReason, ReportType } from './types';
import { addDays, toDateInputValue } from './utils/date';

export const DEFAULT_USER_ID = 'USR_260409_A00001';
export const DEFAULT_PRIMARY_MAIL_ACCOUNT_ID = 'MAC_260409_A00001';
export const AUTH_STORAGE_KEY = 'fny.auth.session';
export const THEME_STORAGE_KEY = 'fny.theme';
export const MAIL_DENSITY_STORAGE_KEY = 'fny.mailDensity';
export const ORIGINAL_MAIL_OPEN_STORAGE_KEY = 'fny.originalMailOpen';
export const SIDEBAR_PINNED_STORAGE_KEY = 'fny.sidebarPinned';
export const AUTO_SYNC_STORAGE_KEY_PREFIX = 'fny.autoSync';
export const WEEKLY_WORKSPACE_STORAGE_KEY_PREFIX = 'fny.weeklyWorkspace';
export const DEFAULT_WEEKLY_END_DATE = toDateInputValue(new Date());
export const DEFAULT_WEEKLY_START_DATE = toDateInputValue(addDays(new Date(), -6));
export const ALL_MAIL_PAGE_SIZE = 20;
export const CALENDAR_MONTH_OPTIONS = Array.from({ length: 12 }, (_, index) => index + 1);

export const reasonLabel: Record<AttentionReason, string> = {
  HIGH_PRIORITY: '긴급',
  NEEDS_REPLY: '회신 필요',
  UNREAD: '읽지 않음',
  STARRED: '중요 표시',
  HAS_DEADLINE: '마감 있음'
};

export const REPORT_TYPE_OPTIONS: Array<{
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
