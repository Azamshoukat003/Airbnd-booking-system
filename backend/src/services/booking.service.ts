import { supabaseAdmin } from '../config/supabase';
import { BookingStatus } from '../types';
import { nightsBetween, validateDateRange } from '../utils/date.utils';

export async function getLastSyncAt(unitId: string): Promise<string | null> {
  const { data, error } = await supabaseAdmin
    .from('sync_logs')
    .select('sync_completed_at')
    .eq('unit_id', unitId)
    .eq('sync_status', 'success')
    .order('sync_completed_at', { ascending: false })
    .limit(1);

  if (error) {
    throw new Error('Failed to fetch last sync timestamp');
  }

  return data?.[0]?.sync_completed_at ?? null;
}

export async function isAvailable(unitId: string, checkIn: string, checkOut: string): Promise<boolean> {
  validateDateRange(checkIn, checkOut);
  const { data, error } = await supabaseAdmin
    .from('availability')
    .select('blocked_date')
    .eq('unit_id', unitId)
    .gte('blocked_date', checkIn)
    .lt('blocked_date', checkOut);

  if (error) {
    throw new Error('Failed to check availability');
  }

  return (data ?? []).length === 0;
}

export async function createBookingRequest(params: {
  unitId: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  checkIn: string;
  checkOut: string;
  specialRequests?: string | null;
}): Promise<{ bookingId: string; totalPrice: number; lastSyncAt: string | null }> {
  const { data: unit, error: unitError } = await supabaseAdmin
    .from('units')
    .select('id, nightly_rate_usd')
    .eq('id', params.unitId)
    .eq('status', 'active')
    .single();

  if (unitError || !unit) {
    throw new Error('Unit not found');
  }

  const available = await isAvailable(params.unitId, params.checkIn, params.checkOut);
  if (!available) {
    throw new Error('Selected dates are not available');
  }

  const nights = nightsBetween(params.checkIn, params.checkOut);
  const totalPrice = Number(unit.nightly_rate_usd) * nights;
  const lastSyncAt = await getLastSyncAt(params.unitId);

  const { data: booking, error: bookingError } = await supabaseAdmin
    .from('booking_requests')
    .insert({
      unit_id: params.unitId,
      guest_name: params.guestName,
      guest_email: params.guestEmail,
      guest_phone: params.guestPhone,
      check_in_date: params.checkIn,
      check_out_date: params.checkOut,
      total_price_usd: totalPrice,
      special_requests: params.specialRequests ?? null,
      status: BookingStatus.Pending,
      last_sync_at_submission: lastSyncAt ?? new Date().toISOString()
    })
    .select('id')
    .single();

  if (bookingError || !booking) {
    throw new Error('Failed to create booking request');
  }

  return { bookingId: booking.id, totalPrice, lastSyncAt };
}
