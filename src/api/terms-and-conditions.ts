import { drivysFetcher, drivysCreator, endpoints } from 'src/utils/axios';
import useSWR, { mutate } from 'swr';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export function useGetTermsAndConditions(locale: string = 'en') {
  const { i18n } = useTranslation();
  const currentLocale = i18n.language;

  const getUrl = () => {
    const baseUrl = endpoints.termsAndConditions.getList;
    return `${baseUrl}?locale=${locale}`;
  };

  // Primary fetch with locale
  const { data: primaryData, isLoading, error, isValidating } = useSWR(getUrl(true), drivysFetcher);

  // Fallback fetch without locale if primary data is empty
  const { data: fallbackData } = useSWR(
    () => (!primaryData?.data?.length ? getUrl(false) : null),
    drivysFetcher
  );

  const dataToUse = primaryData?.data?.length ? primaryData : fallbackData;

  const memoizedValue = useMemo(
    () => ({
      termsAndConditions: dataToUse?.data || [],
      termsLoading: isLoading,
      termsError: error,
      termsValidating: isValidating,
    }),
    [dataToUse?.data, isLoading, error, isValidating]
  );

  const revalidateTermsAndConditions = () => {
    mutate(getUrl(true));
  };

  return { ...memoizedValue, revalidateTermsAndConditions };
}

export function updateCreateTC(body: any) {
  const URL = endpoints.termsAndConditions.createUpdate;
  const response = drivysCreator([URL, body]);
  return response;
}
