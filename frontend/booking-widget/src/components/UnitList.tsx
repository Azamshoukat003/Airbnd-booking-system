import { useEffect } from 'react';
import { api } from '../utils/api';
import { useBookingContext, UnitSummary } from '../context/BookingContext';

export default function UnitList() {
  const { units, setUnits, selectedUnit, setSelectedUnit } = useBookingContext();

  useEffect(() => {
    const fetchUnits = async () => {
      const { data } = await api.get<UnitSummary[]>('/units');
      setUnits(data);
      if (!selectedUnit && data.length > 0) {
        setSelectedUnit(data[0]);
      }
    };

    void fetchUnits();
  }, [setUnits, selectedUnit, setSelectedUnit]);

  return (
    <div className="grid gap-4">
      {units.map((unit) => (
        <div
          key={unit.id}
          className={`widget-card p-4 md:p-5 flex flex-col md:flex-row md:items-center gap-4 transition ${
            selectedUnit?.id === unit.id ? 'border-teal-500 bg-teal-50' : 'hover:border-teal-300'
          }`}
        >
          <div className="w-full md:w-32 h-24 rounded-xl bg-slate-200 overflow-hidden">
            {unit.image_urls?.[0] ? (
              <img src={unit.image_urls[0]} alt={unit.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs text-slate-500">
                No image
              </div>
            )}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold">{unit.name}</h3>
            <p className="text-sm text-slate-600">{unit.description}</p>
            <p className="text-sm text-slate-500 mt-1">
              ${unit.nightly_rate_usd}/night • Max {unit.max_guests} guests
            </p>
          </div>
          <button
            className={`widget-button border ${
              selectedUnit?.id === unit.id
                ? 'bg-teal-600 text-white border-teal-600'
                : 'bg-white text-slate-700 border-slate-300'
            }`}
            onClick={() => setSelectedUnit(unit)}
          >
            {selectedUnit?.id === unit.id ? 'Selected' : 'Select property'}
          </button>
        </div>
      ))}
    </div>
  );
}
