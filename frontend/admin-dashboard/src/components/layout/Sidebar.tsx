import { NavLink } from 'react-router-dom';
import { FiChevronsLeft, FiLogOut } from 'react-icons/fi';
import type { LayoutNavItem } from './types';

interface SidebarProps {
  items: LayoutNavItem[];
  collapsed?: boolean;
  mobile?: boolean;
  onToggleCollapse?: () => void;
  onNavigate?: () => void;
  onSignOut: () => void;
}

export default function Sidebar({
  items,
  collapsed = false,
  mobile = false,
  onToggleCollapse,
  onNavigate,
  onSignOut,
}: SidebarProps) {
  return (
    <div className="sidebar-panel">
      <div className="sidebar-logo-row">
        <div className="logo-placeholder" aria-hidden="true">
          AP
        </div>
        {!collapsed && (
          <div className="sidebar-brand-copy">
            <p className="sidebar-brand-eyebrow">Airbnb Platform</p>
            <h1 className="sidebar-brand-title">Admin Console</h1>
          </div>
        )}
      </div>

      <nav className="sidebar-menu" aria-label="Main navigation">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.label}
              to={item.path}
              end={item.path === '/'}
              onClick={onNavigate}
              className={({ isActive }) =>
                `sidebar-item ${isActive ? 'sidebar-item-active' : ''}`
              }
              title={collapsed ? item.label : undefined}
            >
              <Icon className="sidebar-item-icon" aria-hidden="true" />
              {!collapsed && <span className="sidebar-item-label">{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        {!mobile && onToggleCollapse && (
          <button
            type="button"
            className="sidebar-collapse"
            onClick={onToggleCollapse}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <FiChevronsLeft
              className={`sidebar-collapse-icon ${collapsed ? 'sidebar-collapse-icon-rotated' : ''}`}
              aria-hidden="true"
            />
            {!collapsed && <span>Collapse</span>}
          </button>
        )}

        <button type="button" className="sidebar-signout" onClick={onSignOut}>
          <FiLogOut aria-hidden="true" />
          {!collapsed && <span>Sign out</span>}
        </button>
      </div>
    </div>
  );
}
