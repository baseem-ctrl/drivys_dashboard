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

  const buildParams = (includeLocale: boolean) => {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', moment(startDate).format('YYYY-MM-DD'));
    if (endDate) params.append('end_date', moment(endDate).format('YYYY-MM-DD'));
    if (city_id) params.append('city_id', city_id);
    if (includeLocale) params.append('locale', locale);
    return params;
  };

  const primaryUrl = useMemo(() => {
    const base =
      user?.user?.user_type === 'SCHOOL_ADMIN'
        ? endpoints.analytics.schoolAdmin
        : endpoints.analytics.admin;
    return `${base}?${buildParams(true).toString()}`;
  }, [user?.user?.user_type, startDate, endDate, city_id, locale]);

  const fallbackUrl = useMemo(() => {
    const base =
      user?.user?.user_type === 'SCHOOL_ADMIN'
        ? endpoints.analytics.schoolAdmin
        : endpoints.analytics.admin;
    return `${base}?${buildParams(false).toString()}`;
  }, [user?.user?.user_type, startDate, endDate, city_id]);

  const { data: primaryData, isLoading, error, isValidating } = useSWR(primaryUrl, drivysFetcher);
  const { data: fallbackData } = useSWR(
    () => (!primaryData?.data?.length ? fallbackUrl : null),
    drivysFetcher
  );

  const dataToUse = primaryData?.data?.length ? primaryData : fallbackData;

  const memoizedValue = useMemo(
    () => ({
      analytics: dataToUse?.data || [],
      analyticsError: error,
      analyticsLoading: isLoading,
      analyticsValidating: isValidating,
      totalPages: dataToUse?.total || 0,
    }),
    [dataToUse?.data, error, isLoading, isValidating, dataToUse?.total]
  );

  const revalidateAnalytics = () => {
    mutate(primaryUrl);
  };

  return { ...memoizedValue, revalidateAnalytics };
}

// ----------------------------------------------------------------------
export function useGetRevenue({ city_id, start_date, end_date }: any) {
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const { i18n } = useTranslation();
  const { user } = useAuthContext();
  const locale = i18n.language;

  const buildParams = (includeLocale: boolean) => {
    const params = new URLSearchParams();
    params.append('year', year);
    if (city_id) params.append('city_id', city_id);
    if (start_date) params.append('start_date', moment(start_date).format('YYYY-MM-DD'));
    if (end_date) params.append('end_date', moment(end_date).format('YYYY-MM-DD'));
    if (includeLocale) params.append('locale', locale);
    return params;
  };

  const primaryUrl = useMemo(() => {
    const base =
      user?.user?.user_type === 'SCHOOL_ADMIN'
        ? endpoints.analytics.schoolAdminRevenue
        : endpoints.analytics.adminRevenue;
    return `${base}?${buildParams(true).toString()}`;
  }, [year, city_id, start_date, end_date, locale, user?.user?.user_type]);

  const fallbackUrl = useMemo(() => {
    const base =
      user?.user?.user_type === 'SCHOOL_ADMIN'
        ? endpoints.analytics.schoolAdminRevenue
        : endpoints.analytics.adminRevenue;
    return `${base}?${buildParams(false).toString()}`;
  }, [year, city_id, start_date, end_date, user?.user?.user_type]);

  const { data: primaryData, isLoading, error, isValidating } = useSWR(primaryUrl, drivysFetcher);
  const { data: fallbackData } = useSWR(
    () => (!primaryData?.data?.revenue?.length ? fallbackUrl : null),
    drivysFetcher
  );

  const dataToUse = primaryData?.data?.revenue?.length ? primaryData : fallbackData;

  const memoizedValue = useMemo(
    () => ({
      revenueByPackage: dataToUse?.data?.revenueByPackage || [],
      revenue: dataToUse?.data?.revenue || [],
      paymentMethods: dataToUse?.data?.paymentMethods || [],
      revenueError: error,
      revenueLoading: isLoading,
      revenueValidating: isValidating,
      totalPages: dataToUse?.total || 0,
    }),
    [dataToUse?.data, error, isLoading, isValidating, dataToUse?.total]
  );

  const revalidateAnalytics = (newValue: string) => {
    if (newValue) {
      setYear(newValue);
      mutate(primaryUrl);
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

  const buildParams = (includeLocale: boolean) => {
    const params = new URLSearchParams();
    if (start_date) params.append('start_date', moment(start_date).format('YYYY-MM-DD'));
    if (end_date) params.append('end_date', moment(end_date).format('YYYY-MM-DD'));
    if (city_id) params.append('city_id', city_id);
    if (includeLocale) params.append('locale', locale);
    return params;
  };

  const primaryUrl = useMemo(
    () => `${endpoints.analytics.getStudentInsights}?${buildParams(true).toString()}`,
    [start_date, end_date, city_id, locale]
  );

  const fallbackUrl = useMemo(
    () => `${endpoints.analytics.getStudentInsights}?${buildParams(false).toString()}`,
    [start_date, end_date, city_id]
  );

  const { data: primaryData, isLoading, error, isValidating } = useSWR(primaryUrl, drivysFetcher);
  const { data: fallbackData } = useSWR(
    () => (!primaryData?.data?.length ? fallbackUrl : null),
    drivysFetcher
  );

  const dataToUse = primaryData?.data?.length ? primaryData : fallbackData;

  const memoizedValue = useMemo(
    () => ({
      studentInsights: dataToUse?.data || [],
      studentInsightsError: error,
      studentInsightsLoading: isLoading,
      studentInsightsValidating: isValidating,
      totalPages: dataToUse?.total || 0,
    }),
    [dataToUse?.data, error, isLoading, isValidating, dataToUse?.total]
  );

  const revalidateStudentInsights = () => {
    mutate(primaryUrl);
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

  const buildParams = (includeLocale: boolean) => {
    const params = new URLSearchParams();
    if (start_date) params.append('start_date', moment(start_date).format('YYYY-MM-DD'));
    if (end_date) params.append('end_date', moment(end_date).format('YYYY-MM-DD'));
    if (city_id) params.append('city_id', city_id);
    if (includeLocale) params.append('locale', locale);
    return params;
  };

  const primaryUrl = useMemo(
    () => `${endpoints.analytics.getTrainerInsights}?${buildParams(true).toString()}`,
    [start_date, end_date, city_id, locale]
  );

  const fallbackUrl = useMemo(
    () => `${endpoints.analytics.getTrainerInsights}?${buildParams(false).toString()}`,
    [start_date, end_date, city_id]
  );

  const { data: primaryData, isLoading, error, isValidating } = useSWR(primaryUrl, drivysFetcher);
  const { data: fallbackData } = useSWR(
    () => (!primaryData?.data?.length ? fallbackUrl : null),
    drivysFetcher
  );

  const dataToUse = primaryData?.data?.length ? primaryData : fallbackData;

  const memoizedValue = useMemo(
    () => ({
      trainerInsights: dataToUse?.data || [],
      trainerInsightsError: error,
      trainerInsightsLoading: isLoading,
      trainerInsightsValidating: isValidating,
      totalPages: dataToUse?.total || 0,
    }),
    [dataToUse?.data, error, isLoading, isValidating, dataToUse?.total]
  );

  const revalidateTrainerInsights = () => {
    mutate(primaryUrl);
  };

  return { ...memoizedValue, revalidateTrainerInsights };
}
