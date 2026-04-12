import { FormEvent, useEffect, useMemo, useState } from 'react';

type AttentionReason = 'HIGH_PRIORITY' | 'NEEDS_REPLY' | 'UNREAD' | 'STARRED' | 'HAS_DEADLINE';

type EmailListItem = {
  id: string;
  subject: string;
  snippet: string | null;
  fromName: string | null;
  fromEmail: string;
  receivedAt: string;
  read: boolean;
  starred: boolean;
  hasAttachment: boolean;
  category: string | null;
  priorityLevel: string | null;
  importanceScore: number | null;
  urgencyScore: number | null;
  shortSummary: string | null;
  needsReply: boolean | null;
  attentionReasons: AttentionReason[];
};

type MailboxOverview = {
  userId: string;
  totalEmails: number;
  unreadEmails: number;
  needsReplyEmails: number;
  highPriorityEmails: number;
  pendingAnalysisJobs: number;
  spotlightEmails: EmailListItem[];
};

type LoadState = 'idle' | 'loading' | 'ready' | 'fallback' | 'error';
type DetailLoadState = 'idle' | 'loading' | 'ready' | 'fallback' | 'error';

type EmailAnalysis = {
  id: string;
  analysisVersion: number;
  modelName: string | null;
  promptVersion: string | null;
  shortSummary: string | null;
  detailedSummary: string | null;
  category: string | null;
  priorityLevel: string | null;
  importanceScore: number | null;
  urgencyScore: number | null;
  confidenceScore: number | null;
  needsReply: boolean | null;
  hasDeadline: boolean | null;
  deadlineAt: string | null;
  suggestedAction: string | null;
  reasoning: string | null;
  status: string;
  analyzedAt: string;
};

type EmailActionItem = {
  id: string;
  actionText: string;
  actionType: string | null;
  priorityLevel: string | null;
  dueAt: string | null;
  completed: boolean;
};

type EmailDetail = {
  id: string;
  mailAccountId: string;
  accountEmail: string;
  provider: string;
  externalMessageId: string;
  externalThreadId: string | null;
  internetMessageId: string | null;
  subject: string;
  bodyText: string | null;
  bodyHtml: string | null;
  snippet: string | null;
  fromName: string | null;
  fromEmail: string;
  receivedAt: string;
  sentAt: string | null;
  read: boolean;
  starred: boolean;
  hasAttachment: boolean;
  importanceHeader: string | null;
  analysis: EmailAnalysis | null;
  actionItems: EmailActionItem[];
};

const DEFAULT_USER_ID = 'USR_260409_A00001';

const reasonLabel: Record<AttentionReason, string> = {
  HIGH_PRIORITY: '긴급',
  NEEDS_REPLY: '회신 필요',
  UNREAD: '읽지 않음',
  STARRED: '중요 표시',
  HAS_DEADLINE: '마감 있음'
};

const sampleOverview: MailboxOverview = {
  userId: DEFAULT_USER_ID,
  totalEmails: 3,
  unreadEmails: 2,
  needsReplyEmails: 2,
  highPriorityEmails: 3,
  pendingAnalysisJobs: 0,
  spotlightEmails: [
    {
      id: 'EML_260409_A00001',
      subject: '업무 요청 메일',
      snippet: '금일 중 확인 부탁드립니다.',
      fromName: '김부장',
      fromEmail: 'boss@test.com',
      receivedAt: new Date().toISOString(),
      read: false,
      starred: true,
      hasAttachment: false,
      category: 'REQUEST',
      priorityLevel: 'P1',
      importanceScore: 92,
      urgencyScore: 88,
      shortSummary: '오늘 안에 확인이 필요한 업무 요청 메일',
      needsReply: true,
      attentionReasons: ['HIGH_PRIORITY', 'NEEDS_REPLY', 'UNREAD', 'STARRED']
    },
    {
      id: 'EML_260409_A00003',
      subject: '보고 요청',
      snippet: '주간 보고서 제출 바랍니다.',
      fromName: '이팀장',
      fromEmail: 'leader@test.com',
      receivedAt: new Date(Date.now() - 1000 * 60 * 42).toISOString(),
      read: false,
      starred: false,
      hasAttachment: true,
      category: 'REPORT',
      priorityLevel: 'P2',
      importanceScore: 84,
      urgencyScore: 70,
      shortSummary: '주간 보고서 제출 요청',
      needsReply: true,
      attentionReasons: ['HIGH_PRIORITY', 'NEEDS_REPLY', 'UNREAD']
    },
    {
      id: 'EML_260409_A00002',
      subject: '회의 일정 안내',
      snippet: '내일 오전 10시 회의 예정입니다.',
      fromName: '김과장',
      fromEmail: 'manager@test.com',
      receivedAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
      read: true,
      starred: false,
      hasAttachment: false,
      category: 'MEETING',
      priorityLevel: 'P2',
      importanceScore: 72,
      urgencyScore: 60,
      shortSummary: '내일 오전 회의 일정 안내',
      needsReply: false,
      attentionReasons: ['HIGH_PRIORITY']
    }
  ]
};

