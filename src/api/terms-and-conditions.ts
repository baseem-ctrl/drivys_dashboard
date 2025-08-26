import { drivysFetcher, drivysCreator, endpoints } from 'src/utils/axios';
import useSWR, { mutate } from 'swr';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export function useGetTermsAndConditions(locale?: string) {
  const { i18n } = useTranslation();
  const currentLocale = locale || i18n.language; // always use a locale

  const fullUrl = useMemo(
    () => `${endpoints.termsAndConditions.getList}?locale=${currentLocale}`,
    [currentLocale]
  );

  const { data, isLoading, error, isValidating } = useSWR(fullUrl, drivysFetcher);

  const memoizedValue = useMemo(
    () => ({
      termsAndConditions: data?.data || [],
      termsLoading: isLoading,
      termsError: error,
      termsValidating: isValidating,
    }),
    [data?.data, isLoading, error, isValidating]
  );

  const revalidateTermsAndConditions = () => {
    mutate(fullUrl);
  };

  return { ...memoizedValue, revalidateTermsAndConditions };
}

export function updateCreateTC(body: any) {
  const URL = endpoints.termsAndConditions.createUpdate;
  const response = drivysCreator([URL, body]);
  return response;
}
