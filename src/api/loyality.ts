import useSWR, { mutate } from 'swr';
import React, { useMemo } from 'react';
// utils
import { endpoints, drivysFetcher, drivysSmasher, drivysCreator } from 'src/utils/axios';

// ----------------------------------------------------------------------

interface UseGetLoyaltyProgramListProps {
  page: number;
  limit: number;
  searchQuery?: string;
}

export function useGetLoyaltyProgramList({
  page,
  limit,
  searchQuery,
}: UseGetLoyaltyProgramListProps) {
  const getTheFullUrl = () => {
    let queryParams: any = {
      limit: limit || 10,
      page: page ? page + 1 : 1,
    };

    if (searchQuery) {
      queryParams = { ...queryParams, search: searchQuery };
    }

    return `${endpoints.loyalityProgram.list}?${new URLSearchParams(queryParams)}`;
  };

  const { data, isLoading, error, isValidating } = useSWR(getTheFullUrl, drivysFetcher);

  const memoizedValue = useMemo(
    () => ({
      loyaltyPrograms: data?.data || [],
      loyaltyProgramsError: error,
      loyaltyProgramsLoading: isLoading,
      loyaltyProgramsValidating: isValidating,
      totalpages: data?.total || 0,
    }),
    [data?.data, error, isLoading, isValidating, data?.total]
  );

  const revalidateLoyaltyPrograms = () => {
    mutate(getTheFullUrl);
  };

  return { ...memoizedValue, revalidateLoyaltyPrograms };
}

export async function createOrUpdateLoyaltyProgram(loyaltyProgramData: Body) {
  const URL = endpoints.loyalityProgram.createUpdate;
  try {
    const response = await drivysCreator([URL, loyaltyProgramData]);
    return response;
  } catch (error) {
    console.error('Error creating or updating loyalty program:', error);
    throw error;
  }
}
export async function deleteLoyaltyProgramById(id: number) {
  const URL = `${endpoints.loyalityProgram.delete}/${id}`;
  try {
    const response = await drivysSmasher([URL]);
    return response;
  } catch (error) {
    console.error('Error deleting loyalty program:', error);
    throw error;
  }
}
export function useGetEligibleRewardTrainerList({
  status,
  limit,
  page,
  sort_dir,
  trainer_id,
  trainer_reward_id,
}: {
  status?: string;
  limit?: number;
  page?: number;
  sort_dir?: 'asc' | 'desc';
  trainer_id?: string;
  trainer_reward_id?: string;
}) {
  const getTheFullUrl = () => {
    let queryParams: any = {
      limit: limit || 10,
      page: page ? page + 1 : 1,
    };

    if (status) queryParams.status = status;
    if (sort_dir) queryParams.sort_dir = sort_dir;
    if (trainer_id) queryParams.trainer_id = trainer_id;
    if (trainer_reward_id) queryParams.trainer_reward_id = trainer_reward_id;

    return `${endpoints.loyalityProgram.eligibleRewardTrainerList}?${new URLSearchParams(
      queryParams
    )}`;
  };

  const { data, isLoading, error, isValidating } = useSWR(getTheFullUrl, drivysFetcher);

  const memoizedValue = useMemo(
    () => ({
      eligibleRewardTrainers: data?.data || [],
      eligibleRewardTrainersError: error,
      eligibleRewardTrainersLoading: isLoading,
      eligibleRewardTrainersValidating: isValidating,
      totalPages: data?.total || 0,
    }),
    [data?.data, error, isLoading, isValidating, data?.total]
  );

  const revalidateEligibleRewardTrainers = () => {
    mutate(getTheFullUrl);
  };

  return { ...memoizedValue, revalidateEligibleRewardTrainers };
}
export async function processTrainerReward(loyaltyProgramData: Body) {
  const URL = endpoints.loyalityProgram.processTrainerReward;
  try {
    const response = await drivysCreator([URL, loyaltyProgramData]);
    return response;
  } catch (error) {
    console.error('Error creating or updating loyalty program:', error);
    throw error;
  }
}
