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

export function useGetAllAppSettings(page: number, limit: number) {
  const { i18n } = useTranslation();
  const currentLocale = i18n.language;

  const getTheFullUrl = () => {
    let queryParams: Record<string, any> = {};

    queryParams.page = page ? page + 1 : 1;
    queryParams.limit = limit || 10;

    queryParams.sort_order = 'asc';
    queryParams.sort_by = 'display_order';
    queryParams.locale = currentLocale;

    return `${endpoints.appSettings.list}?${new URLSearchParams(queryParams)}`;
  };

  const { data, isLoading, error, isValidating } = useSWR(getTheFullUrl, drivysFetcher);

  const memoizedValue = useMemo(
    () => ({
      appSettings: data?.data as any,
      appSettingsLoading: isLoading,
      appSettingsError: error,
      appSettingsValidating: isValidating,
      totalpages: data?.total || 0,
    }),
    [data?.data, error, isLoading, isValidating]
  );

  const revalidateAppSettings = () => {
    mutate(getTheFullUrl);
  };

  return { ...memoizedValue, revalidateAppSettings };
}

// ----------------------------------------------------------------------

export function updateValue(body: any) {
  const URL = endpoints.appSettings.update;
  const response = drivysCreator([URL, body]);
  return response;
}
