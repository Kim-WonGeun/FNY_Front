import type { ReactNode } from 'react';
import type { NavView } from '../types';
import {
  IconChevron,
  IconInbox,
  IconLayoutDashboard,
  IconPin,
  IconSettings,
  IconSparkles,
  IconWeeklyReport
} from './icons';

export function AppSidebar({
  navView,
  sidebarPinned,
  onNavViewChange,
  onSidebarPinnedChange
}: {
  navView: NavView;
  sidebarPinned: boolean;
  onNavViewChange: (view: NavView) => void;
  onSidebarPinnedChange: (pinned: boolean) => void;
}) {
  return (
    <aside className="app-sidebar" aria-label="주요 메뉴">
      <div className="sidebar-brand-row">
        <button
          type="button"
          className="sidebar-brand"
          onClick={() => onNavViewChange('home')}
          aria-label="홈으로 이동"
        >
          <div className="sidebar-logo" aria-hidden="true">
            F
          </div>
          <div className="sidebar-brand-text">
            <h1>FNY</h1>
            <p>Mail Intelligence</p>
          </div>
        </button>
        <button
          type="button"
          className={`sidebar-pin-btn${sidebarPinned ? ' sidebar-pin-btn-active' : ''}`}
          onClick={() => onSidebarPinnedChange(!sidebarPinned)}
          aria-pressed={sidebarPinned}
          aria-label={sidebarPinned ? '사이드바 접기' : '사이드바 펼치기'}
          title={sidebarPinned ? '사이드바 접기' : '사이드바 펼치기'}
        >
          <IconPin size={16} />
        </button>
      </div>

      <nav className="sidebar-nav" aria-label="메일 내비게이션">
        <SidebarLink
          active={navView === 'home'}
          label="홈"
          icon={<IconLayoutDashboard size={20} />}
          onClick={() => onNavViewChange('home')}
        />
        <SidebarLink
          active={navView === 'allMail' || navView === 'mailDetail'}
          label="메일함"
          icon={<IconInbox size={20} />}
          onClick={() => onNavViewChange('allMail')}
        />
        <SidebarLink
          active={navView === 'weekly'}
          label="보고서 생성"
          icon={<IconWeeklyReport size={20} />}
          onClick={() => onNavViewChange('weekly')}
        />

        <p className="sidebar-section-label">기타</p>
        <SidebarLink
          active={navView === 'accounts'}
          label="메일 계정"
          icon={<IconInbox size={20} />}
          onClick={() => onNavViewChange('accounts')}
        />
        <SidebarLink
          active={navView === 'activity'}
          label="작업 기록"
          icon={<IconSparkles size={20} />}
          onClick={() => onNavViewChange('activity')}
        />
        <SidebarLink
          active={navView === 'settings'}
          label="설정"
          icon={<IconSettings size={20} />}
          onClick={() => onNavViewChange('settings')}
        />
      </nav>
    </aside>
  );
}

function SidebarLink({
  active,
  label,
  icon,
  onClick
}: {
  active: boolean;
  label: string;
  icon: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={`sidebar-link${active ? ' sidebar-link-active' : ''}`}
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
    >
      <span className="sidebar-link-icon">
        {icon}
        <span>{label}</span>
      </span>
      <IconChevron size={16} />
    </button>
  );
}
