import { useCallback, useEffect, useState } from 'react';
import { processAnalysisQueue } from '../api/analysis';
import { fetchOperationSummary } from '../api/operations';
import type { LoadState, OperationSummary } from '../types';

export function useOperations() {
  const [summary, setSummary] = useState<OperationSummary | null>(null);
  const [state, setState] = useState<LoadState>('loading');
  const [message, setMessage] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const load = useCallback(async () => {
    setState('loading');
    setMessage(null);
    try {
      setSummary(await fetchOperationSummary());
      setState('ready');
    } catch (error) {
      setState('error');
      setMessage(error instanceof Error ? error.message : '작업 기록을 불러오지 못했습니다.');
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const processQueue = useCallback(async () => {
    setProcessing(true);
    setMessage(null);
    try {
      const result = await processAnalysisQueue(10);
      setMessage(`${result.processedCount}건을 처리해 ${result.completedCount}건을 완료했습니다.`);
      setSummary(await fetchOperationSummary());
      setState('ready');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '대기 작업을 처리하지 못했습니다.');
    } finally {
      setProcessing(false);
    }
  }, []);

  return { summary, state, message, processing, load, processQueue };
}
