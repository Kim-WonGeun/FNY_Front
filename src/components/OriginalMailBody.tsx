import type { EmailDetail } from '../types';
import { buildMailHtmlDocument, decodeHtmlEntities } from '../utils/mailbox';

type OriginalMailBodyProps = {
  detail: EmailDetail;
  fallback?: string | null;
  theme: 'light' | 'dark';
  compact?: boolean;
};

export function OriginalMailBody({ detail, fallback, theme, compact = false }: OriginalMailBodyProps) {
  if (detail.bodyHtml && detail.bodyHtml.trim()) {
    return (
      <iframe
        className={`original-mail-frame${compact ? ' original-mail-frame-compact' : ''}`}
        title={`${detail.subject} 원문`}
        sandbox=""
        srcDoc={buildMailHtmlDocument(detail.bodyHtml, theme)}
      />
    );
  }

  return (
    <p className="original-mail-text">
      {decodeHtmlEntities(detail.bodyText || detail.snippet || fallback || '본문이 없습니다.')}
    </p>
  );
}
