import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import type { LayoutNavItem } from './types';

interface AppLayoutProps {
  items: LayoutNavItem[];
  userEmail?: string;
  onSignOut: () => void;
  children: ReactNode;
}

export default function AppLayout({ items, userEmail, onSignOut, children }: AppLayoutProps) {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const current = useMemo(() => {
    const exact = items.find((item) => item.path === location.pathname);
    if (exact) return exact;

    const nested = items.find(
      (item) => item.path !== '/' && location.pathname.startsWith(item.path),
    );

    return nested ?? items[0];
  }, [items, location.pathname]);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (mobileOpen) {
      document.body.classList.add('sidebar-open');
    } else {
      document.body.classList.remove('sidebar-open');
    }

    return () => document.body.classList.remove('sidebar-open');
  }, [mobileOpen]);

  return (
    <div className={`dashboard-shell ${collapsed ? 'dashboard-shell-collapsed' : ''}`}>
      <aside className="dashboard-sidebar" aria-label="Sidebar">
        <Sidebar
          items={items}
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed((prev) => !prev)}
          onSignOut={onSignOut}
        />
      </aside>

      <main className="dashboard-main">
        <Topbar
          title={current.title}
          description={current.description}
          userEmail={userEmail}
          onMenuClick={() => setMobileOpen(true)}
          onSignOut={onSignOut}
        />

        <section className="dashboard-content">{children}</section>
      </main>

      <div
        className={`mobile-sidebar-backdrop ${mobileOpen ? 'mobile-sidebar-backdrop-open' : ''}`}
        onClick={() => setMobileOpen(false)}
      />

      <aside className={`mobile-sidebar ${mobileOpen ? 'mobile-sidebar-open' : ''}`} aria-label="Mobile navigation">
        <Sidebar
          items={items}
          mobile
          onNavigate={() => setMobileOpen(false)}
          onSignOut={onSignOut}
        />
      </aside>
    </div>
  );
}
