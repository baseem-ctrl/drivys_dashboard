import useSWR, { mutate } from 'swr';
import { useMemo } from 'react';
import moment from 'moment';

// utils
import { endpoints, drivysFetcher, drivysCreator } from 'src/utils/axios';
import { useAuthContext } from 'src/auth/hooks';

// ----------------------------------------------------------------------

export function useGetBookings({
  search,
  driver_id,
  booking_type,
  limit,
  page,
  booking_status,
  payment_status,
  payment_method,
  start_date,
  end_date,
}: any) {
  // const { search, driver_id, payment_status, booking_type, limit, page } = filters;
  const queryParams = new URLSearchParams();
  if (search !== undefined) queryParams.append('search', search);
  if (driver_id) queryParams.append('driver_id', driver_id);
  if (
    booking_status !== 'all' &&
    booking_status !== undefined &&
    booking_status !== null &&
    booking_status !== ''
  )
    queryParams.append('booking_status', booking_status);
  if (payment_method !== undefined && payment_method !== null && payment_method !== '') {
    queryParams.append('payment_method', payment_method);
  }

  if (payment_status !== undefined && payment_status !== null && payment_status !== '') {
    queryParams.append('payment_status', payment_status);
  }
  if (start_date !== undefined && start_date !== null && start_date !== '') {
    queryParams.append('start_date', moment(start_date).format('YYYY-MM-DD'));
  }
  if (end_date !== undefined && end_date !== null && end_date !== '') {
    queryParams.append('end_date', moment(end_date).format('YYYY-MM-DD'));
  }

  // if (payment_status !== undefined) queryParams.append('booking_status', payment_status);
  if (limit !== undefined) queryParams.append('limit', limit);
  if (page !== undefined) queryParams.append('page', page);

  const URL = `${endpoints.booking.getList}?${queryParams.toString()}`;

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
// Function to update booking and payment status
export function updatePaymentBookingStatus(body: FormData) {
  const URL = endpoints.booking.updatePaymentBookingStatus;
  return drivysCreator([URL, body]);
}
// Function to get booking status enum
export function useGetBookingStatusEnum() {
  const URL = endpoints.booking.getBookingStatus;

  const { data, isLoading, error, isValidating } = useSWR(URL, drivysFetcher, {
    revalidateOnFocus: false,
  });

  const memoizedValue = useMemo(() => {
    // Access the values directly from the response
    const bookingStatusEnum = data?.values || [];
    return {
      bookingStatusEnum,
      bookingStatusError: error,
      bookingStatusLoading: isLoading,
      bookingStatusValidating: isValidating,
    };
  }, [data, error, isLoading, isValidating]);

  const revalidateBookingStatusEnum = () => {
    mutate(URL);
  };

  return { ...memoizedValue, revalidateBookingStatusEnum };
}
export function useGetPaymentStatusEnum() {
  const URL = endpoints.booking.getPaymentStatus;

  const { data, isLoading, error, isValidating } = useSWR(URL, drivysFetcher, {
    revalidateOnFocus: false,
  });

  const memoizedValue = useMemo(() => {
    // Access the values directly from the response
    const paymentStatusEnum = data?.values || [];
    return {
      paymentStatusEnum,
      paymentStatusError: error,
      paymentStatusLoading: isLoading,
      paymentStatusValidating: isValidating,
    };
  }, [data, error, isLoading, isValidating]);

  const revalidateBookingStatusEnum = () => {
    mutate(URL);
  };

  return { ...memoizedValue, revalidateBookingStatusEnum };
}
// function to fetch booking details by a student's ID
export function useGetBookingByTrainerId(filters: {
  trainer_id: string;
  payment_status?: string | number;
  page?: number;
  limit?: number;
  payment_method?: string;
}) {
  const { user } = useAuthContext();

  const queryParams = new URLSearchParams();

  queryParams.append('driver_id', filters.trainer_id);

  if (filters.page !== undefined) queryParams.append('page', filters.page.toString());
  if (filters.limit !== undefined) queryParams.append('limit', filters.limit.toString());

  if (
    filters.payment_status !== undefined &&
    filters.payment_status !== null &&
    filters.payment_status !== ''
  ) {
    queryParams.append('payment_status', filters.payment_status.toString());
  }

  if (
    filters.payment_method !== undefined &&
    filters.payment_method !== null &&
    filters.payment_method !== ''
  ) {
    queryParams.append('payment_method', filters.payment_method.toString());
  }

  const baseUrl =
    user?.user?.user_type === 'SCHOOL_ADMIN'
      ? endpoints.booking.schoolAdmin.getList
      : endpoints.booking.getList;

  const finalUrl = `${baseUrl}?${queryParams.toString()}`;

  const { data, isLoading, error, isValidating } = useSWR(finalUrl, drivysFetcher, {
    revalidateOnFocus: false,
  });

  const memoizedValue = useMemo(
    () => ({
      bookingTrainerDetails: (data?.data as any) || {},
      totalBookings: data?.total || 0,
      bookingError: error,
      bookingLoading: isLoading,
      bookingValidating: isValidating,
    }),
    [data?.data, data?.total, error, isLoading, isValidating]
  );

  const revalidateBookingDetails = () => {
    mutate(finalUrl);
  };

  return { ...memoizedValue, revalidateBookingDetails };
}

export function useGetSchoolBookingByTrainerId(trainer_id: string) {
  const URL = `${endpoints.booking.schoolAdmin.getList}?driver_id=${trainer_id}`;
  const { data, isLoading, error, isValidating } = useSWR(URL, drivysFetcher, {
    revalidateOnFocus: false,
  });

  const memoizedValue = useMemo(
    () => ({
      bookingTrainerDetails: (data?.data as any) || {},
      bookingError: error,
      bookingLoading: isLoading,
      bookingValidating: isValidating,
    }),
    [data?.data, error, isLoading, isValidating]
  );

  const revalidateBookingDetails = () => {
    mutate(URL);
  };

  return { ...memoizedValue, revalidateBookingDetails };
}
