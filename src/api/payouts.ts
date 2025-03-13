import useSWR, { mutate } from 'swr';
import { useMemo, useState } from 'react';
// utils
import { endpoints, drivysFetcher, drivysCreator, drivysSmasher } from 'src/utils/axios';
interface useGetParams {
  limit?: number;
  page?: number;
  trainer_id?: number;
  sort_dir?: string;
  sorting_by?: string;
  vendor_id?: string;
}

export function useGetTrainerPayouts({
  limit,
  page,
  trainer_id,
  sort_dir,
  sorting_by,
  vendor_id,
}: useGetParams = {}) {
  // Construct query parameters dynamically
  const queryParams = useMemo(() => {
    const params: Record<string, any> = {};
    if (limit) params.limit = limit;
    if (page) params.page = page;
    if (trainer_id) params.trainer_id = trainer_id;
    if (vendor_id) params.vendor_id = vendor_id;
    if (sort_dir) params.sort_dir = sort_dir;
    if (sorting_by) params.sorting_by = sorting_by;

    return params;
  }, [limit, page, sorting_by, trainer_id, sort_dir, vendor_id]);

  const fullUrl = useMemo(
    () => `${endpoints.payouts.trainerPayouts}?${new URLSearchParams(queryParams)}`,
    [queryParams]
  );

  const { data, error, isLoading, isValidating } = useSWR(fullUrl, drivysFetcher, {
    revalidateOnFocus: false,
  });

  const revalidatePayouts = () => {
    mutate(fullUrl);
  };
  // Memoize the return value for performance
  const memoizedValue = useMemo(() => {
    return {
      payoutsList: data?.data || [],
      payoutsLoading: isLoading,
      payoutsError: error,
      payoutsValidating: isValidating,
      payoutsEmpty: data?.data?.length === 0,
      totalPages: data?.total || 0,
    };
  }, [data?.data, data?.total, error, isLoading, isValidating]);

  return {
    ...memoizedValue,
    revalidatePayouts,
  };
}
export function useGetSchoolPayouts({
  limit,
  page,
  vendor_id,
  sort_dir,
  sorting_by,
}: useGetParams = {}) {
  // Construct query parameters dynamically
  const queryParams = useMemo(() => {
    const params: Record<string, any> = {};
    if (limit) params.limit = limit;
    if (page) params.page = page;
    if (vendor_id) params.vendor_id = vendor_id;
    if (sort_dir) params.sort_dir = sort_dir;
    if (sorting_by) params.sorting_by = sorting_by;

    return params;
  }, [limit, page, sorting_by, vendor_id, sort_dir]);

  const fullUrl = useMemo(
    () => `${endpoints.payouts.schoolPayouts}?${new URLSearchParams(queryParams)}`,
    [queryParams]
  );

  const { data, error, isLoading, isValidating } = useSWR(fullUrl, drivysFetcher, {
    revalidateOnFocus: false,
  });

  const revalidatePayouts = () => {
    mutate(fullUrl);
  };

  // Memoize the return value for performance
  const memoizedValue = useMemo(() => {
    return {
      payoutsList: data?.data || [],
      payoutsLoading: isLoading,
      payoutsError: error,
      payoutsValidating: isValidating,
      payoutsEmpty: data?.data?.length === 0,
      totalPages: data?.total || 0,
    };
  }, [data?.data, data?.total, error, isLoading, isValidating]);

  return {
    ...memoizedValue,
    revalidatePayouts,
  };
}
export function useGetPayoutsList({ limit, page, vendor_id, trainer_id }: useGetParams = {}) {
  // Construct query parameters dynamically
  const queryParams = useMemo(() => {
    const params: Record<string, any> = {};
    if (limit) params.limit = limit;
    if (page) params.page = page;
    if (vendor_id) params.vendor_id = vendor_id;
    if (trainer_id) params.trainer_id = trainer_id;

    return params;
  }, [limit, page, vendor_id, trainer_id]);

  const fullUrl = useMemo(
    () => `${endpoints.payouts.getList}?${new URLSearchParams(queryParams)}`,
    [queryParams]
  );

  const { data, error, isLoading, isValidating } = useSWR(fullUrl, drivysFetcher, {
    revalidateOnFocus: false,
  });

  const revalidatePayouts = () => {
    mutate(fullUrl);
  };

  // Memoize the return value for performance
  const memoizedValue = useMemo(() => {
    return {
      payoutsList: data?.data || [],
      payoutsLoading: isLoading,
      payoutsError: error,
      payoutsValidating: isValidating,
      payoutsEmpty: data?.data?.length === 0,
      totalPages: data?.total || 0,
      totalRevenueValue: data?.total_revenue_amount_from_bookings,
      totalTrainerEarning: data?.total_trainer_earning_from_bookings,
      totalVendorEarning: data?.total_vendor_earning_from_bookings,
      totalDrivysCommission: data?.total_drivys_commission_from_bookings,
    };
  }, [
    data?.data,
    data?.total,
    error,
    isLoading,
    isValidating,
    data?.total_revenue_amount_from_booking,
    data?.total_trainer_earning_from_bookings,
    data?.total_drivys_commission_from_bookings,
  ]);

  return {
    ...memoizedValue,
    revalidatePayouts,
  };
}
export function processPayoutToTrainer(body: Record<string, any>) {
  const URL = `${endpoints.payouts.payToTrainer}`;
  return drivysCreator([URL, body]);
}
export function processPayoutToSchool(body: Record<string, any>) {
  const URL = `${endpoints.payouts.payToSchool}`;
  return drivysCreator([URL, body]);
}
export function useGetPayoutHistory({
  limit,
  page,
  sort_dir,
  trainer_id,
  payment_method,
  status,
  id,
  amount_min,
  amount_max,
  date_from,
  date_to,
}: {
  limit?: number;
  page?: number;
  sort_dir?: string;
  trainer_id?: number;
  payment_method?: string;
  status?: string;
  id?: number;
  amount_min?: number;
  amount_max?: number;
  date_from?: string;
  date_to?: string;
} = {}) {
  // Construct query parameters dynamically
  const queryParams = useMemo(() => {
    const params = {};
    if (limit) params.limit = limit;
    if (page) params.page = page;
    if (sort_dir) params.sort_dir = sort_dir;
    if (trainer_id) params.trainer_id = trainer_id;
    if (payment_method) params.payment_method = payment_method;
    if (status) params.status = status;
    if (id) params.id = id;
    if (amount_min) params.amount_min = amount_min;
    if (amount_max) params.amount_max = amount_max;
    if (date_from) params.date_from = date_from;
    if (date_to) params.date_to = date_to;

    return params;
  }, [
    limit,
    page,
    sort_dir,
    trainer_id,
    payment_method,
    status,
    id,
    amount_min,
    amount_max,
    date_from,
    date_to,
  ]);

  const fullUrl = useMemo(
    () => `${endpoints.payouts.getPayoutHistory}?${new URLSearchParams(queryParams)}`,
    [queryParams]
  );

  const { data, error, isLoading, isValidating } = useSWR(fullUrl, drivysFetcher, {
    revalidateOnFocus: false,
  });
  const revalidatePayoutHistory = () => {
    mutate(fullUrl);
  };

  // Memoize the return value for performance
  const memoizedValue = useMemo(() => {
    return {
      payoutHistoryList: data?.data || [],
      payoutHistoryLoading: isLoading,
      payoutHistoryError: error,
      payoutHistoryValidating: isValidating,
      payoutHistoryEmpty: data?.data?.length === 0,
      totalPages: data?.total || 0,
    };
  }, [data?.data, data?.total, error, isLoading, isValidating]);

  return {
    ...memoizedValue,
    revalidatePayoutHistory,
  };
}

