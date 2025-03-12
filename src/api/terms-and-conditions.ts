import { drivysFetcher, drivysCreator, endpoints } from 'src/utils/axios';
import useSWR, { mutate } from 'swr';
import { useMemo } from 'react';

export function useGetTermsAndConditions() {
  const URL = endpoints.termsAndConditions.getList;

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
