import useSWR, { mutate } from 'swr';
import React, { useEffect, useMemo, useState } from 'react';
// utils
import { endpoints, drivysFetcher, drivysCreator, drivysSmasher } from 'src/utils/axios';
import { IOrderItem } from 'src/types/order';

// ----------------------------------------------------------------------

export function useGetPackagesDetailsByTrainer(trainerId: string | number) {
  const URL = endpoints.trainer.getPackages + trainerId;
  const { data, isLoading, error, isValidating } = useSWR(URL, drivysFetcher, {
    revalidateOnFocus: false,
  });
  const memoizedValue = useMemo(
    () => ({
      details: (data?.data as any) || {},
      detailsError: error,
      detailsLoading: isLoading,
      detailsValdating: isValidating,
    }),
    [data?.data, error, isLoading, isValidating]
  );

  const revalidateDetails = () => {
    mutate(URL);
  };

  return { ...memoizedValue, revalidateDetails };
}

export function deleteTrainer(id: any) {
  const URL = `${endpoints.trainer.delete}${id}`;
  const response = drivysSmasher(URL);
  return response;
}
export function useGetTrainerNoSchool({ page, limit, search }: any) {
  const getTheFullUrl = () => {
    const queryParams: { [key: string]: any } = {
      page: page + 1,
      limit,
    };
    if (search) queryParams.search = search;
    return `${endpoints.trainer.noschool}?${new URLSearchParams(queryParams)}`;
  };

  const { data, isLoading, error, isValidating } = useSWR(getTheFullUrl, drivysFetcher, {
    revalidateOnFocus: false,
  });

  const memoizedValue = useMemo(
    () => ({
      trainers: data?.data || [],
      trainersLoading: isLoading,
      trainersError: error,
      trainersValidating: isValidating,
      trainersEmpty: !isLoading && !data?.data?.length,
      trainersLength: data?.total,
      trainersFilter: data?.total,
    }),
    [data, isLoading, error, isValidating]
  );

  const revalidateUsers = () => {
    mutate(getTheFullUrl);
  };

  return {
    ...memoizedValue,
    revalidateUsers,
  };
}
