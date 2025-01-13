import { endpoints, drivysFetcher } from 'src/utils/axios';
import useSWR, { mutate } from 'swr';
import { useMemo } from 'react';

// ----------------------------------------------------------------------
// List live trainer locations
type useGetLiveTrainerLocationParams = {
  latitude: number;
  longitude: number;
  radius: number;
  limit?: number;
  page?: number;
  searchTerm?: string;
};

export function useGetLiveTrainerLocation({
  latitude,
  longitude,
  radius,
}: useGetLiveTrainerLocationParams) {
  const getTheFullUrl = () => {
    const queryParams: Record<string, any> = {
      latitude,
      longitude,
      radius,
    };

    return `${endpoints.location.getLiveTrainerLocation}?${new URLSearchParams(queryParams)}`;
  };

  const { data, isLoading, error, isValidating } = useSWR(getTheFullUrl, drivysFetcher);

  const memoizedValue = useMemo(
    () => ({
      liveTrainers: data?.data as any,
      trainerLoading: isLoading,
      trainerError: error,
      trainerValidating: isValidating,
      totalpages: data?.total || 0,
    }),
    [data?.data, error, isLoading, isValidating]
  );

  const revalidateLiveTrainerLocations = () => {
    mutate(getTheFullUrl);
  };

  return { ...memoizedValue, revalidateLiveTrainerLocations };
}
