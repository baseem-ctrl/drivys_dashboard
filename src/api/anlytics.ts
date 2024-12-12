import {
  fetcher,
  endpoints,
  drivysCreator,
  drivysFetcher,
  drivysSmasher,
  drivysCreatorPut,
} from 'src/utils/axios';
import useSWR, { mutate } from 'swr';

import React, { useEffect, useMemo } from 'react';
import { useAuthContext } from 'src/auth/hooks';

interface UseGetPendingVerificationRequestProps {
  year?: any;
}

export function useGetAnalytics({ year }: UseGetPendingVerificationRequestProps) {
  const { user } = useAuthContext();
  const getTheFullUrl = useMemo(() => {
    if (user?.user?.user_type) {
      if (user?.user?.user_type === 'SCHOOL_ADMIN') {
        return `${endpoints.analytics.schoolAdmin}?year=${year}`;
      } else {
        return `${endpoints.analytics.admin}?year=${year}`;
      }
    } else {
      window.location.reload();
    }
  }, []);

  const { data, isLoading, error, isValidating } = useSWR(getTheFullUrl, drivysFetcher);

  const memoizedValue = useMemo(
    () => ({
      analytics: data?.data || [],
      analyticsError: error,
      analyticsLoading: isLoading,
      analyticsValidating: isValidating,
      totalPages: data?.total || 0,
    }),
    [data?.data, error, isLoading, isValidating, data?.total]
  );

  const revalidateAnalytics = () => {
    mutate(getTheFullUrl);
  };

  return { ...memoizedValue, revalidateAnalytics };
}
// ----------------------------------------------------------------------
