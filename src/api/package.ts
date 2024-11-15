import useSWR, { mutate } from 'swr';
import { useMemo, useState } from 'react';
// utils
import { endpoints, drivysFetcher, drivysCreator, barrySmasher } from 'src/utils/axios';

// ----------------------------------------------------------------------

interface useGetDelivereyParams {
  limit?: number;
  page?: number;
  locale?: string;
  search?: string;
  status?: number;
  is_published?: number;
  min_price?: number;
  max_price?: number;
  number_of_sessions?: number;
  vendor_id?: any;
  session_inclusions?: any;
  city?: any;
  is_public?: any;
}

export function useGetPackage({
  limit,
  page,
  locale,
  search,
  status,
  is_published,
  min_price,
  max_price,
  number_of_sessions,
  vendor_id,
  city_id,
  is_public,
}: useGetDelivereyParams = {}) {
  // Construct query parameters dynamically
  const queryParams = useMemo(() => {
    const params: Record<string, any> = {};
    if (limit) params.limit = limit;
    if (page) params.page = page;
    if (locale) params.locale = locale;
    if (search) params.search = search;
    if (status) params.status = status;
    if (is_published) params.is_published = is_published;
    if (min_price) params.min_price = min_price;
    if (max_price) params.max_price = max_price;
    if (number_of_sessions) params.number_of_sessions = number_of_sessions;
    if (vendor_id) params.vendor_id = vendor_id;
    if (city_id) params.city_id = city_id;
    if (is_public) params.is_public = is_public;

    return params;
  }, [
    limit,
    page,
    locale,
    search,
    status,
    is_published,
    min_price,
    max_price,
    number_of_sessions,
    vendor_id,
    city_id,
    is_public,
  ]);

  const fullUrl = useMemo(
    () => `${endpoints.package.list}?${new URLSearchParams(queryParams)}`,
    [queryParams]
  );

  const { data, error, isLoading, isValidating } = useSWR(fullUrl, drivysFetcher, {
    revalidateOnFocus: false,
  });

  const revalidatePackage = () => {
    mutate(fullUrl);
  };

  // Memoize the return value for performance
  const memoizedValue = useMemo(() => {
    const DelivereyData = data?.data || [];
    return {
      packageList: DelivereyData,
      packageLoading: isLoading,
      packageError: error,
      packageValidating: isValidating,
      packageEmpty: DelivereyData.length === 0,
      totalPages: data?.total || 0,
    };
  }, [data?.data, data?.total, error, isLoading, isValidating]);

  return {
    ...memoizedValue,
    revalidatePackage,
  };
}

export function createUpdatePackage(body: any) {
  const URL = endpoints.package.createUpdate;
  const response = drivysCreator([URL, body]);
  return response;
}

export function deletePackage(id: any) {
  const URL = endpoints.package.delete + id;
  const response = barrySmasher(URL);
  return response;
}
export function useGetPackageById(packageId: string) {
  const URL = endpoints.package.details + packageId;

  const { data, isLoading, error, isValidating } = useSWR(URL, drivysFetcher, {
    revalidateOnFocus: false,
  });
  const memoizedValue = useMemo(
    () => ({
      details: (data?.data as any) || {},
      detailsError: error,
      detailsLoading: isLoading,
      detailsValdating: isValidating,
    }),
    [data?.data, error, isLoading, isValidating]
  );

  const revalidateDetails = () => {
    mutate(URL);
  };

  return { ...memoizedValue, revalidateDetails };
}
