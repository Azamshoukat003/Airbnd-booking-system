import { FiBell, FiMenu } from 'react-icons/fi';

interface TopbarProps {
  title: string;
  description: string;
  userEmail?: string;
  onMenuClick: () => void;
  onSignOut: () => void;
}

export default function Topbar({ title, description, userEmail, onMenuClick, onSignOut }: TopbarProps) {
  return (
    <header className="dashboard-header">
      <div className="dashboard-header-main">
        <button
          type="button"
          className="mobile-menu-trigger"
          onClick={onMenuClick}
          aria-label="Open navigation menu"
        >
          <FiMenu aria-hidden="true" />
        </button>

        <div>
          <p className="dashboard-header-eyebrow">Admin workspace</p>
          <h2 className="dashboard-header-title">{title}</h2>
          <p className="dashboard-header-description">{description}</p>
        </div>
      </div>

      <div className="dashboard-header-actions">
        <div className="sync-badge" role="status" aria-live="polite">
          <span className="sync-badge-dot" aria-hidden="true" />
          Live sync enabled
        </div>

        <button type="button" className="icon-action" aria-label="Notifications">
          <FiBell aria-hidden="true" />
        </button>

        <div className="profile-chip">
          <span className="profile-avatar" aria-hidden="true">
            {userEmail?.charAt(0).toUpperCase() ?? 'A'}
          </span>
          <div className="profile-copy">
            <p className="profile-name">Admin</p>
            <p className="profile-email">{userEmail ?? 'admin@company.com'}</p>
          </div>
        </div>

        <button type="button" className="topbar-logout" onClick={onSignOut}>
          Logout
        </button>
      </div>
    </header>
  );
}