const sampleDetails: Record<string, EmailDetail> = {
  EML_260409_A00001: {
    id: 'EML_260409_A00001',
    mailAccountId: 'MAC_260409_A00001',
    accountEmail: 'user1@test.com',
    provider: 'GOOGLE',
    externalMessageId: 'MSG_MAC_1_1',
    externalThreadId: 'THR_MAC_1',
    internetMessageId: '<msg1@test.com>',
    subject: '업무 요청 메일',
    bodyText: '금일 중 확인 부탁드립니다.',
    bodyHtml: null,
    snippet: '금일 중 확인 부탁드립니다.',
    fromName: '김부장',
    fromEmail: 'boss@test.com',
    receivedAt: new Date().toISOString(),
    sentAt: new Date().toISOString(),
    read: false,
    starred: true,
    hasAttachment: false,
    importanceHeader: 'high',
    analysis: {
      id: 'ANL_260409_A00001',
      analysisVersion: 1,
      modelName: 'gpt-5.4-mini',
      promptVersion: 'v1',
      shortSummary: '오늘 안에 확인이 필요한 업무 요청 메일',
      detailedSummary: '상사가 금일 내 확인을 요청한 업무 메일입니다. 회신이 필요하고 처리 시점이 짧아 우선 확인해야 합니다.',
      category: 'REQUEST',
      priorityLevel: 'P1',
      importanceScore: 92,
      urgencyScore: 88,
      confidenceScore: 95,
      needsReply: true,
      hasDeadline: true,
      deadlineAt: null,
      suggestedAction: '내용 확인 후 회신',
      reasoning: '명시적인 확인 요청과 짧은 마감 시점이 있습니다.',
      status: 'COMPLETED',
      analyzedAt: new Date().toISOString()
    },
    actionItems: [
      {
        id: 'ACT_260409_A00001',
        actionText: '메일 내용 확인 및 회신',
        actionType: 'REPLY',
        priorityLevel: 'P1',
        dueAt: null,
        completed: false
      }
    ]
  }
};

sampleDetails.EML_260409_A00002 = {
  ...sampleDetails.EML_260409_A00001,
  id: 'EML_260409_A00002',
  subject: '회의 일정 안내',
  bodyText: '내일 오전 10시 회의 예정입니다.',
  snippet: '내일 오전 10시 회의 예정입니다.',
  fromName: '김과장',
  fromEmail: 'manager@test.com',
  read: true,
  starred: false,
  analysis: {
    ...sampleDetails.EML_260409_A00001.analysis!,
    id: 'ANL_260409_A00002',
    shortSummary: '내일 오전 회의 일정 안내',
    detailedSummary: '캘린더 등록이 필요한 회의 공지 메일입니다.',
    category: 'MEETING',
    priorityLevel: 'P2',
    importanceScore: 72,
    urgencyScore: 60,
    needsReply: false,
    suggestedAction: '회의 일정 캘린더 반영',
    reasoning: '시간 정보가 분명하고 액션이 단순합니다.'
  },
  actionItems: [
    {
      id: 'ACT_260409_A00002',
      actionText: '회의 일정 캘린더 등록',
      actionType: 'SCHEDULE',
      priorityLevel: 'P2',
      dueAt: null,
      completed: false
    }
  ]
};

