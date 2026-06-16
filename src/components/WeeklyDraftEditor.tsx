import type { ReportType, WeeklyDraftViewMode, WeeklyWorkspaceSaveMode, WeeklyWorkspaceStatus } from '../types';
import { formatDate } from '../utils/date';
import { reportTypeLabel } from '../utils/reports';

type WeeklyDraftEditorProps = {
  reportType: ReportType;
  weeklyDraftDirty: boolean;
  weeklyWorkspaceStatus: WeeklyWorkspaceStatus | null;
  weeklyDraftViewMode: WeeklyDraftViewMode;
  weeklyCopyState: 'idle' | 'done' | 'error';
  weeklySaveState: 'idle' | 'draft-saved' | 'saved' | 'error';
  editableWeeklyDraft: string;
  onSaveWeeklyWorkspace: (mode: WeeklyWorkspaceSaveMode) => void;
  onResetWeeklyWorkspace: () => void;
  onCopyWeeklyReportDraft: () => void;
  onShowOriginalWeeklyDraft: () => void;
  onShowSavedWeeklyDraft: () => void;
  onEditableDraftChange: (draft: string) => void;
};

export function WeeklyDraftEditor({
  reportType,
  weeklyDraftDirty,
  weeklyWorkspaceStatus,
  weeklyDraftViewMode,
  weeklyCopyState,
  weeklySaveState,
  editableWeeklyDraft,
  onSaveWeeklyWorkspace,
  onResetWeeklyWorkspace,
  onCopyWeeklyReportDraft,
  onShowOriginalWeeklyDraft,
  onShowSavedWeeklyDraft,
  onEditableDraftChange
}: WeeklyDraftEditorProps) {
  const reportLabel = reportTypeLabel(reportType);
  const status = weeklyDraftStatus(weeklyDraftDirty, weeklyWorkspaceStatus, weeklySaveState, weeklyCopyState);

  return (
    <section className="weekly-editor-section" aria-label="보고서 초안 편집">
      <div className="weekly-panel-head">
        <div>
          <h5>{reportLabel} 초안</h5>
          <p>{status.description}</p>
        </div>
        <div className="weekly-draft-actions">
          <button type="button" className="btn-weekly" onClick={() => onSaveWeeklyWorkspace('draft')}>
            임시 저장
          </button>
          <button type="button" className="btn-weekly" onClick={() => onSaveWeeklyWorkspace('saved')}>
            저장
          </button>
          {weeklyWorkspaceStatus ? (
            <button type="button" className="btn-weekly" onClick={onResetWeeklyWorkspace}>
              저장본 비우기
            </button>
          ) : null}
          <button type="button" className="btn-weekly" onClick={onCopyWeeklyReportDraft}>
            보고서 복사
          </button>
        </div>
      </div>
      <div className="weekly-draft-card">
        <div className={`weekly-draft-status weekly-draft-status-${status.tone}`}>
          <strong>{status.label}</strong>
          {status.savedAt ? <span>{formatDate(status.savedAt)}</span> : null}
        </div>
        {weeklyWorkspaceStatus ? (
          <div className="weekly-draft-view">
            <div className="weekly-draft-switch">
              <button
                type="button"
                className={weeklyDraftViewMode === 'original' ? 'is-active' : ''}
                onClick={onShowOriginalWeeklyDraft}
              >
                원본 보기
              </button>
              <button
                type="button"
                className={weeklyDraftViewMode === 'workspace' ? 'is-active' : ''}
                onClick={onShowSavedWeeklyDraft}
              >
                저장본 보기
              </button>
            </div>
          </div>
        ) : null}
        {weeklyCopyState === 'done' ? <p className="weekly-copy-status">보고서 초안을 클립보드에 복사했습니다.</p> : null}
        {weeklyCopyState === 'error' ? (
          <p className="weekly-copy-status weekly-copy-status-error">클립보드 복사에 실패했습니다.</p>
        ) : null}
        {weeklySaveState === 'draft-saved' ? (
          <p className="weekly-copy-status">
            {weeklyWorkspaceStatus
              ? `${weeklyWorkspaceStatus.storage === 'server' ? '서버에' : '로컬에만'} 임시 저장했습니다. · ${formatDate(weeklyWorkspaceStatus.savedAt)}`
              : '생성 원본으로 되돌렸습니다.'}
          </p>
        ) : null}
        {weeklySaveState === 'saved' ? (
          <p className="weekly-copy-status">
            {weeklyWorkspaceStatus
              ? `${weeklyWorkspaceStatus.storage === 'server' ? '서버에' : '로컬에만'} 저장했습니다. · ${formatDate(weeklyWorkspaceStatus.savedAt)}`
              : '저장했습니다.'}
          </p>
        ) : null}
        {weeklySaveState === 'error' ? (
          <p className="weekly-copy-status weekly-copy-status-error">
            서버 저장에 실패했습니다. 가능한 경우 로컬에만 임시 보관했습니다.
          </p>
        ) : null}
        {weeklyWorkspaceStatus ? (
          <p className="weekly-workspace-status">
            {weeklyWorkspaceStatus.storage === 'server' ? '서버 저장본' : '로컬 임시 저장본'} ·{' '}
            {weeklyWorkspaceStatus.mode === 'draft' ? '임시 저장' : '저장 완료'} · {formatDate(weeklyWorkspaceStatus.savedAt)}
          </p>
        ) : null}
        <textarea
          className="weekly-draft-textarea"
          value={editableWeeklyDraft}
          onChange={(event) => onEditableDraftChange(event.target.value)}
          aria-label={`${reportLabel} 초안 편집`}
        />
      </div>
    </section>
  );
}

function weeklyDraftStatus(
  dirty: boolean,
  workspaceStatus: WeeklyWorkspaceStatus | null,
  saveState: 'idle' | 'draft-saved' | 'saved' | 'error',
  copyState: 'idle' | 'done' | 'error'
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
