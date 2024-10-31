import useSWR, { mutate } from 'swr';
import { useMemo } from 'react';
// utils
import { endpoints, drivysFetcher } from 'src/utils/axios';

// ----------------------------------------------------------------------

export function useGetBookings(filters = {}) {
  console.log('filters from api', filters);
  const { search, driver_id, payment_status, booking_type, limit, page } = filters;
  const queryParams = new URLSearchParams();
  if (search !== undefined) queryParams.append('search', search);
  if (driver_id) queryParams.append('driver_id', driver_id);
  if (booking_type) queryParams.append('booking_type', booking_type);
  if (payment_status !== undefined) queryParams.append('booking_status', payment_status);
  if (limit !== undefined) queryParams.append('limit', limit);
  if (page !== undefined) queryParams.append('page', page);

  const URL = `${endpoints.booking.getList}?${queryParams.toString()}`;

  const { data, isLoading, error, isValidating } = useSWR(URL, drivysFetcher, {
    revalidateOnFocus: false,
  });

  const memoizedValue = useMemo(() => {
    const bookings = data?.data || [];
    const totalCount = data?.totalCount || 0;
    return {
      bookings,
      totalCount,
      bookingsError: error,
      bookingsLoading: isLoading,
      bookingsValidating: isValidating,
    };
  }, [data, error, isLoading, isValidating]);

  const revalidateBookings = () => {
    mutate(URL);
  };

  return { ...memoizedValue, revalidateBookings };
}

export function useGetBookingById(id: string | number) {
  const URL = `${endpoints.booking.getById}?id=${id}`;

  const { data, isLoading, error, isValidating } = useSWR(URL, drivysFetcher, {
    revalidateOnFocus: false,
  });

  const memoizedValue = useMemo(
    () => ({
      bookingDetails: (data?.data as any) || {},
      bookingError: error,
      bookingLoading: isLoading,
      bookingValidating: isValidating,
    }),
    [data?.data, error, isLoading, isValidating]
  );

  const revalidateBooking = () => {
    mutate(URL);
  };

  return { ...memoizedValue, revalidateBooking };
}
