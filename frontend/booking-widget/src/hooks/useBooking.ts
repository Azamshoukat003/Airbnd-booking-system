import { useState } from 'react';
import { api } from '../utils/api';

interface BookingPayload {
  unit_id: string;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  check_in_date: string;
  check_out_date: string;
  special_requests?: string;
}

export function useBooking() {
  const [submitting, setSubmitting] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const createBookingRequest = async (payload: BookingPayload) => {
    setSubmitting(true);
    setError(null);
    try {
      const { data } = await api.post('/booking-request', payload);
      setBookingId(data.booking_id);
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'response' in err
          ? ((err as { response?: { data?: { error?: string } } }).response?.data?.error ??
              'Failed to submit booking')
          : 'Failed to submit booking';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const createPaymentPreauth = async (id: string) => {
    setSubmitting(true);
    setError(null);
    try {
      const { data } = await api.post('/payments/preauth', { booking_id: id });
      setPaymentUrl(data.payment_url);
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'response' in err
          ? ((err as { response?: { data?: { error?: string } } }).response?.data?.error ??
              'Failed to authorize payment')
          : 'Failed to authorize payment';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setBookingId(null);
    setPaymentUrl(null);
    setError(null);
  };

  return {
    createBookingRequest,
    createPaymentPreauth,
    submitting,
    paymentUrl,
    bookingId,
    error,
    reset
  };
}
