import { fetcher, endpoints, drivysCreator, drivysFetcher, drivysSmasher } from 'src/utils/axios';
import useSWR, { mutate } from 'swr';

import React, { useEffect, useMemo, useState } from 'react';

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
  const queryParams = useMemo(() => {
    const params: Record<string, any> = {};
    if (limit) params.limit = limit;
    if (page) params.page = page;
    if (search) params.search = search;
    if (parent_id) params.parent_id = parent_id;
    if (is_published || is_published === '0') params.is_published = is_published;

    return params;
  }, [limit, page, search, parent_id, is_published]);
  const getTheFullUrl = useMemo(
    () => `${endpoints.city.list}?${new URLSearchParams(queryParams)}`,
    [queryParams]
  );

  const { data, isLoading, error, isValidating } = useSWR(getTheFullUrl, drivysFetcher);

  const memoizedValue = useMemo(
    () => ({
      city: data?.data as any,
      cityLoading: isLoading,
      cityError: error,
      cityValidating: isValidating,
      cityEmpty: !isLoading && data?.data?.length === 0,
      totalpages: data?.total || 0,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data?.data, error, isLoading, isValidating]
  );
  const revalidateCategory = () => {
    mutate(getTheFullUrl);
  };
  return { ...memoizedValue, revalidateCategory };
}
export function useGetAllCities(page: number, limit: number, searchQuery: string, locale: string) {
  const getTheFullUrl = () => {
    let queryParams: any = {
      limit: limit || 100,
      page: page ? page + 1 : 1,
    };

    // Add search query and locale to the request if provided
    if (searchQuery) {
      queryParams.search = searchQuery;
    }

    if (locale) {
      queryParams.locale = locale;
    }

    return `${endpoints.city.getByList}?${new URLSearchParams(queryParams)}`;
  };

  const { data, isLoading, error, isValidating } = useSWR(getTheFullUrl, drivysFetcher);
  const memoizedValue = useMemo(
    () => ({
      cities: data?.data as any,
      cityLoading: isLoading,
      cityError: error,
      cityValidating: isValidating,
      totalpages: data?.total || 0,
    }),
    [data?.data, error, isLoading, isValidating]
  );

  const revalidateCities = () => {
    mutate(getTheFullUrl);
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
  const queryParams = useMemo(() => {
    const params: Record<string, any> = {};
    if (city_id) params.city_id = city_id;
    if (page) params.page = page + 1;
    if (limit) params.limit = limit;

    return params;
  }, [city_id, page, limit]);

  const fullUrl = useMemo(
    () => `${endpoints.city.getPackageList}?${new URLSearchParams(queryParams)}`,
    [queryParams]
  );

  const { data, error, isLoading, isValidating } = useSWR(fullUrl, drivysFetcher, {
    revalidateOnFocus: false,
  });

  const revalidatePackage = () => {
    mutate(fullUrl);
  };

  const memoizedValue = useMemo(() => {
    const packageCityList = data?.data || [];
    return {
      packageCityList,
      packageCityListLoading: isLoading,
      packageCityListError: error,
      packageCityListValidating: isValidating,
      packageCityListEmpty: packageCityList.length === 0,
      totalPages: data?.total || 0,
    };
  }, [data?.data, error, isLoading, isValidating]);

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
