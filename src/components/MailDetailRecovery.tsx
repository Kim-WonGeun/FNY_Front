type MailDetailRecoveryProps = {
  errorMessage: string | null;
  onBack: () => void;
  onRetry: () => void;
};

export function MailDetailRecovery({
  errorMessage,
  onBack,
  onRetry
}: MailDetailRecoveryProps) {
  return (
    <section className="mail-detail-recovery" role="status">
      <div className="empty-state-mark" aria-hidden="true">
        <span />
      </div>
      <strong>메일을 찾을 수 없습니다</strong>
      <p>{errorMessage ?? '메일 목록이 아직 준비되지 않았거나 삭제된 메일일 수 있습니다.'}</p>
      <div className="mail-detail-recovery-actions">
        <button type="button" className="mail-detail-back" onClick={onRetry}>
          다시 불러오기
        </button>
        <button type="button" className="mail-detail-nav-btn" onClick={onBack}>
          메일함으로 이동
        </button>
      </div>
    </section>
  );
}
