import { useEffect, useState } from 'react';
import { api } from '../../utils/api';
import { supabase } from '../../context/AuthContext';

interface UnitRow {
  id: string;
  name: string;
  airbnb_ical_url: string;
}

interface SyncLog {
  unit_id: string | null;
  sync_status: string;
  sync_completed_at: string | null;
  sync_started_at: string;
}

export default function SyncStatus() {
  const [units, setUnits] = useState<UnitRow[]>([]);
  const [logs, setLogs] = useState<Record<string, SyncLog>>({});

  const fetchUnits = async () => {
    const { data } = await api.get<UnitRow[]>('/admin/units');
    setUnits(data);
  };

  const fetchLogs = async () => {
    const { data } = await api.get<SyncLog[]>('/admin/sync-logs', { params: { limit: 100 } });
    const latestByUnit: Record<string, SyncLog> = {};
    for (const log of data) {
      if (log.unit_id && !latestByUnit[log.unit_id]) {
        latestByUnit[log.unit_id] = log;
      }
    }
    setLogs(latestByUnit);
  };

  useEffect(() => {
    void fetchUnits();
    void fetchLogs();
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel('realtime-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sync_logs' }, () => {
        void fetchLogs();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const manualSync = async (unitId: string) => {
    await api.post('/admin/sync/manual', { unit_id: unitId });
    await fetchLogs();
  };

  const syncAll = async () => {
    await api.post('/admin/sync/manual', {});
    await fetchLogs();
  };

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Sync status</h2>
        <button className="rounded-lg bg-ocean text-white px-4 py-2" onClick={syncAll}>
          Sync all
        </button>
      </div>

      <div className="grid gap-3">
        {units.map((unit) => {
          const log = logs[unit.id];
          return (
            <div key={unit.id} className="card p-4 flex items-center justify-between">
              <div>
                <h3 className="font-semibold">{unit.name}</h3>
                <p className="text-xs text-black/60">{unit.airbnb_ical_url}</p>
                <p className="text-xs text-black/60">Last sync: {log?.sync_completed_at ?? 'Never'}</p>
              </div>
              <button className="rounded-lg border px-3 py-1" onClick={() => manualSync(unit.id)}>
                Manual sync
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
