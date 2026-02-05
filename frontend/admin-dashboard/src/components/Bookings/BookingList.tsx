import { useEffect, useState } from 'react';
import { api } from '../../utils/api';
import ApprovalButtons from './ApprovalButtons';
import BookingDetails from './BookingDetails';
import { supabase } from '../../context/AuthContext';

interface BookingRow {
  id: string;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  check_in_date: string;
  check_out_date: string;
  total_price_usd: number;
  status: string;
  units?: { name: string } | null;
}

export default function BookingList() {
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [status, setStatus] = useState<string>('');

  const fetchBookings = async () => {
    const { data } = await api.get('/admin/booking-requests', {
      params: status ? { status } : {}
    });
    setBookings(data.data ?? []);
  };

  useEffect(() => {
    void fetchBookings();
  }, [status]);

  useEffect(() => {
    const channel = supabase
      .channel('realtime-bookings')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'booking_requests' }, () => {
        void fetchBookings();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [status]);

  const approve = async (bookingId: string) => {
    await api.post(`/admin/booking-requests/${bookingId}/approve`);
    await fetchBookings();
  };

  const reject = async (bookingId: string) => {
    const reason = prompt('Rejection reason') ?? 'Not available';
    await api.post(`/admin/booking-requests/${bookingId}/reject`, { rejection_reason: reason });
    await fetchBookings();
  };

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Booking requests</h2>
        <select className="rounded-lg border p-2" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="paid">Paid</option>
        </select>
      </div>

      <div className="grid gap-3">
        {bookings.map((booking) => (
          <div key={booking.id} className="card p-4 grid gap-2">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">{booking.units?.name ?? 'Unit'}</h3>
              <span className="text-sm text-black/60">{booking.status}</span>
            </div>
            <BookingDetails booking={booking} />
            {booking.status === 'pending' && (
              <ApprovalButtons onApprove={() => approve(booking.id)} onReject={() => reject(booking.id)} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
