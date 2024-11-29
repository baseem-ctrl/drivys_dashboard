import useSWR, { mutate } from 'swr';
import { useMemo } from 'react';
// utils
import { endpoints, drivysFetcher } from 'src/utils/axios';

// ----------------------------------------------------------------------

interface UseGetPendingVerificationRequestProps {
  page?: number;
  limit?: number;
  sort_by?: 'asc' | 'desc';
  is_verified?: number;
}

export function useGetPendingVerificationRequest({
  page = 1,
  limit = 10,
  sort_by = 'desc',
  is_verified = 0,
}: UseGetPendingVerificationRequestProps) {
  const getTheFullUrl = () => {
    let queryParams: any = {
      page,
      limit,
      sort_by,
      is_verified,
    };

    return `${endpoints.trainerPendingRequest}?${new URLSearchParams(queryParams)}`;
  };

  const { data, isLoading, error, isValidating } = useSWR(getTheFullUrl, drivysFetcher);

  const memoizedValue = useMemo(
    () => ({
      pendingRequests: data?.data || [],
      pendingRequestsError: error,
      pendingRequestsLoading: isLoading,
      pendingRequestsValidating: isValidating,
      totalPages: data?.total || 0,
    }),
    [data?.data, error, isLoading, isValidating, data?.total]
  );

  const revalidatePendingRequests = () => {
    mutate(getTheFullUrl);
  };

  return { ...memoizedValue, revalidatePendingRequests };
}
