import { differenceInCalendarDays } from 'date-fns';
import { useBookingContext } from '../context/BookingContext';

export default function PriceCalculator() {
  const { selectedUnit, range } = useBookingContext();

  if (!selectedUnit || !range?.from || !range?.to) {
    return (
      <div className="card p-5">
        <h2 className="text-xl font-semibold">Price</h2>
        <p className="text-sm text-black/60">Select dates to see price.</p>
      </div>
    );
  }

  const nights = differenceInCalendarDays(range.to, range.from);
  const total = nights * selectedUnit.nightly_rate_usd;

  return (
    <div className="card p-5">
      <h2 className="text-xl font-semibold">Price</h2>
      <div className="mt-3 text-sm">
        <p>{nights} nights at ${selectedUnit.nightly_rate_usd}/night</p>
        <p className="text-lg font-semibold mt-2">Total: ${total.toFixed(2)}</p>
      </div>
    </div>
  );
}
