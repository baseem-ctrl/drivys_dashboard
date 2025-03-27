import { endpoints, drivysFetcher, drivysCreator } from 'src/utils/axios';
import useSWR, { mutate } from 'swr';
import { useMemo } from 'react';

// Fetch collector's cash in hand list
import { fetcher, endpoints, drivysFetcher } from 'src/utils/axios';
import useSWR, { mutate } from 'swr';
import { useMemo } from 'react';

// Fetch collector's cash in hand list with optional filters
export function useGetCollectorCashInHand(
  trainer_id?: string | null,
  vendor_id?: string | null,
  page: number = 1,
  limit: number = 10
) {
  const getTheFullUrl = () => {
    const queryParams: Record<string, any> = {};

    if (trainer_id) queryParams.trainer_id = trainer_id;
    if (vendor_id) queryParams.vendor_id = vendor_id;
    queryParams.page = page;
    queryParams.limit = limit;

    return `${endpoints.collector.getCashInHand}?${new URLSearchParams(queryParams)}`;
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
export function collectCash(body: any) {
  const URL = endpoints.collector.collectCash;
  const response = drivysCreator([URL, body]);
  return response;
}
