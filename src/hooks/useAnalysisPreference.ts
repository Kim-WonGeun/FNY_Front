import { useEffect, useState } from 'react';
import { fetchAnalysisPreference, saveAnalysisPreference } from '../api/preferences';
import type { AnalysisPreference } from '../types';

const DEFAULT_ANALYSIS_PREFERENCE: AnalysisPreference = {
  analysisWindowDays: 30,
  excludeAutomated: true,
  excludedSenders: '',
  excludedKeywords: ''
};

export type AnalysisPreferenceState = 'loading' | 'ready' | 'saving' | 'saved' | 'error';

export function useAnalysisPreference() {
  const [preference, setPreference] = useState(DEFAULT_ANALYSIS_PREFERENCE);
  const [state, setState] = useState<AnalysisPreferenceState>('loading');

  useEffect(() => {
    fetchAnalysisPreference()
      .then((loadedPreference) => {
        setPreference(loadedPreference);
        setState('ready');
      })
      .catch(() => setState('error'));
  }, []);

  function updatePreference<K extends keyof AnalysisPreference>(key: K, value: AnalysisPreference[K]) {
    setPreference((current) => ({ ...current, [key]: value }));
  }

  async function savePreference() {
    setState('saving');
    try {
      setPreference(await saveAnalysisPreference(preference));
      setState('saved');
    } catch {
      setState('error');
    }
  }

  return { preference, state, updatePreference, savePreference };
}
