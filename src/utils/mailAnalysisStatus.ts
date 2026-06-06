import type { AgentHealth, AnalysisJob, EmailAnalysis, EmailDetail, LoadState } from '../types';
import { analysisCandidateExplanation } from './mailAnalysisCandidate';

export function getLatestAnalysisJob(detail: EmailDetail) {
  return [...detail.analysisJobs].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )[0] ?? null;
}

export function isAgentReady(agentHealth: AgentHealth | null) {
  return Boolean(agentHealth?.enabled && agentHealth.reachable);
}

export function agentHealthTone(agentHealth: AgentHealth | null, state: LoadState) {
  if (state === 'loading') {
    return 'checking';
  }
  if (!agentHealth) {
    return state === 'error' ? 'error' : 'unknown';
  }
  if (!agentHealth.enabled) {
    return 'disabled';
  }
  return agentHealth.reachable ? 'connected' : 'error';
}

export function agentHealthLabel(agentHealth: AgentHealth | null, state: LoadState) {
  if (state === 'loading') {
    return '확인 중';
  }
  if (!agentHealth) {
    return state === 'error' ? '확인 실패' : '상태 미확인';
  }
  if (!agentHealth.enabled) {
    return '분석 비활성화';
  }
  return agentHealth.reachable ? '연결됨' : '연결 안 됨';
}

export function canRequestAnalysis(detail: EmailDetail | null) {
  if (!detail) {
    return false;
  }
  const latestJob = getLatestAnalysisJob(detail);
  if (!latestJob) {
    return true;
  }
  return !['PENDING', 'RUNNING'].includes(latestJob.status);
}

export function analysisRequestButtonLabel(
  detail: EmailDetail | null,
  agentHealth: AgentHealth | null,
  statusLabel: string,
  submitting: boolean
) {
  if (submitting) {
    return '요청 중';
  }
  if (!isAgentReady(agentHealth)) {
    return agentHealth?.enabled === false ? '분석 비활성화' : 'Agent 준비 필요';
  }
  if (!detail) {
    return '분석 시작';
  }
  const latestJob = getLatestAnalysisJob(detail);
  if (latestJob?.status === 'PENDING' || latestJob?.status === 'RUNNING') {
    return '분석 중';
  }
  if (latestJob?.status === 'FAILED') {
    return '재시도';
  }
  if (detail.analysis) {
    return '다시 분석';
  }
  if (!detail.analysisEligible && detail.analysisCandidateEvaluatedAt) {
    return '수동 분석';
  }
  return statusLabel === 'Agent 대기' ? '다시 요청' : '분석 시작';
}

export function resolveAnalysisStatus(
  detail: EmailDetail | null,
  loading: boolean,
  submitting: boolean
): {
  label: string;
  tone: 'complete' | 'pending' | 'failed' | 'empty';
  description: string;
} {
  if (loading || submitting) {
    return {
      label: '분석 요청 중',
      tone: 'pending',
      description: '메일 내용을 분석 작업으로 전달하고 있습니다.'
    };
  }

  if (!detail) {
    return {
      label: '대기',
      tone: 'empty',
      description: '메일을 선택하면 분석 상태를 확인할 수 있습니다.'
    };
  }

  const latestJob = getLatestAnalysisJob(detail);
  if (latestJob && latestJob.status !== 'COMPLETED') {
    const failed = latestJob.status === 'FAILED';
    const waitingAgent = latestJob.status === 'WAITING_AGENT';
    const running = latestJob.status === 'RUNNING';
    return {
      label: failed ? '분석 실패' : waitingAgent ? 'Agent 대기' : running ? '분석 중' : '분석 대기',
      tone: failed ? 'failed' : 'pending',
      description: failed
        ? latestJob.errorMessage || '분석 작업이 실패했습니다. 다시 분석을 요청할 수 있습니다.'
        : waitingAgent
          ? latestJob.errorMessage || 'Agent 서버가 준비되면 분석할 수 있습니다.'
          : running
            ? 'Agent가 메일 내용을 분석하고 있습니다.'
            : '분석 작업이 등록되어 결과를 기다리고 있습니다.'
    };
  }

  if (detail.analysis) {
    return {
      label: '분석 완료',
      tone: 'complete',
      description: detail.analysis.modelName
        ? `${detail.analysis.modelName} 기준 ${detail.analysis.analysisVersion}차 분석 결과입니다. 필요하면 다시 분석할 수 있습니다.`
        : `${detail.analysis.analysisVersion}차 분석 결과입니다. 필요하면 다시 분석할 수 있습니다.`
    };
  }

  if (!detail.analysisEligible && detail.analysisCandidateEvaluatedAt) {
    return {
      label: '자동 제외',
      tone: 'empty',
      description: analysisCandidateExplanation(detail)
    };
  }

  return {
    label: '분석 없음',
    tone: 'empty',
    description: '아직 이 메일의 요약, 점수, 액션이 생성되지 않았습니다.'
  };
}

export function compactAnalysisStatusDescription(
  status: ReturnType<typeof resolveAnalysisStatus>,
  latestJob: AnalysisJob | null,
  analysis: EmailAnalysis | null | undefined
) {
  if (status.tone === 'failed') {
    return '실패했습니다. 다시 요청할 수 있습니다.';
  }
  if (latestJob?.status === 'RUNNING') {
    return '분석 중입니다.';
  }
  if (latestJob && latestJob.status !== 'COMPLETED') {
    return '결과를 기다리고 있습니다.';
  }
  if (analysis) {
    return `${analysis.analysisVersion}차 분석 완료`;
  }
  return status.description;
}

export function analysisJobStatusLabel(status: string) {
  if (status === 'COMPLETED') {
    return '완료';
  }
  if (status === 'PENDING') {
    return '대기';
  }
  if (status === 'FAILED') {
    return '실패';
  }
  if (status === 'RUNNING') {
    return '진행 중';
  }
  if (status === 'WAITING_AGENT') {
    return 'Agent 대기';
  }
  return status;
}
