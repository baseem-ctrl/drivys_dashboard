import {
  fetcher,
  endpoints,
  drivysCreator,
  drivysFetcher,
  drivysSmasher,
  drivysCreatorPut,
} from 'src/utils/axios';
import useSWR, { mutate } from 'swr';

import React, { useEffect, useMemo, useState } from 'react';
import { useAuthContext } from 'src/auth/hooks';

interface UseGetPendingVerificationRequestProps {
  year?: any;
}

export function useGetAnalytics() {
  const { user } = useAuthContext();
  const getTheFullUrl = useMemo(() => {
    if (user?.user?.user_type) {
      if (user?.user?.user_type === 'SCHOOL_ADMIN') {
        return `${endpoints.analytics.schoolAdmin}`;
      } else {
        return `${endpoints.analytics.admin}`;
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

export function useGetRevenue() {
  const [year, setYear] = useState('2024');
  const { user } = useAuthContext();
  const getTheFullUrl = useMemo(() => {
    if (user?.user?.user_type && year) {
      if (user?.user?.user_type === 'SCHOOL_ADMIN') {
        return `${endpoints.analytics.schoolAdminRevenue}?year=${year}`;
      } else {
        return `${endpoints.analytics.adminRevenue}?year=${year}`;
      }
    } else {
      window.location.reload();
    }
  }, [year]);

  const { data, isLoading, error, isValidating } = useSWR(getTheFullUrl, drivysFetcher);

  const memoizedValue = useMemo(
    () => ({
      revenue: data?.data?.revenue || [],
      revenueError: error,
      revenueLoading: isLoading,
      revenueValidating: isValidating,
      totalPages: data?.total || 0,
    }),
    [data?.data, error, isLoading, isValidating, data?.total]
  );

  const revalidateAnalytics = (newValue: any) => {
    if (newValue) {
      setYear(newValue);
      mutate(getTheFullUrl);
    }
  };

  return { ...memoizedValue, revalidateAnalytics };
}
// ----------------------------------------------------------------------
