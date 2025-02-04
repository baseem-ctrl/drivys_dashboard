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
    };
  }, [data?.data, data?.total, error, isLoading, isValidating]);

  return {
    ...memoizedValue,
    revalidatePayouts,
  };
}
export function processPayoutToTrainer(body: Record<string, any>) {
  const URL = `${endpoints.payouts.payToTrainer}`;
  return drivysCreator([URL, body]);
}
