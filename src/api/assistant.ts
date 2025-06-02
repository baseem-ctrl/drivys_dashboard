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
