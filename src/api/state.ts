import { endpoints, drivysCreator, drivysFetcher, drivysSmasher } from 'src/utils/axios';
import useSWR, { mutate } from 'swr';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

// ----------------------------------------------------------------------
// Function for creatin the state translation
export function createStateTranslation(body: any) {
  const URL = endpoints.state.createStateTranslation;

  const response = drivysCreator([URL, body]);
  return response;
}

// Function for Updatong the state translation
export function updateStateTranslation(body: any) {
  const URL = endpoints.state.updateStateTranslation;
  const response = drivysCreator([URL, body]);
  return response;
}

// ----------------------------------------------------------------------
// List all states
// Define the types for the parameters
type useGetStateListParams = {
  limit?: number;
  page?: number;
  sort?: string;
  sort_dir?: string;
  is_published?: 'published' | 'unpublished';
  order?: string;
  searchTerm?: string;
  locale?: string;
  city_id?: string;
};

export function useGetStateList({
  limit = 10,
  page = 0,
  is_published,
  order,
  searchTerm = '',
  city_id,
}: useGetStateListParams = {}) {
  const { i18n } = useTranslation();
  const locale = i18n.language;

  const getTheFullUrl = () => {
    const queryParams: Record<string, any> = {
      limit: limit || 100,
      page: page ? page + 1 : 1,
    };

    if (is_published !== undefined) {
      queryParams.is_published = is_published === 'published' ? 1 : 0;
    }
    if (order !== undefined) queryParams.order = order;
    if (city_id !== undefined) queryParams.city_id = city_id;
    if (searchTerm) queryParams.search = searchTerm;
    if (locale) queryParams.locale = locale;

    return `${endpoints.state.getByList}?${new URLSearchParams(queryParams)}`;
  };

  const { data, isLoading, error, isValidating } = useSWR(getTheFullUrl, drivysFetcher);

  const memoizedValue = useMemo(
    () => ({
      states: data?.data as any,
      stateLoading: isLoading,
      stateError: error,
      stateValidating: isValidating,
      totalpages: data?.total || 0,
    }),
    [data?.data, error, isLoading, isValidating]
  );

  const revalidateStates = () => {
    mutate(getTheFullUrl);
  };

  return { ...memoizedValue, revalidateStates };
}

// ----------------------------------------------------------------------
// List state provinces by ID
export function useGetStateById(stateId: number | string) {
  const getStateUrl = () => `${endpoints.state.getById}/${stateId}`;

  const { data, isLoading, error, isValidating } = useSWR(
    stateId ? getStateUrl() : null,
    drivysFetcher
  );

  const memoizedValue = useMemo(
    () => ({
      state: data?.data as any,
      stateLoading: isLoading,
      stateError: error,
      stateValidating: isValidating,
    }),
    [data?.data, error, isLoading, isValidating]
  );

  return memoizedValue;
}

// ----------------------------------------------------------------------
// Function to delete state by ID
export function deleteStateById(id: any) {
  const URL = `${endpoints.state.deleteById}/${id}`;
  const response = drivysSmasher(URL);
  return response;
}

// ----------------------------------------------------------------------
// Function to delete state translation by IDs
export function deleteStateTranslation(translation_ids: number[]) {
  const URL = `${endpoints.state.deleteStateProvince}?translation_ids[]=${translation_ids.join(
    ','
  )}`;
  const response = drivysSmasher(URL);
  return response;
}
