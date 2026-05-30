import { CALENDAR_MONTH_OPTIONS } from '../constants';
import type {
  AgentHealth,
  AnalysisFeedbackMessage,
  AnalysisFeedbackType,
  AnalysisQueueFilter,
  AttentionStatus,
  DetailLoadState,
  EmailAnalysis,
  EmailDetail,
  EmailListItem,
  LoadState,
  MailboxOverview,
  SpotlightFilter
} from '../types';
import {
  formatCalendarDate,
  formatCalendarMonth,
  shiftMonthKey,
  todayKey
} from '../utils/date';
import { analysisSkippedReasonShortLabel, attentionStatusLabel } from '../utils/mailbox';
import { EmptyState, FilterTab, Metric } from './common';
import { MailListRow } from './mail';

type MailRowRuntimeProps = {
  detailLoadState: DetailLoadState;
  detailErrorMessage: string | null;
  theme: 'light' | 'dark';
  originalMailDefaultOpen: boolean;
  analysisRequestingId: string | null;
  agentHealth: AgentHealth | null;
  attentionUpdatingId: string | null;
  analysisFeedbackSavingId: string | null;
  analysisFeedbackMessages: Record<string, AnalysisFeedbackMessage>;
  analysisHistory: Record<string, EmailAnalysis[]>;
  analysisHistoryState: Record<string, LoadState>;
  onRequestAnalysis: (emailId: string) => void;
  onUpdateAttentionStatus: (emailId: string, status: AttentionStatus) => void;
  onSaveAnalysisFeedback: (analysisId: string, feedbackType: AnalysisFeedbackType) => void;
};

export type HomeDashboardPageProps = {
  syncState: LoadState;
  loadState: LoadState;
  errorMessage: string | null;
  overview: MailboxOverview;
  mailboxCounts: { all: number; inbox: number; sent: number };
  analysisQueueCounts: { candidate: number; excluded: number; done: number };
  tabCounts: Record<SpotlightFilter, number>;
  spotlightFilter: SpotlightFilter;
  listQuery: string;
  calendarMonth: string;
  calendarYear: number;
  calendarMonthNumber: number;
  calendarPickerOpen: boolean;
  calendarDays: Array<{
    dateKey: string;
    dayOfMonth: number;
    inCurrentMonth: boolean;
    stats: { total: number };
  }>;
  selectedCalendarDate: string;
  selectedCalendarEmails: EmailListItem[];
  filteredSpotlight: EmailListItem[];
  processedTodayEmails: EmailListItem[];
  analysisSkippedReasonStats: Array<{ reason: string; count: number }>;
  analysisQueueFilter: AnalysisQueueFilter;
  analysisQueueEmails: EmailListItem[];
  expandedMailId: string | null;
  emailDetail: EmailDetail | null;
  mailRow: MailRowRuntimeProps;
  onSync: () => void;
  onSpotlightFilterChange: (filter: SpotlightFilter) => void;
  onListQueryChange: (query: string) => void;
  onCalendarPickerOpenChange: (open: boolean) => void;
  onCalendarMonthChange: (monthKey: string) => void;
  onCalendarDateSelect: (dateKey: string) => void;
  onTodaySelect: () => void;
  onOpenEmail: (emailId: string) => void;
  onToggleEmailDetail: (emailId: string) => void;
  onAnalysisQueueFilterChange: (filter: AnalysisQueueFilter) => void;
  onOpenMailboxForAnalysis: (filter: AnalysisQueueFilter) => void;
};

