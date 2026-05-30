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
  detailLoadState,
  detailErrorMessage,
  theme,
  originalMailDefaultOpen,
  analysisSubmitting,
  agentHealth,
  onRequestAnalysis,
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
  detailLoadState: DetailLoadState;
  detailErrorMessage: string | null;
  theme: 'light' | 'dark';
  originalMailDefaultOpen: boolean;
  analysisSubmitting: boolean;
  agentHealth: AgentHealth | null;
  onRequestAnalysis: (emailId: string) => void;
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
    <div className={`mail-list-item${expanded ? ' mail-list-item-expanded' : ''}`} role="listitem">
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
          onUpdateAttentionStatus={onUpdateAttentionStatus}
          onSaveAnalysisFeedback={onSaveAnalysisFeedback}
        />
      ) : null}
    </div>
  );
}
