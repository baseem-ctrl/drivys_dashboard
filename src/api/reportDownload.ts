import useSWR, { mutate } from 'swr';
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
      const rows = data.trim().split('\n');
      const headers = rows[0].split(',').map((header) => header.trim());

      parsedData = rows.slice(1).map((row) => {
        const values = row.split(',').map((value) => value.trim()); // Extract row values
        return headers.reduce(
          (acc, header, index) => {
            acc[header] = values[index] || ''; // Map values to headers
            return acc;
          },
          {} as Record<string, string>
        );
      });
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

  // Function to download CSV manually
  const downloadCSV = () => {
    if (!parsedData.length) {
      console.warn('No data available to download.');
      return;
    }

    // Extract headers dynamically
    const headers = Object.keys(parsedData[0]);

    // Convert data into CSV format
    const csvContent = [
      headers.join(','),
      ...parsedData.map((row) => headers.map((field) => `"${row[field]}"`).join(',')),
    ].join('\n');

    // Create a Blob and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'BookingReports.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const revalidateBookingReports = () => {
    mutate(getTheFullUrl);
  };

  return { ...memoizedValue, revalidateBookingReports, downloadCSV };
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
      // Manual CSV Parsing Without PapaParse
      const rows = data.trim().split('\n'); // Split CSV into rows
      const headers = rows[0].split(',').map((header) => header.trim()); // Extract headers

      parsedData = rows.slice(1).map((row) => {
        const values = row.split(',').map((value) => value.trim()); // Extract row values
        return headers.reduce(
          (acc, header, index) => {
            acc[header] = values[index] || ''; // Map values to headers
            return acc;
          },
          {} as Record<string, string>
        );
      });
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

  // Function to download CSV manually
  const downloadCSV = () => {
    if (!parsedData.length) {
      console.warn('No data available to download.');
      return;
    }

    // Extract headers dynamically
    const headers = Object.keys(parsedData[0]);

    // Convert data into CSV format
    const csvContent = [
      headers.join(','), // Add headers row
      ...parsedData.map((row) => headers.map((field) => `"${row[field]}"`).join(',')), // Map data rows
    ].join('\n');

    // Create a Blob and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'RevenueReports.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const revalidateRevenueReports = () => {
    mutate(getTheFullUrl);
  };

  return { ...memoizedValue, revalidateRevenueReports, downloadCSV };
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
      // Manual CSV Parsing Without PapaParse
      const rows = data.trim().split('\n'); // Split CSV into rows
      const headers = rows[0].split(',').map((header) => header.trim()); // Extract headers

      parsedData = rows.slice(1).map((row) => {
        const values = row.split(',').map((value) => value.trim()); // Extract row values
        return headers.reduce(
          (acc, header, index) => {
            acc[header] = values[index] || ''; // Map values to headers
            return acc;
          },
          {} as Record<string, string>
        );
      });
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

  // Function to download CSV manually
  const downloadCSV = () => {
    if (!parsedData.length) {
      console.warn('No data available to download.');
      return;
    }

    // Extract headers dynamically
    const headers = Object.keys(parsedData[0]);

    // Convert data into CSV format
    const csvContent = [
      headers.join(','),
      ...parsedData.map((row) => headers.map((field) => `"${row[field]}"`).join(',')),
    ].join('\n');

    // Create a Blob and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'TrainerReports.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const revalidateTrainerReports = () => {
    mutate(getTheFullUrl);
  };

  return { ...memoizedValue, revalidateTrainerReports, downloadCSV };
}

export function useGetStudentReportsDownload(
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
      // Manual CSV Parsing Without PapaParse
      const rows = data.trim().split('\n'); // Split CSV into rows
      const headers = rows[0].split(',').map((header) => header.trim()); // Extract headers

      parsedData = rows.slice(1).map((row) => {
        const values = row.split(',').map((value) => value.trim()); // Extract row values
        return headers.reduce(
          (acc, header, index) => {
            acc[header] = values[index] || ''; // Map values to headers
            return acc;
          },
          {} as Record<string, string>
        );
      });
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

  // Function to download CSV manually
  const downloadCSV = () => {
    if (!parsedData.length) {
      console.warn('No data available to download.');
      return;
    }

    // Extract headers dynamically
    const headers = Object.keys(parsedData[0]);

    // Convert data into CSV format
    const csvContent = [
      headers.join(','),
      ...parsedData.map((row) => headers.map((field) => `"${row[field]}"`).join(',')),
    ].join('\n');

    // Create a Blob and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'StudentData.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const revalidateStudentReports = () => {
    mutate(getTheFullUrl);
  };

  return { ...memoizedValue, revalidateStudentReports, downloadCSV };
}

export function useGetSchoolReportsDownload(
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
      // Manual CSV Parsing Without PapaParse
      const rows = data.trim().split('\n'); // Split CSV into rows
      const headers = rows[0].split(',').map((header) => header.trim()); // Extract headers

      parsedData = rows.slice(1).map((row) => {
        const values = row.split(',').map((value) => value.trim()); // Extract row values
        return headers.reduce(
          (acc, header, index) => {
            acc[header] = values[index] || ''; // Map values to headers
            return acc;
          },
          {} as Record<string, string>
        );
      });
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

  // Function to download CSV manually
  const downloadCSV = () => {
    if (!parsedData.length) {
      console.warn('No data available to download.');
      return;
    }

    // Extract headers dynamically
    const headers = Object.keys(parsedData[0]);

    // Convert data into CSV format
    const csvContent = [
      headers.join(','),
      ...parsedData.map((row) => headers.map((field) => `"${row[field]}"`).join(',')),
    ].join('\n');

    // Create a Blob and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'SchoolData.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const revalidateSchoolReports = () => {
    mutate(getTheFullUrl);
  };

  return { ...memoizedValue, revalidateSchoolReports, downloadCSV };
}
