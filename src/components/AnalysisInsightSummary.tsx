import type { EmailDetail } from '../types';
import {
  analysisCandidateExplanation,
  attentionStatusDescription,
  attentionStatusLabel,
  candidateReasonLabel,
  isOpenAttentionStatus,
  parseCandidateReasons,
  priorityReasonLabel,
  timeSensitivityLabel
} from '../utils/mailbox';

type AnalysisInsightSummaryProps = {
  detail: EmailDetail;
  block?: boolean;
};

export function AnalysisInsightSummary({ detail, block = false }: AnalysisInsightSummaryProps) {
  const analysis = detail.analysis;
  const candidateReasons = parseCandidateReasons(detail.analysisCandidateReasons)
    .filter((reason) => !reason.startsWith('LOW_') && reason !== 'AUTO_SENDER' && reason !== 'SELF_SENT')
    .slice(0, 3);
  const reasonCodes = analysis?.priorityReasonCodes?.length
    ? analysis.priorityReasonCodes.slice(0, 4)
    : candidateReasons;
  const taskText =
    analysis?.userTaskSummary ||
    analysis?.suggestedAction ||
    analysis?.shortSummary ||
    detail.snippet ||
    '메일 내용을 확인하세요.';
  const statusClosed = !isOpenAttentionStatus(detail.attentionStatus);

  return (
    <section className={`analysis-insight-summary${block ? ' detail-block' : ''}`}>
      <div className="analysis-insight-summary-main">
        <p className="eyebrow">Why Now</p>
        <strong>{taskText}</strong>
        <p>{statusClosed ? attentionStatusDescription(detail) : analysis?.reasoning || analysisCandidateExplanation(detail)}</p>
      </div>
      <div className="analysis-insight-summary-side">
        <div className="analysis-insight-state-tags">
          <span className={`attention-state-chip${statusClosed ? ' attention-state-chip-done' : ''}`}>
            {attentionStatusLabel(detail.attentionStatus)}
          </span>
          {analysis ? (
            <>
              <span>{analysis.requiresAction ? '액션 필요' : '액션 낮음'}</span>
              <span>{timeSensitivityLabel(analysis.timeSensitivity)}</span>
            </>
          ) : detail.analysisCandidateEvaluatedAt ? (
            <span>{detail.analysisEligible ? '분석 대상' : '분석 제외'}</span>
          ) : (
            <span>분석 대기</span>
          )}
        </div>
        {reasonCodes.length > 0 ? (
          <div className="priority-reason-list priority-reason-list-inline" aria-label="우선 노출 근거">
            {reasonCodes.map((reason) => (
              <span key={reason}>
                {analysis?.priorityReasonCodes?.includes(reason) ? priorityReasonLabel(reason) : candidateReasonLabel(reason)}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
