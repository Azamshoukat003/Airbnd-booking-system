import { useEffect, useState } from 'react';
import { api } from '../../utils/api';
import { supabase } from '../../context/AuthContext';

interface PaymentRow {
  id: string;
  booking_id: string;
  amount_usd: number;
  payment_status: string;
  payment_method: string | null;
  bancard_transaction_id: string | null;
  created_at: string;
}

export default function PaymentHistory() {
  const [payments, setPayments] = useState<PaymentRow[]>([]);

  const fetchPayments = async () => {
    const { data } = await api.get<PaymentRow[]>('/admin/payments');
    setPayments(data);
  };

  useEffect(() => {
    void fetchPayments();
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel('realtime-payments')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'payments' }, () => {
        void fetchPayments();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="card p-4">
      <h2 className="text-2xl font-semibold mb-3">Payments</h2>
      <div className="grid gap-2 text-sm">
        {payments.map((payment) => (
          <div key={payment.id} className="border-b pb-2">
            <p>Booking: {payment.booking_id}</p>
            <p>Amount: ${payment.amount_usd}</p>
            <p>Status: {payment.payment_status}</p>
            <p>Transaction: {payment.bancard_transaction_id ?? 'N/A'}</p>
            <p>Created: {payment.created_at}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
