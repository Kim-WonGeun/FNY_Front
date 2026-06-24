import type { WeeklyWorkspaceStatus } from '../types';

type WeeklySaveState = 'idle' | 'draft-saved' | 'saved' | 'error';
type WeeklyCopyState = 'idle' | 'done' | 'error';

export function weeklyDraftStatus(
  dirty: boolean,
  workspaceStatus: WeeklyWorkspaceStatus | null,
  saveState: WeeklySaveState,
  copyState: WeeklyCopyState
) {
  if (saveState === 'error' || copyState === 'error') {
    return {
      label: '확인 필요',
      description: '저장 또는 복사에 실패했습니다. 다시 시도해 주세요.',
      tone: 'error' as const,
      savedAt: null
    };
  }

  if (copyState === 'done') {
    return {
      label: '복사 완료',
      description: '보고서 초안을 클립보드에 복사했습니다.',
      tone: 'success' as const,
      savedAt: null
    };
  }

  if (saveState === 'draft-saved') {
    return {
      label: '임시 저장됨',
      description: '임시 저장본을 기준으로 계속 수정할 수 있습니다.',
      tone: 'success' as const,
      savedAt: workspaceStatus?.savedAt ?? null
    };
  }

  if (saveState === 'saved') {
    return {
      label: '저장됨',
      description: '저장된 초안을 다시 열어 이어서 수정할 수 있습니다.',
      tone: 'success' as const,
      savedAt: workspaceStatus?.savedAt ?? null
    };
  }

  if (dirty) {
    return {
      label: '수정 중',
      description: '수정한 내용은 아직 저장되지 않았습니다.',
      tone: 'warning' as const,
      savedAt: null
    };
  }

  if (workspaceStatus) {
    return {
      label: workspaceStatus.mode === 'draft' ? '임시 저장본' : '저장본',
      description: '저장된 초안을 기준으로 보고서를 확인하고 있습니다.',
      tone: 'neutral' as const,
      savedAt: workspaceStatus.savedAt
    };
  }

  return {
    label: '생성 원본',
    description: '생성된 초안을 바로 편집할 수 있습니다.',
    tone: 'neutral' as const,
    savedAt: null
  };
}
