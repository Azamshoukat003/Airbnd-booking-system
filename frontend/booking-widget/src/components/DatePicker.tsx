import { useMemo } from 'react';
import { DayPicker, DateRange } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { parseISO, isBefore, format, differenceInCalendarDays } from 'date-fns';
import { useBookingContext } from '../context/BookingContext';

export default function DatePicker() {
  const { range, setRange, blockedDates, selectedUnit, lastSyncAt } = useBookingContext();

  const disabledDays = useMemo(() => {
    const blocked = blockedDates.map((date) => parseISO(date));
    return [{ before: new Date() }, ...blocked];
  }, [blockedDates]);

  const handleSelect = (next: DateRange | undefined) => {
    if (!next?.from || !next?.to) {
      setRange(next);
      return;
    }

    if (isBefore(next.to, next.from)) {
      setRange({ from: next.to, to: next.from });
      return;
    }

    setRange(next);
  };

  const nights = range?.from && range?.to ? differenceInCalendarDays(range.to, range.from) : 0;
  const total = selectedUnit ? nights * selectedUnit.nightly_rate_usd : 0;

  return (
    <div className="widget-card p-4 md:p-5 grid gap-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <div>
          <h3 className="text-lg font-semibold">
            Booking: {selectedUnit ? selectedUnit.name : 'Select a property first'}
          </h3>
          <p className="text-xs text-slate-500">Updated {lastSyncAt ? new Date(lastSyncAt).toLocaleString() : 'not synced yet'}</p>
        </div>
        <div className="text-xs text-slate-500">
          Legend: <span className="inline-block w-3 h-3 bg-white border mr-1" /> Available
          <span className="inline-block w-3 h-3 bg-slate-300 ml-3 mr-1" /> Blocked
          <span className="inline-block w-3 h-3 bg-teal-400 ml-3 mr-1" /> Selected
        </div>
      </div>

      <DayPicker
        mode="range"
        selected={range}
        onSelect={handleSelect}
        disabled={disabledDays}
        numberOfMonths={2}
      />

      <div className="grid md:grid-cols-3 gap-3 text-sm">
        <div className="bg-white rounded-xl border p-3">
          <p className="text-xs text-slate-500">Check-in</p>
          <p className="font-semibold">{range?.from ? format(range.from, 'MMM dd, yyyy') : '--'}</p>
        </div>
        <div className="bg-white rounded-xl border p-3">
          <p className="text-xs text-slate-500">Check-out</p>
          <p className="font-semibold">{range?.to ? format(range.to, 'MMM dd, yyyy') : '--'}</p>
        </div>
        <div className="bg-white rounded-xl border p-3">
          <p className="text-xs text-slate-500">Nights</p>
          <p className="font-semibold">{nights > 0 ? `${nights} nights` : '--'}</p>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm border-t pt-3">
        <div className="text-slate-500">
          {selectedUnit && nights > 0
            ? `${nights} nights × $${selectedUnit.nightly_rate_usd}`
            : 'Select dates to see total price'}
        </div>
        <div className="text-lg font-semibold">${total.toFixed(2)}</div>
      </div>

      {selectedUnit && nights > 0 && blockedDates.length > 0 && (
        <p className="text-xs text-slate-500">
          Dates marked as blocked are not available.
        </p>
      )}
    </div>
  );
}