sampleDetails.EML_260409_A00003 = {
  ...sampleDetails.EML_260409_A00001,
  id: 'EML_260409_A00003',
  subject: '보고 요청',
  bodyText: '주간 보고서 제출 바랍니다.',
  snippet: '주간 보고서 제출 바랍니다.',
  fromName: '이팀장',
  fromEmail: 'leader@test.com',
  starred: false,
  hasAttachment: true,
  analysis: {
    ...sampleDetails.EML_260409_A00001.analysis!,
    id: 'ANL_260409_A00003',
    shortSummary: '주간 보고서 제출 요청',
    detailedSummary: '정기 보고 제출 요청 메일입니다. 제출 액션이 필요합니다.',
    category: 'REPORT',
    priorityLevel: 'P2',
    importanceScore: 84,
    urgencyScore: 70,
    suggestedAction: '보고서 작성 및 제출',
    reasoning: '업무 제출 요청이며 회신 또는 제출 액션이 필요합니다.'
  },
  actionItems: [
    {
      id: 'ACT_260409_A00003',
      actionText: '주간 보고서 작성 및 제출',
      actionType: 'SUBMIT',
      priorityLevel: 'P2',
      dueAt: null,
      completed: false
    }
  ]
};

function App() {
  const [userId, setUserId] = useState(DEFAULT_USER_ID);
  const [draftUserId, setDraftUserId] = useState(DEFAULT_USER_ID);
  const [overview, setOverview] = useState<MailboxOverview>(sampleOverview);
  const [loadState, setLoadState] = useState<LoadState>('idle');
  const [selectedEmailId, setSelectedEmailId] = useState(sampleOverview.spotlightEmails[0]?.id ?? '');
  const [emailDetail, setEmailDetail] = useState<EmailDetail | null>(sampleDetails.EML_260409_A00001);
  const [detailLoadState, setDetailLoadState] = useState<DetailLoadState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [detailErrorMessage, setDetailErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    void loadOverview(userId);
  }, [userId]);

  useEffect(() => {
    if (selectedEmailId) {
      void loadEmailDetail(selectedEmailId);
    }
  }, [selectedEmailId]);

  const sortedEmails = useMemo(() => {
    return [...overview.spotlightEmails].sort((a, b) => scoreEmail(b) - scoreEmail(a));
  }, [overview.spotlightEmails]);

  async function loadOverview(targetUserId: string) {
    setLoadState('loading');
    setErrorMessage(null);

    try {
      const response = await fetch(`/api/users/${targetUserId}/overview`);

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }

      const data = (await response.json()) as MailboxOverview;
      const normalized = normalizeOverview(data);
      setOverview(normalized);
      setSelectedEmailId((current) => current || normalized.spotlightEmails[0]?.id || '');
      setLoadState('ready');
    } catch (error) {
      setOverview({ ...sampleOverview, userId: targetUserId });
      setSelectedEmailId(sampleOverview.spotlightEmails[0]?.id ?? '');
      setLoadState('fallback');
      setErrorMessage(error instanceof Error ? error.message : 'Unknown error');
    }
  }

  async function loadEmailDetail(emailId: string) {
    setDetailLoadState('loading');
    setDetailErrorMessage(null);

    try {
      const response = await fetch(`/api/emails/${emailId}`);

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }

      const data = (await response.json()) as EmailDetail;
      setEmailDetail(data);
      setDetailLoadState('ready');
    } catch (error) {
      setEmailDetail(sampleDetails[emailId] ?? createDetailFromListItem(sortedEmails.find((email) => email.id === emailId)));
      setDetailLoadState('fallback');
      setDetailErrorMessage(error instanceof Error ? error.message : 'Unknown error');
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextUserId = draftUserId.trim();

    if (nextUserId) {
      setUserId(nextUserId);
    }
  }

  return (
    <main className="shell">
      <section className="dashboard" aria-label="메일 우선 처리 대시보드">
        <div className="topbar">
          <div className="brand">
            <div className="brand-mark" aria-hidden="true">
              F
            </div>
            <div>
              <p className="eyebrow">FNY Mail</p>
              <h1>지금 먼저 볼 메일</h1>
            </div>
          </div>

          <form className="user-form" onSubmit={handleSubmit}>
            <label htmlFor="user-id">사용자 ID</label>
            <div className="user-form-row">
              <input
                id="user-id"
                value={draftUserId}
                onChange={(event) => setDraftUserId(event.target.value)}
                placeholder="USR_260409_A00001"
              />
              <button type="submit">조회</button>
            </div>
          </form>
        </div>

        <div className="status-line" role="status">
          {loadState === 'loading' && '메일함을 불러오는 중입니다.'}
          {loadState === 'ready' && '서버 데이터로 정렬했습니다.'}
          {loadState === 'fallback' && `서버 연결 전이라 샘플 데이터로 보고 있습니다. ${errorMessage ?? ''}`}
          {loadState === 'error' && '메일함을 불러오지 못했습니다.'}
        </div>

        <section className="metrics" aria-label="메일함 요약">
          <Metric label="전체 메일" value={overview.totalEmails} />
          <Metric label="읽지 않음" value={overview.unreadEmails} tone="blue" />
          <Metric label="회신 필요" value={overview.needsReplyEmails} tone="red" />
          <Metric label="중요 메일" value={overview.highPriorityEmails} tone="green" />
        </section>

        <section className="focus-layout">
          <div className="priority-panel">
            <div className="section-heading">
              <p className="eyebrow">Priority Queue</p>
              <h2>처리 우선순위</h2>
            </div>

            <div className="email-list">
              {sortedEmails.map((email, index) => (
                <EmailRow
                  key={email.id}
                  email={email}
                  rank={index + 1}
                  selected={email.id === selectedEmailId}
                  onSelect={() => setSelectedEmailId(email.id)}
                />
              ))}
            </div>
          </div>

          <EmailDetailPanel detail={emailDetail} loadState={detailLoadState} errorMessage={detailErrorMessage} />
        </section>
      </section>
    </main>
  );
}

