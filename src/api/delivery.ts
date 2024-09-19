import useSWR, { mutate } from 'swr';
import { useMemo } from 'react';
// utils
import { endpoints, barryFetcher, barryCreator, barrySmasher } from 'src/utils/axios';

// ----------------------------------------------------------------------

interface useGetDelivereyParams {
  limit?: number;
  page?: number;
  locale?: string;
  search?: string;
  start_time?: number;
  end_time?: number;
  max_orders?: number;
  published?: number;
  day_of_week?: number;
}

export function useGetDeliverey({
  limit,
  page,
  locale,
  search,
  start_time,
  end_time,
  max_orders,
  published,
  day_of_week,
}: useGetDelivereyParams = {}) {
  // Construct query parameters dynamically
  const queryParams = useMemo(() => {
    const params: Record<string, any> = {};
    if (limit) params.limit = limit;
    if (page) params.page = page;
    if (locale) params.locale = locale;
    if (search) params.search = search;
    if (start_time) params.start_time = start_time;
    if (end_time) params.end_time = end_time;
    if (max_orders) params.max_orders = max_orders;
    if (published) params.published = published;
    if (day_of_week) params.day_of_week = day_of_week;
    return params;
  }, [limit, page, locale, search, start_time, end_time, max_orders, published, day_of_week]);

  const fullUrl = useMemo(
    () => `${endpoints.deliverey.list}?${new URLSearchParams(queryParams)}`,
    [queryParams]
  );

  const { data, error, isLoading, isValidating } = useSWR(fullUrl, barryFetcher, {
    revalidateOnFocus: false,
  });

  const revalidateDeliverey = () => {
    mutate(fullUrl);
  };

  // Memoize the return value for performance
  const memoizedValue = useMemo(() => {
    const DelivereyData = data?.data || [];
    return {
      delivereyList: DelivereyData,
      delivereyLoading: isLoading,
      delivereyError: error,
      delivereyValidating: isValidating,
      delivereyEmpty: DelivereyData.length === 0,
      totalPages: data?.total || 0,
    };
  }, [data?.data, data?.total, error, isLoading, isValidating]);

  return {
    ...memoizedValue,
    revalidateDeliverey,
  };
}

export function createDelivery(body: any) {
  const URL = endpoints.deliverey.create;
  const response = barryCreator([URL, body]);
  return response;
}
export function updateDelivery(body: any) {
  const URL = endpoints.deliverey.update;
  const response = barryCreator([URL, body]);
  return response;
}

export function deleteDelivery(id: any) {
  const URL = endpoints.deliverey.delete + id;
  const response = barrySmasher(URL);
  return response;
}
