export function MailboxToolbar({
  advancedSearchOpen,
  onAdvancedSearchOpenChange
}: {
  advancedSearchOpen: boolean;
  onAdvancedSearchOpenChange: (open: boolean) => void;
}) {
  return (
    <div className="list-toolbar">
      <span className="list-toolbar-note">최신 메일 순서</span>
      <button
        type="button"
        className="toolbar-filter-toggle"
        onClick={() => onAdvancedSearchOpenChange(!advancedSearchOpen)}
        aria-expanded={advancedSearchOpen}
      >
        {advancedSearchOpen ? '상세 검색 닫기' : '상세 검색'}
      </button>
    </div>
  );
}