function Metric({ label, value, tone = 'default' }: { label: string; value: number; tone?: 'default' | 'blue' | 'red' | 'green' }) {
  return (
    <div className={`metric metric-${tone}`}>
      <span>{label}</span>
      <strong>{value.toLocaleString('ko-KR')}</strong>
    </div>
  );
}

function EmailRow({
  email,
  rank,
  selected,
  onSelect
}: {
  email: EmailListItem;
  rank: number;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button className={`email-row ${selected ? 'email-row-selected' : ''}`} type="button" onClick={onSelect}>
      <div className="rank">{rank}</div>
      <div className="email-content">
        <div className="email-head">
          <div>
            <p className="sender">{email.fromName ?? email.fromEmail}</p>
            <h3>{email.subject}</h3>
          </div>
          <PriorityBadge priority={email.priorityLevel} />
        </div>

        <p className="summary">{email.shortSummary || email.snippet || '요약 대기 중입니다.'}</p>

        <div className="email-meta">
          <span>{formatDate(email.receivedAt)}</span>
          {email.category && <span>{email.category}</span>}
          {email.hasAttachment && <span>첨부 있음</span>}
        </div>

        <div className="reason-list" aria-label="우선 노출 이유">
          {email.attentionReasons.map((reason) => (
            <span key={reason}>{reasonLabel[reason] ?? reason}</span>
          ))}
        </div>
      </div>
    </button>
  );
}

