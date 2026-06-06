import type { EmailDetail, EmailListItem } from '../types';

export function decodeHtmlEntities(value: string) {
  const textarea = document.createElement('textarea');
  textarea.innerHTML = value;
  return textarea.value;
}

export function buildMailHtmlDocument(bodyHtml: string, theme: 'light' | 'dark') {
  const isDark = theme === 'dark';
  const textColor = isDark ? '#eef3f6' : '#1a2332';
  const backgroundColor = isDark ? '#1d2226' : '#ffffff';

  return `<!doctype html>
<html>
<head>
  <base target="_blank">
  <style>
    html {
      color: ${textColor};
      background: ${backgroundColor};
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      font-size: 14px;
      line-height: 1.6;
      overflow-wrap: anywhere;
    }
    body {
      margin: 0;
      padding: 0;
    }
    img {
      max-width: 100%;
      height: auto;
    }
    table {
      max-width: 100%;
    }
  </style>
</head>
<body>${bodyHtml}</body>
</html>`;
}

export function createDetailFromListItem(email: EmailListItem | undefined): EmailDetail | null {
  if (!email) {
    return null;
  }

  const hasAnalysisSnapshot = Boolean(
    email.shortSummary ||
      email.category ||
      email.priorityLevel ||
      email.importanceScore != null ||
      email.urgencyScore != null ||
      email.needsReply != null
  );

  return {
    id: email.id,
    mailAccountId: '',
    accountEmail: '',
    provider: '',
    externalMessageId: email.id,
    externalThreadId: null,
    internetMessageId: null,
    subject: email.subject,
    bodyText: email.snippet,
    bodyHtml: null,
    snippet: email.snippet,
    fromName: email.fromName,
    fromEmail: email.fromEmail,
    receivedAt: email.receivedAt,
    sentAt: null,
    read: email.read,
    starred: email.starred,
    hasAttachment: email.hasAttachment,
    importanceHeader: null,
    analysisEligible: email.analysisEligible,
    analysisCandidateScore: email.analysisCandidateScore,
    analysisCandidateReasons: email.analysisCandidateReasons,
    analysisSkippedReason: email.analysisSkippedReason,
    analysisCandidateEvaluatedAt: email.analysisCandidateEvaluatedAt,
    attentionResolved: email.attentionResolved,
    attentionResolvedAt: email.attentionResolvedAt,
    attentionStatus: email.attentionStatus,
    attentionStatusUpdatedAt: email.attentionStatusUpdatedAt,
    analysis: hasAnalysisSnapshot
      ? {
          id: `${email.id}_analysis`,
          analysisVersion: 1,
          modelName: null,
          promptVersion: null,
          shortSummary: email.shortSummary,
          detailedSummary: email.shortSummary,
          category: email.category,
          priorityLevel: email.priorityLevel,
          importanceScore: email.importanceScore,
          urgencyScore: email.urgencyScore,
          confidenceScore: null,
          needsReply: email.needsReply,
          hasDeadline: email.attentionReasons.includes('HAS_DEADLINE'),
          deadlineAt: null,
          deadlineText: null,
          timeSensitivity: email.attentionReasons.includes('HAS_DEADLINE') ? 'THIS_WEEK' : 'NO_DEADLINE',
          requiresAction: Boolean(email.needsReply || email.attentionReasons.includes('HAS_DEADLINE')),
          userTaskSummary: email.needsReply ? '메일 내용을 확인하고 회신 필요 여부를 판단해야 합니다.' : '필요 시 메일 내용을 확인하면 됩니다.',
          priorityReasonCodes: email.attentionReasons.includes('HAS_DEADLINE')
            ? ['HAS_DEADLINE']
            : email.needsReply
              ? ['NEEDS_REPLY']
              : [],
          suggestedAction: email.needsReply ? '내용 확인 후 회신' : '내용 확인',
          reasoning: '목록 응답을 기준으로 만든 임시 상세입니다.',
          status: 'READY',
          analyzedAt: new Date().toISOString()
        }
      : null,
    actionItems: email.needsReply
      ? [
          {
            id: `${email.id}_action`,
            actionText: '메일 내용 확인 및 회신',
            actionType: 'REPLY',
            priorityLevel: email.priorityLevel,
            dueAt: null,
            completed: false
          }
        ]
      : [],
    analysisJobs: []
  };
}
