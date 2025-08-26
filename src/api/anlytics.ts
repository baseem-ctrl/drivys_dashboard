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
import React, { useMemo, useState } from 'react';
import { useAuthContext } from 'src/auth/hooks';
import { useTranslation } from 'react-i18next';

// ----------------------------------------------------------------------
export function useGetAnalytics({ startDate, endDate, city_id }: any) {
  const { user } = useAuthContext();
  const { i18n } = useTranslation();
  const locale = i18n.language;

  const buildParams = () => {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', moment(startDate).format('YYYY-MM-DD'));
    if (endDate) params.append('end_date', moment(endDate).format('YYYY-MM-DD'));
    if (city_id) params.append('city_id', city_id);
    params.append('locale', locale); // always required
    return params;
  };

  const url = useMemo(() => {
    const base =
      user?.user?.user_type === 'SCHOOL_ADMIN'
        ? endpoints.analytics.schoolAdmin
        : endpoints.analytics.admin;
    return `${base}?${buildParams().toString()}`;
  }, [user?.user?.user_type, startDate, endDate, city_id, locale]);

  const { data, isLoading, error, isValidating } = useSWR(url, drivysFetcher);

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
    mutate(url);
  };

  return { ...memoizedValue, revalidateAnalytics };
}

// ----------------------------------------------------------------------
export function useGetRevenue({ city_id, start_date, end_date }: any) {
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const { i18n } = useTranslation();
  const { user } = useAuthContext();
  const locale = i18n.language;

  const buildParams = () => {
    const params = new URLSearchParams();
    params.append('year', year);
    if (city_id) params.append('city_id', city_id);
    if (start_date) params.append('start_date', moment(start_date).format('YYYY-MM-DD'));
    if (end_date) params.append('end_date', moment(end_date).format('YYYY-MM-DD'));
    params.append('locale', locale); // always required
    return params;
  };

  const url = useMemo(() => {
    const base =
      user?.user?.user_type === 'SCHOOL_ADMIN'
        ? endpoints.analytics.schoolAdminRevenue
        : endpoints.analytics.adminRevenue;
    return `${base}?${buildParams().toString()}`;
  }, [year, city_id, start_date, end_date, locale, user?.user?.user_type]);

  const { data, isLoading, error, isValidating } = useSWR(url, drivysFetcher);

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

  const revalidateAnalytics = (newValue: string) => {
    if (newValue) {
      setYear(newValue);
      mutate(url);
    }
  };

  return { ...memoizedValue, revalidateAnalytics };
}

// ----------------------------------------------------------------------
export function useGetStudentInsights({
  start_date,
  end_date,
  city_id,
}: UseGetStudentInsightsProps = {}) {
  const { i18n } = useTranslation();
  const locale = i18n.language;

  const buildParams = () => {
    const params = new URLSearchParams();
    if (start_date) params.append('start_date', moment(start_date).format('YYYY-MM-DD'));
    if (end_date) params.append('end_date', moment(end_date).format('YYYY-MM-DD'));
    if (city_id) params.append('city_id', city_id);
    params.append('locale', locale); // always required
    return params;
  };

  const url = useMemo(
    () => `${endpoints.analytics.getStudentInsights}?${buildParams().toString()}`,
    [start_date, end_date, city_id, locale]
  );

  const { data, isLoading, error, isValidating } = useSWR(url, drivysFetcher);

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
    mutate(url);
  };

  return { ...memoizedValue, revalidateStudentInsights };
}

// ----------------------------------------------------------------------
export function useGetTrainerInsights({
  start_date,
  end_date,
  city_id,
}: UseGetTrainerInsightsProps = {}) {
  const { i18n } = useTranslation();
  const locale = i18n.language;

  const buildParams = () => {
    const params = new URLSearchParams();
    if (start_date) params.append('start_date', moment(start_date).format('YYYY-MM-DD'));
    if (end_date) params.append('end_date', moment(end_date).format('YYYY-MM-DD'));
    if (city_id) params.append('city_id', city_id);
    params.append('locale', locale); // always required
    return params;
  };

  const url = useMemo(
    () => `${endpoints.analytics.getTrainerInsights}?${buildParams().toString()}`,
    [start_date, end_date, city_id, locale]
  );

  const { data, isLoading, error, isValidating } = useSWR(url, drivysFetcher);

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
    mutate(url);
  };

  return { ...memoizedValue, revalidateTrainerInsights };
}
