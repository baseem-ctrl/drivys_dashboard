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
export function useGetLeaveDatesByTrainerId(
  userId: number | string,
  page: number,
  limit: number,
  userType: 'ADMIN' | 'SCHOOL_ADMIN'
) {
  const getLeaveDatesUrl = () => {
    if (userType === 'ADMIN') {
      return `${endpoints.trainer.leaveDates}?trainer_id=${userId}&page=${page}&limit=${limit}`;
    } else if (userType === 'SCHOOL_ADMIN') {
      return `${endpoints.trainer.leaveDatesSchoolAdmin}?trainer_id=${userId}&page=${page}&limit=${limit}`;
    }
    return null;
  };

  const finalUrl = userId ? getLeaveDatesUrl() : null;

  const { data, isLoading, error, isValidating } = useSWR(finalUrl, drivysFetcher);

  const memoizedValue = useMemo(
    () => ({
      leaveDates: data?.data || [],
      totalLeaveDates: data?.total || 0,
      leaveDatesLoading: isLoading,
      leaveDatesError: error,
      leaveDatesValidating: isValidating,
    }),
    [data?.data, data?.total, error, isLoading, isValidating]
  );

  const revalidateLeaveDates = () => {
    if (finalUrl) mutate(finalUrl);
  };

  return { ...memoizedValue, revalidateLeaveDates };
}

// Function to create or update shift
export function createShift(body: Record<string, any>) {
  const response = drivysCreator([endpoints.trainer.shift.create, body]);
  return response;
}

// ----------------------------------------------------------------------
// Function to delete shift by ID
export function deleteShiftById(trainer_id: number | string) {
  const URL = `${endpoints.trainer.shift.delete}?id=${trainer_id}`;
  const response = drivysSmasher(URL);
  return response;
}

export function useGetShiftsByTrainerId(
  trainer_id: number | string,
  userType: 'ADMIN' | 'SCHOOL_ADMIN'
) {
  const getShiftsUrl = () => {
    if (userType === 'ADMIN') {
      return `${endpoints.trainer.shift.get}?trainer_id=${trainer_id}`;
    } else {
      return `${endpoints.trainer.workingHoursSchoolAdmin.getList}?trainer_id=${trainer_id}`;
    }
  };

  const finalUrl = trainer_id ? getShiftsUrl() : null;

  const { data, isLoading, error, isValidating } = useSWR(finalUrl, drivysFetcher);

  const memoizedValue = useMemo(
    () => ({
      shifts: data?.data || [],
      shiftsLoading: isLoading,
      shiftsError: error,
      shiftsValidating: isValidating,
    }),
    [data?.data, error, isLoading, isValidating]
  );

  const revalidateShifts = () => {
    if (finalUrl) mutate(finalUrl);
  };

  return { ...memoizedValue, revalidateShifts };
}
