import { useEffect, useRef } from 'react';
import { ALL_MAIL_PAGE_SIZE } from '../constants';
import type {
  AgentHealth,
  AnalysisFeedbackMessage,
  AnalysisFeedbackType,
  AttentionStatus,
  DetailLoadState,
  EmailAnalysis,
  EmailListItem,
  LoadState
} from '../types';
import { EmptyState } from './common';
import { MailListRow } from './mail';

type MailboxEmailListProps = {
  agentHealth: AgentHealth | null;
  analysisFeedbackMessages: Record<string, AnalysisFeedbackMessage>;
  analysisFeedbackSavingId: string | null;
  analysisHistory: Record<string, EmailAnalysis[]>;
  analysisHistoryState: Record<string, LoadState>;
  analysisRequestingId: string | null;
  attentionUpdatingId: string | null;
  detailErrorMessage: string | null;
  detailLoadState: DetailLoadState;
  hasAnyFilter: boolean;
  hasSearchFilter: boolean;
  originalMailDefaultOpen: boolean;
  page: number;
  pagedEmails: EmailListItem[];
  scrollTop: number;
  selectedEmailId: string;
  theme: 'light' | 'dark';
  onResetFilters: () => void;
  onRequestAnalysis: (emailId: string) => void;
  onSaveAnalysisFeedback: (analysisId: string, feedbackType: AnalysisFeedbackType) => void;
  onScrollTopChange: (scrollTop: number) => void;
  onToggleEmailDetail: (emailId: string) => void;
  onUpdateAttentionStatus: (emailId: string, status: AttentionStatus) => void;
};

export function MailboxEmailList({
  agentHealth,
  analysisFeedbackMessages,
  analysisFeedbackSavingId,
  analysisHistory,
  analysisHistoryState,
  analysisRequestingId,
  attentionUpdatingId,
  detailErrorMessage,
  detailLoadState,
  hasAnyFilter,
  hasSearchFilter,
  originalMailDefaultOpen,
  page,
  pagedEmails,
  scrollTop,
  selectedEmailId,
  theme,
  onResetFilters,
  onRequestAnalysis,
  onSaveAnalysisFeedback,
  onScrollTopChange,
  onToggleEmailDetail,
  onUpdateAttentionStatus
}: MailboxEmailListProps) {
  const mailTableRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const table = mailTableRef.current;
    if (!table) {
      return;
    }
    const frameId = window.requestAnimationFrame(() => {
      table.scrollTop = scrollTop;
    });
    return () => window.cancelAnimationFrame(frameId);
  }, [page, pagedEmails.length, scrollTop]);

  return (
    <section className="all-mail-panel">
      <div
        className="mail-table"
        role="list"
        ref={mailTableRef}
        onScroll={(event) => onScrollTopChange(event.currentTarget.scrollTop)}
      >
        {pagedEmails.length === 0 ? (
          <EmptyState
            title="표시할 메일이 없습니다"
            description={
              hasSearchFilter
                ? '검색어와 선택한 필터에 맞는 메일을 찾지 못했습니다.'
                : '선택한 분류에 해당하는 메일이 없습니다.'
            }
            actionLabel={hasAnyFilter ? '전체 메일 보기' : undefined}
            onAction={onResetFilters}
          />
        ) : (
          pagedEmails.map((email, index) => (
            <MailListRow
              key={email.id}
              email={email}
              index={(page - 1) * ALL_MAIL_PAGE_SIZE + index + 1}
              expanded={false}
              detail={null}
              selected={email.id === selectedEmailId}
              detailLoadState={detailLoadState}
              detailErrorMessage={detailErrorMessage}
              theme={theme}
              originalMailDefaultOpen={originalMailDefaultOpen}
              analysisSubmitting={analysisRequestingId === email.id}
              agentHealth={agentHealth}
              attentionUpdating={attentionUpdatingId === email.id}
              onRequestAnalysis={onRequestAnalysis}
              onUpdateAttentionStatus={onUpdateAttentionStatus}
              feedbackSavingId={analysisFeedbackSavingId}
              feedbackMessages={analysisFeedbackMessages}
              onSaveAnalysisFeedback={onSaveAnalysisFeedback}
              analysisHistory={analysisHistory[email.id] ?? []}
              analysisHistoryState={analysisHistoryState[email.id] ?? 'idle'}
              onSelect={() => {
                if (mailTableRef.current) {
                  onScrollTopChange(mailTableRef.current.scrollTop);
                }
                onToggleEmailDetail(email.id);
              }}
            />
          ))
        )}
      </div>
    </section>
  );
}
