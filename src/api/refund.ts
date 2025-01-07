import useSWR, { mutate } from 'swr';
import { useMemo } from 'react';
// utils
import { endpoints, drivysFetcher, drivysCreator } from 'src/utils/axios';

// ----------------------------------------------------------------------

// Function to get the refund request list
export function useGetRefundRequestList(filters = {}) {
  const { city_id, category_id, driver_id, page, limit, search } = filters;

  const queryParams = new URLSearchParams();

  if (city_id !== undefined) queryParams.append('city_id', city_id);
  if (category_id !== undefined) queryParams.append('category_id', category_id);
  if (page !== undefined) queryParams.append('page', page);
  if (limit !== undefined) queryParams.append('limit', limit);
  if (driver_id !== undefined) queryParams.append('driver_id', driver_id);
  if (search !== undefined && search.trim() !== '') queryParams.append('search', search);

  const URL = `${endpoints.booking.refund.list}?${queryParams.toString()}`;

  const { data, isLoading, error, isValidating } = useSWR(URL, drivysFetcher, {
    revalidateOnFocus: false,
  });

  const memoizedValue = useMemo(() => {
    const refundRequests = data?.data || [];
    const totalCount = data?.total || 0;

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
// Function to get the refunded  list
export function useGetRefundedList(filters = {}) {
  const { city_id, category_id, driver_id, page, limit } = filters;
  const queryParams = new URLSearchParams();
  if (city_id !== undefined) queryParams.append('city_id', city_id);
  if (category_id !== undefined) queryParams.append('category_id', category_id);
  if (page !== undefined) queryParams.append('page', page);
  if (limit !== undefined) queryParams.append('limit', limit);
  if (driver_id !== undefined) queryParams.append('driver_id', driver_id);

  const URL = `${endpoints.booking.refund.refundedList}?${queryParams.toString()}`;

  const { data, isLoading, error, isValidating } = useSWR(URL, drivysFetcher, {
    revalidateOnFocus: false,
  });

  const memoizedValue = useMemo(() => {
    const refundedRequests = data?.data || [];

    const totalRefundedCount = data?.total || 0;
    return {
      refundedRequests,
      totalRefundedCount,
      refundRequestError: error,
      refundedRequestLoading: isLoading,
      refundRequestValidating: isValidating,
    };
  }, [data, error, isLoading, isValidating]);

  const revalidateRefundedRequests = () => {
    mutate(URL);
  };

  return { ...memoizedValue, revalidateRefundedRequests };
}
