import type {
  AgentHealth,
  AnalysisFeedbackMessage,
  AnalysisFeedbackType,
  AttentionStatus,
  DetailLoadState,
  EmailAnalysis,
  EmailDetail,
  EmailListItem,
  LoadState
} from '../types';
import { MailInlineDetail } from './MailInlineDetail';
import { MailListRowHeader } from './MailListRowHeader';

export function MailListRow({
  email,
  index,
  expanded,
  detail,
  selected = false,
  detailLoadState,
  detailErrorMessage,
  theme,
  originalMailDefaultOpen,
  analysisSubmitting,
  agentHealth,
  onRequestAnalysis,
  onUpdateAnalysisCandidate,
  attentionUpdating,
  onUpdateAttentionStatus,
  feedbackSavingId,
  feedbackMessages,
  onSaveAnalysisFeedback,
  analysisHistory,
  analysisHistoryState,
  onSelect
}: {
  email: EmailListItem;
  index: number;
  expanded: boolean;
  detail: EmailDetail | null;
  selected?: boolean;
  detailLoadState: DetailLoadState;
  detailErrorMessage: string | null;
  theme: 'light' | 'dark';
  originalMailDefaultOpen: boolean;
  analysisSubmitting: boolean;
  agentHealth: AgentHealth | null;
  onRequestAnalysis: (emailId: string) => void;
  onUpdateAnalysisCandidate: (emailId: string, eligible: boolean) => void;
  attentionUpdating: boolean;
  onUpdateAttentionStatus: (emailId: string, status: AttentionStatus) => void;
  feedbackSavingId: string | null;
  feedbackMessages: Record<string, AnalysisFeedbackMessage>;
  onSaveAnalysisFeedback: (analysisId: string, feedbackType: AnalysisFeedbackType) => void;
  analysisHistory: EmailAnalysis[];
  analysisHistoryState: LoadState;
  onSelect: () => void;
}) {
  const isLoading = expanded && detailLoadState === 'loading';

  return (
    <div
      className={[
        'mail-list-item',
        expanded ? 'mail-list-item-expanded' : '',
        selected ? 'mail-list-item-selected' : ''
      ].filter(Boolean).join(' ')}
      role="listitem"
      data-email-id={email.id}
    >
      <MailListRowHeader email={email} index={index} expanded={expanded} onSelect={onSelect} />

      {expanded ? (
        <MailInlineDetail
          email={email}
          detail={detail}
          detailLoadState={detailLoadState}
          detailErrorMessage={detailErrorMessage}
          isLoading={isLoading}
          theme={theme}
          originalMailDefaultOpen={originalMailDefaultOpen}
          analysisSubmitting={analysisSubmitting}
          agentHealth={agentHealth}
          attentionUpdating={attentionUpdating}
          feedbackSavingId={feedbackSavingId}
          feedbackMessages={feedbackMessages}
          analysisHistory={analysisHistory}
          analysisHistoryState={analysisHistoryState}
          onRequestAnalysis={onRequestAnalysis}
          onUpdateAnalysisCandidate={onUpdateAnalysisCandidate}
          onUpdateAttentionStatus={onUpdateAttentionStatus}
          onSaveAnalysisFeedback={onSaveAnalysisFeedback}
        />
      ) : null}
    </div>
  );
}
