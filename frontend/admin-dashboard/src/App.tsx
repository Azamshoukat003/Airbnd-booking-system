import { useMemo, useState, useEffect } from 'react';
import Login from './components/Auth/Login';
import Dashboard from './pages/Dashboard';
import Units from './pages/Units';
import Bookings from './pages/Bookings';
import Sync from './pages/Sync';
import Payments from './pages/Payments';
import { AuthProvider, useAuth } from './context/AuthContext';
import { setAuthToken } from './utils/api';

const tabs = ['Dashboard', 'Units', 'Bookings', 'Sync', 'Payments'] as const;

type Tab = (typeof tabs)[number];

const missingEnv: string[] = [];
if (!import.meta.env.VITE_API_URL) missingEnv.push('VITE_API_URL');
if (!import.meta.env.VITE_SUPABASE_URL) missingEnv.push('VITE_SUPABASE_URL');
if (!import.meta.env.VITE_SUPABASE_ANON_KEY) missingEnv.push('VITE_SUPABASE_ANON_KEY');

function Shell() {
  const { user, session, loading, signOut } = useAuth();
  const [active, setActive] = useState<Tab>('Dashboard');

  useEffect(() => {
    setAuthToken(session?.access_token ?? null);
  }, [session]);

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

  const content = useMemo(() => {
    switch (active) {
      case 'Units':
        return <Units />;
      case 'Bookings':
        return <Bookings />;
      case 'Sync':
        return <Sync />;
      case 'Payments':
        return <Payments />;
      default:
        return <Dashboard />;
    }
  }, [active]);

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-clay text-ink p-6">
      <div className="max-w-6xl mx-auto grid gap-6">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-sm text-black/60">Admin dashboard</p>
            <h1 className="text-3xl font-semibold">Booking operations</h1>
          </div>
          <button className="rounded-lg border px-3 py-1" onClick={signOut}>
            Sign out
          </button>
        </header>

        <nav className="flex gap-2 flex-wrap">
          {tabs.map((tab) => (
            <button
              key={tab}
              className={`px-4 py-2 rounded-full border ${
                active === tab ? 'bg-ocean text-white border-ocean' : 'bg-white'
              }`}
              onClick={() => setActive(tab)}
            >
              {tab}
            </button>
          ))}
        </nav>

        {content}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Shell />
    </AuthProvider>
  );
}
