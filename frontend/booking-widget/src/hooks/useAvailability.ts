import { useEffect, useState } from 'react';
import { format, addDays } from 'date-fns';
import { api } from '../utils/api';

export function useAvailability(unitId: string | null) {
  const [blockedDates, setBlockedDates] = useState<string[]>([]);
  const [lastSyncAt, setLastSyncAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!unitId) return;

    const fetchAvailability = async () => {
      setLoading(true);
      try {
        const start = format(new Date(), 'yyyy-MM-dd');
        const end = format(addDays(new Date(), 180), 'yyyy-MM-dd');
        const { data } = await api.get(`/units/${unitId}/availability`, {
          params: { start_date: start, end_date: end }
        });
        setBlockedDates(data.blocked_dates ?? []);
        setLastSyncAt(data.last_sync_at ?? null);
      } finally {
        setLoading(false);
      }
    };

    void fetchAvailability();
  }, [unitId]);

  return { blockedDates, lastSyncAt, loading };
}
