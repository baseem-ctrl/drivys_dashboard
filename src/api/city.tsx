import {
  fetcher,
  endpoints,
  drivysCreator,
  drivysFetcher,
  drivysSmasher,
  drivysCreatorPut,
} from 'src/utils/axios';
import useSWR, { mutate } from 'swr';
import React, { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

// Fetch all cities with pagination

export function useGetAllCities(page: number, limit: number) {
  const { i18n } = useTranslation();
  const locale = i18n.language;

  const getTheFullUrl = () => {
    let queryParams: Record<string, any> = {
      page: page ? page + 1 : 1,
      limit: limit || 10,
    };

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

  return memoizedValue;
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
