import type { AuthSession, NavView } from '../types';

const navTitle: Record<NavView, string> = {
  home: '홈',
  weekly: '보고서 생성',
  allMail: '메일함',
  mailDetail: '메일 상세',
  accounts: '메일 계정',
  activity: '작업 기록',
  settings: '설정'
};

export function AppHeader({
  navView,
  authSession,
  onLogout
}: {
  navView: NavView;
  authSession: AuthSession;
  onLogout: () => void;
}) {
  return (
    <header className="app-main-header">
      <div className="app-main-header-text">
        <h2>{navTitle[navView]}</h2>
      </div>
      <div className="header-actions">
        <div className="header-user">
          <div className="header-user-avatar" aria-hidden="true">
            {(authSession.displayName || authSession.accountEmail).slice(0, 2).toUpperCase()}
          </div>
          <div className="header-user-info">
            <strong>{authSession.displayName || 'Gmail 사용자'}</strong>
            <span title={authSession.accountEmail}>{authSession.accountEmail}</span>
          </div>
          <button type="button" className="header-logout" onClick={onLogout}>
            로그아웃
          </button>
        </div>
      </div>
    </header>
  );
}
