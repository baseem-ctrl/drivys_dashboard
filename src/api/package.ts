import useSWR, { mutate } from 'swr';
import { useMemo, useState } from 'react';
// utils
import { endpoints, drivysFetcher, drivysCreator, drivysSmasher } from 'src/utils/axios';
import { useTranslation } from 'react-i18next';

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
  city_id?: any;
  is_public?: any;
}

export function useGetPackage({
  limit,
  page,
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
  const { i18n } = useTranslation();
  const locale = i18n.language;

  const buildQueryParams = () => {
    const params: Record<string, any> = {
      locale, // always include locale
    };
    if (limit) params.limit = limit;
    if (page) params.page = page;
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
  };

  const url = useMemo(
    () => `${endpoints.package.list}?${new URLSearchParams(buildQueryParams()).toString()}`,
    [
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
    ]
  );

  const { data, error, isLoading, isValidating } = useSWR(url, drivysFetcher, {
    revalidateOnFocus: false,
  });

  const memoizedValue = useMemo(() => {
    const packageData = data?.data || [];
    return {
      packageList: packageData,
      packageLoading: isLoading,
      packageError: error,
      packageValidating: isValidating,
      packageEmpty: !isLoading && packageData.length === 0,
      totalPages: data?.total || 0,
    };
  }, [data?.data, data?.total, error, isLoading, isValidating]);

  const revalidatePackage = () => {
    mutate(url);
  };

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
  const response = drivysSmasher(URL);
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
export function useGetPublicPackage({
  limit,
  page,
  search,
  status,
  is_published,
  min_price,
  max_price,
  number_of_sessions,
  vendor_id,
  city_id,
  is_public,
  category_id,
}: useGetDelivereyParams = {}) {
  const { i18n } = useTranslation();
  const locale = i18n.language; // always required

  // Construct query parameters dynamically
  const queryParams = useMemo(() => {
    const params: Record<string, any> = { locale }; // always include locale
    if (limit) params.limit = limit;
    if (page) params.page = page;
    if (search) params.search = search;
    if (status) params.status = status;
    if (is_published) params.is_published = is_published;
    if (min_price) params.min_price = min_price;
    if (max_price) params.max_price = max_price;
    if (number_of_sessions) params.number_of_sessions = number_of_sessions;
    if (vendor_id) params.vendor_id = vendor_id;
    if (city_id) params.city_id = city_id;
    if (is_public) params.is_public = is_public;
    if (category_id) params.category_id = category_id;

    return params;
  }, [
    limit,
    page,
    search,
    status,
    is_published,
    min_price,
    max_price,
    number_of_sessions,
    vendor_id,
    city_id,
    is_public,
    category_id,
    locale,
  ]);

  const fullUrl = useMemo(
    () => `${endpoints.package.publicList}?${new URLSearchParams(queryParams)}`,
    [queryParams]
  );

  const { data, error, isLoading, isValidating } = useSWR(fullUrl, drivysFetcher, {
    revalidateOnFocus: false,
  });

  const revalidatePackage = () => {
    mutate(fullUrl);
  };

  const memoizedValue = useMemo(() => {
    const packageData = data?.data || [];
    return {
      packageList: packageData,
      packageLoading: isLoading,
      packageError: error,
      packageValidating: isValidating,
      packageEmpty: packageData.length === 0,
      totalPages: data?.total || 0,
    };
  }, [data?.data, data?.total, error, isLoading, isValidating]);

  return {
    ...memoizedValue,
    revalidatePackage,
  };
}
