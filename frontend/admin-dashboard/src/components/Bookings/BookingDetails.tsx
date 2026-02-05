interface BookingDetailsProps {
  booking: {
    guest_name: string;
    guest_email: string;
    guest_phone: string;
    check_in_date: string;
    check_out_date: string;
    total_price_usd: number;
    status: string;
  };
}

export default function BookingDetails({ booking }: BookingDetailsProps) {
  return (
    <div className="text-sm text-black/70">
      <p>Guest: {booking.guest_name}</p>
      <p>Email: {booking.guest_email}</p>
      <p>Phone: {booking.guest_phone}</p>
      <p>Dates: {booking.check_in_date} ? {booking.check_out_date}</p>
      <p>Total: ${booking.total_price_usd}</p>
      <p>Status: {booking.status}</p>
    </div>
  );
}
