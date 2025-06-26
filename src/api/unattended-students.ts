import { endpoints, drivysFetcher, drivysCreator } from 'src/utils/axios';
import useSWR, { mutate } from 'swr';
import { useMemo } from 'react';

export function useGetUnattendedStudents(
  page: number = 1,
  limit: number = 10,
  status?: string | null
) {
  const getTheFullUrl = () => {
    const queryParams: Record<string, any> = {
      page,
      limit,
    };

    if (status) {
      queryParams.status = status;
    }

    return `${endpoints.getUnattendedStudents.list}?${new URLSearchParams(queryParams)}`;
  };

  const { data, isLoading, error, isValidating } = useSWR(getTheFullUrl, drivysFetcher);

  const memoizedValue = useMemo(
    () => ({
      unattendedSessions: data?.data as any,
      unattendedLoading: isLoading,
      unattendedError: error,
      unattendedValidating: isValidating,
      totalPages: data?.total || 0,
    }),
    [data?.data, error, isLoading, isValidating]
  );

  const revalidateUnattendedSessions = () => {
    mutate(getTheFullUrl);
  };

  return { ...memoizedValue, revalidateUnattendedSessions };
}

export function approveOrRejectUnattendedSession(body: any) {
  const URL = endpoints.getUnattendedStudents.approveOrReject;
  return drivysCreator([URL, body]);
}
