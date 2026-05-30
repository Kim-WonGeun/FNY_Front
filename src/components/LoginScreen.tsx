import { IconGoogle } from './icons';

export function LoginScreen({
  loading,
  errorMessage,
  onGmailLogin
}: {
  loading: boolean;
  errorMessage: string | null;
  onGmailLogin: () => void;
}) {
  return (
    <main className="login-page" aria-label="로그인">
      <section className="login-visual" aria-hidden="true">
        <div className="login-mail-stack">
          <div className="login-mail-card login-mail-card-top">
            <span>긴급 승인 요청</span>
            <strong>오늘 중 승인 여부 확인 부탁드립니다.</strong>
          </div>
          <div className="login-mail-card login-mail-card-middle">
            <span>보고서 생성</span>
            <strong>금주실적과 차주계획 초안 준비</strong>
          </div>
          <div className="login-mail-card login-mail-card-bottom">
            <span>고객 미팅</span>
            <strong>후속 액션 3건 확인 필요</strong>
          </div>
        </div>
      </section>

      <section className="login-panel">
        <div className="login-brand">
          <div className="login-logo">F</div>
          <div>
            <h1>FNY Mail</h1>
            <p>메일 계정을 연결해 분석을 시작합니다.</p>
          </div>
        </div>

        <div className="login-copy">
          <p className="eyebrow">메일 연동</p>
          <h2>처리할 메일부터 보고서 초안까지</h2>
          <p>
            연결된 메일함을 바탕으로 우선 확인할 메일과 보고서 생성에 필요한 내용을 정리합니다.
          </p>
        </div>

        <button
          type="button"
          className="gmail-login-button"
          onClick={onGmailLogin}
          disabled={loading}
        >
          <IconGoogle size={20} />
          {loading ? '메일 계정 연결 중' : '메일 계정으로 시작하기'}
        </button>

        {errorMessage ? (
          <p className="login-error">메일 계정 연결을 시작하지 못했습니다. {errorMessage}</p>
        ) : (
          <p className="login-note">계정 권한 승인 후 메일함으로 이동합니다.</p>
        )}
      </section>
    </main>
  );
}
