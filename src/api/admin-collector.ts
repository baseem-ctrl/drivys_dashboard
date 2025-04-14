import { fetcher, endpoints, drivysFetcher, drivysCreator } from 'src/utils/axios';
import useSWR, { mutate } from 'swr';
import { useMemo } from 'react';

export function useGetAdminCollectorCashInHand(
  trainer_id?: string | null,
  vendor_id?: string | null,
  page: number = 1,
  limit: number = 10,
  search?: string | null,
  cash_clearance_date_from?: string | null,
  cash_clearance_date_to?: string | null
) {
  const getTheFullUrl = () => {
    const queryParams: Record<string, any> = {};

    if (trainer_id) queryParams.trainer_id = trainer_id;
    if (vendor_id) queryParams.vendor_id = vendor_id;
    if (search) queryParams.search = search;
    if (cash_clearance_date_from) queryParams.cash_clearance_date_from = cash_clearance_date_from;
    if (cash_clearance_date_to) queryParams.cash_clearance_date_to = cash_clearance_date_to;
    queryParams.page = page;
    queryParams.limit = limit;

    return `${endpoints.collectorAdminView.collectorCashInHand}?${new URLSearchParams(
      queryParams
    )}`;
  };

  const { data, isLoading, error, isValidating } = useSWR(getTheFullUrl, drivysFetcher);

  const memoizedValue = useMemo(
    () => ({
      cashInHand: data?.data as any,
      cashLoading: isLoading,
      cashError: error,
      cashValidating: isValidating,
      totalPages: data?.total || 0,
    }),
    [data?.data, error, isLoading, isValidating]
  );

  const revalidateCollectorCashInHand = () => {
    mutate(getTheFullUrl);
  };

  return { ...memoizedValue, revalidateCollectorCashInHand };
}

export function collectCashAdmin(body: any) {
  const URL = endpoints.collectorAdminView.collectCash;
  const response = drivysCreator([URL, body]);
  return response;
}

export function useGetCashCollectedListPerTransaction(
  trainer_id?: string | null,
  page: number = 1,
  limit: number = 10
) {
  const getTheFullUrl = () => {
    const queryParams: Record<string, any> = {};

    if (trainer_id) queryParams.trainer_id = trainer_id;
    queryParams.page = page;
    queryParams.limit = limit;

    return `${endpoints.collector.cashCollectedListPerTransaction}?${new URLSearchParams(
      queryParams
    )}`;
  };

  const { data, isLoading, error, isValidating } = useSWR(getTheFullUrl, drivysFetcher);

  const memoizedValue = useMemo(
    () => ({
      cashCollectedList: data?.data as any,
      cashCollectedLoading: isLoading,
      cashCollectedError: error,
      cashCollectedValidating: isValidating,
      totalPages: data?.total || 0,
    }),
    [data?.data, error, isLoading, isValidating]
  );

  const revalidateCashCollectedList = () => {
    mutate(getTheFullUrl);
  };

  return { ...memoizedValue, revalidateCashCollectedList };
}
export function useGetCashCollectedListPerTrainer(
  trainer_id?: string | null,
  page: number = 1,
  limit: number = 10
) {
  const getTheFullUrl = () => {
    const queryParams: Record<string, any> = {};

    if (trainer_id) queryParams.trainer_id = trainer_id;
    queryParams.page = page;
    queryParams.limit = limit;

    return `${endpoints.collector.cashCollectedListPerTrainer}?${new URLSearchParams(queryParams)}`;
  };

  const { data, isLoading, error, isValidating } = useSWR(getTheFullUrl, drivysFetcher);

  const memoizedValue = useMemo(
    () => ({
      cashCollectedList: data?.data as any,
      cashCollectedLoading: isLoading,
      cashCollectedError: error,
      cashCollectedValidating: isValidating,
      totalPages: data?.total || 0,
    }),
    [data?.data, error, isLoading, isValidating]
  );

  const revalidateCashCollectedList = () => {
    mutate(getTheFullUrl);
  };

  return { ...memoizedValue, revalidateCashCollectedList };
}
export function useGetAdminCashCollectedListPerTransaction(
  collector_id?: string | null,
  page: number = 1,
  limit: number = 10
) {
  const getTheFullUrl = () => {
    const queryParams: Record<string, any> = {};

    if (collector_id) queryParams.trainer_id = collector_id;
    queryParams.page = page;
    queryParams.limit = limit;

    return `${endpoints.collectorAdminView.collectorCollectedCashInHand}?${new URLSearchParams(
      queryParams
    )}`;
  };

  const { data, isLoading, error, isValidating } = useSWR(getTheFullUrl, drivysFetcher);

  const memoizedValue = useMemo(
    () => ({
      adminCashCollectedList: data?.data as any,
      adminCashCollectedLoading: isLoading,
      adminCashCollectedError: error,
      adminCashCollectedValidating: isValidating,
      totalPages: data?.total || 0,
    }),
    [data?.data, error, isLoading, isValidating]
  );

  const revalidateAdminCashCollectedList = () => {
    mutate(getTheFullUrl);
  };

  return { ...memoizedValue, revalidateAdminCashCollectedList };
}
