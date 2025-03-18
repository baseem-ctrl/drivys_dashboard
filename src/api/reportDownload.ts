import useSWR, { mutate } from 'swr';
import { utils, writeFile } from 'xlsx';
import Papa from 'papaparse';
import { drivysFetcher, endpoints } from 'src/utils/axios';

export function useGetBookingReportsDownload(
  locale?: string,
  start_date?: string,
  end_date?: string,
  page?: number,
  limit?: number,
  booking_status?: any,
  payment_method?: any
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

    return `${endpoints.reportSessionDownload.booking}?${new URLSearchParams(queryParams)}`;
  };

  const { data, isLoading, error, isValidating } = useSWR(getTheFullUrl, drivysFetcher);

  let parsedData: any[] = [];
  if (data) {
    try {
      parsedData = Papa.parse(data, {
        header: true, // Ensures first row is used as keys
        skipEmptyLines: true, // Skips empty lines
      }).data;
    } catch (csvError) {
      console.error('CSV Parsing Error:', csvError);
    }
  }

  const memoizedValue = {
    bookingReports: parsedData,
    bookingReportsLoading: isLoading,
    bookingReportsError: error,
    bookingReportsValidating: isValidating,
    totalRecords: parsedData.length || 0,
  };

  const downloadExcel = () => {
    const ws = utils.json_to_sheet(parsedData);

    // Create a new workbook and append the worksheet
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, 'Booking Reports');

    writeFile(wb, 'booking_reports.xlsx');
  };

  const revalidateBookingReports = () => {
    mutate(getTheFullUrl);
  };

  return { ...memoizedValue, revalidateBookingReports, downloadExcel };
}

export function useGetRevenueReportsDownload(
  locale?: string,
  start_date?: string,
  end_date?: string,
  page?: number,
  limit?: number
) {
  const getTheFullUrl = () => {
    let queryParams: Record<string, any> = {};

    if (locale) queryParams.locale = locale;
    if (start_date) queryParams.start_date = start_date;
    if (end_date) queryParams.end_date = end_date;
    if (limit) queryParams.limit = limit;
    if (page) queryParams.page = page;

    return `${endpoints.reportSessionDownload.revenue}?${new URLSearchParams(queryParams)}`;
  };

  const { data, isLoading, error, isValidating } = useSWR(getTheFullUrl, drivysFetcher);

  let parsedData: any[] = [];
  if (data) {
    try {
      parsedData = Papa.parse(data, {
        header: true,
        skipEmptyLines: true,
      }).data;
    } catch (csvError) {
      console.error('CSV Parsing Error:', csvError);
    }
  }

  const memoizedValue = {
    revenueReports: parsedData,
    revenueReportsLoading: isLoading,
    revenueReportsError: error,
    revenueReportsValidating: isValidating,
    totalRecords: parsedData.length || 0,
  };

  const downloadExcel = () => {
    const ws = utils.json_to_sheet(parsedData);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, 'Revenue Reports');
    writeFile(wb, 'revenue_reports.xlsx');
  };

  const revalidateRevenueReports = () => {
    mutate(getTheFullUrl);
  };

  return { ...memoizedValue, revalidateRevenueReports, downloadExcel };
}

export function useGetTrainerReportsDownload(
  locale?: string,
  start_date?: string,
  end_date?: string,
  page?: number,
  limit?: number,
  city_id?: number,
  trainer_id?: number
) {
  const getTheFullUrl = () => {
    let queryParams: Record<string, any> = {};

    if (locale) queryParams.locale = locale;
    if (start_date) queryParams.start_date = start_date;
    if (end_date) queryParams.end_date = end_date;
    if (limit) queryParams.limit = limit;
    if (page) queryParams.page = page;
    if (city_id) queryParams.city_id = city_id;
    if (trainer_id) queryParams.trainer_id = trainer_id;

    return `${endpoints.reportSessionDownload.trainer}?${new URLSearchParams(queryParams)}`;
  };

  const { data, isLoading, error, isValidating } = useSWR(getTheFullUrl, drivysFetcher);

  let parsedData: any[] = [];
  if (data) {
    try {
      parsedData = Papa.parse(data, {
        header: true,
        skipEmptyLines: true,
      }).data;
    } catch (csvError) {
      console.error('CSV Parsing Error:', csvError);
    }
  }

  const memoizedValue = {
    trainerReports: parsedData,
    trainerReportsLoading: isLoading,
    trainerReportsError: error,
    trainerReportsValidating: isValidating,
    totalRecords: parsedData.length || 0,
  };

  const downloadExcel = () => {
    const ws = utils.json_to_sheet(parsedData);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, 'Trainer Reports');
    writeFile(wb, 'trainer_reports.xlsx');
  };

  const revalidateTrainerReports = () => {
    mutate(getTheFullUrl);
  };

  return { ...memoizedValue, revalidateTrainerReports, downloadExcel };
}

export function useGetStudentReports(
  locale?: string,
  start_date?: string,
  end_date?: string,
  page?: number,
  limit?: number,
  student_id?: number,
  city_id?: number
) {
  const getTheFullUrl = () => {
    let queryParams: Record<string, any> = {};

    if (locale) queryParams.locale = locale;
    if (start_date) queryParams.start_date = start_date;
    if (end_date) queryParams.end_date = end_date;
    if (limit) queryParams.limit = limit;
    if (page) queryParams.page = page;
    if (student_id) queryParams.student_id = student_id;
    if (city_id) queryParams.city_id = city_id;

    return `${endpoints.reportSessionDownload.student}?${new URLSearchParams(queryParams)}`;
  };

  const { data, isLoading, error, isValidating } = useSWR(getTheFullUrl, drivysFetcher);

  let parsedData: any[] = [];
  if (data) {
    try {
      parsedData = Papa.parse(data, {
        header: true,
        skipEmptyLines: true,
      }).data;
    } catch (csvError) {
      console.error('CSV Parsing Error:', csvError);
    }
  }

  const memoizedValue = {
    studentReports: parsedData,
    studentReportsLoading: isLoading,
    studentReportsError: error,
    studentReportsValidating: isValidating,
    totalRecords: parsedData.length || 0,
  };

  const downloadExcel = () => {
    const ws = utils.json_to_sheet(parsedData);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, 'Student Reports');
    writeFile(wb, 'student_reports.xlsx');
  };

  const revalidateStudentReports = () => {
    mutate(getTheFullUrl);
  };

  return { ...memoizedValue, revalidateStudentReports, downloadExcel };
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

    return `${endpoints.reportSessionDownload.school}?${new URLSearchParams(queryParams)}`;
  };

  const { data, isLoading, error, isValidating } = useSWR(getTheFullUrl, drivysFetcher);

  let parsedData: any[] = [];
  if (data) {
    try {
      parsedData = Papa.parse(data, {
        header: true,
        skipEmptyLines: true,
      }).data;
    } catch (csvError) {
      console.error('CSV Parsing Error:', csvError);
    }
  }

  const memoizedValue = {
    schoolReports: parsedData,
    schoolReportsLoading: isLoading,
    schoolReportsError: error,
    schoolReportsValidating: isValidating,
    totalRecords: parsedData.length || 0,
  };

  const downloadExcel = () => {
    const ws = utils.json_to_sheet(parsedData);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, 'School Reports');
    writeFile(wb, 'school_reports.xlsx');
  };

  const revalidateSchoolReports = () => {
    mutate(getTheFullUrl);
  };

  return { ...memoizedValue, revalidateSchoolReports, downloadExcel };
}
