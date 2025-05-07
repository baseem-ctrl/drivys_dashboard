import { drivysFetcher, drivysCreator, endpoints } from 'src/utils/axios';
import useSWR, { mutate } from 'swr';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export function useGetTermsAndConditions() {
  const { i18n } = useTranslation();
  const currentLocale = i18n.language;

  const URL = `${endpoints.termsAndConditions.getList}?locale=${currentLocale}`;

  const { data, isLoading, error, isValidating } = useSWR(URL, drivysFetcher);

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
    mutate(URL);
  };

  return { ...memoizedValue, revalidateTermsAndConditions };
}

export function updateCreateTC(body: any) {
  const URL = endpoints.termsAndConditions.createUpdate;
  const response = drivysCreator([URL, body]);
  return response;
}
