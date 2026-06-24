import type { MailDensity } from '../types';
import { AnalysisPreferenceSettings } from './AnalysisPreferenceSettings';

export function SettingsPage({
  theme,
  mailDensity,
  originalMailDefaultOpen,
  onThemeChange,
  onMailDensityChange,
  onOriginalMailDefaultOpenChange,
  onLogout
}: {
  theme: 'light' | 'dark';
  mailDensity: MailDensity;
  originalMailDefaultOpen: boolean;
  onThemeChange: (theme: 'light' | 'dark') => void;
  onMailDensityChange: (density: MailDensity) => void;
  onOriginalMailDefaultOpenChange: (open: boolean) => void;
  onLogout: () => void;
}) {
  return (
    <div className="settings-page" aria-label="설정">
      <section className="settings-card">
        <div className="settings-card-head">
          <div>
            <p className="eyebrow">화면</p>
            <h3>테마 설정</h3>
            <p>작업 환경에 맞게 화면 밝기를 바꿀 수 있습니다.</p>
          </div>
          <button
            type="button"
            className="theme-toggle settings-theme-toggle"
            onClick={() => onThemeChange(theme === 'dark' ? 'light' : 'dark')}
            role="switch"
            aria-pressed={theme === 'dark'}
            aria-checked={theme === 'dark'}
            aria-label={theme === 'dark' ? '라이트 모드로 전환' : '다크 모드로 전환'}
          >
            <span className="theme-toggle-track" aria-hidden="true">
              <span className="theme-toggle-thumb" />
            </span>
          </button>
        </div>
        <div className="settings-row">
          <span>현재 모드</span>
          <strong>{theme === 'dark' ? '다크 모드' : '라이트 모드'}</strong>
        </div>
      </section>

      <AnalysisPreferenceSettings />

      <section className="settings-card">
        <div className="settings-card-head">
          <div>
            <p className="eyebrow">메일함</p>
            <h3>목록 표시</h3>
            <p>메일함과 홈의 메일 목록을 보는 방식을 조정합니다.</p>
          </div>
        </div>
        <div className="settings-row settings-row-stack">
          <div>
            <span>목록 간격</span>
            <p>한 화면에 더 많은 메일을 보고 싶을 때 촘촘하게 바꿀 수 있습니다.</p>
          </div>
          <div className="settings-segmented" role="group" aria-label="메일 목록 표시 밀도">
            <button
              type="button"
              className={mailDensity === 'comfortable' ? 'is-active' : ''}
              onClick={() => onMailDensityChange('comfortable')}
            >
              기본
            </button>
            <button
              type="button"
              className={mailDensity === 'compact' ? 'is-active' : ''}
              onClick={() => onMailDensityChange('compact')}
            >
              촘촘하게
            </button>
          </div>
        </div>
        <div className="settings-row settings-row-stack">
          <div>
            <span>메일 원문</span>
            <p>메일을 펼쳤을 때 원문을 바로 보여줄지 선택합니다.</p>
          </div>
          <button
            type="button"
            className="theme-toggle settings-theme-toggle"
            onClick={() => onOriginalMailDefaultOpenChange(!originalMailDefaultOpen)}
            role="switch"
            aria-pressed={originalMailDefaultOpen}
            aria-checked={originalMailDefaultOpen}
            aria-label={originalMailDefaultOpen ? '메일 원문 기본 표시 끄기' : '메일 원문 기본 표시 켜기'}
          >
            <span className="theme-toggle-track" aria-hidden="true">
              <span className="theme-toggle-thumb" />
            </span>
          </button>
        </div>
      </section>

      <section className="settings-card">
        <div className="settings-card-head">
          <div>
            <p className="eyebrow">보안</p>
            <h3>메일 데이터 접근</h3>
            <p>메일 원문과 분석 결과는 로그인한 계정 기준으로만 요청합니다.</p>
          </div>
        </div>
        <div className="settings-row settings-row-stack">
          <div>
            <span>세션 기준 접근</span>
            <p>운영 환경에서는 OAuth 로그인 세션으로 API 접근 권한을 확인합니다.</p>
          </div>
          <strong>활성</strong>
        </div>
        <div className="settings-row settings-row-stack">
          <div>
            <span>로컬 개발 모드</span>
            <p>개발용 사용자 헤더는 로컬 실행 옵션에서만 사용합니다.</p>
          </div>
          <strong>개발 전용</strong>
        </div>
      </section>

      <section className="settings-card settings-danger-card">
        <div className="settings-card-head">
          <div>
            <p className="eyebrow">계정</p>
            <h3>로그인 세션</h3>
            <p>현재 브라우저의 로그인 세션을 종료합니다.</p>
          </div>
          <button type="button" className="settings-action-btn settings-action-danger" onClick={onLogout}>
            로그아웃
          </button>
        </div>
      </section>
    </div>
  );
}
