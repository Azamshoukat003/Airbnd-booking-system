import { format, differenceInCalendarDays } from 'date-fns';
import { useBookingContext } from '../context/BookingContext';

interface PaymentStepProps {
  bookingId: string | null;
  paymentUrl: string | null;
  onPay: (bookingId: string) => Promise<void>;
  loading: boolean;
  error: string | null;
}

export default function PaymentStep({ bookingId, paymentUrl, onPay, loading, error }: PaymentStepProps) {
  const { selectedUnit, range } = useBookingContext();
  const nights = range?.from && range?.to ? differenceInCalendarDays(range.to, range.from) : 0;
  const total = selectedUnit ? nights * selectedUnit.nightly_rate_usd : 0;

  return (
    <div className="widget-card p-4 md:p-5 grid gap-4">
      <div className="grid gap-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-slate-500">Property</span>
          <span className="font-semibold">{selectedUnit?.name ?? '--'}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-500">Dates</span>
          <span className="font-semibold">
            {range?.from && range?.to
              ? `${format(range.from, 'MMM dd')} - ${format(range.to, 'MMM dd, yyyy')}`
              : '--'}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-500">Total</span>
          <span className="font-semibold">${total.toFixed(2)}</span>
        </div>
      </div>

      <div className="rounded-xl bg-slate-100 border border-slate-200 p-3 text-xs text-slate-600">
        Your card will be pre-authorized now. The payment is captured only after admin approval.
      </div>

      {!paymentUrl && (
        <button
          className="widget-button bg-teal-600 text-white disabled:opacity-50"
          disabled={!bookingId || loading}
          onClick={() => bookingId && onPay(bookingId)}
        >
          {loading ? 'Processing...' : 'Authorize payment'}
        </button>
      )}

      {paymentUrl && (
        <div className="grid gap-2 text-sm">
          <p className="text-slate-600">Payment authorized. You may close this window.</p>
          <a className="text-teal-700 underline" href={paymentUrl} target="_blank" rel="noreferrer">
            View payment details
          </a>
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
