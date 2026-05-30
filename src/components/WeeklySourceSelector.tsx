import type { WeeklyReport } from '../types';
import { formatDate } from '../utils/date';
import { reportSectionLabel } from '../utils/reports';

type WeeklySourceSelectorProps = {
  weeklyReport: WeeklyReport;
  includedCount: number;
  excludedWeeklySourceIds: string[];
  weeklySourcesOpen: boolean;
  onToggleSourcesOpen: () => void;
  onIncludeAllWeeklySources: () => void;
  onApplySelectedSourcesToDraft: () => void;
  onOpenReportSourceEmail: (emailId: string) => void;
  onToggleWeeklySource: (emailId: string) => void;
};

export function WeeklySourceSelector({
  weeklyReport,
  includedCount,
  excludedWeeklySourceIds,
  weeklySourcesOpen,
  onToggleSourcesOpen,
  onIncludeAllWeeklySources,
  onApplySelectedSourcesToDraft,
  onOpenReportSourceEmail,
  onToggleWeeklySource
}: WeeklySourceSelectorProps) {
  return (
    <section className="weekly-thread-block" aria-label="참고 메일 선택">
      <div className="weekly-thread-head">
        <div>
          <h5>참고 메일</h5>
          <p>보고서에 반영된 메일을 확인하고 필요할 때만 조정할 수 있습니다.</p>
        </div>
        <div className="weekly-thread-actions">
          <span className="weekly-thread-count">
            포함 {includedCount}건 / 전체 {weeklyReport.threadSummaries.length}건
          </span>
          <button type="button" className="btn-weekly" onClick={onToggleSourcesOpen} aria-expanded={weeklySourcesOpen}>
            {weeklySourcesOpen ? '접기' : '참고 메일 보기'}
          </button>
          {weeklySourcesOpen ? (
            <>
              <button type="button" className="btn-weekly" onClick={onIncludeAllWeeklySources}>
                전체 포함
              </button>
              <button type="button" className="btn-weekly" onClick={onApplySelectedSourcesToDraft}>
                선택 메일 반영
              </button>
            </>
          ) : null}
        </div>
      </div>
      {weeklySourcesOpen ? (
        <div className="weekly-thread-cards">
          {weeklyReport.threadSummaries.map((thread) => {
            const excluded = excludedWeeklySourceIds.includes(thread.emailId);

            return (
              <div className={`weekly-thread-card${excluded ? ' weekly-thread-card-excluded' : ''}`} key={thread.emailId}>
                <span className={`weekly-thread-state${excluded ? ' weekly-thread-state-excluded' : ''}`}>
                  {excluded ? '제외됨' : '포함됨'}
                </span>
                <button
                  type="button"
                  className="weekly-thread-card-main"
                  onClick={() => onOpenReportSourceEmail(thread.emailId)}
                >
                  <span className="weekly-thread-section">{reportSectionLabel(thread.reportSection)}</span>
                  <strong>{thread.subject || '(제목 없음)'}</strong>
                  <span>{thread.oneLiner || '참고 요약이 없습니다.'}</span>
                  {thread.evidenceText ? <p>{thread.evidenceText}</p> : null}
                  <small>
                    {[thread.fromEmail, thread.receivedAt ? formatDate(thread.receivedAt) : null].filter(Boolean).join(' · ')}
                  </small>
                </button>
                <button type="button" className="weekly-thread-toggle" onClick={() => onToggleWeeklySource(thread.emailId)}>
                  {excluded ? '다시 포함' : '제외'}
                </button>
              </div>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}
