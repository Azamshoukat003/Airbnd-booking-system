import { useEffect, useState } from 'react';
import UnitForm, { UnitFormValues } from './UnitForm';
import UnitCard from './UnitCard';
import { api } from '../../utils/api';
import { supabase } from '../../context/AuthContext';

interface UnitRow {
  id: string;
  name: string;
  nightly_rate_usd: number;
  status: string;
  description: string | null;
  max_guests: number;
  airbnb_listing_url: string | null;
  airbnb_ical_url: string;
  image_urls: string[] | null;
}

export default function UnitList() {
  const [units, setUnits] = useState<UnitRow[]>([]);
  const [editing, setEditing] = useState<UnitRow | null>(null);
  const [creating, setCreating] = useState(false);

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

  const handleSave = async (values: UnitFormValues) => {
    const payload = {
      ...values,
      image_urls: values.image_urls ? values.image_urls.split(',').map((v) => v.trim()) : []
    };

    if (editing) {
      await api.put(`/admin/units/${editing.id}`, payload);
      setEditing(null);
    } else {
      await api.post('/admin/units', payload);
      setCreating(false);
    }
    await fetchUnits();
  };

  const handleDelete = async (unitId: string) => {
    await api.delete(`/admin/units/${unitId}`);
    await fetchUnits();
  };

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Units</h2>
        <button className="rounded-lg bg-ocean text-white px-4 py-2" onClick={() => setCreating(true)}>
          Add unit
        </button>
      </div>

      {creating && (
        <div className="card p-4">
          <h3 className="text-lg font-semibold mb-2">New unit</h3>
          <UnitForm onSave={handleSave} />
        </div>
      )}

      {editing && (
        <div className="card p-4">
          <h3 className="text-lg font-semibold mb-2">Edit unit</h3>
          <UnitForm
            initial={{
              ...editing,
              image_urls: (editing.image_urls ?? []).join(',')
            }}
            onSave={handleSave}
          />
        </div>
      )}

      <div className="grid gap-3">
        {units.map((unit) => (
          <UnitCard
            key={unit.id}
            name={unit.name}
            nightlyRate={unit.nightly_rate_usd}
            status={unit.status}
            onEdit={() => setEditing(unit)}
            onDelete={() => handleDelete(unit.id)}
          />
        ))}
      </div>
    </div>
  );
}
