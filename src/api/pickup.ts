import { endpoints, drivysCreator, drivysFetcher, barrySmasher } from 'src/utils/axios';
import useSWR, { mutate } from 'swr';
import { useMemo } from 'react';

// ----------------------------------------------------------------------
// Function for creating or updating city pickup exclusions
export function createUpdateCityPickupExclusion(body: any) {
  const URL = endpoints.pickup.createUpdate;
  const response = drivysCreator([URL, body]);
  return response;
}

// ----------------------------------------------------------------------
// List all city pickup exclusions
type useGetCityPickupExclusionListParams = {
  limit?: number;
  page?: number;
  sort?: string;
  sort_dir?: string;
  searchTerm?: string;
};

export function useGetCityPickupExclusionList({
  limit = 10,
  page = 1,

  searchTerm = '',
}: useGetCityPickupExclusionListParams = {}) {
  const getTheFullUrl = () => {
    const queryParams: Record<string, any> = {
      limit: limit || 100,
      page: page ? page + 1 : 1,
    };

    if (searchTerm) queryParams.search = searchTerm;

    return `${endpoints.pickup.list}?${new URLSearchParams(queryParams)}`;
  };

  const { data, isLoading, error, isValidating } = useSWR(getTheFullUrl, drivysFetcher);

  const memoizedValue = useMemo(
    () => ({
      exclusions: data?.data as any,
      exclusionsLoading: isLoading,
      exclusionsError: error,
      exclusionsValidating: isValidating,
      totalpages: data?.total || 0,
    }),
    [data?.data, error, isLoading, isValidating]
  );

  const revalidateExclusions = () => {
    mutate(getTheFullUrl);
  };

  return { ...memoizedValue, revalidateExclusions };
}

// ----------------------------------------------------------------------
// Get city pickup exclusion by ID
export function useGetCityPickupExclusionById(pickupExclusionId: number | string) {
  const getExclusionUrl = () => `${endpoints.pickup.getById}/${pickupExclusionId}`;

  const { data, isLoading, error, isValidating } = useSWR(
    pickupExclusionId ? getExclusionUrl() : null,
    drivysFetcher
  );

  const memoizedValue = useMemo(
    () => ({
      exclusion: data?.data as any,
      exclusionLoading: isLoading,
      exclusionError: error,
      exclusionValidating: isValidating,
    }),
    [data?.data, error, isLoading, isValidating]
  );

  return memoizedValue;
}

// ----------------------------------------------------------------------
// Function to delete city pickup exclusion by ID
export function deleteCityPickupExclusionById(id: any) {
  const URL = `${endpoints.pickup.delete}?id=${id}`;
  const response = barrySmasher(URL);
  return response;
}
