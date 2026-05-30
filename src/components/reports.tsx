import type { WeeklyReport } from '../types';

export function ReportQualityPanel({
  report,
  includedCount,
  excludedCount,
  draftDirty
}: {
  report: WeeklyReport;
  includedCount: number;
  excludedCount: number;
  draftDirty: boolean;
}) {
  const inclusionRate = report.threadSummaries.length === 0
    ? 0
    : Math.round((includedCount / report.threadSummaries.length) * 100);
  const warnings = [
    includedCount === 0 ? '보고서에 포함된 참고 메일이 없습니다.' : null,
    report.source !== 'AGENT' ? 'Agent 응답 대신 서버 기본 규칙으로 생성했습니다.' : null,
    draftDirty ? '초안이 직접 수정되어 원본 생성 결과와 다를 수 있습니다.' : null,
    excludedCount > 0 ? `${excludedCount}건의 참고 메일을 제외했습니다.` : null
  ].filter(Boolean);

  return (
    <section className="report-quality-panel" aria-label="보고서 품질 점검">
      <div className="report-quality-head">
        <div>
          <p className="eyebrow">Quality Check</p>
          <h5>보고서 점검</h5>
        </div>
        <strong>{warnings.length === 0 ? '양호' : `${warnings.length}개 확인`}</strong>
      </div>
      <div className="report-quality-metrics">
        <span>포함률 {inclusionRate}%</span>
        <span>참고 메일 {includedCount}/{report.threadSummaries.length}건</span>
        <span>소스 {report.source}</span>
        <span>{report.modelName}</span>
      </div>
      {warnings.length > 0 ? (
        <ul className="report-quality-warnings">
          {warnings.map((warning) => (
            <li key={warning}>{warning}</li>
          ))}
        </ul>
      ) : (
        <p>선택한 기간과 참고 메일 기준으로 보고서 초안이 준비되었습니다.</p>
      )}
    </section>
  );
}
