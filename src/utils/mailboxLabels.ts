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
    SELF_SENT: '내가 보낸 메일',
    MANUAL_INCLUDE: '사용자 포함',
    MANUAL_EXCLUDE: '사용자 제외'
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
    SELF_SENT: '내 계정에서 보낸 메일이라 자동 분석 우선순위를 조금 낮췄습니다.',
    MANUAL_INCLUDE: '사용자가 직접 분석 대상으로 포함했습니다.',
    MANUAL_EXCLUDE: '사용자가 직접 자동 분석 대상에서 제외했습니다.'
  };
  return labels[reason] ?? reason;
}

export function analysisSkippedReasonLabel(reason: string) {
  const labels: Record<string, string> = {
    OLD_MAIL: '최근 30일이 지난 메일이라 자동 분석에서 제외했습니다.',
    LOW_CANDIDATE_SCORE: '업무 처리 신호가 낮아 자동 분석에서 제외했습니다.',
    LOW_SIGNAL: '업무 처리 신호가 약해 우선 분석 대상에서 제외했습니다.',
    AUTOMATED_OR_PROMOTIONAL: '광고성 또는 자동 알림 메일로 판단해 자동 분석에서 제외했습니다.',
    MANUAL_EXCLUDE: '사용자가 직접 자동 분석 대상에서 제외했습니다.',
    UNKNOWN: '제외 사유가 아직 정리되지 않았습니다.'
  };
  return labels[reason] ?? reason;
}

export function analysisSkippedReasonShortLabel(reason: string) {
  const labels: Record<string, string> = {
    OLD_MAIL: '최근 30일 범위를 지나 분석에서 제외됨',
    LOW_CANDIDATE_SCORE: '업무 신호가 낮아 분석에서 제외됨',
    LOW_SIGNAL: '업무 신호가 약해 분석에서 제외됨',
    AUTOMATED_OR_PROMOTIONAL: '광고성 또는 자동 알림으로 분석에서 제외됨',
    MANUAL_EXCLUDE: '사용자가 분석에서 제외함',
    UNKNOWN: '제외 사유 미정리'
  };
  return labels[reason] ?? analysisSkippedReasonLabel(reason);
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
