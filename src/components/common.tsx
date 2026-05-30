export function FilterTab({
  id,
  selected,
  onSelect,
  label
}: {
  id: string;
  selected: boolean;
  onSelect: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="tab"
      id={id}
      aria-selected={selected}
      className={`filter-tab${selected ? ' filter-tab-active' : ''}`}
      onClick={onSelect}
    >
      {label}
    </button>
  );
}

export function FilterChip({
  selected,
  onSelect,
  label
}: {
  selected: boolean;
  onSelect: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      className={`filter-chip${selected ? ' filter-chip-active' : ''}`}
      aria-pressed={selected}
      onClick={onSelect}
    >
      {label}
    </button>
  );
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction
}: {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="empty-state" role="status">
      <div className="empty-state-mark" aria-hidden="true">
        <span />
      </div>
      <strong>{title}</strong>
      <p>{description}</p>
      {actionLabel && onAction ? (
        <button type="button" onClick={onAction}>
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}

export function Metric({
  label,
  value,
  tone = 'default',
  selected = false,
  onClick
}: {
  label: string;
  value: number;
  tone?: 'default' | 'blue' | 'red' | 'green';
  selected?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      className={`metric metric-${tone}${selected ? ' metric-selected' : ''}`}
      onClick={onClick}
      aria-pressed={selected}
    >
      <span>{label}</span>
      <strong>{value.toLocaleString('ko-KR')}</strong>
    </button>
  );
}

export function PaginationBar({
  page,
  totalPages,
  totalItems,
  pageSize,
  onPageChange
}: {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}) {
  return (
    <div className="pagination-bar" aria-label="전체 메일 페이지">
      <span>
        {totalItems === 0
          ? '0건'
          : `${(page - 1) * pageSize + 1}-${Math.min(page * pageSize, totalItems)} / ${totalItems}건`}
      </span>
      <div>
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page <= 1}
        >
          이전
        </button>
        <strong>
          {page} / {totalPages}
        </strong>
        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page >= totalPages}
        >
          다음
        </button>
      </div>
    </div>
  );
}
