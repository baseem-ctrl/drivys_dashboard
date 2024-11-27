import useSWR, { mutate } from 'swr';
import { useMemo } from 'react';
// utils
import { endpoints, drivysFetcher, drivysCreator } from 'src/utils/axios';

// ----------------------------------------------------------------------

// Function to get the refund request list
export function useGetRefundRequestList(filters = {}) {
  const { search, limit, page, status } = filters;
  const queryParams = new URLSearchParams();
  if (search !== undefined) queryParams.append('search', search);
  if (limit !== undefined) queryParams.append('limit', limit);
  if (page !== undefined) queryParams.append('page', page);
  if (status !== undefined) queryParams.append('status', status);

  const URL = `${endpoints.booking.refund.list}?${queryParams.toString()}`;

  const { data, isLoading, error, isValidating } = useSWR(URL, drivysFetcher, {
    revalidateOnFocus: false,
  });

  const memoizedValue = useMemo(() => {
    const refundRequests = data?.data || [];
    const totalCount = data?.totalCount || 0;
    return {
      refundRequests,
      totalCount,
      refundRequestError: error,
      refundRequestLoading: isLoading,
      refundRequestValidating: isValidating,
    };
  }, [data, error, isLoading, isValidating]);

  const revalidateRefundRequests = () => {
    mutate(URL);
  };

  return { ...memoizedValue, revalidateRefundRequests };
}

// Function to update refund request status
export function updateRefundRequestStatus(body: Record<string, any>) {
  const URL = `${endpoints.booking.refund.update}`;
  return drivysCreator([URL, body]);
}
