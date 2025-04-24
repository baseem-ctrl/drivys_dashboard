import { endpoints, drivysFetcher } from 'src/utils/axios';
import useSWR, { mutate } from 'swr';
import { useMemo } from 'react';

// Define the types for the parameters
type useGetSupportListParams = {
  user_id?: string;
  limit?: number;
  page?: number;
};

export function useGetSupportList({ user_id, limit = 10, page = 0 }: useGetSupportListParams = {}) {
  const getSupportUrl = () => {
    const queryParams: Record<string, any> = {
      limit: limit || 100,
      page: page ? page + 1 : 1,
    };

    if (user_id) queryParams.user_id = user_id;

    return `${endpoints.support.list}?${new URLSearchParams(queryParams)}`;
  };

  const { data, isLoading, error, isValidating } = useSWR(getSupportUrl, drivysFetcher);

  const memoizedValue = useMemo(
    () => ({
      supports: data?.data as any,
      supportLoading: isLoading,
      supportError: error,
      supportValidating: isValidating,
      totalpages: data?.total || 0,
    }),
    [data?.data, error, isLoading, isValidating]
  );

  const revalidateSupport = () => {
    mutate(getSupportUrl);
  };

  return { ...memoizedValue, revalidateSupport };
}
