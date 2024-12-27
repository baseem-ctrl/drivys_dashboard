import {
  fetcher,
  endpoints,
  drivysCreator,
  drivysFetcher,
  drivysSmasher,
  drivysCreatorPut,
} from 'src/utils/axios';
import moment from 'moment';
import useSWR, { mutate } from 'swr';

import React, { useEffect, useMemo, useState } from 'react';
import { useAuthContext } from 'src/auth/hooks';

interface UseGetPendingVerificationRequestProps {
  year?: any;
}
export function useGetAnalytics({ startDate, endDate }) {
  const { user } = useAuthContext();

  const getTheFullUrl = useMemo(() => {
    let url = '';

    if (user?.user?.user_type) {
      if (user?.user?.user_type === 'SCHOOL_ADMIN') {
        url = `${endpoints.analytics.schoolAdmin}`;
      } else {
        url = `${endpoints.analytics.admin}`;
      }

      const params = new URLSearchParams();
      if (startDate) params.append('start_date', moment(startDate).format('YYYY-MM-DD'));
      if (endDate) params.append('end_date', moment(endDate).format('YYYY-MM-DD'));

      if (params.toString()) {
        url += `?${params.toString()}`;
      }
    }

    // else {
    //   window.location.reload();
    // }

    return url;
  }, [user?.user?.user_type, startDate, endDate]);

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
