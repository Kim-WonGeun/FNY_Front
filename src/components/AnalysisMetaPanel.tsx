import type { AnalysisJob, EmailAnalysis } from '../types';
import { formatDate } from '../utils/date';
import { analysisJobStatusLabel } from '../utils/mailbox';

type AnalysisMetaPanelProps = {
  analysis: EmailAnalysis | null | undefined;
  latestJob: AnalysisJob | null;
};

export function AnalysisMetaPanel({ analysis, latestJob }: AnalysisMetaPanelProps) {
  return (
    <>
      {analysis ? (
        <dl className="analysis-run-meta" aria-label="분석 결과 메타 정보">
          <div>
            <dt>모델</dt>
            <dd>{analysis.modelName ?? '기록 없음'}</dd>
          </div>
          <div>
            <dt>버전</dt>
            <dd>{analysis.analysisVersion}차 분석</dd>
          </div>
          <div>
            <dt>프롬프트</dt>
            <dd>{analysis.promptVersion ?? '기록 없음'}</dd>
          </div>
          <div>
            <dt>분석 시각</dt>
            <dd>{formatDate(analysis.analyzedAt)}</dd>
          </div>
        </dl>
      ) : null}
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
          {latestJob.completedAt ? (
            <div>
              <dt>종료 시각</dt>
              <dd>{formatDate(latestJob.completedAt)}</dd>
            </div>
          ) : null}
          {latestJob.errorMessage ? (
            <div className="analysis-job-error">
              <dt>메시지</dt>
              <dd>{latestJob.errorMessage}</dd>
            </div>
          ) : null}
        </dl>
      ) : null}
    </>
  );
}
