import useSWR, { mutate } from 'swr';
import { useMemo } from 'react';
// utils
import { endpoints, drivysFetcher, drivysCreator } from 'src/utils/axios';

// ----------------------------------------------------------------------

// Function to get the trainer profile update list
export function useGetTrainerProfileUpdateList(filters = {}) {
  const { trainer_id, page, limit, is_verified } = filters;

  const queryParams = new URLSearchParams();

  if (trainer_id !== undefined && trainer_id) queryParams.append('trainer_id', trainer_id);
  if (is_verified !== undefined) queryParams.append('is_verified', is_verified);
  if (page !== undefined) queryParams.append('page', page);
  if (limit !== undefined) queryParams.append('limit', limit);

  const URL = `${endpoints.profileUpdate.list}?${queryParams.toString()}`;

  const { data, isLoading, error, isValidating } = useSWR(URL, drivysFetcher, {
    revalidateOnFocus: false,
  });

  const memoizedValue = useMemo(() => {
    const profileUpdates = data?.data || [];
    const totalCount = data?.total || 0;

    return {
      profileUpdates,
      totalCount,
      profileUpdateError: error,
      profileUpdateLoading: isLoading,
      profileUpdateValidating: isValidating,
    };
  }, [data, error, isLoading, isValidating]);

  const revalidateProfileUpdates = () => {
    mutate(URL);
  };

  return { ...memoizedValue, revalidateProfileUpdates };
}

// Function to unverify a trainer
export function unverifyTrainerProfile(body: Record<string, any>) {
  const URL = `${endpoints.profileUpdate.unverifyTrainer}`;
  return drivysCreator([URL, body]);
}
export function approveTrainerProfile(body: Record<string, any>) {
  const URL = `${endpoints.profileUpdate.approveReject}`;
  return drivysCreator([URL, body]);
}
