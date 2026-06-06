import type { AttentionReason, EmailDetail, EmailListItem } from '../types';
import {
  analysisSkippedReasonLabel,
  analysisSkippedReasonShortLabel,
  candidateReasonLabel,
  joinKoreanList,
  parseCandidateReasons
} from './mailboxLabels';

const ANALYSIS_REASON_EXCLUSIONS = new Set(['AUTO_SENDER', 'SELF_SENT']);

function visibleCandidateReason(reason: string) {
  return !reason.startsWith('LOW_') && !ANALYSIS_REASON_EXCLUSIONS.has(reason);
}

export function analysisCandidateExplanation(detail: EmailDetail) {
  if (detail.analysisSkippedReason) {
    return analysisSkippedReasonLabel(detail.analysisSkippedReason);
  }

  const reasons = parseCandidateReasons(detail.analysisCandidateReasons)
    .filter(visibleCandidateReason)
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
    .filter(visibleCandidateReason)
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
