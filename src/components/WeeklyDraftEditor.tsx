import type { ReportType, WeeklyDraftViewMode, WeeklyWorkspaceSaveMode, WeeklyWorkspaceStatus } from '../types';
import { formatDate } from '../utils/date';
import { reportTypeLabel } from '../utils/reports';
import { weeklyDraftStatus } from '../utils/weeklyDraftStatus';

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
          <p>{status.label}{status.savedAt ? ` · ${formatDate(status.savedAt)}` : ''}</p>
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
        <div className="weekly-draft-meta-row">
          {weeklyWorkspaceStatus ? (
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
          ) : null}
        </div>
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
