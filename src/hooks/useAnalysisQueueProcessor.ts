import { useState } from 'react';
import { processAnalysisQueue } from '../api/analysis';

export function useAnalysisQueueProcessor(onProcessed: () => void) {
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function processQueue() {
    setProcessing(true);
    setMessage(null);
    try {
      const result = await processAnalysisQueue(10);
      setMessage(
        `${result.processedCount}건 처리 · ${result.completedCount}건 완료 · ${result.failedCount}건 재시도 필요`
      );
      onProcessed();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '분석 작업을 처리하지 못했습니다.');
    } finally {
      setProcessing(false);
    }
  }

  return { message, processing, processQueue };
}
