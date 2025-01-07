import useSWR, { mutate } from 'swr';
import { useMemo } from 'react';
// utils
import { endpoints, drivysFetcher, drivysCreator } from 'src/utils/axios';
import { useAuthContext } from 'src/auth/hooks';

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
  search = '',
}: UseGetPendingVerificationRequestProps) {
  const { user } = useAuthContext();

  const getTheFullUrl = () => {
    let queryParams: any = {
      page,
      limit,
      sort_by,
      is_verified,
    };
    if (search) {
      queryParams.search = search;
    }
    if (user?.user?.user_type === 'SCHOOL_ADMIN') {
      queryParams.is_school_verified = 0;
      return `${endpoints.pendingRequest.schoolAdminTrainerPendingRequest}?${new URLSearchParams(
        queryParams
      )}`;
    } else {
      return `${endpoints.pendingRequest.trainerPendingRequest}?${new URLSearchParams(
        queryParams
      )}`;
    }
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
export function updateUserVerificationAdmin(body: any) {
  const URL = endpoints.pendingRequest.rejectAcceptPendingRequest;
  const response = drivysCreator([URL, body]);
  return response;
}
export function updateUserVerificationSchool(body: any) {
  const URL = endpoints.pendingRequest.updateVerificationStatus;
  const response = drivysCreator([URL, body]);
  return response;
}
