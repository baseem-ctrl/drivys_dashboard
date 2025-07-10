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
  });

  const urlWithLocale = `${
    endpoints.appSettings.list
  }?${baseParams.toString()}&locale=${currentLocale}`;
  const urlWithoutLocale = `${endpoints.appSettings.list}?${baseParams.toString()}`;

  // Primary fetch with locale
  const {
    data: primaryData,
    isLoading: loadingPrimary,
    error: errorPrimary,
    mutate: revalidatePrimary,
  } = useSWR(urlWithLocale, drivysFetcher);

  // Fallback fetch without locale (only if no primaryData)
  const {
    data: fallbackData,
    isLoading: loadingFallback,
    error: errorFallback,
    mutate: revalidateFallback,
  } = useSWR(() => (!primaryData?.data?.length ? urlWithoutLocale : null), drivysFetcher);

  const hasPrimary = primaryData?.data?.length > 0;
  const hasFallback = fallbackData?.data?.length > 0;

  const finalData = hasPrimary ? primaryData : hasFallback ? fallbackData : null;
  const usedFallback = !hasPrimary && hasFallback;

  // Unified revalidate function
  const revalidateAppSettings = async () => {
    await revalidatePrimary();
    if (!primaryData?.data?.length) {
      await revalidateFallback();
    }
  };

  return {
    appSettings: finalData?.data || [],
    appSettingsLoading: loadingPrimary || loadingFallback,
    appSettingsError: errorPrimary || errorFallback,
    appSettingsValidating: !finalData,
    totalpages: finalData?.total || 0,
    usedFallback,
    revalidateAppSettings,
  };
}

// ----------------------------------------------------------------------

export function updateValue(body: any) {
  const URL = endpoints.appSettings.update;
  const response = drivysCreator([URL, body]);
  return response;
}
