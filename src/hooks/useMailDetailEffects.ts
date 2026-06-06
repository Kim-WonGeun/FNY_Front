import { useEffect } from 'react';
import type { EmailDetail, NavView } from '../types';

type UseMailDetailEffectsOptions = {
  emailDetail: EmailDetail | null;
  expandedMailId: string | null;
  loadAnalysisHistory: (emailId: string) => Promise<void>;
  loadEmailDetail: (emailId: string) => Promise<void>;
  navView: NavView;
  selectedEmailId: string;
};

export function useMailDetailEffects({
  emailDetail,
  expandedMailId,
  loadAnalysisHistory,
  loadEmailDetail,
  navView,
  selectedEmailId
}: UseMailDetailEffectsOptions) {
  useEffect(() => {
    if (selectedEmailId && (expandedMailId === selectedEmailId || navView === 'mailDetail')) {
      void loadEmailDetail(selectedEmailId);
    }
  }, [selectedEmailId, expandedMailId, navView]);

  useEffect(() => {
    const detailVisible =
      Boolean(expandedMailId && emailDetail?.id === expandedMailId) ||
      (navView === 'mailDetail' && Boolean(selectedEmailId && emailDetail?.id === selectedEmailId));

    if (detailVisible && emailDetail?.id && emailDetail.analysis) {
      void loadAnalysisHistory(emailDetail.id);
    }
  }, [navView, selectedEmailId, expandedMailId, emailDetail?.id, emailDetail?.analysis?.id]);
}
