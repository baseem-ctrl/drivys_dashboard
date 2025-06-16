import { useTranslation } from 'react-i18next';
import { endpoints, drivysCreator, drivysFetcher } from 'src/utils/axios';
import useSWR, { mutate } from 'swr';
import { useMemo } from 'react';

interface BookingListParams {
  city_id?: any;
  category_id?: any;
  trainer_id?: any;
  student_id?: any;
  booking_status?: any;
  is_payment_approved?: any;
  id?: any;
  limit?: any;
  page?: any;
  search?: any;
}

export function useGetBookingList(params: BookingListParams) {
  const getBookingUrl = () => {
    const {
      city_id,
      category_id,
      trainer_id,
      student_id,
      booking_status,
      is_payment_approved,
      id,
      limit = 10,
      page = 0,

      search,
    } = params;

    const queryParams: Record<string, any> = {
      limit,
      page: page + 1,
    };

    const optionalParams = {
      city_id,
      category_id,
      trainer_id,
      student_id,
      booking_status,
      is_payment_approved,
      id,
      search,
    };

    Object.entries(optionalParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams[key] = value;
      }
    });

    return `${endpoints.assistant.booking.list}?${new URLSearchParams(queryParams)}`;
  };

  const { data, isLoading, error, isValidating } = useSWR(getBookingUrl, drivysFetcher);

  const memoizedValue = useMemo(
    () => ({
      bookings: data?.data || [],
      bookingListLoading: isLoading,
      bookingListError: error,
      bookingListValidating: isValidating,
      totalBookingPages: data?.total || 0,
    }),
    [data?.data, error, isLoading, isValidating]
  );

  const revalidateBookingList = () => {
    mutate(getBookingUrl);
  };

  return { ...memoizedValue, revalidateBookingList };
}

export function createBooking(body: any) {
  const URL = endpoints.assistant.booking.create;
  const response = drivysCreator([URL, body]);
  return response;
}
