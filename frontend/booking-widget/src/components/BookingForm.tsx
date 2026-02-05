import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format, differenceInCalendarDays } from 'date-fns';
import { useBookingContext } from '../context/BookingContext';

const formSchema = z.object({
  guest_name: z.string().min(2, 'Name is required'),
  guest_email: z.string().email('Valid email required'),
  guest_phone: z.string().min(6, 'Valid phone required'),
  special_requests: z.string().max(1000).optional()
});

type FormValues = z.infer<typeof formSchema>;

interface BookingFormProps {
  onSubmitBooking: (payload: {
    unit_id: string;
    guest_name: string;
    guest_email: string;
    guest_phone: string;
    check_in_date: string;
    check_out_date: string;
    special_requests?: string;
  }) => Promise<void>;
  submitting: boolean;
  error: string | null;
}

export default function BookingForm({ onSubmitBooking, submitting, error }: BookingFormProps) {
  const { selectedUnit, range } = useBookingContext();
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<FormValues>({ resolver: zodResolver(formSchema) });

  const canSubmit = useMemo(() => {
    return Boolean(selectedUnit && range?.from && range?.to);
  }, [selectedUnit, range]);

  const nights = range?.from && range?.to ? differenceInCalendarDays(range.to, range.from) : 0;
  const total = selectedUnit ? nights * selectedUnit.nightly_rate_usd : 0;

  const onSubmit = async (values: FormValues) => {
    if (!selectedUnit || !range?.from || !range?.to) return;

    await onSubmitBooking({
      unit_id: selectedUnit.id,
      guest_name: values.guest_name,
      guest_email: values.guest_email,
      guest_phone: values.guest_phone,
      special_requests: values.special_requests,
      check_in_date: format(range.from, 'yyyy-MM-dd'),
      check_out_date: format(range.to, 'yyyy-MM-dd')
    });
  };

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
            {range?.from && range?.to ? `${format(range.from, 'MMM dd')} - ${format(range.to, 'MMM dd, yyyy')}` : '--'}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-500">Total</span>
          <span className="font-semibold">${total.toFixed(2)}</span>
        </div>
      </div>

      <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-700">
        This is a booking request. Payment will be requested after admin approval.
      </div>

      <form className="grid gap-3" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <input
            {...register('guest_name')}
            placeholder="Full name"
            className="w-full rounded-lg border border-slate-200 p-2"
          />
          {errors.guest_name && <p className="text-xs text-red-600">{errors.guest_name.message}</p>}
        </div>
        <div>
          <input
            {...register('guest_email')}
            placeholder="Email"
            className="w-full rounded-lg border border-slate-200 p-2"
          />
          {errors.guest_email && <p className="text-xs text-red-600">{errors.guest_email.message}</p>}
        </div>
        <div>
          <input
            {...register('guest_phone')}
            placeholder="Phone"
            className="w-full rounded-lg border border-slate-200 p-2"
          />
          {errors.guest_phone && <p className="text-xs text-red-600">{errors.guest_phone.message}</p>}
        </div>
        <div>
          <textarea
            {...register('special_requests')}
            placeholder="Special requests (optional)"
            className="w-full rounded-lg border border-slate-200 p-2"
            rows={3}
          />
        </div>
        <button
          type="submit"
          className="widget-button bg-teal-600 text-white disabled:opacity-50"
          disabled={!canSubmit || submitting}
        >
          {submitting ? 'Submitting...' : 'Submit booking request'}
        </button>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </form>
    </div>
  );
}
