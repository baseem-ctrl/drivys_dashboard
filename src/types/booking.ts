export type IBookingItem = {
  id?: number;
  user: {
    id: number;
    name: string;
    email?: string;
  };
  driver?: {
    id: number;
    name: string;
  };
  booking_method: 'online' | 'offline';
  payment_status: 'paid' | 'pending' | 'failed';
  total: number;
  created_at: string;
  sessions: Array<{
    session_id: number;
    start_time: string;
    end_time: string;
  }>;
};
