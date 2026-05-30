import type { EmailListItem } from '../types';
import { formatDate } from '../utils/date';
import {
  analysisListHint,
  attentionStatusLabel,
  isOpenAttentionStatus,
  priorityDescription,
  priorityLabel
} from '../utils/mailbox';

type MailListRowHeaderProps = {
  email: EmailListItem;
  index: number;
  expanded: boolean;
  onSelect: () => void;
};

export function MailListRowHeader({ email, index, expanded, onSelect }: MailListRowHeaderProps) {
  const analysisHint = analysisListHint(email);

  return (
    <button className="mail-list-row" type="button" onClick={onSelect} aria-expanded={expanded}>
      <span className="mail-list-index">{index}</span>
      <span className="mail-list-main">
        <strong>{email.subject}</strong>
        <span>{email.shortSummary || email.snippet || '요약 대기 중입니다.'}</span>
        {analysisHint ? <span className="mail-list-analysis-hint">{analysisHint}</span> : null}
      </span>
      <span className="mail-list-sender">
        <strong>{email.fromName ?? email.fromEmail}</strong>
        <span>{email.fromEmail}</span>
      </span>
      <span className="mail-list-meta">
        {!isOpenAttentionStatus(email.attentionStatus) ? (
          <span className="resolved-pill">{attentionStatusLabel(email.attentionStatus)}</span>
        ) : null}
        <PriorityBadge priority={email.priorityLevel} />
        <span>{formatDate(email.receivedAt)}</span>
      </span>
    </button>
  );
}

function PriorityBadge({ priority }: { priority: string | null }) {
  const normalized = (priority ?? 'WAITING').toUpperCase();
  const label = priorityLabel(normalized);
  const description = priorityDescription(normalized);
  return (
    <span className={`priority priority-${normalized.toLowerCase()}`} title={description}>
      {label}
    </span>
  );
}
