export function MailboxAdvancedSearch({
  senderQuery,
  startDate,
  endDate,
  searchBody,
  onSenderQueryChange,
  onStartDateChange,
  onEndDateChange,
  onSearchBodyChange,
  onReset
}: {
  senderQuery: string;
  startDate: string;
  endDate: string;
  searchBody: boolean;
  onSenderQueryChange: (value: string) => void;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  onSearchBodyChange: (value: boolean) => void;
  onReset: () => void;
}) {
  return (
    <div className="advanced-mail-search" aria-label="상세 검색">
      <label>
        발신자
        <input
          value={senderQuery}
          onChange={(event) => onSenderQueryChange(event.target.value)}
          placeholder="이름 또는 이메일"
        />
      </label>
      <label>
        시작일
        <input
          type="date"
          value={startDate}
          onChange={(event) => onStartDateChange(event.target.value)}
        />
      </label>
      <label>
        종료일
        <input
          type="date"
          value={endDate}
          onChange={(event) => onEndDateChange(event.target.value)}
        />
      </label>
      <button type="button" onClick={onReset}>
        검색 초기화
      </button>
      <label className="advanced-mail-search-check">
        <input
          type="checkbox"
          checked={searchBody}
          onChange={(event) => onSearchBodyChange(event.target.checked)}
        />
        메일 원문 포함
      </label>
    </div>
  );
}
