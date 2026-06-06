import type { EmailDetail } from '../types';
import { analysisCandidateExplanation } from '../utils/mailAnalysisCandidate';
import {
  candidateReasonDescription,
  candidateReasonLabel,
  parseCandidateReasons
} from '../utils/mailboxLabels';

type AnalysisCandidatePanelProps = {
  detail: EmailDetail;
  compact: boolean;
};

export function AnalysisCandidatePanel({ detail, compact }: AnalysisCandidatePanelProps) {
  const reasons = parseCandidateReasons(detail.analysisCandidateReasons);

  return (
    <div className={`candidate-panel${compact ? ' candidate-panel-compact' : ''}`}>
      <div className="candidate-score-line">
        <span>{detail.analysisEligible ? '자동 분석 대상' : '자동 분석 제외'}</span>
        <strong>{analysisCandidateExplanation(detail)}</strong>
      </div>
      {!compact && reasons.length > 0 ? (
        <div className="candidate-reason-list" aria-label="분석 후보 판단 사유">
          {reasons.map((reason) => (
            <span key={reason} title={candidateReasonDescription(reason)}>
              {candidateReasonLabel(reason)}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}
