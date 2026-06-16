import type {
  ReportType,
  WeeklyDraftViewMode,
  WeeklyReport,
  WeeklyWorkspaceSaveMode,
  WeeklyWorkspaceStatus
} from '../types';
import { WeeklyDraftEditor } from './WeeklyDraftEditor';
import { WeeklyReportSummaryPanel } from './WeeklyReportSummaryPanel';
import { WeeklySourceSelector } from './WeeklySourceSelector';
import { ReportQualityPanel } from './reports';

export type WeeklyReportDraftProps = {
  workspaceStatus: WeeklyWorkspaceStatus | null;
  viewMode: WeeklyDraftViewMode;
  copyState: 'idle' | 'done' | 'error';
  saveState: 'idle' | 'draft-saved' | 'saved' | 'error';
  text: string;
  onSaveWorkspace: (mode: WeeklyWorkspaceSaveMode) => void;
  onResetWorkspace: () => void;
  onCopyReport: () => void;
  onShowOriginal: () => void;
  onShowSaved: () => void;
  onChange: (draft: string) => void;
};

export type WeeklyReportSourcesProps = {
  open: boolean;
  onToggleOpen: () => void;
  onIncludeAll: () => void;
  onApplySelectedToDraft: () => void;
  onOpenSourceEmail: (emailId: string) => void;
  onToggleSource: (emailId: string) => void;
};

type WeeklyReportViewProps = {
  report: WeeklyReport;
  reportType: ReportType;
  includedThreads: WeeklyReport['threadSummaries'];
  excludedSourceIds: string[];
  draftDirty: boolean;
  draft: WeeklyReportDraftProps;
  sources: WeeklyReportSourcesProps;
};

export function WeeklyReportView({
  report,
  reportType,
  includedThreads,
  excludedSourceIds,
  draftDirty,
  draft,
  sources
}: WeeklyReportViewProps) {
  return (
    <>
      <WeeklyReportSummaryPanel report={report} reportType={reportType} includedCount={includedThreads.length} />

      <ReportQualityPanel
        report={report}
        includedCount={includedThreads.length}
        excludedCount={excludedSourceIds.length}
        draftDirty={draftDirty}
      />

      <WeeklyDraftEditor
        reportType={reportType}
        weeklyDraftDirty={draftDirty}
        weeklyWorkspaceStatus={draft.workspaceStatus}
        weeklyDraftViewMode={draft.viewMode}
        weeklyCopyState={draft.copyState}
        weeklySaveState={draft.saveState}
        editableWeeklyDraft={draft.text}
        onSaveWeeklyWorkspace={draft.onSaveWorkspace}
        onResetWeeklyWorkspace={draft.onResetWorkspace}
        onCopyWeeklyReportDraft={draft.onCopyReport}
        onShowOriginalWeeklyDraft={draft.onShowOriginal}
        onShowSavedWeeklyDraft={draft.onShowSaved}
        onEditableDraftChange={draft.onChange}
      />

      <WeeklySourceSelector
        weeklyReport={report}
        includedCount={includedThreads.length}
        excludedWeeklySourceIds={excludedSourceIds}
        weeklySourcesOpen={sources.open}
        onToggleSourcesOpen={sources.onToggleOpen}
        onIncludeAllWeeklySources={sources.onIncludeAll}
        onApplySelectedSourcesToDraft={sources.onApplySelectedToDraft}
        onOpenReportSourceEmail={sources.onOpenSourceEmail}
        onToggleWeeklySource={sources.onToggleSource}
      />
      <p className="weekly-meta">
        {report.emailCount}건 기준 · 소스 {report.source} · {report.modelName} ({report.promptVersion}) · 생성 {report.createdAt}
      </p>
    </>
  );
}
