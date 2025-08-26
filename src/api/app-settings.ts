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

  const baseParams = new URLSearchParams({
    page: String(page + 1 || 1),
    limit: String(limit || 10),
    sort_order: 'asc',
    sort_by: 'display_order',
    locale: currentLocale, // always required
  });

  const url = `${endpoints.appSettings.list}?${baseParams.toString()}`;

  const { data, isLoading, error, mutate } = useSWR(url, drivysFetcher);

  const appSettings = data?.data || [];
  const totalPages = data?.total || 0;

  const revalidateAppSettings = () => {
    mutate();
  };

  return {
    appSettings,
    appSettingsLoading: isLoading,
    appSettingsError: error,
    appSettingsValidating: isLoading, // SWR handles validation
    totalPages,
    revalidateAppSettings,
  };
}

// ----------------------------------------------------------------------

export function updateValue(body: any) {
  const URL = endpoints.appSettings.update;
  const response = drivysCreator([URL, body]);
  return response;
}
