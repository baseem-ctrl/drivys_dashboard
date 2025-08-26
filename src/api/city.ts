import { fetcher, endpoints, drivysCreator, drivysFetcher, drivysSmasher } from 'src/utils/axios';
import useSWR, { mutate } from 'swr';

import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

// ----------------------------------------------------------------------
export function createCategory(body: any) {
  const URL = endpoints.category.create;
  const response = drivysCreator([URL, body]);
  return response;
}

// ----------------------------------------------------------------------
interface useGetCategoryParams {
  limit?: number;
  page?: number;
  search?: any;
  is_published?: any;
  parent_id?: any;
}
export function useGetAllCity({
  limit,
  page,
  search,
  is_published,
  parent_id,
}: useGetCategoryParams = {}) {
  const { i18n } = useTranslation();
  const locale = i18n.language;

  const buildParams = () => {
    const params: Record<string, any> = {};
    if (limit) params.limit = limit;
    if (page) params.page = page;
    if (search) params.search = search;
    if (parent_id) params.parent_id = parent_id;
    if (is_published || is_published === '0') params.is_published = is_published;
    params.locale = locale; // always required
    return params;
  };

  const url = useMemo(
    () => `${endpoints.city.list}?${new URLSearchParams(buildParams()).toString()}`,
    [limit, page, search, parent_id, is_published, locale]
  );

  const { data, isLoading, error, isValidating } = useSWR(url, drivysFetcher);

  const memoizedValue = useMemo(
    () => ({
      city: data?.data || [],
      cityLoading: isLoading,
      cityError: error,
      cityValidating: isValidating,
      cityEmpty: !isLoading && data?.data?.length === 0,
      totalpages: data?.total || 0,
    }),
    [data?.data, error, isLoading, isValidating, data?.total]
  );

  const revalidateCategory = () => {
    mutate(url);
  };

  return { ...memoizedValue, revalidateCategory };
}

export function useGetAllCities(page: number, limit: number, searchQuery: string) {
  const { i18n } = useTranslation();
  const locale = i18n.language;

  const buildParams = () => {
    const params: Record<string, any> = {
      limit: limit || 100,
      page: page ? page + 1 : 1,
    };
    if (searchQuery) params.search = searchQuery;
    params.locale = locale; // always required
    return params;
  };

  const url = useMemo(
    () => `${endpoints.city.getByList}?${new URLSearchParams(buildParams()).toString()}`,
    [page, limit, searchQuery, locale]
  );

  const { data, isLoading, error, isValidating } = useSWR(url, drivysFetcher);

  const memoizedValue = useMemo(
    () => ({
      cities: data?.data || [],
      cityLoading: isLoading,
      cityError: error,
      cityValidating: isValidating,
      totalpages: data?.total || 0,
    }),
    [data?.data, error, isLoading, isValidating, data?.total]
  );

  const revalidateCities = () => {
    mutate(url);
  };

  return { ...memoizedValue, revalidateCities };
}

// ----------------------------------------------------------------------
export function useGetCityById(cityId: number | string) {
  const getCityUrl = () => `admin/city/get-city/${cityId}`;

  const { data, isLoading, error, isValidating } = useSWR(
    cityId ? getCityUrl() : null,
    drivysFetcher
  );

  const memoizedValue = useMemo(
    () => ({
      city: data?.data as any,
      cityLoading: isLoading,
      cityError: error,
      cityValidating: isValidating,
    }),
    [data?.data, error, isLoading, isValidating]
  );
  const revalidate = () => {
    mutate(getCityUrl);
  };
  return { ...memoizedValue, revalidate };
}
// Delete a city by ID :to do
export function deleteCity(id: any) {
  const URL = endpoints.city.delete + id;
  const response = drivysSmasher(URL);
  return response;
}

// ----------------------------------------------------------------------

// Create or update city translation
export function createCityTranslation(body: any) {
  const URL = endpoints.city.createTranslation; // Update this line if the endpoint is different
  const response = drivysCreator([URL, body]);
  return response;
}

// ----------------------------------------------------------------------

// Update city translation
export function updateCityTranslation(body: FormData) {
  const URL = endpoints.city.updateTranslation; // Ensure this matches your API
  const response = drivysCreator([URL, body]);
  return response;
}

// ----------------------------------------------------------------------

// Create or update package-city mapping
export function createPackageCity(body: any) {
  const URL = endpoints.city.createPackage; // Referring to your defined endpoint
  const response = drivysCreator([URL, body]);
  return response;
}

// Delete a package-city mapping by ID
export function deletePackageCityById(packageId: number | string) {
  const URL = `${endpoints.city.deletePackageList}${packageId}`;
  const response = drivysSmasher(URL);
  return response;
}

// Get the full list of package-city mappings
interface UseGetPackageCityListParams {
  city_id?: string;
  page?: any;
  limit?: any;
}

export function useGetPackageCityList({ city_id, page, limit }: UseGetPackageCityListParams = {}) {
  const { i18n } = useTranslation();
  const locale = i18n.language;

  const buildParams = () => {
    const params: Record<string, any> = {};
    if (city_id) params.city_id = city_id;
    if (page) params.page = page + 1;
    if (limit) params.limit = limit;
    params.locale = locale; // always required
    return params;
  };

  const url = useMemo(
    () => `${endpoints.city.getPackageList}?${new URLSearchParams(buildParams()).toString()}`,
    [city_id, page, limit, locale]
  );

  const { data, error, isLoading, isValidating } = useSWR(url, drivysFetcher, {
    revalidateOnFocus: false,
  });

  const packageCityList = data?.data || [];

  const memoizedValue = useMemo(
    () => ({
      packageCityList,
      packageCityListLoading: isLoading,
      packageCityListError: error,
      packageCityListValidating: isValidating,
      packageCityListEmpty: !isLoading && packageCityList.length === 0,
      totalPages: data?.total || 0,
    }),
    [packageCityList, error, isLoading, isValidating, data?.total]
  );

  const revalidatePackage = () => {
    mutate(url);
  };

  return {
    ...memoizedValue,
    revalidatePackage,
  };
}

// export function deleteCategory(category_translation_id: any, pictures_ids: any) {
//   const URL =
//     endpoints.category.delete +
//     '?category_translation_id=' +
//     category_translation_id +
//     '&' +
//     'pictures_ids[]=' +
//     pictures_ids;
//   const response = drivysSmasher(URL);
//   return response;
// }

// export function deleteCategoryById(id: any) {
//   const URL = endpoints.category.deleteId + id;
//   const response = drivysSmasher(URL);
//   return response;
// }
// Create or update package-city mapping
export function updateRescheduleBulk(body: any) {
  const URL = endpoints.city.updateResheduleBulk;
  const response = drivysCreator([URL, body]);
  return response;
}
