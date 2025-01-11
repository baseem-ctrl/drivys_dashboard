import useSWR, { mutate } from 'swr';
import { useMemo } from 'react';
// utils
import { endpoints, drivysFetcher } from 'src/utils/axios';

// ----------------------------------------------------------------------

export function useGetBookingsSchoolAdmin(filters = {}) {
  const {
    search,
    driver_id,

    booking_status,
    limit,
    page,
    payment_status,
    payment_method,
  } = filters;
  const queryParams = new URLSearchParams();
  if (search !== undefined) queryParams.append('search', search);
  if (driver_id) queryParams.append('driver_id', driver_id);
  if (booking_status !== 'all') queryParams.append('booking_status', booking_status);
  if (payment_status !== undefined) queryParams.append('booking_status', payment_status);
  if (limit !== undefined) queryParams.append('limit', limit);
  if (page !== undefined) queryParams.append('page', page);
  if (payment_method !== undefined && payment_method !== null && payment_method !== '') {
    queryParams.append('payment_method', payment_method);
  }
  if (payment_status !== undefined && payment_status !== null && payment_status !== '') {
    queryParams.append('payment_status', payment_status);
  }
  const URL = `${endpoints.booking.schoolAdmin.getList}?${queryParams.toString()}`;

  const { data, isLoading, error, isValidating } = useSWR(URL, drivysFetcher, {
    revalidateOnFocus: false,
  });

  const memoizedValue = useMemo(() => {
    const bookings = data?.data || [];
    const totalCount = data?.total || 0;
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

export function useGetBookingSchoolAdminById(id: string | number) {
  const URL = `${endpoints.booking.schoolAdmin.getById}?id=${id}`;

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
