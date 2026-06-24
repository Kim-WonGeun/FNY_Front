import { useCallback } from 'react';
import type { EmailDetail, EmailListItem } from '../types';
import { HomeMailRow, type MailRowRuntimeProps } from '../components/HomeMailRow';

type UseHomeMailRowRendererOptions = {
  emailDetail: EmailDetail | null;
  runtime: MailRowRuntimeProps;
  onOpenEmail: (emailId: string, sequence?: EmailListItem[]) => void;
};

export function useHomeMailRowRenderer({
  emailDetail,
  runtime,
  onOpenEmail
}: UseHomeMailRowRendererOptions) {
  return useCallback((sequence: EmailListItem[]) => (
    email: EmailListItem,
    index: number,
    key: string
  ) => (
    <HomeMailRow
      key={key}
      email={email}
      index={index}
      expanded={false}
      emailDetail={emailDetail}
      runtime={runtime}
      onSelect={() => onOpenEmail(email.id, sequence)}
    />
  ), [emailDetail, onOpenEmail, runtime]);
}
