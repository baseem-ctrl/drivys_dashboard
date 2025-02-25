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

export function useGetAllAppSettings(page: number, limit: number, locale?: string) {
  const getTheFullUrl = () => {
    let queryPrams: Record<string, any> = {};

    queryPrams.page = page ? page + 1 : 1;
    queryPrams.limit = limit || 10;

    if (locale) {
      queryPrams.locale = locale;
    }

    return `${endpoints.appSettings.list}?${new URLSearchParams(queryPrams)}`;
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