export function HomeDashboardPage({
  syncState,
  loadState,
  errorMessage,
  overview,
  mailboxCounts,
  analysisQueueCounts,
  tabCounts,
  spotlightFilter,
  listQuery,
  calendarMonth,
  calendarYear,
  calendarMonthNumber,
  calendarPickerOpen,
  calendarDays,
  selectedCalendarDate,
  selectedCalendarEmails,
  filteredSpotlight,
  processedTodayEmails,
  analysisSkippedReasonStats,
  analysisQueueFilter,
  analysisQueueEmails,
  expandedMailId,
  emailDetail,
  mailRow,
  onSync,
  onSpotlightFilterChange,
  onListQueryChange,
  onCalendarPickerOpenChange,
  onCalendarMonthChange,
  onCalendarDateSelect,
  onTodaySelect,
  onOpenEmail,
  onToggleEmailDetail,
  onAnalysisQueueFilterChange,
  onOpenMailboxForAnalysis
}: HomeDashboardPageProps) {
  const renderMailRow = (email: EmailListItem, index: number, expanded: boolean, onSelect: () => void, key: string) => (
    <MailListRow
      key={key}
      email={email}
      index={index + 1}
      expanded={expanded}
      detail={expanded && emailDetail?.id === email.id ? emailDetail : null}
      detailLoadState={mailRow.detailLoadState}
      detailErrorMessage={mailRow.detailErrorMessage}
      theme={mailRow.theme}
      originalMailDefaultOpen={mailRow.originalMailDefaultOpen}
      analysisSubmitting={mailRow.analysisRequestingId === email.id}
      agentHealth={mailRow.agentHealth}
      attentionUpdating={mailRow.attentionUpdatingId === email.id}
      onRequestAnalysis={mailRow.onRequestAnalysis}
      onUpdateAttentionStatus={mailRow.onUpdateAttentionStatus}
      feedbackSavingId={mailRow.analysisFeedbackSavingId}
      feedbackMessages={mailRow.analysisFeedbackMessages}
      onSaveAnalysisFeedback={mailRow.onSaveAnalysisFeedback}
      analysisHistory={mailRow.analysisHistory[email.id] ?? []}
      analysisHistoryState={mailRow.analysisHistoryState[email.id] ?? 'idle'}
      onSelect={onSelect}
    />
  );

  return (
    <div className="status-dashboard" aria-label="홈 대시보드">
      <section className="status-hero-card">
        <div>
          <p className="eyebrow">오늘의 메일</p>
          <h3>상태를 보고 바로 처리합니다.</h3>
          <p>동기화된 메일, 분석 상태, 우선 확인할 메일을 한 화면에서 봅니다.</p>
        </div>
        <button type="button" className="settings-action-btn" onClick={onSync} disabled={syncState === 'loading'}>
          {syncState === 'loading' ? '동기화 중' : '동기화'}
        </button>
      </section>

      <div className="status-line" role="status">
        {loadState === 'loading' && '메일함을 불러오는 중입니다.'}
        {loadState === 'ready' && '최신 메일 기준으로 정리했습니다.'}
        {loadState === 'fallback' && `서버 연결 전이라 샘플 데이터로 보고 있습니다. ${errorMessage ?? ''}`}
        {loadState === 'error' && '메일함을 불러오지 못했습니다.'}
      </div>

      <section className="status-metrics-grid" aria-label="메일 대시보드 지표">
        <Metric label="전체 메일" value={mailboxCounts.all} />
        <Metric label="읽지 않음" value={overview.unreadEmails} tone="blue" selected={spotlightFilter === 'unread'} onClick={() => onSpotlightFilterChange('unread')} />
        <Metric label="회신 필요" value={overview.needsReplyEmails} tone="red" selected={spotlightFilter === 'reply'} onClick={() => onSpotlightFilterChange('reply')} />
        <Metric label="중요 메일" value={overview.highPriorityEmails} tone="green" selected={spotlightFilter === 'urgent'} onClick={() => onSpotlightFilterChange('urgent')} />
        <Metric label="분석 대상" value={analysisQueueCounts.candidate} tone="blue" />
        <Metric label="분석 제외" value={analysisQueueCounts.excluded} />
        <Metric label="확인 완료" value={analysisQueueCounts.done} tone="green" />
        <Metric label="대기 작업" value={overview.pendingAnalysisJobs} tone="red" />
      </section>

      <div className="filter-tabs" role="tablist" aria-label="목록 필터">
        <FilterTab id="tab-all" selected={spotlightFilter === 'all'} onSelect={() => onSpotlightFilterChange('all')} label={`전체 (${tabCounts.all})`} />
        <FilterTab id="tab-urgent" selected={spotlightFilter === 'urgent'} onSelect={() => onSpotlightFilterChange('urgent')} label={`긴급 (${tabCounts.urgent})`} />
        <FilterTab id="tab-reply" selected={spotlightFilter === 'reply'} onSelect={() => onSpotlightFilterChange('reply')} label={`회신 필요 (${tabCounts.reply})`} />
        <FilterTab id="tab-unread" selected={spotlightFilter === 'unread'} onSelect={() => onSpotlightFilterChange('unread')} label={`읽지 않음 (${tabCounts.unread})`} />
      </div>

      <section className="mail-calendar-panel" aria-label="메일 캘린더">
        <div className="mail-calendar-card">
          <div className="mail-calendar-head">
            <div>
              <p className="eyebrow">메일 캘린더</p>
              <button type="button" className="mail-calendar-title-button" onClick={() => onCalendarPickerOpenChange(!calendarPickerOpen)} aria-expanded={calendarPickerOpen}>
                {formatCalendarMonth(calendarMonth)}
              </button>
            </div>
            <div className="mail-calendar-nav">
              <button type="button" onClick={() => onCalendarMonthChange(shiftMonthKey(calendarMonth, -1))} aria-label="이전 달">
                이전
              </button>
              <button type="button" onClick={onTodaySelect}>
                오늘
              </button>
              <button type="button" onClick={() => onCalendarMonthChange(shiftMonthKey(calendarMonth, 1))} aria-label="다음 달">
                다음
              </button>
            </div>
          </div>
          {calendarPickerOpen ? (
            <div className="mail-calendar-picker" aria-label="연도와 월 선택">
              <div className="mail-calendar-picker-year">
                <button type="button" onClick={() => onCalendarMonthChange(`${calendarYear - 1}-${String(calendarMonthNumber).padStart(2, '0')}`)} aria-label="이전 연도">
                  이전
                </button>
                <strong>{calendarYear}년</strong>
                <button type="button" onClick={() => onCalendarMonthChange(`${calendarYear + 1}-${String(calendarMonthNumber).padStart(2, '0')}`)} aria-label="다음 연도">
                  다음
                </button>
              </div>
              <div className="mail-calendar-month-grid">
                {CALENDAR_MONTH_OPTIONS.map((month) => {
                  const selected = month === calendarMonthNumber;
                  return (
                    <button
                      key={month}
                      type="button"
                      className={selected ? 'mail-calendar-month-active' : ''}
                      onClick={() => {
                        onCalendarMonthChange(`${calendarYear}-${String(month).padStart(2, '0')}`);
                        onCalendarPickerOpenChange(false);
                      }}
                      aria-pressed={selected}
                    >
                      {month}월
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          <div className="mail-calendar-weekdays" aria-hidden="true">
            {['일', '월', '화', '수', '목', '금', '토'].map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>
          <div className="mail-calendar-grid">
            {calendarDays.map((day) => {
              const isSelected = day.dateKey === selectedCalendarDate;
              const isToday = day.dateKey === todayKey();
              const hasMail = day.stats.total > 0;

              return (
                <button
                  type="button"
                  key={day.dateKey}
                  className={[
                    'mail-calendar-day',
                    day.inCurrentMonth ? '' : 'mail-calendar-day-muted',
                    isSelected ? 'mail-calendar-day-selected' : '',
                    isToday ? 'mail-calendar-day-today' : ''
                  ].filter(Boolean).join(' ')}
                  onClick={() => onCalendarDateSelect(day.dateKey)}
                >
                  <span className="mail-calendar-date">{day.dayOfMonth}</span>
                  {hasMail ? <span className="mail-calendar-count">{day.stats.total}</span> : null}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mail-calendar-list">
          <div className="section-heading">
            <h2>{formatCalendarDate(selectedCalendarDate)}</h2>
            <p className="section-copy">
              {selectedCalendarEmails.length === 0
                ? '이 날짜에 표시할 메일이 없습니다.'
                : `${selectedCalendarEmails.length}건의 메일이 있습니다.`}
            </p>
          </div>
          <div className="mail-table" role="list">
            {selectedCalendarEmails.length === 0 ? (
              <EmptyState title="메일이 없습니다" description="다른 날짜를 선택하면 해당 날짜의 메일을 볼 수 있습니다." />
            ) : (
              selectedCalendarEmails.map((email, index) =>
                renderMailRow(email, index, false, () => onOpenEmail(email.id), `calendar-${email.id}`)
              )
            )}
          </div>
        </div>
      </section>

      <section className="focus-layout">
        <div className="priority-panel">
          <div className="section-heading priority-panel-heading">
            <p className="eyebrow">우선순위</p>
            <div className="priority-panel-title-row">
              <h2>확인할 메일</h2>
              <label className="sr-only" htmlFor="list-search">목록 검색</label>
              <input id="list-search" className="toolbar-search" value={listQuery} onChange={(event) => onListQueryChange(event.target.value)} placeholder="제목·발신자 검색" />
            </div>
          </div>

          <div className="mail-table" role="list">
            {filteredSpotlight.length === 0 ? (
              <EmptyState
                title="확인할 메일이 없습니다"
                description="현재 조건에 맞는 우선 확인 메일이 없습니다. 필터나 검색어를 바꿔보세요."
                actionLabel={spotlightFilter !== 'all' || listQuery.trim() ? '필터 초기화' : undefined}
                onAction={() => {
                  onSpotlightFilterChange('all');
                  onListQueryChange('');
                }}
              />
            ) : (
              filteredSpotlight.map((email, index) =>
                renderMailRow(email, index, email.id === expandedMailId, () => onToggleEmailDetail(email.id), email.id)
              )
            )}
          </div>
        </div>
      </section>

      <section className="status-insight-grid" aria-label="처리 및 제외 현황">
        <div className="status-insight-panel">
          <div className="section-heading">
            <p className="eyebrow">오늘 처리</p>
            <h2>처리한 메일</h2>
            <p className="section-copy">오늘 확인 완료, 처리 완료, 보류로 바꾼 메일입니다.</p>
          </div>
          {processedTodayEmails.length === 0 ? (
            <EmptyState title="오늘 처리한 메일이 없습니다" description="확인 완료나 처리 완료로 바꾼 메일이 여기에 표시됩니다." actionLabel="처리 상태 보기" onAction={() => onAnalysisQueueFilterChange('done')} />
          ) : (
            <div className="status-processed-list">
              {processedTodayEmails.map((email) => (
                <button type="button" key={email.id} onClick={() => onOpenEmail(email.id)}>
                  <span>
                    <strong>{email.subject || '(제목 없음)'}</strong>
                    <small>{email.fromName ?? email.fromEmail}</small>
                  </span>
                  <em>{attentionStatusLabel(email.attentionStatus)}</em>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="status-insight-panel">
          <div className="section-heading">
            <p className="eyebrow">분석 제외</p>
            <h2>제외 사유</h2>
            <p className="section-copy">LLM 분석 대상에서 제외한 이유를 분포로 봅니다.</p>
          </div>
          {analysisSkippedReasonStats.length === 0 ? (
            <EmptyState title="분석 제외 사유가 없습니다" description="메일 동기화 후 1차 필터가 실행되면 제외 사유가 표시됩니다." actionLabel="분석 제외 보기" onAction={() => onAnalysisQueueFilterChange('excluded')} />
          ) : (
            <div className="status-reason-list">
              {analysisSkippedReasonStats.slice(0, 5).map((item) => {
                const percent = analysisQueueCounts.excluded === 0 ? 0 : Math.round((item.count / analysisQueueCounts.excluded) * 100);

                return (
                  <button type="button" key={item.reason} onClick={() => onOpenMailboxForAnalysis('excluded')}>
                    <span>
                      <strong>{analysisSkippedReasonShortLabel(item.reason)}</strong>
                      <small>{item.count.toLocaleString('ko-KR')}건</small>
                    </span>
                    <span className="status-reason-meter" aria-hidden="true">
                      <i style={{ width: `${percent}%` }} />
                    </span>
                    <em>{percent}%</em>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <section className="analysis-queue-panel status-analysis-panel" aria-label="처리 상태">
        <div className="section-heading">
          <p className="eyebrow">자동 분류</p>
          <h2>처리 상태</h2>
          <p className="section-copy">상태별 메일을 확인하고 메일함에서 이어서 처리합니다.</p>
        </div>

        <div className="filter-tabs analysis-queue-tabs" role="tablist" aria-label="처리 상태 필터">
          <FilterTab id="analysis-candidate" selected={analysisQueueFilter === 'candidate'} onSelect={() => onAnalysisQueueFilterChange('candidate')} label={`분석 대상 (${analysisQueueCounts.candidate})`} />
          <FilterTab id="analysis-excluded" selected={analysisQueueFilter === 'excluded'} onSelect={() => onAnalysisQueueFilterChange('excluded')} label={`분석 제외 (${analysisQueueCounts.excluded})`} />
          <FilterTab id="analysis-done" selected={analysisQueueFilter === 'done'} onSelect={() => onAnalysisQueueFilterChange('done')} label={`확인 완료 (${analysisQueueCounts.done})`} />
        </div>

        <div className="analysis-queue-summary" role="status">
          {analysisQueueFilter === 'candidate' && '업무 처리 가능성이 높아 자동 분석 대상으로 남아 있는 메일입니다.'}
          {analysisQueueFilter === 'excluded' && '업무 신호가 낮거나 오래된 메일처럼 자동 분석에서 제외된 메일입니다.'}
          {analysisQueueFilter === 'done' && '사용자가 확인 완료, 처리 완료, 보류로 바꿔 홈 우선순위에서 빠진 메일입니다.'}
        </div>

        <div className="analysis-queue-actions">
          <button type="button" className="btn-weekly" onClick={() => onOpenMailboxForAnalysis(analysisQueueFilter)}>
            메일함에서 전체 보기
          </button>
        </div>

        <div className="mail-table" role="list">
          {analysisQueueEmails.length === 0 ? (
            <EmptyState title="해당 상태의 메일이 없습니다" description="다른 상태를 선택하거나 메일함에서 전체 메일을 확인해 보세요." actionLabel="메일함에서 보기" onAction={() => onOpenMailboxForAnalysis(analysisQueueFilter)} />
          ) : (
            analysisQueueEmails.slice(0, 8).map((email, index) =>
              renderMailRow(email, index, email.id === expandedMailId, () => onToggleEmailDetail(email.id), `analysis-${email.id}`)
            )
          )}
        </div>
      </section>
    </div>
  );
}
