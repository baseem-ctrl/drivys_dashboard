import { useTranslation } from 'react-i18next';
import { endpoints, drivysCreator, drivysFetcher } from 'src/utils/axios';
import useSWR, { mutate } from 'swr';
import { useMemo } from 'react';

interface StudentListParams {
  page?: number;
  limit?: number;
  search?: string;
  is_active?: number | string;
  id?: number | string;
  sort_dir?: 'asc' | 'desc';
}

export function useGetStudentList(params: StudentListParams) {
  const getTheFullUrl = () => {
    const { page = 0, limit = 10, search, is_active, id, sort_dir = 'asc' } = params;

    const queryParams: Record<string, any> = {
      page: page + 1,
      limit,

      sort_dir,
    };

    if (search !== undefined) queryParams.search = search;
    if (is_active !== undefined) queryParams.is_active = is_active;
    if (id !== undefined) queryParams.id = id;

    return `${endpoints.assistant.student.list}?${new URLSearchParams(queryParams)}`;
  };

  const { data, isLoading, error, isValidating } = useSWR(getTheFullUrl, drivysFetcher);

  const memoizedValue = useMemo(
    () => ({
      students: data?.data || [],
      studentListLoading: isLoading,
      studentListError: error,
      studentListValidating: isValidating,
      totalStudentPages: data?.total || 0,
    }),
    [data?.data, error, isLoading, isValidating]
  );

  const revalidateStudentList = () => {
    mutate(getTheFullUrl);
  };

  return { ...memoizedValue, revalidateStudentList };
}

export function updateProfile(body: any) {
  const URL = endpoints.assistant.updateProfile;
  const response = drivysCreator([URL, body]);
  return response;
}

export function addStudent(body: any) {
  const URL = endpoints.assistant.student.addStudent;
  const response = drivysCreator([URL, body]);
  return response;
}

interface TrainerListParams {
  page?: number;
  limit?: number;
  search?: string;
  gender?: string;
  is_pickup_enabled?: boolean;
  city_id?: string;
  language_spoken?: string;
  vehicle_type_id?: string;
  gear?: string;
  vendor_id?: string;
  with_all_trainers?: boolean;
  id?: string;
  trainer_id?: string;
  has_package?: number;
}

export function useGetTrainerList(params: TrainerListParams) {
  const getTrainerUrl = () => {
    const {
      page = 0,
      limit = 10,
      search,
      gender,
      is_pickup_enabled,
      city_id,
      language_spoken,
      vehicle_type_id,
      gear,
      vendor_id,
      with_all_trainers,
      id,
      trainer_id,
      has_package,
    } = params;

    const queryParams: Record<string, any> = {
      page: page + 1,
      limit,
    };

    if (search !== undefined) queryParams.search = search;
    if (gender !== undefined) queryParams.gender = gender;
    if (is_pickup_enabled !== undefined) queryParams.is_pickup_enabled = is_pickup_enabled;
    if (city_id !== undefined) queryParams.city_id = city_id;
    if (language_spoken !== undefined) queryParams.language_spoken = language_spoken;
    if (vehicle_type_id !== undefined) queryParams.vehicle_type_id = vehicle_type_id;
    if (gear !== undefined) queryParams.gear = gear;
    if (vendor_id !== undefined) queryParams.vendor_id = vendor_id;
    if (with_all_trainers !== undefined) queryParams.with_all_trainers = with_all_trainers;
    if (id !== undefined) queryParams.id = id;
    if (trainer_id !== undefined) queryParams.trainer_id = trainer_id;
    if (has_package !== undefined) queryParams.has_package = has_package;

    return `${endpoints.assistant.trainer.list}?${new URLSearchParams(queryParams)}`;
  };

  const { data, isLoading, error, isValidating } = useSWR(getTrainerUrl, drivysFetcher);

  const memoizedValue = useMemo(
    () => ({
      trainers: data?.data || [],
      trainerListLoading: isLoading,
      trainerListError: error,
      trainerListValidating: isValidating,
      totalTrainerPages: data?.total || 0,
    }),
    [data?.data, error, isLoading, isValidating]
  );

  const revalidateTrainerList = () => {
    mutate(getTrainerUrl);
  };

  return { ...memoizedValue, revalidateTrainerList };
}

export function createBooking(body: any) {
  const URL = endpoints.assistant.booking.create;
  const response = drivysCreator([URL, body]);
  return response;
}

interface TrainerPackageListParams {
  page?: number;
  limit?: number;
  trainer_id?: number;
}

export function useGetTrainerPackageList(params: TrainerPackageListParams) {
  const { page = 0, limit = 10, trainer_id } = params;

  const queryParams: Record<string, any> = {
    page: page + 1,
    limit,
  };

  if (trainer_id) {
    queryParams.trainer_id = trainer_id;
  }

  const queryString = new URLSearchParams(queryParams).toString();
  const url = `${endpoints.assistant.trainer.trainerPackageList}?${queryString}`;

  const { data, isLoading, error, isValidating } = useSWR(url, drivysFetcher);

  const memoizedValue = useMemo(
    () => ({
      trainerPackages: data?.data || [],
      trainerPackageLoading: isLoading,
      trainerPackageError: error,
      trainerPackageValidating: isValidating,
      totalTrainerPackagePages: data?.total || 0,
    }),
    [data?.data, data?.total, isLoading, error, isValidating]
  );

  const revalidateTrainerPackageList = () => {
    mutate(url);
  };

  return { ...memoizedValue, revalidateTrainerPackageList };
}
interface AvailableSlotParams {
  driver_id?: number;
  requested_date?: string;
  last_booked_endtime?: string;
}

export function useGetAvailableSlots(params: AvailableSlotParams) {
  const { driver_id, requested_date, last_booked_endtime } = params;

  const queryParams: Record<string, any> = {};

  if (driver_id) {
    queryParams.driver_id = driver_id;
  }

  if (requested_date) {
    queryParams.requested_date = requested_date;
  }

  if (last_booked_endtime) {
    queryParams.last_booked_endtime = last_booked_endtime;
  }

  const queryString = new URLSearchParams(queryParams).toString();
  const url = `${endpoints.users.listAvailableSlots}?${queryString}`;

  const { data, isLoading, error, isValidating } = useSWR(url, drivysFetcher);

  const memoizedValue = useMemo(
    () => ({
      availableSlots: data?.available_slots || [],
      availableSlotLoading: isLoading,
      availableSlotError: error,
      availableSlotValidating: isValidating,
    }),
    [data?.available_slots, isLoading, error, isValidating]
  );

  const revalidateAvailableSlots = () => {
    mutate(url);
  };

  return { ...memoizedValue, revalidateAvailableSlots };
}
