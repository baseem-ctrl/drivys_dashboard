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

export function scheduleRemainingBooking(body: any) {
  const URL = endpoints.assistant.booking.scheduleRemainingSession;
  const response = drivysCreator([URL, body]);
  return response;
}
interface PayoutListParams {
  student_id?: any;
  booking_id?: any;
  is_approved?: any;
  payment_status?: any;
  limit?: number;
  page?: number;
}

export function useGetPayoutList(params: PayoutListParams) {
  const getPayoutUrl = () => {
    const { student_id, booking_id, is_approved, payment_status, limit = 10, page = 0 } = params;

    const queryParams: Record<string, any> = {
      limit,
      page: page + 1,
    };

    const optionalParams = {
      student_id,
      booking_id,
      is_approved,
      payment_status,
    };

    Object.entries(optionalParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams[key] = value;
      }
    });

    return `${endpoints.assistant.payout.list}?${new URLSearchParams(queryParams)}`;
  };

  const { data, isLoading, error, isValidating } = useSWR(getPayoutUrl, drivysFetcher);

  const memoizedValue = useMemo(
    () => ({
      payouts: data?.data || [],
      payoutListLoading: isLoading,
      payoutListError: error,
      payoutListValidating: isValidating,
      totalPayoutPages: data?.total || 0,
    }),
    [data?.data, error, isLoading, isValidating]
  );

  const revalidatePayoutList = () => {
    mutate(getPayoutUrl);
  };

  return { ...memoizedValue, revalidatePayoutList };
}
interface CommissionListParams {
  page?: number;
  limit?: number;
}

export function useGetCommissionList(params: CommissionListParams) {
  const getCommissionUrl = () => {
    const { limit = 10, page = 0 } = params;

    const queryParams: Record<string, any> = {
      limit,
      page: page + 1,
    };

    return `${endpoints.assistant.commission.list}?${new URLSearchParams(queryParams)}`;
  };

  const { data, isLoading, error, isValidating } = useSWR(getCommissionUrl, drivysFetcher);

  const memoizedValue = useMemo(
    () => ({
      commissions: data?.data || [],
      commissionListLoading: isLoading,
      commissionListError: error,
      commissionListValidating: isValidating,
      totalCommissionPages: data?.total || 0,
    }),
    [data?.data, error, isLoading, isValidating]
  );

  const revalidateCommissionList = () => {
    mutate(getCommissionUrl);
  };

  return { ...memoizedValue, revalidateCommissionList };
}
interface PaymentSummaryParams {
  trainer_id?: string;
  student_id?: string;
  package_id?: string;
}

export function useGetPaymentSummary(params: PaymentSummaryParams) {
  const getPaymentSummaryUrl = () => {
    const queryParams: Record<string, any> = {};

    if (params.trainer_id) queryParams.trainer_id = params.trainer_id;
    if (params.student_id) queryParams.student_id = params.student_id;
    if (params.package_id) queryParams.package_id = params.package_id;

    return `${endpoints.assistant.paymentSummary.list}?${new URLSearchParams(queryParams)}`;
  };

  const { data, isLoading, error, isValidating } = useSWR(getPaymentSummaryUrl, drivysFetcher);

  const memoizedValue = useMemo(
    () => ({
      paymentSummary: data?.data || null,
      paymentSummaryLoading: isLoading,
      paymentSummaryError: error,
      paymentSummaryValidating: isValidating,
    }),
    [data?.data, error, isLoading, isValidating]
  );

  const revalidatePaymentSummary = () => {
    mutate(getPaymentSummaryUrl);
  };

  return { ...memoizedValue, revalidatePaymentSummary };
}