function EmailDetailPanel({
  detail,
  loadState,
  errorMessage
}: {
  detail: EmailDetail | null;
  loadState: DetailLoadState;
  errorMessage: string | null;
}) {
  if (!detail) {
    return (
      <aside className="detail-panel">
        <div className="section-heading">
          <p className="eyebrow">Mail Detail</p>
          <h2>메일을 선택하세요</h2>
        </div>
      </aside>
    );
  }

  const analysis = detail.analysis;

  return (
    <aside className="detail-panel" aria-label="메일 상세">
      <div className="detail-status">
        {loadState === 'loading' && '상세를 불러오는 중입니다.'}
        {loadState === 'ready' && '서버 상세 데이터입니다.'}
        {loadState === 'fallback' && `샘플 상세로 보고 있습니다. ${errorMessage ?? ''}`}
      </div>

      <div className="section-heading">
        <p className="eyebrow">Mail Detail</p>
        <h2>{detail.subject}</h2>
      </div>

      <div className="detail-sender">
        <span>{detail.fromName ?? detail.fromEmail}</span>
        <strong>{detail.fromEmail}</strong>
      </div>

      <div className="score-grid">
        <Score label="중요도" value={analysis?.importanceScore} />
        <Score label="긴급도" value={analysis?.urgencyScore} />
        <Score label="신뢰도" value={analysis?.confidenceScore} />
      </div>

      <section className="detail-block">
        <p className="eyebrow">Summary</p>
        <p>{analysis?.detailedSummary || analysis?.shortSummary || detail.snippet || '분석 요약을 기다리고 있습니다.'}</p>
      </section>

      {analysis?.suggestedAction && (
        <section className="detail-block action-callout">
          <p className="eyebrow">Suggested Action</p>
          <strong>{analysis.suggestedAction}</strong>
        </section>
      )}

      <section className="detail-block">
        <p className="eyebrow">Action Items</p>
        <div className="action-list">
          {detail.actionItems.length > 0 ? (
            detail.actionItems.map((item) => (
              <div className="action-item" key={item.id}>
                <span>{item.actionType ?? 'ACTION'}</span>
                <p>{item.actionText}</p>
              </div>
            ))
          ) : (
            <p>추출된 액션이 없습니다.</p>
          )}
        </div>
      </section>

      <section className="detail-block">
        <p className="eyebrow">Reasoning</p>
        <p>{analysis?.reasoning || '판단 사유가 아직 없습니다.'}</p>
      </section>

      <section className="detail-block original-mail">
        <p className="eyebrow">Original Mail</p>
        <p>{detail.bodyText || detail.snippet || '본문이 없습니다.'}</p>
      </section>
    </aside>
  );
}

function Score({ label, value }: { label: string; value: number | null | undefined }) {
  return (
    <div className="score">
      <span>{label}</span>
      <strong>{value == null ? '-' : Math.round(value)}</strong>
    </div>
  );
}

function PriorityBadge({ priority }: { priority: string | null }) {
  const normalized = priority ?? '대기';
  return <span className={`priority priority-${normalized.toLowerCase()}`}>{normalized}</span>;
}

function normalizeOverview(data: MailboxOverview): MailboxOverview {
  return {
    ...data,
    spotlightEmails: data.spotlightEmails.map((email) => ({
      ...email,
      attentionReasons: email.attentionReasons ?? []
    }))
  };
}

function createDetailFromListItem(email: EmailListItem | undefined): EmailDetail | null {
  if (!email) {
    return null;
  }

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
    analysis: {
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
      suggestedAction: email.needsReply ? '내용 확인 후 회신' : '내용 확인',
      reasoning: '목록 응답을 기준으로 만든 임시 상세입니다.',
      status: 'READY',
      analyzedAt: new Date().toISOString()
    },
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
      : []
  };
}

function scoreEmail(email: EmailListItem) {
  const priorityScore = email.priorityLevel === 'P1' ? 500 : email.priorityLevel === 'P2' ? 350 : email.priorityLevel === 'P3' ? 150 : 0;
  const replyScore = email.needsReply ? 120 : 0;
  const unreadScore = email.read ? 0 : 80;
  const starredScore = email.starred ? 60 : 0;
  const urgencyScore = email.urgencyScore ?? 0;
  const importanceScore = email.importanceScore ?? 0;

  return priorityScore + replyScore + unreadScore + starredScore + urgencyScore + importanceScore;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('ko-KR', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(value));
}

export default App;
