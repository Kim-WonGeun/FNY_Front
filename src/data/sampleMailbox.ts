import { DEFAULT_USER_ID } from '../constants';
import type { EmailDetail, MailboxOverview } from '../types';

export const sampleOverview: MailboxOverview = {
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
      analysisEligible: true,
      analysisCandidateScore: 95,
      analysisCandidateReasons: 'UNREAD,STARRED,IMPORTANT_HEADER,ACTION_KEYWORD',
      analysisSkippedReason: null,
      analysisCandidateEvaluatedAt: new Date().toISOString(),
      attentionResolved: false,
      attentionResolvedAt: null,
      attentionStatus: 'NEEDS_ATTENTION',
      attentionStatusUpdatedAt: null,
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
      analysisEligible: true,
      analysisCandidateScore: 75,
      analysisCandidateReasons: 'UNREAD,HAS_ATTACHMENT,ACTION_KEYWORD',
      analysisSkippedReason: null,
      analysisCandidateEvaluatedAt: new Date().toISOString(),
      attentionResolved: false,
      attentionResolvedAt: null,
      attentionStatus: 'NEEDS_ATTENTION',
      attentionStatusUpdatedAt: null,
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
      analysisEligible: true,
      analysisCandidateScore: 40,
      analysisCandidateReasons: 'MEETING_KEYWORD,DIRECT_TO_ME',
      analysisSkippedReason: null,
      analysisCandidateEvaluatedAt: new Date().toISOString(),
      attentionResolved: false,
      attentionResolvedAt: null,
      attentionStatus: 'NEEDS_ATTENTION',
      attentionStatusUpdatedAt: null,
      attentionReasons: ['HIGH_PRIORITY']
    }
  ]
};

export const sampleDetails: Record<string, EmailDetail> = {
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
    analysisEligible: true,
    analysisCandidateScore: 95,
    analysisCandidateReasons: 'UNREAD,STARRED,IMPORTANT_HEADER,ACTION_KEYWORD',
    analysisSkippedReason: null,
    analysisCandidateEvaluatedAt: new Date().toISOString(),
    attentionResolved: false,
    attentionResolvedAt: null,
    attentionStatus: 'NEEDS_ATTENTION',
    attentionStatusUpdatedAt: null,
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
      deadlineText: '금일 중',
      timeSensitivity: 'TODAY',
      requiresAction: true,
      userTaskSummary: '메일 내용을 확인하고 오늘 안에 회신해야 합니다.',
      priorityReasonCodes: ['NEEDS_REPLY', 'HAS_DEADLINE', 'URGENT_KEYWORD'],
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
    ],
    analysisJobs: [
      {
        id: 'JOB_260409_A00001',
        jobType: 'EMAIL_ANALYSIS',
        status: 'COMPLETED',
        priority: 1,
        retryCount: 0,
        maxRetries: 3,
        workerId: 'sample-agent',
        errorMessage: null,
        startedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        createdAt: new Date().toISOString()
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
      actionType: 'REVIEW',
      priorityLevel: 'P2',
      dueAt: null,
      completed: false
    }
  ]
};
