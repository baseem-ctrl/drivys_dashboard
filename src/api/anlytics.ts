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
export function useGetAnalytics({ startDate, endDate, city_id }) {
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
      if (city_id) params.append('city_id', city_id);
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
    }

    // else {
    //   window.location.reload();
    // }

    return url;
  }, [user?.user?.user_type, startDate, endDate, city_id]);

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
export function useGetRevenue({ city_id, start_date, end_date }) {
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const { user } = useAuthContext();

  const getTheFullUrl = useMemo(() => {
    if (user?.user?.user_type && year) {
      let url = '';

      if (user?.user?.user_type === 'SCHOOL_ADMIN') {
        url = `${endpoints.analytics.schoolAdminRevenue}?year=${year}`;
      } else {
        url = `${endpoints.analytics.adminRevenue}?year=${year}`;
      }

      if (city_id) {
        url += `&city_id=${city_id}`;
      }

      if (start_date) {
        url += `&start_date=${moment(start_date).format('YYYY-MM-DD')}`;
      }
      if (end_date) {
        url += `&end_date=${moment(end_date).format('YYYY-MM-DD')}`;
      }

      return url;
    } else {
      window.location.reload();
    }
  }, [year, city_id, start_date, end_date, user?.user?.user_type]);

  const { data, isLoading, error, isValidating } = useSWR(getTheFullUrl, drivysFetcher);

  const memoizedValue = useMemo(
    () => ({
      revenueByPackage: data?.data?.revenueByPackage || [],
      revenue: data?.data?.revenue || [],
      paymentMethods: data?.data?.paymentMethods || [],
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
export function useGetStudentInsights({
  start_date,
  end_date,
  city_id,
}: UseGetStudentInsightsProps = {}) {
  const getTheFullUrl = useMemo(() => {
    const baseUrl = endpoints.analytics.getStudentInsights;
    const params = new URLSearchParams();

    if (start_date) params.append('start_date', moment(start_date).format('YYYY-MM-DD'));
    if (end_date) params.append('end_date', moment(end_date).format('YYYY-MM-DD'));
    if (city_id) params.append('city_id', city_id);

    return params.toString() ? `${baseUrl}?${params.toString()}` : baseUrl;
  }, [start_date, end_date, city_id]);

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

export function useGetTrainerInsights({
  start_date,
  end_date,
  city_id,
}: UseGetTrainerInsightsProps = {}) {
  const getTheFullUrl = useMemo(() => {
    const baseUrl = endpoints.analytics.getTrainerInsights;
    const params = new URLSearchParams();

    if (start_date) params.append('start_date', moment(start_date).format('YYYY-MM-DD'));
    if (end_date) params.append('end_date', moment(end_date).format('YYYY-MM-DD'));

    if (city_id) params.append('city_id', city_id);

    return params.toString() ? `${baseUrl}?${params.toString()}` : baseUrl;
  }, [start_date, end_date, city_id]);

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
