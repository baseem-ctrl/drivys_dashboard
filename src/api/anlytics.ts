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
      revenueByPackage: data?.data?.revenueByPackage || [],
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
interface UseGetStudentInsightsProps {
  start_date?: string;
  end_date?: string;
}
export function useGetStudentInsights({ start_date, end_date }: UseGetStudentInsightsProps = {}) {
  const getTheFullUrl = useMemo(() => {
    const baseUrl = endpoints.analytics.getStudentInsights;
    const params = new URLSearchParams();

    if (start_date) params.append('start_date', start_date);
    if (end_date) params.append('end_date', end_date);

    return params.toString() ? `${baseUrl}?${params.toString()}` : baseUrl;
  }, [start_date, end_date]);

  const { data, isLoading, error, isValidating } = useSWR(getTheFullUrl, drivysFetcher);

  const memoizedValue = useMemo(
    () => ({
      studentInsights: data?.data || [],
      studentInsightsError: error,
      studentInsightsLoading: isLoading,
      studentInsightsValidating: isValidating,
      totalPages: data?.total || 0,
    }),
    [data?.data, error, isLoading, isValidating, data?.total]
  );

  const revalidateStudentInsights = () => {
    mutate(getTheFullUrl);
  };

  return { ...memoizedValue, revalidateStudentInsights };
}
interface UseGetTrainerInsightsProps {
  start_date?: string;
  end_date?: string;
}

export function useGetTrainerInsights({ start_date, end_date }: UseGetTrainerInsightsProps = {}) {
  const getTheFullUrl = useMemo(() => {
    const baseUrl = endpoints.analytics.getTrainerInsights;
    const params = new URLSearchParams();

    if (start_date) params.append('start_date', start_date);
    if (end_date) params.append('end_date', end_date);

    return params.toString() ? `${baseUrl}?${params.toString()}` : baseUrl;
  }, [start_date, end_date]);

  const { data, isLoading, error, isValidating } = useSWR(getTheFullUrl, drivysFetcher);

  const memoizedValue = useMemo(
    () => ({
      trainerInsights: data?.data || [],
      trainerInsightsError: error,
      trainerInsightsLoading: isLoading,
      trainerInsightsValidating: isValidating,
      totalPages: data?.total || 0,
    }),
    [data?.data, error, isLoading, isValidating, data?.total]
  );

  const revalidateTrainerInsights = () => {
    mutate(getTheFullUrl);
  };

  return { ...memoizedValue, revalidateTrainerInsights };
}
