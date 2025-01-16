import { endpoints, drivysCreator, drivysFetcher, drivysSmasher } from 'src/utils/axios';
import useSWR, { mutate } from 'swr';
import { useMemo } from 'react';

// ----------------------------------------------------------------------
// Function to create or update working hours
export function createOrUpdateWorkingHours(body: any) {
  const URL = endpoints.trainer.workingHours.createUpdate;
  const response = drivysCreator([URL, body]);
  return response;
}

// ----------------------------------------------------------------------
// Function to delete working hours by ID
export function deleteWorkingHoursById(id: number | string) {
  const URL = `admin/trainer-working-hours/delete-by-id?id=${id}`;
  const response = drivysSmasher(URL);
  return response;
}

// ----------------------------------------------------------------------
// Function to get working hours by user ID
export function useGetWorkingHoursByUserId(userId: number | string) {
  const getWorkingHoursUrl = () =>
    `${endpoints.trainer.workingHours.getByUserId}?user_id=${userId}&limit=10000`;

  const { data, isLoading, error, isValidating } = useSWR(
    userId ? getWorkingHoursUrl() : null,
    drivysFetcher
  );

  const memoizedValue = useMemo(
    () => ({
      workingHours: data?.data as any,
      workingHoursLoading: isLoading,
      workingHoursError: error,
      workingHoursValidating: isValidating,
    }),
    [data?.data, error, isLoading, isValidating]
  );

  const revalidateWorkingHours = () => {
    mutate(getWorkingHoursUrl);
  };

  return { ...memoizedValue, revalidateWorkingHours };
}

// ----------------------------------------------------------------------
// Function to list all working hours (if needed)
export function useGetAllWorkingHours({
  limit = 10,
  page = 1,
}: {
  limit?: number;
  page?: number;
} = {}) {
  const getAllWorkingHoursUrl = () => {
    const queryParams = {
      limit,
      page,
    };

    return `${endpoints.trainer.workingHours.getList}?${new URLSearchParams(queryParams)}`;
  };

  const { data, isLoading, error, isValidating } = useSWR(getAllWorkingHoursUrl, drivysFetcher);

  const memoizedValue = useMemo(
    () => ({
      workingHours: data?.data as any,
      workingHoursLoading: isLoading,
      workingHoursError: error,
      workingHoursValidating: isValidating,
      totalpages: data?.total || 0,
    }),
    [data?.data, error, isLoading, isValidating]
  );

  const revalidateWorkingHours = () => {
    mutate(getAllWorkingHoursUrl);
  };

  return { ...memoizedValue, revalidateWorkingHours };
}
export function useGetLeaveDatesByTrainerId(userId: number | string) {
  const getLeaveDatesUrl = () => `${endpoints.trainer.leaveDates}?trainer_id=${userId}`;

  const { data, isLoading, error, isValidating } = useSWR(
    userId ? getLeaveDatesUrl() : null,
    drivysFetcher
  );

  const memoizedValue = useMemo(
    () => ({
      leaveDates: data?.data as any,
      leaveDatesLoading: isLoading,
      leaveDatesError: error,
      leaveDatesValidating: isValidating,
    }),
    [data?.data, error, isLoading, isValidating]
  );

  const revalidateLeaveDates = () => {
    mutate(getLeaveDatesUrl);
  };

  return { ...memoizedValue, revalidateLeaveDates };
}
