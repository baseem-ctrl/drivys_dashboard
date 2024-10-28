import useSWR, { mutate } from 'swr';
import React, { useEffect, useMemo, useState } from 'react';
// utils
import { endpoints, drivysFetcher, drivysCreator, barrySmasher } from 'src/utils/axios';
import { IOrderItem } from 'src/types/order';

// ----------------------------------------------------------------------

export function useGetBookings(filters = {}) {
  const { city_id, category_id, driver_id, booking_status, limit, page } = filters;
  const queryParams = new URLSearchParams();

  if (city_id !== undefined) queryParams.append('city_id', city_id);
  if (category_id !== undefined) queryParams.append('category_id', category_id);
  if (driver_id !== undefined) queryParams.append('driver_id', driver_id);
  if (booking_status !== undefined) queryParams.append('booking_status', booking_status);
  if (limit !== undefined) queryParams.append('limit', limit);
  if (page !== undefined) queryParams.append('page', page);

  const URL = `${endpoints.booking.getList}?${queryParams.toString()}`;

  const { data, isLoading, error, isValidating } = useSWR(URL, drivysFetcher, {
    revalidateOnFocus: false,
  });

  const memoizedValue = useMemo(
    () => ({
      bookings: (data?.data as any) || [],
      bookingsError: error,
      bookingsLoading: isLoading,
      bookingsValidating: isValidating,
    }),
    [data?.data, error, isLoading, isValidating]
  );

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
