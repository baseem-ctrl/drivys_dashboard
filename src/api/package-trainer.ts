import { endpoints, drivysCreator, drivysFetcher, barrySmasher } from 'src/utils/axios';
import useSWR, { mutate } from 'swr';
import { useMemo } from 'react';

// ----------------------------------------------------------------------
// Function to create a package for a trainer
export function createPackageTrainer(body: any) {
  const URL = endpoints.packageTrainer.create;
  const response = drivysCreator([URL, body]);
  return response;
}

// ----------------------------------------------------------------------
// List all package trainers
// Define the types for the parameters
type useGetPackageTrainerListParams = {
  limit?: number;
  page?: number;
  sort?: string;
  sort_dir?: string;
  searchTerm?: string;
};

export function useGetPackageTrainerList({ limit, page }: useGetPackageTrainerListParams = {}) {
  const getTheFullUrl = () => {
    const queryParams: Record<string, any> = {
      limit: limit || 100,
      page: page ? page + 1 : 1,
    };

    return `${endpoints.packageTrainer.list}?${new URLSearchParams(queryParams)}`;
  };

  const { data, isLoading, error, isValidating } = useSWR(getTheFullUrl, drivysFetcher);

  const memoizedValue = useMemo(
    () => ({
      packageTrainers: data?.data as any,
      packageTrainerLoading: isLoading,
      packageTrainerError: error,
      packageTrainerValidating: isValidating,
      totalPages: data?.total || 0,
    }),
    [data?.data, error, isLoading, isValidating]
  );

  const revalidatePackageTrainers = () => {
    mutate(getTheFullUrl);
  };

  return { ...memoizedValue, revalidatePackageTrainers };
}

// ----------------------------------------------------------------------
// Get package trainer details by ID
export function useGetPackageTrainerById(packageTrainerId: number | string) {
  const getPackageTrainerUrl = () => `${endpoints.packageTrainer.list}/${packageTrainerId}`;
  const { data, isLoading, error, isValidating } = useSWR(
    packageTrainerId ? getPackageTrainerUrl() : null,
    drivysFetcher
  );
  const memoizedValue = useMemo(
    () => ({
      packageTrainer: data?.data as any,
      packageTrainerLoading: isLoading,
      packageTrainerError: error,
      packageTrainerValidating: isValidating,
    }),
    [data?.data, error, isLoading, isValidating]
  );

  return memoizedValue;
}

// ----------------------------------------------------------------------
// Function to delete a package trainer by ID
export function deletePackageTrainerById(id: any) {
  const URL = `${endpoints.packageTrainer.delete}/${id}`;
  const response = barrySmasher(URL);
  return response;
}
