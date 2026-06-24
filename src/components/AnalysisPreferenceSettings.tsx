import { useAnalysisPreference } from '../hooks/useAnalysisPreference';

export function AnalysisPreferenceSettings() {
  const { preference, state, updatePreference, savePreference } = useAnalysisPreference();

  const statusMessage = state === 'saved'
    ? '분석 기준을 저장했습니다.'
    : state === 'error'
      ? '분석 기준을 불러오거나 저장하지 못했습니다.'
      : '쉼표로 여러 항목을 구분할 수 있습니다.';

  return (
    <section className="settings-card">
      <div className="settings-card-head">
        <div>
          <p className="eyebrow">분석</p>
          <h3>분석 대상</h3>
          <p>최근 메일 중 실제 확인이 필요한 메일만 분석하도록 기준을 조정합니다.</p>
        </div>
        <button
          type="button"
          className="settings-action-btn"
          onClick={savePreference}
          disabled={state === 'loading' || state === 'saving'}
        >
          {state === 'saving' ? '저장 중' : '저장'}
        </button>
      </div>
      <div className="settings-row settings-row-stack">
        <div>
          <span>분석 기간</span>
          <p>수신일을 기준으로 이 기간 안의 메일만 자동 분석 후보에 포함합니다.</p>
        </div>
        <label className="settings-field settings-number-field">
          <input
            type="number"
            min="1"
            max="365"
            value={preference.analysisWindowDays}
            onChange={(event) => updatePreference('analysisWindowDays', Number(event.target.value))}
          />
          <span>일</span>
        </label>
      </div>
      <div className="settings-row settings-row-stack">
        <div>
          <span>자동 알림 제외</span>
          <p>뉴스레터, 프로모션, 자동 발송 메일을 기본 분석에서 제외합니다.</p>
        </div>
        <button
          type="button"
          className="theme-toggle settings-theme-toggle"
          onClick={() => updatePreference('excludeAutomated', !preference.excludeAutomated)}
          role="switch"
          aria-checked={preference.excludeAutomated}
        >
          <span className="theme-toggle-track" aria-hidden="true">
            <span className="theme-toggle-thumb" />
          </span>
        </button>
      </div>
      <div className="settings-form-grid">
        <label className="settings-field">
          <span>제외 발신자</span>
          <input
            value={preference.excludedSenders}
            onChange={(event) => updatePreference('excludedSenders', event.target.value)}
            placeholder="no-reply@example.com, newsletter"
          />
        </label>
        <label className="settings-field">
          <span>제외 키워드</span>
          <input
            value={preference.excludedKeywords}
            onChange={(event) => updatePreference('excludedKeywords', event.target.value)}
            placeholder="광고, 할인, 채용 알림"
          />
        </label>
      </div>
      <p className={`settings-save-status ${state === 'error' ? 'is-error' : ''}`}>
        {statusMessage}
      </p>
    </section>
  );
}
