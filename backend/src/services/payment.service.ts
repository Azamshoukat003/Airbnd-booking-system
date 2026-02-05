import axios from 'axios';
import crypto from 'crypto';
import { supabaseAdmin } from '../config/supabase';
import { env } from '../config/env';
import { BookingStatus, PaymentStatus } from '../types';

interface BancardInitResponse {
  payment_url: string;
  transaction_id: string;
}

function signPayload(payload: Record<string, unknown>): string {
  const serialized = JSON.stringify(payload);
  return crypto.createHmac('sha256', env.BANCARD_PRIVATE_KEY).update(serialized).digest('hex');
}

export async function createPaymentPreauth(bookingId: string): Promise<BancardInitResponse> {
  const { data: booking, error: bookingError } = await supabaseAdmin
    .from('booking_requests')
    .select('id, status, total_price_usd, guest_name, guest_email')
    .eq('id', bookingId)
    .single();

  if (bookingError || !booking) {
    throw new Error('Booking not found');
  }

  if (![BookingStatus.Pending, BookingStatus.Approved].includes(booking.status as BookingStatus)) {
    throw new Error('Booking is not eligible for payment');
  }

  const { data: existingPayment } = await supabaseAdmin
    .from('payments')
    .select('id, bancard_transaction_id')
    .eq('booking_id', bookingId)
    .single();

  if (existingPayment?.bancard_transaction_id) {
    return {
      payment_url: `${env.ADMIN_DASHBOARD_URL}/payments?booking=${bookingId}`,
      transaction_id: existingPayment.bancard_transaction_id
    };
  }

  const { data: payment, error: paymentError } = await supabaseAdmin
    .from('payments')
    .insert({
      booking_id: bookingId,
      amount_usd: booking.total_price_usd,
      payment_status: PaymentStatus.Pending
    })
    .select('id')
    .single();

  if (paymentError || !payment) {
    throw new Error('Failed to create payment record');
  }

  if (env.PAYMENT_MODE === 'stub') {
    const stubTransactionId = `stub_${payment.id}`;
    const stubUrl = `${env.ADMIN_DASHBOARD_URL}/payments?booking=${bookingId}`;

    await supabaseAdmin
      .from('payments')
      .update({
        bancard_transaction_id: stubTransactionId,
        bancard_response: { mode: 'stub', type: 'preauth' }
      })
      .eq('id', payment.id);

    return { payment_url: stubUrl, transaction_id: stubTransactionId };
  }

  const payload = {
    merchant_id: env.BANCARD_MERCHANT_ID,
    amount: booking.total_price_usd,
    currency: 'USD',
    description: `Booking ${bookingId}`,
    external_transaction_id: payment.id,
    customer: {
      name: booking.guest_name,
      email: booking.guest_email
    },
    return_url: `${env.ADMIN_DASHBOARD_URL}/payments`,
    cancel_url: `${env.ADMIN_DASHBOARD_URL}/payments`
  };

  const signature = signPayload(payload);

  try {
    const response = await axios.post(
      `${env.BANCARD_API_URL}/payments`,
      payload,
      {
        headers: {
          'X-Api-Key': env.BANCARD_PUBLIC_KEY,
          'X-Signature': signature,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );

    const paymentUrl = response.data?.payment_url as string | undefined;
    const bancardTransactionId = response.data?.transaction_id as string | undefined;

    if (!paymentUrl || !bancardTransactionId) {
      throw new Error('Invalid response from Bancard');
    }

    await supabaseAdmin
      .from('payments')
      .update({
        bancard_transaction_id: bancardTransactionId,
        bancard_response: response.data
      })
      .eq('id', payment.id);

    return { payment_url: paymentUrl, transaction_id: bancardTransactionId };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Bancard request failed';
    throw new Error(`Bancard error: ${message}`);
  }
}

export async function capturePaymentForBooking(bookingId: string): Promise<void> {
  const { data: payment, error: paymentError } = await supabaseAdmin
    .from('payments')
    .select('id, payment_status')
    .eq('booking_id', bookingId)
    .single();

  if (paymentError || !payment) {
    throw new Error('Payment record not found');
  }

  if (env.PAYMENT_MODE === 'stub') {
    await supabaseAdmin
      .from('payments')
      .update({
        payment_status: PaymentStatus.Completed,
        completed_at: new Date().toISOString(),
        bancard_response: { mode: 'stub', type: 'capture' }
      })
      .eq('id', payment.id);

    await supabaseAdmin
      .from('booking_requests')
      .update({
        status: BookingStatus.Paid,
        updated_at: new Date().toISOString()
      })
      .eq('id', bookingId);
    return;
  }

  throw new Error('Live capture not configured');
}

export function verifyBancardSignature(rawBody: Buffer, signature: string | undefined): boolean {
  if (!signature) return false;
  const expected = crypto.createHmac('sha256', env.BANCARD_WEBHOOK_SECRET).update(rawBody).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

export async function handleBancardWebhook(payload: Record<string, unknown>): Promise<void> {
  const paymentId = typeof payload.external_transaction_id === 'string' ? payload.external_transaction_id : undefined;
  const status = typeof payload.status === 'string' ? payload.status : undefined;

  if (!paymentId || !status) {
    throw new Error('Invalid webhook payload');
  }

  const { data: payment, error: paymentError } = await supabaseAdmin
    .from('payments')
    .select('id, booking_id')
    .eq('id', paymentId)
    .single();

  if (paymentError || !payment) {
    throw new Error('Payment record not found');
  }

  const normalizedStatus = status.toLowerCase();
  if (normalizedStatus === 'completed') {
    await supabaseAdmin
      .from('payments')
      .update({
        payment_status: PaymentStatus.Completed,
        completed_at: new Date().toISOString(),
        bancard_response: payload
      })
      .eq('id', paymentId);

    await supabaseAdmin
      .from('booking_requests')
      .update({
        status: BookingStatus.Paid,
        updated_at: new Date().toISOString()
      })
      .eq('id', payment.booking_id);
  } else if (normalizedStatus === 'failed') {
    const reason = typeof payload.reason === 'string' ? payload.reason : 'Payment failed';
    await supabaseAdmin
      .from('payments')
      .update({
        payment_status: PaymentStatus.Failed,
        failed_at: new Date().toISOString(),
        failure_reason: reason,
        bancard_response: payload
      })
      .eq('id', paymentId);
  }
}
