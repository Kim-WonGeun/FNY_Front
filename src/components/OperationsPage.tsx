import { useOperations } from '../hooks/useOperations';
import type { OperationJob } from '../types';
import { formatDate } from '../utils/date';
import { providerLabel, syncStatusLabel } from '../utils/mailboxLabels';

const jobStatusLabels: Record<string, string> = {
  PENDING: '대기',
  WAITING_AGENT: '연결 대기',
  RUNNING: '분석 중',
  FAILED: '실패',
  COMPLETED: '완료'
};

export function OperationsPage() {
  const { summary, state, message, processing, load, processQueue } = useOperations();

  return (
    <div className="operations-page">
      <section className="operations-intro">
        <div>
          <p className="eyebrow">작업 현황</p>
          <h3>메일 처리 기록</h3>
          <p>계정 동기화와 최근 분석 작업 상태를 확인합니다.</p>
        </div>
        <div className="operations-actions">
          <button type="button" onClick={() => void load()} disabled={state === 'loading'}>새로고침</button>
          <button type="button" className="is-primary" onClick={() => void processQueue()} disabled={processing}>
            {processing ? '처리 중' : '대기 작업 처리'}
          </button>
        </div>
      </section>

      {message ? <p className="operations-message">{message}</p> : null}
      {state === 'loading' && !summary ? <p className="operations-state">작업 기록을 불러오는 중입니다.</p> : null}
      {state === 'error' && !summary ? <p className="operations-state is-error">작업 기록을 불러오지 못했습니다.</p> : null}

      {summary ? (
        <>
          <section className="operations-metrics" aria-label="분석 작업 요약">
            <OperationMetric label="대기" value={summary.pendingCount} tone="waiting" />
            <OperationMetric label="분석 중" value={summary.runningCount} tone="running" />
            <OperationMetric label="실패" value={summary.failedCount} tone="failed" />
            <OperationMetric label="완료" value={summary.completedCount} tone="completed" />
          </section>

          <section className="operations-section">
            <div className="operations-section-head">
              <div>
                <p className="eyebrow">메일 계정</p>
                <h3>동기화 상태</h3>
              </div>
              <span>{formatDate(summary.checkedAt)} 기준</span>
            </div>
            <div className="operations-account-list">
              {summary.accounts.map((account) => (
                <div className="operations-account" key={account.mailAccountId}>
                  <div>
                    <strong>{account.accountEmail}</strong>
                    <span>{providerLabel(account.provider)}{account.primary ? ' · 대표 계정' : ''}</span>
                  </div>
                  <div>
                    <strong>{account.syncEnabled ? syncStatusLabel(account.syncStatus) : '연결 해제'}</strong>
                    <span>{account.lastSyncedAt ? `마지막 동기화 ${formatDate(account.lastSyncedAt)}` : '동기화 기록 없음'}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="operations-section">
            <div className="operations-section-head">
              <div>
                <p className="eyebrow">최근 기록</p>
                <h3>분석 작업</h3>
              </div>
              <span>최근 {summary.recentJobs.length}건</span>
            </div>
            {summary.recentJobs.length > 0 ? (
              <div className="operations-job-list">
                {summary.recentJobs.map((job) => <OperationJobRow key={job.jobId} job={job} />)}
              </div>
            ) : (
              <div className="operations-empty">
                <strong>아직 분석 작업이 없습니다.</strong>
                <span>분석 대상 메일이 등록되면 처리 상태가 여기에 표시됩니다.</span>
              </div>
            )}
          </section>
        </>
      ) : null}
    </div>
  );
}

function OperationMetric({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div className={`operations-metric operations-metric-${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function OperationJobRow({ job }: { job: OperationJob }) {
  return (
    <article className="operations-job">
      <div className="operations-job-main">
        <span className={`operations-job-status status-${job.status.toLowerCase()}`}>
          {jobStatusLabels[job.status] ?? job.status}
        </span>
        <div>
          <strong>{job.subject || '제목 없음'}</strong>
          <span>{job.accountEmail} · {formatDate(job.createdAt)}</span>
        </div>
      </div>
      <div className="operations-job-result">
        <span>{job.statusMessage}</span>
        {job.retryCount > 0 ? <small>재시도 {job.retryCount}/{job.maxRetries}</small> : null}
      </div>
    </article>
  );
}
