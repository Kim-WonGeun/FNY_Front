import {
  buildMailboxActiveFilters,
  type MailboxActiveFilterOptions
} from '../utils/mailboxActiveFilters';

type MailboxActiveFiltersProps = MailboxActiveFilterOptions & {
  onResetFilters: () => void;
};

export function MailboxActiveFilters(props: MailboxActiveFiltersProps) {
  const filters = buildMailboxActiveFilters(props);
  if (filters.length === 0) {
    return null;
  }

  return (
    <section className="mailbox-active-filters" aria-label="적용된 필터">
      <div className="mailbox-active-filters-head">
        <span>적용된 조건</span>
        <button type="button" onClick={props.onResetFilters}>
          모두 해제
        </button>
      </div>
      <div className="mailbox-active-filter-list">
        {filters.map((filter) => (
          <button type="button" key={filter.key} onClick={filter.onRemove} title={`${filter.label} 조건 해제`}>
            <span>{filter.label}</span>
            <strong>{filter.value}</strong>
            <em aria-hidden="true">×</em>
          </button>
        ))}
      </div>
    </section>
  );
}
