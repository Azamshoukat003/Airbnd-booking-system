import { useEffect, useMemo, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter, NavLink, Route, Routes, useLocation } from 'react-router-dom';
import Login from './components/Auth/Login';
import Dashboard from './pages/Dashboard';
import Units from './pages/Units';
import Bookings from './pages/Bookings';
import Sync from './pages/Sync';
import Payments from './pages/Payments';
import { AuthProvider, useAuth } from './context/AuthContext';
import { setAuthToken } from './utils/api';

const navItems = [
  {
    label: 'Dashboard',
    path: '/',
    element: <Dashboard />,
    title: 'Booking operations',
    description: 'Track reservations, payouts, and hosting performance.'
  },
  {
    label: 'Units',
    path: '/units',
    element: <Units />,
    title: 'Listing management',
    description: 'Keep property details polished and up to date.'
  },
  {
    label: 'Bookings',
    path: '/bookings',
    element: <Bookings />,
    title: 'Reservation queue',
    description: 'Review upcoming stays and guest information.'
  },
  {
    label: 'Sync',
    path: '/sync',
    element: <Sync />,
    title: 'Calendar sync',
    description: 'Confirm availability across connected channels.'
  },
  {
    label: 'Payments',
    path: '/payments',
    element: <Payments />,
    title: 'Payouts & billing',
    description: 'Monitor transactions and reconcile statements.'
  }
] as const;

const missingEnv: string[] = [];
if (!import.meta.env.VITE_API_URL) missingEnv.push('VITE_API_URL');
if (!import.meta.env.VITE_SUPABASE_URL) missingEnv.push('VITE_SUPABASE_URL');
if (!import.meta.env.VITE_SUPABASE_ANON_KEY) missingEnv.push('VITE_SUPABASE_ANON_KEY');

function useCurrentNav() {
  const location = useLocation();
  return useMemo(() => {
    const match = navItems.find((item) => item.path === location.pathname);
    return match ?? navItems[0];
  }, [location.pathname]);
}

function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  const current = useCurrentNav();

  return (
    <header className="topbar">
      <div className="topbar-title">
        <button className="menu-button" type="button" onClick={onMenuClick}>
          <span />
          <span />
          <span />
        </button>
        <div>
          <p className="text-sm text-black/60">Admin dashboard</p>
          <h2 className="text-3xl font-semibold">{current.title}</h2>
          <p className="text-sm text-black/50 mt-2">{current.description}</p>
        </div>
      </div>
      <div className="topbar-actions">
        <div className="status-chip">
          <span className="status-dot" />
          Live sync enabled
        </div>
      </div>
    </header>
  );
}

function Shell() {
  const { user, session, loading, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const current = useCurrentNav();

  useEffect(() => {
    setAuthToken(session?.access_token ?? null);
  }, [session]);

  useEffect(() => {
    if (sidebarOpen) {
      document.body.classList.add('sidebar-open');
    } else {
      document.body.classList.remove('sidebar-open');
    }
    return () => document.body.classList.remove('sidebar-open');
  }, [sidebarOpen]);

  if (missingEnv.length > 0) {
    return (
      <div className="min-h-screen bg-clay text-ink p-6">
        <div className="max-w-2xl mx-auto card p-6">
          <h1 className="text-2xl font-semibold mb-2">Admin dashboard is not configured</h1>
          <p className="text-sm text-black/70 mb-4">
            The following environment variables are missing in
            <span className="font-semibold"> frontend/admin-dashboard/.env</span>:
          </p>
          <ul className="list-disc pl-5 text-sm">
            {missingEnv.map((name) => (
              <li key={name}>{name}</li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-clay text-ink">
      <div className="app-shell">
        <aside className="sidebar">
          <div className="sidebar-header">
            <div className="brand-dot" />
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-black/50">Airbnb</p>
              <h1 className="text-lg font-semibold">Admin Suite</h1>
            </div>
          </div>

          <nav className="sidebar-nav">
            {navItems.map((item) => (
              <NavLink
                key={item.label}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `nav-pill ${isActive ? 'nav-pill-active' : ''}`
                }
              >
                <span className="nav-label">{item.label}</span>
                <span className="nav-indicator" />
              </NavLink>
            ))}
          </nav>

          <div className="sidebar-card">
            <p className="text-xs uppercase tracking-[0.2em] text-black/40">Quick note</p>
            <p className="mt-2 text-sm text-black/70">
              Keep listings polished and calendars synced to reduce cancellations.
            </p>
          </div>
        </aside>

        <section className="main-area">
          <div className="topbar-desktop">
            <header className="topbar">
              <div>
                <p className="text-sm text-black/60">Admin dashboard</p>
                <h2 className="text-3xl font-semibold">{current.title}</h2>
                <p className="text-sm text-black/50 mt-2">{current.description}</p>
              </div>
              <div className="topbar-actions">
                <div className="status-chip">
                  <span className="status-dot" />
                  Live sync enabled
                </div>
                <button className="primary-button" onClick={signOut}>
                  Sign out
                </button>
              </div>
            </header>
          </div>

          <div className="topbar-mobile">
            <Topbar onMenuClick={() => setSidebarOpen((prev) => !prev)} />
          </div>

          <div className="content-card">
            <Routes>
              {navItems.map((item) => (
                <Route key={item.path} path={item.path} element={item.element} />
              ))}
            </Routes>
          </div>
        </section>
      </div>

      <div
        className={`sidebar-backdrop ${sidebarOpen ? 'sidebar-backdrop-open' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />
      <div className={`sidebar-drawer ${sidebarOpen ? 'sidebar-drawer-open' : ''}`}>
        <div className="sidebar-drawer-header">
          <div className="brand-dot" />
          <button className="drawer-close" type="button" onClick={() => setSidebarOpen(false)}>
            Close
          </button>
        </div>
        <p className="text-xs uppercase tracking-[0.2em] text-black/40">Navigation</p>
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `nav-pill ${isActive ? 'nav-pill-active' : ''}`
              }
              onClick={() => setSidebarOpen(false)}
            >
              <span className="nav-label">{item.label}</span>
              <span className="nav-indicator" />
            </NavLink>
          ))}
        </nav>
        <button className="primary-button" onClick={signOut}>
          Sign out
        </button>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Shell />
        <Toaster position="top-right" />
      </BrowserRouter>
    </AuthProvider>
  );
}


