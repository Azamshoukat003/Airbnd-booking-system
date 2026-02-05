import { differenceInCalendarDays, format } from 'date-fns';

interface ConfirmationScreenProps {
  bookingId: string;
  unitName: string;
  nightlyRate: number;
  from: Date;
  to: Date;
  onReset: () => void;
}

export default function ConfirmationScreen({
  bookingId,
  unitName,
  nightlyRate,
  from,
  to,
  onReset
}: ConfirmationScreenProps) {
  const nights = differenceInCalendarDays(to, from);
  const total = nights * nightlyRate;

  return (
    <div className="widget-shell p-6 md:p-8">
      <div className="grid gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-teal-600 text-white flex items-center justify-center">?</div>
          <div>
            <h2 className="text-2xl font-semibold">Booking Request Submitted!</h2>
            <p className="text-sm text-slate-500">We have received your request.</p>
          </div>
        </div>

        <div className="widget-card p-4 grid gap-2 text-sm">
          <p><span className="text-slate-500">Property:</span> {unitName}</p>
          <p>
            <span className="text-slate-500">Dates:</span> {format(from, 'MMM dd, yyyy')} - {format(to, 'MMM dd, yyyy')}
          </p>
          <p><span className="text-slate-500">Total:</span> ${total.toFixed(2)} USD</p>
        </div>

        <div className="text-sm text-slate-600">
          <p>What happens next:</p>
          <ul className="list-disc pl-5">
            <li>Our team will review your request.</li>
            <li>You will receive an email within 24 hours.</li>
            <li>If approved, we will send a payment link.</li>
          </ul>
        </div>

        <div className="text-sm text-slate-500">Booking ID: {bookingId}</div>

        <div className="flex flex-wrap gap-2">
          <button className="widget-button bg-teal-600 text-white" onClick={onReset}>
            Book another property
          </button>
          <button className="widget-button border border-slate-300 text-slate-700" onClick={onReset}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
