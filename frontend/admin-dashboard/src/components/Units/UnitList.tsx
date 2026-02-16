import { useEffect, useState } from 'react';
import UnitCard from './UnitCard';
import { api } from '../../utils/api';
import { supabase } from '../../context/AuthContext';

export interface UnitRow {
  id: string;
  name: string;
  nightly_rate_usd: number;
  status: string;
  description: string | null;
  max_guests: number;
  airbnb_listing_url: string | null;
  airbnb_ical_url: string;
  image_urls: string[] | null;
  category?: string | null;
  place_type?: string | null;
  country?: string | null;
  street_address?: string | null;
  floor?: string | null;
  city?: string | null;
  state?: string | null;
  postal_code?: string | null;
  home_precise?: boolean | null;
  bedroom_lock?: boolean | null;
  private_bathroom?: number | null;
  dedicated_bathroom?: number | null;
  shared_bathroom?: number | null;
  bathroom_usage?: string | null;
  favorites?: string[] | null;
  amenities?: string[] | null;
  safety_items?: string[] | null;
  highlights?: string[] | null;
  safety_details?: string[] | null;
  weekday_price?: number | null;
  weekday_after_tax_price?: number | null;
}

interface UnitListProps {
  onEditUnit?: (unit: UnitRow) => void;
}

export default function UnitList({ onEditUnit }: UnitListProps) {
  const [units, setUnits] = useState<UnitRow[]>([]);

  const fetchUnits = async () => {
    const { data } = await api.get<UnitRow[]>('/admin/units');
    setUnits(data);
  };

  useEffect(() => {
    void fetchUnits();
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel('realtime-units')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'units' }, () => {
        void fetchUnits();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleDelete = async (unitId: string) => {
    await api.delete(`/admin/units/${unitId}`);
    await fetchUnits();
  };

  if (units.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-black/15 bg-white/80 p-10 text-center">
        <h3 className="text-lg font-semibold text-slate-900">No units yet</h3>
        <p className="mt-2 text-sm text-slate-600">Create your first unit to start managing listings.</p>
      </div>
    );
  }

  return (
    <section className="space-y-4" aria-label="Unit listings">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {units.map((unit) => (
          <UnitCard
            key={unit.id}
            name={unit.name}
            description={unit.description}
            imageUrl={unit.image_urls?.[0] ?? null}
            nightlyRate={unit.nightly_rate_usd}
            maxGuests={unit.max_guests}
            status={unit.status}
            onEdit={() => onEditUnit?.(unit)}
            onDelete={() => handleDelete(unit.id)}
          />
        ))}
      </div>
    </section>
  );
}
