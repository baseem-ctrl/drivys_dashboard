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

export function useGetAllAppSettings(page: number, limit: number) {
  const getTheFullUrl = () => {
    let queryPrams = {};
    if (page) {
      queryPrams = { ...queryPrams, page: page + 1 };
    } else {
      queryPrams = { ...queryPrams, page: 1 };
    }
    if (limit) {
      queryPrams = { ...queryPrams, limit };
    } else {
      queryPrams = { ...queryPrams, limit: 10 };
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

  const revalidateLanguage = () => {
    mutate(getTheFullUrl);
  };
  return { ...memoizedValue, revalidateLanguage };
}

// ----------------------------------------------------------------------

export function updateValue(body: any) {
  const URL = endpoints.appSettings.update;
  const response = drivysCreator([URL, body]);
  return response;
}
