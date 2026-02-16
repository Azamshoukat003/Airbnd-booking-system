import { FiActivity, FiClock, FiInbox, FiTrendingUp } from 'react-icons/fi';

const stats = [
  { label: 'Active units', value: '24', icon: FiActivity },
  { label: 'Upcoming check-ins', value: '9', icon: FiClock },
  { label: 'This month revenue', value: '$18.2k', icon: FiTrendingUp },
];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map((item) => {
          const Icon = item.icon;
          return (
            <article key={item.label} className="card p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500">{item.label}</p>
                <span className="rounded-lg bg-slate-100 p-2 text-slate-600">
                  <Icon aria-hidden="true" />
                </span>
              </div>
              <p className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">{item.value}</p>
            </article>
          );
        })}
      </div>

      <section className="card p-10 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
          <FiInbox aria-hidden="true" />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-slate-900">No recent activity</h3>
        <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
          New sync events, booking alerts, and operational notifications will appear here once data flows in.
        </p>
      </section>
    </div>
  );
}
