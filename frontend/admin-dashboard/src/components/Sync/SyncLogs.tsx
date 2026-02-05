import { useEffect, useState } from 'react';
import { api } from '../../utils/api';
import { supabase } from '../../context/AuthContext';

interface SyncLog {
  id: string;
  unit_id: string | null;
  sync_status: string;
  sync_started_at: string;
  sync_completed_at: string | null;
  blocked_dates_found: number;
  error_message: string | null;
}

export default function SyncLogs() {
  const [logs, setLogs] = useState<SyncLog[]>([]);

  const fetchLogs = async () => {
    const { data } = await api.get<SyncLog[]>('/admin/sync-logs', { params: { limit: 50 } });
    setLogs(data);
  };

  useEffect(() => {
    void fetchLogs();
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel('realtime-sync-logs')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sync_logs' }, () => {
        void fetchLogs();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="card p-4">
      <h3 className="text-lg font-semibold mb-3">Sync logs</h3>
      <div className="grid gap-2 text-sm">
        {logs.map((log) => (
          <div key={log.id} className="border-b pb-2">
            <p>Status: {log.sync_status}</p>
            <p>Started: {log.sync_started_at}</p>
            <p>Completed: {log.sync_completed_at ?? 'In progress'}</p>
            <p>Blocked dates: {log.blocked_dates_found}</p>
            {log.error_message && <p className="text-red-600">Error: {log.error_message}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
