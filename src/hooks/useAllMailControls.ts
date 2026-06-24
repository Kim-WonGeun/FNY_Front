import { useState } from 'react';
import type { MailboxAnalysisFilter, MailboxCategory } from '../types';

export function useAllMailControls() {
  const [allMailQuery, setAllMailQuery] = useState('');
  const [allMailSenderQuery, setAllMailSenderQuery] = useState('');
  const [allMailStartDate, setAllMailStartDate] = useState('');
  const [allMailEndDate, setAllMailEndDate] = useState('');
  const [allMailSearchBody, setAllMailSearchBody] = useState(false);
  const [allMailAdvancedSearchOpen, setAllMailAdvancedSearchOpen] = useState(false);
  const [allMailPage, setAllMailPage] = useState(1);
  const [allMailScrollTop, setAllMailScrollTop] = useState(0);
  const [mailboxCategory, setMailboxCategory] = useState<MailboxCategory>('all');
  const [mailboxAnalysisFilter, setMailboxAnalysisFilter] = useState<MailboxAnalysisFilter>('all');
  const [mailboxStatusFilterOpen, setMailboxStatusFilterOpen] = useState(false);
  const [mailboxAccountId, setMailboxAccountId] = useState('all');

  function resetAllMailSearchFields() {
    setAllMailQuery('');
    setAllMailSenderQuery('');
    setAllMailStartDate('');
    setAllMailEndDate('');
    setAllMailSearchBody(false);
  }

  function resetAllMailFilters() {
    setMailboxCategory('all');
    setMailboxAccountId('all');
    setMailboxAnalysisFilter('all');
    resetAllMailSearchFields();
    setAllMailPage(1);
    setAllMailScrollTop(0);
  }

  function prepareAnalysisFilter(filter: MailboxAnalysisFilter) {
    setMailboxCategory('all');
    setMailboxAnalysisFilter(filter);
    setMailboxStatusFilterOpen(true);
    setAllMailPage(1);
    setAllMailScrollTop(0);
  }

  function prepareReportSourceOpen(page: number) {
    setMailboxCategory('all');
    setMailboxAnalysisFilter('all');
    setMailboxStatusFilterOpen(false);
    resetAllMailSearchFields();
    setAllMailPage(page);
    setAllMailScrollTop(0);
  }

  return {
    allMailAdvancedSearchOpen,
    allMailEndDate,
    allMailPage,
    allMailQuery,
    allMailSearchBody,
    allMailSenderQuery,
    allMailStartDate,
    allMailScrollTop,
    mailboxAnalysisFilter,
    mailboxAccountId,
    mailboxCategory,
    mailboxStatusFilterOpen,
    prepareAnalysisFilter,
    prepareReportSourceOpen,
    resetAllMailFilters,
    resetAllMailSearchFields,
    setAllMailAdvancedSearchOpen,
    setAllMailEndDate,
    setAllMailPage,
    setAllMailQuery,
    setAllMailSearchBody,
    setAllMailSenderQuery,
    setAllMailStartDate,
    setAllMailScrollTop,
    setMailboxAnalysisFilter,
    setMailboxAccountId,
    setMailboxCategory,
    setMailboxStatusFilterOpen
  };
}

export type UseAllMailControlsResult = ReturnType<typeof useAllMailControls>;