// Function to fetch the booking by payment status
export function useGetPayoutByBooking({
  limit,
  page,
  trainer_id,
  session_payout_category,
}: {
  limit?: number;
  page?: number;
  trainer_id?: string;
  session_payout_category?: string;
} = {}) {
  const queryParams = useMemo(() => {
    const params: Record<string, any> = {};
    if (limit) params.limit = limit;
    if (page) params.page = page;
    if (trainer_id) params.trainer_id = trainer_id;
    if (session_payout_category) params.session_payout_category = session_payout_category;

    return params;
  }, [limit, page, trainer_id, session_payout_category]);

  const fullUrl = useMemo(
    () => `${endpoints.payouts.getPayoutByBooking}?${new URLSearchParams(queryParams)}`,
    [queryParams]
  );

  const { data, error, isLoading, isValidating } = useSWR(fullUrl, drivysFetcher, {
    revalidateOnFocus: false,
  });

  const revalidatePayoutByBooking = () => {
    mutate(fullUrl);
  };

  // Memoize the return value for performance
  const memoizedValue = useMemo(() => {
    return {
      payoutByBookingList: data?.data || [],
      payoutByBookingLoading: isLoading,
      payoutByBookingError: error,
      payoutByBookingValidating: isValidating,
      payoutByBookingEmpty: data?.data?.length === 0,
      totalPages: data?.total || 0,
      totalPaidValue: data?.total_revenue_amount_from_booking,
    };
  }, [
    data?.data,
    data?.total,
    error,
    isLoading,
    isValidating,
    data?.total_revenue_amount_from_booking,
  ]);

  return {
    ...memoizedValue,
    revalidatePayoutByBooking,
  };
}
