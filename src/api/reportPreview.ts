import useSWR, { mutate } from 'swr';
import { drivysFetcher, endpoints } from 'src/utils/axios';

export function useGetBookingReports(
  locale?: string,
  start_date?: string,
  end_date?: string,
  page?: number,
  limit?: number,
  booking_status?: any,
  payment_method?: any,
  category_id?: any
) {
  const getTheFullUrl = () => {
    let queryParams: Record<string, any> = {};

    if (locale) queryParams.locale = locale;
    if (start_date) queryParams.start_date = start_date;
    if (end_date) queryParams.end_date = end_date;
    if (limit) queryParams.limit = limit;
    if (page) queryParams.page = page;
    if (booking_status) queryParams.booking_status = booking_status;
    if (payment_method !== undefined) queryParams.payment_method = payment_method;
    if (category_id !== undefined) queryParams.category_id = category_id;

    return `${endpoints.reportSessionPreview.booking}?${new URLSearchParams(queryParams)}`;
  };

  const { data, isLoading, error, isValidating } = useSWR(getTheFullUrl, drivysFetcher);

  const memoizedValue = {
    bookingReports: data?.data as any,
    bookingReportsLoading: isLoading,
    bookingReportsError: error,
    bookingReportsValidating: isValidating,
    totalRecords: data?.total || 0,
  };

  const revalidateBookingReports = () => {
    mutate(getTheFullUrl);
  };

  return { ...memoizedValue, revalidateBookingReports };
}

export function useGetRevenueReports(
  locale?: string,
  start_date?: string,
  end_date?: string,
  category_id?: any,

  page?: number,
  limit?: number
) {
  const getTheFullUrl = () => {
    let queryParams: Record<string, any> = {};

    if (locale) queryParams.locale = locale;
    if (start_date) queryParams.start_date = start_date;
    if (end_date) queryParams.end_date = end_date;
    if (category_id) queryParams.category_id = category_id;
    if (limit) queryParams.limit = limit;
    if (page) queryParams.page = page;

    return `${endpoints.reportSessionPreview.revenue}?${new URLSearchParams(queryParams)}`;
  };

  const { data, isLoading, error, isValidating } = useSWR(getTheFullUrl, drivysFetcher);

  const memoizedValue = {
    revenueReports: data?.data as any,
    revenueReportsLoading: isLoading,
    revenueReportsError: error,
    revenueReportsValidating: isValidating,
    totalRecords: data?.total || 0,
  };

  const revalidateRevenueReports = () => {
    mutate(getTheFullUrl);
  };

  return { ...memoizedValue, revalidateRevenueReports };
}

export function useGetTrainerReports(
  locale?: string,
  start_date?: string,
  end_date?: string,
  page?: number,
  limit?: number,
  school_id?: number,
  category_id?: number
) {
  const getTheFullUrl = () => {
    let queryParams: Record<string, any> = {};

    if (locale) queryParams.locale = locale;
    if (start_date) queryParams.start_date = start_date;
    if (end_date) queryParams.end_date = end_date;
    if (limit) queryParams.limit = limit;
    if (page) queryParams.page = page;
    if (school_id) queryParams.school_id = school_id;
    if (category_id) queryParams.category_id = category_id;

    return `${endpoints.reportSessionPreview.trainer}?${new URLSearchParams(queryParams)}`;
  };

  const { data, isLoading, error, isValidating } = useSWR(getTheFullUrl, drivysFetcher);

  const memoizedValue = {
    trainerReports: data?.data as any,
    trainerReportsLoading: isLoading,
    trainerReportsError: error,
    trainerReportsValidating: isValidating,
    totalRecords: data?.total || 0,
  };

  const revalidateTrainerReports = () => {
    mutate(getTheFullUrl);
  };

  return { ...memoizedValue, revalidateTrainerReports };
}

export function useGetStudentReports(
  locale?: string,
  start_date?: string,
  end_date?: string,
  page?: number,
  limit?: number,
  category_id?: number,
  city_id?: number
) {
  const getTheFullUrl = () => {
    let queryParams: Record<string, any> = {};

    if (locale) queryParams.locale = locale;
    if (start_date) queryParams.start_date = start_date;
    if (end_date) queryParams.end_date = end_date;
    if (limit) queryParams.limit = limit;
    if (page) queryParams.page = page;
    if (category_id) queryParams.category_id = category_id;
    if (city_id) queryParams.city_id = city_id;

    return `${endpoints.reportSessionPreview.student}?${new URLSearchParams(queryParams)}`;
  };

  const { data, isLoading, error, isValidating } = useSWR(getTheFullUrl, drivysFetcher);

  const memoizedValue = {
    studentReports: data?.data as any,
    studentReportsLoading: isLoading,
    studentReportsError: error,
    studentReportsValidating: isValidating,
    totalRecords: data?.total || 0,
  };

  const revalidateStudentReports = () => {
    mutate(getTheFullUrl);
  };

  return { ...memoizedValue, revalidateStudentReports };
}

export function useGetSchoolReports(
  locale?: string,
  start_date?: string,
  end_date?: string,

  page?: number,
  limit?: number,
  school_id?: string
) {
  const getTheFullUrl = () => {
    let queryParams: Record<string, any> = {};

    if (locale) queryParams.locale = locale;
    if (start_date) queryParams.start_date = start_date;
    if (end_date) queryParams.end_date = end_date;
    if (school_id) queryParams.school_id = school_id;
    if (limit) queryParams.limit = limit;
    if (page) queryParams.page = page;

    return `${endpoints.reportSessionPreview.school}?${new URLSearchParams(queryParams)}`;
  };

  const { data, isLoading, error, isValidating } = useSWR(getTheFullUrl, drivysFetcher);

  const memoizedValue = {
    schoolReports: data?.data as any,
    schoolReportsLoading: isLoading,
    schoolReportsError: error,
    schoolReportsValidating: isValidating,
    totalRecords: data?.total || 0,
  };

  const revalidateSchoolReports = () => {
    mutate(getTheFullUrl);
  };

  return { ...memoizedValue, revalidateSchoolReports };
}
