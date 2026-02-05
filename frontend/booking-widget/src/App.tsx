import { useEffect, useState } from 'react';
import UnitList from './components/UnitList';
import DatePicker from './components/DatePicker';
import BookingForm from './components/BookingForm';
import PaymentStep from './components/PaymentStep';
import ConfirmationScreen from './components/ConfirmationScreen';
import { BookingProvider, useBookingContext } from './context/BookingContext';
import { useAvailability } from './hooks/useAvailability';
import { useBooking } from './hooks/useBooking';

function WidgetShell() {
  const { selectedUnit, range, setBlockedDates, setLastSyncAt } = useBookingContext();
  const { blockedDates, lastSyncAt } = useAvailability(selectedUnit?.id ?? null);
  const {
    createBookingRequest,
    createPaymentPreauth,
    submitting,
    paymentUrl,
    bookingId,
    error,
    reset
  } = useBooking();

  const [step, setStep] = useState(1);

  useEffect(() => {
    setBlockedDates(blockedDates);
  }, [blockedDates, setBlockedDates]);

  useEffect(() => {
    setLastSyncAt(lastSyncAt ?? null);
  }, [lastSyncAt, setLastSyncAt]);

  if (bookingId && paymentUrl) {
    return (
      <ConfirmationScreen
        bookingId={bookingId}
        unitName={selectedUnit?.name ?? 'Selected property'}
        nightlyRate={selectedUnit?.nightly_rate_usd ?? 0}
        from={range?.from ?? new Date()}
        to={range?.to ?? new Date()}
        onReset={() => {
          reset();
          setStep(1);
        }}
      />
    );
  }

  return (
    <div className="widget-shell p-6 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Direct Booking</p>
          <h1 className="widget-title">Reserve your stay</h1>
        </div>
        <div className="text-sm text-slate-500">Pre-authorization only. Payment captured after approval.</div>
      </div>

      <div className="grid gap-4 mb-6">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          {[1, 2, 3, 4].map((num) => (
            <div
              key={num}
              className={`w-7 h-7 rounded-full flex items-center justify-center border ${
                step >= num ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-slate-500'
              }`}
            >
              {num}
            </div>
          ))}
          <span>Step {step} of 4</span>
        </div>
      </div>

      {step === 1 && (
        <section className="grid gap-4">
          <h2 className="text-lg font-semibold">Step 1 · Choose a property</h2>
          <UnitList />
          <div className="flex justify-end">
            <button className="widget-button bg-teal-600 text-white" onClick={() => setStep(2)}>
              Continue
            </button>
          </div>
        </section>
      )}

      {step === 2 && (
        <section className="grid gap-4">
          <h2 className="text-lg font-semibold">Step 2 · Select dates</h2>
          <DatePicker />
          <div className="flex justify-between">
            <button className="widget-button border border-slate-300 text-slate-700" onClick={() => setStep(1)}>
              Back
            </button>
            <button className="widget-button bg-teal-600 text-white" onClick={() => setStep(3)}>
              Continue
            </button>
          </div>
        </section>
      )}

      {step === 3 && (
        <section className="grid gap-4">
          <h2 className="text-lg font-semibold">Step 3 · Guest information</h2>
          <BookingForm
            onSubmitBooking={async (payload) => {
              await createBookingRequest(payload);
              setStep(4);
            }}
            submitting={submitting}
            error={error}
          />
          <div className="flex justify-start">
            <button className="widget-button border border-slate-300 text-slate-700" onClick={() => setStep(2)}>
              Back
            </button>
          </div>
        </section>
      )}

      {step === 4 && (
        <section className="grid gap-4">
          <h2 className="text-lg font-semibold">Step 4 · Payment</h2>
          <PaymentStep
            bookingId={bookingId}
            paymentUrl={paymentUrl}
            onPay={createPaymentPreauth}
            loading={submitting}
            error={error}
          />
          <div className="flex justify-start">
            <button className="widget-button border border-slate-300 text-slate-700" onClick={() => setStep(3)}>
              Back
            </button>
          </div>
        </section>
      )}
    </div>
  );
}

export default function App() {
  return (
    <div className="w-full max-w-5xl mx-auto p-4">
      <BookingProvider>
        <WidgetShell />
      </BookingProvider>
    </div>
  );
}
