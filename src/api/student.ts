import useSWR, { mutate } from 'swr';
import React, { useEffect, useMemo, useState } from 'react';
// utils
import { endpoints, drivysFetcher, drivysCreator, drivysSmasher } from 'src/utils/axios';
import { IOrderItem } from 'src/types/order';

// ----------------------------------------------------------------------
export function useGetStudents({ page, limit, trainer_id }: any) {
  const getTheFullUrl = () => {
    const queryParams: { [key: string]: any } = {
      page: page + 1,
      limit,
    };

    if (trainer_id) queryParams.trainer_id = trainer_id;
    return `${endpoints.trainer.getStudents}?${new URLSearchParams(queryParams)}`;
  };

  const { data, isLoading, error, isValidating } = useSWR(getTheFullUrl, drivysFetcher, {
    revalidateOnFocus: false,
  });

  const memoizedValue = useMemo(
    () => ({
      students: data?.data || [],
      studentsLoading: isLoading,
      studentsError: error,
      studentsValidating: isValidating,
      studentsEmpty: !isLoading && !data?.data?.length,
      studentsLength: data?.total,
      studentsFilter: data?.total,
    }),
    [data, isLoading, error, isValidating]
  );

  const revalidateStudents = () => {
    mutate(getTheFullUrl);
  };

  return {
    ...memoizedValue,
    revalidateStudents,
  };
}
