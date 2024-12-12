import useSWR, { mutate } from 'swr';
import { useMemo, useState } from 'react';
// utils
import { endpoints, drivysFetcher, drivysCreator, drivysSmasher } from 'src/utils/axios';

// ----------------------------------------------------------------------

interface useGetDelivereyParams {
  limit?: number;
  page?: number;
  locale?: string;
  search?: string;
  status?: number;
  is_active?: number;
  min_commission?: number;
  max_commission?: number;
  license_expiry_from?: number;
  license_expiry_to?: number;
}

export function useGetSchool({
  limit,
  page,
  locale,
  search,
  status,
  is_active,
  min_commission,
  max_commission,
  license_expiry_from,
  license_expiry_to,
}: useGetDelivereyParams = {}) {
  // Construct query parameters dynamically
  const queryParams = useMemo(() => {
    const params: Record<string, any> = {};
    if (limit) params.limit = limit;
    if (page) params.page = page;
    if (locale) params.locale = locale;
    if (search) params.search = search;
    if (status) params.status = status;
    if (is_active) params.is_active = is_active;
    if (min_commission) params.min_commission = min_commission;
    if (max_commission) params.max_commission = max_commission;
    if (license_expiry_from) params.license_expiry_from = license_expiry_from;
    if (license_expiry_to) params.license_expiry_to = license_expiry_to;

    return params;
  }, [
    limit,
    page,
    locale,
    search,
    status,
    is_active,
    min_commission,
    max_commission,
    license_expiry_from,
    license_expiry_to,
  ]);

  const fullUrl = useMemo(
    () => `${endpoints.school.list}?${new URLSearchParams(queryParams)}`,
    [queryParams]
  );

  const { data, error, isLoading, isValidating } = useSWR(fullUrl, drivysFetcher, {
    revalidateOnFocus: false,
  });

  const revalidateSchool = () => {
    mutate(fullUrl);
  };

  // Memoize the return value for performance
  const memoizedValue = useMemo(() => {
    const DelivereyData = data?.data || [];
    return {
      schoolList: DelivereyData,
      schoolLoading: isLoading,
      schoolError: error,
      schoolValidating: isValidating,
      schoolEmpty: DelivereyData.length === 0,
      totalPages: data?.total || 0,
    };
  }, [data?.data, data?.total, error, isLoading, isValidating]);

  return {
    ...memoizedValue,
    revalidateSchool,
  };
}
export function useGetSchoolAdmin(limit: number, page: number) {
  // Construct query parameters dynamically
  const [searchValue, setSearchValue] = useState('');
  const queryParams = useMemo(() => {
    const params: Record<string, any> = {};
    if (limit) params.limit = limit;
    if (page) params.page = page;
    if (searchValue) params.search = searchValue;
    params.user_types = ['SCHOOL_ADMIN'];
    return params;
  }, [limit, page]);

  const fullUrl = useMemo(() => {
    const urlSearchParams = new URLSearchParams();
    Object.entries(queryParams).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        // If the value is an array, append each item
        value.forEach((item) => urlSearchParams.append(`${key}[]`, item));
      } else {
        urlSearchParams.append(key, value as string);
      }
    });
    return `${endpoints.school.admin}?${urlSearchParams}`;
  }, [queryParams]);

  const { data, error, isLoading, isValidating } = useSWR(fullUrl, drivysFetcher, {
    revalidateOnFocus: false,
  });

  const revalidateDeliverey = () => {
    mutate(fullUrl);
  };
  const revalidateSearch = (search: any) => {
    setSearchValue(search);
    mutate(fullUrl);
  };
  // Memoize the return value for performance
  const memoizedValue = useMemo(() => {
    const DelivereyData = data?.data || [];
    return {
      schoolAdminList: DelivereyData,
      schoolAdminLoading: isLoading,
      schoolAdminError: error,
      schoolAdminValidating: isValidating,
      schoolAdminEmpty: DelivereyData.length === 0,
      totalPages: data?.total || 0,
    };
  }, [data?.data, data?.total, error, isLoading, isValidating]);

  return {
    ...memoizedValue,
    revalidateDeliverey,
    revalidateSearch,
  };
}
export function createSchool(body: any) {
  const URL = endpoints.school.create;
  const response = drivysCreator([URL, body]);
  return response;
}
export function createUpdateSchoolAddress(body: any) {
  const URL = endpoints.school.address;
  const response = drivysCreator([URL, body]);
  return response;
}

export function updateDelivery(body: any) {
  const URL = endpoints.school.update;
  const response = drivysCreator([URL, body]);
  return response;
}

export function deleteSchool(id: any) {
  const URL = endpoints.school.delete + id;
  const response = drivysSmasher(URL);
  return response;
}
export function useGetSchoolById(schoolId: string) {
  const URL = endpoints.school.details + schoolId;

  const { data, isLoading, error, isValidating } = useSWR(URL, drivysFetcher, {
    revalidateOnFocus: false,
  });

  const memoizedValue = useMemo(
    () => ({
      details: (data?.data as any) || {},
      detailsError: error,
      detailsLoading: isLoading,
      detailsValdating: isValidating,
    }),
    [data?.data, error, isLoading, isValidating]
  );

  const revalidateDetails = () => {
    mutate(URL);
  };

  return { ...memoizedValue, revalidateDetails };
}
export function useGetSchoolTrainers({ limit, page, vendor_id }: any) {
  // Construct query parameters dynamically
  const [searchValue, setSearchValue] = useState('');
  const queryParams = useMemo(() => {
    const params: Record<string, any> = {};
    if (limit) params.limit = limit;
    if (page) params.page = page;
    if (vendor_id) params.vendor_id = vendor_id;
    if (searchValue) params.search = searchValue;
    // params.user_types = ['SCHOOL_ADMIN'];
    return params;
  }, [limit, page]);

  const fullUrl = useMemo(() => {
    const urlSearchParams = new URLSearchParams();
    Object.entries(queryParams).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        // If the value is an array, append each item
        value.forEach((item) => urlSearchParams.append(`${key}[]`, item));
      } else {
        urlSearchParams.append(key, value as string);
      }
    });
    return `${endpoints.school.trainers}?${urlSearchParams}`;
  }, [queryParams]);

  const { data, error, isLoading, isValidating } = useSWR(fullUrl, drivysFetcher, {
    revalidateOnFocus: false,
  });

  const revalidateTrainers = () => {
    mutate(fullUrl);
  };
  const revalidateSearch = (search: any) => {
    setSearchValue(search);
    mutate(fullUrl);
  };
  // Memoize the return value for performance
  const memoizedValue = useMemo(() => {
    const DelivereyData = data?.data || [];
    return {
      schoolTrainersList: DelivereyData,
      schoolTrainersLoading: isLoading,
      schoolTrainersError: error,
      schoolTrainersValidating: isValidating,
      schoolTrainersEmpty: DelivereyData.length === 0,
      totalPages: data?.total || 0,
    };
  }, [data?.data, data?.total, error, isLoading, isValidating]);

  return {
    ...memoizedValue,
    revalidateTrainers,
    revalidateSearch,
  };
}
export function addTrainer(body: any) {
  const URL = endpoints.school.addTrainer;
  const response = drivysCreator([URL, body]);
  return response;
}

// LOGIN AS SCHOOL ADMIN APIS
export function useGetSchoolByIdAdmin(schoolId: string) {
  const URL = endpoints.school.detailsadmin;

  const { data, isLoading, error, isValidating } = useSWR(URL, drivysFetcher, {
    revalidateOnFocus: false,
  });
  const memoizedValue = useMemo(
    () => ({
      details: (data?.data as any) || {},
      detailsError: error,
      detailsLoading: isLoading,
      detailsValdating: isValidating,
    }),
    [data?.data, error, isLoading, isValidating]
  );

  const revalidateDetails = () => {
    mutate(URL);
  };

  return { ...memoizedValue, revalidateDetails };
}
export function RemoveTrainerFromSchool(id: any) {
  const URL = endpoints.school.removeTrainer + id;
  const response = drivysSmasher(URL);
  return response;
}
export function useGetAllSchoolAdmin(limit: number, page: number) {
  // Construct query parameters dynamically
  const queryParams = useMemo(() => {
    const params: Record<string, any> = {};
    if (limit) params.limit = limit;
    if (page) params.page = page;
    params.has_school = 0;

    return params;
  }, [limit, page]);

  const fullUrl = useMemo(() => {
    const urlSearchParams = new URLSearchParams();
    Object.entries(queryParams).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        // If the value is an array, append each item
        value.forEach((item) => urlSearchParams.append(`${key}[]`, item));
      } else {
        urlSearchParams.append(key, value as string);
      }
    });
    return `${endpoints.school.getSchoolAdmin}?${urlSearchParams}`;
  }, [queryParams]);

  const { data, error, isLoading, isValidating } = useSWR(fullUrl, drivysFetcher, {
    revalidateOnFocus: false,
  });

  const revalidateSchoolList = () => {
    mutate(fullUrl);
  };

  // Memoize the return value for performance
  const memoizedValue = useMemo(() => {
    const DelivereyData = data?.data || [];
    return {
      schoolAdminList: DelivereyData,
      schoolAdminLoading: isLoading,
      schoolAdminError: error,
      schoolAdminValidating: isValidating,
      schoolAdminEmpty: DelivereyData.length === 0,
      totalPages: data?.total || 0,
    };
  }, [data?.data, data?.total, error, isLoading, isValidating]);

  return {
    ...memoizedValue,
    revalidateSchoolList,
  };
}
// function to fetch booking details by a student's ID
export function useGetBookingByStudentId(studentId: string) {
  const URL = `${endpoints.booking.getBookingById}?student_id=${studentId}`;
  const { data, isLoading, error, isValidating } = useSWR(URL, drivysFetcher, {
    revalidateOnFocus: false,
  });

  const memoizedValue = useMemo(
    () => ({
      bookingDetails: (data?.data as any) || {},
      bookingError: error,
      bookingLoading: isLoading,
      bookingValidating: isValidating,
    }),
    [data?.data, error, isLoading, isValidating]
  );

  const revalidateBookingDetails = () => {
    mutate(URL);
  };

  return { ...memoizedValue, revalidateBookingDetails };
}
export function useGetPackageBySchool(schoolId: string) {
  const URL = `${endpoints.school.package.getPackageBySchool}?school_id=${schoolId}`;

  const { data, isLoading, error, isValidating } = useSWR(URL, drivysFetcher, {
    revalidateOnFocus: false,
  });

  const memoizedValue = useMemo(
    () => ({
      packageDetails: (data?.data as any) || {},
      packageError: error,
      packageLoading: isLoading,
      packageValidating: isValidating,
    }),
    [data?.data, error, isLoading, isValidating]
  );

  const revalidatePackageDetails = () => {
    mutate(URL);
  };

  return { ...memoizedValue, revalidatePackageDetails };
}
export function AddBulkSchoolCommision(body: any) {
  const URL = endpoints.school.bulk.addCommision;
  const response = drivysCreator([URL, body]);
  return response;
}
export function useGetSchoolTrainerList({ limit, page }: any) {
  // Construct query parameters dynamically
  const [searchValue, setSearchValue] = useState('');
  const queryParams = useMemo(() => {
    const params: Record<string, any> = {};
    if (limit) params.limit = limit;
    if (page) params.page = page;
    if (searchValue) params.search = searchValue;
    // params.user_types = ['SCHOOL_ADMIN'];
    return params;
  }, [limit, page]);

  const fullUrl = useMemo(() => {
    const urlSearchParams = new URLSearchParams();
    Object.entries(queryParams).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        // If the value is an array, append each item
        value.forEach((item) => urlSearchParams.append(`${key}[]`, item));
      } else {
        urlSearchParams.append(key, value as string);
      }
    });
    return `${endpoints.school.schoolTrainers}?${urlSearchParams}`;
  }, [queryParams]);

  const { data, error, isLoading, isValidating } = useSWR(fullUrl, drivysFetcher, {
    revalidateOnFocus: false,
  });

  const revalidateTrainers = () => {
    mutate(fullUrl);
  };
  const revalidateSearch = (search: any) => {
    setSearchValue(search);
    mutate(fullUrl);
  };
  // Memoize the return value for performance
  const memoizedValue = useMemo(() => {
    const DelivereyData = data?.data || [];
    return {
      schoolTrainersList: DelivereyData,
      schoolTrainersLoading: isLoading,
      schoolTrainersError: error,
      schoolTrainersValidating: isValidating,
      schoolTrainersEmpty: DelivereyData.length === 0,
      totalPages: data?.total || 0,
    };
  }, [data?.data, data?.total, error, isLoading, isValidating]);

  return {
    ...memoizedValue,
    revalidateTrainers,
    revalidateSearch,
  };
}
export function useGetSchoolPackageList({ limit, page, search }: any) {
  // Construct query parameters dynamically
  const [searchValue, setSearchValue] = useState('');
  const queryParams = useMemo(() => {
    const params: Record<string, any> = {};
    if (limit) params.limit = limit;
    if (page) params.page = page;
    if (search) params.search = search;
    // params.user_types = ['SCHOOL_ADMIN'];
    return params;
  }, [limit, page, search]);

  const fullUrl = useMemo(() => {
    const urlSearchParams = new URLSearchParams();
    Object.entries(queryParams).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        // If the value is an array, append each item
        value.forEach((item) => urlSearchParams.append(`${key}[]`, item));
      } else {
        urlSearchParams.append(key, value as string);
      }
    });
    return `${endpoints.school.package.getPackageBySchool}?${urlSearchParams}`;
  }, [queryParams]);

  const { data, error, isLoading, isValidating } = useSWR(fullUrl, drivysFetcher, {
    revalidateOnFocus: false,
  });

  const revalidatePackage = () => {
    mutate(fullUrl);
  };
  const revalidateSearch = (search: any) => {
    if (search) {
      setSearchValue(search);
      mutate(fullUrl);
    }
  };
  // Memoize the return value for performance
  const memoizedValue = useMemo(() => {
    const DelivereyData = data?.data || [];
    return {
      schoolPackageList: DelivereyData,
      schoolPackageLoading: isLoading,
      schoolPackageError: error,
      schoolPackageValidating: isValidating,
      schoolPackageEmpty: DelivereyData.length === 0,
      totalPages: data?.total || 0,
    };
  }, [data?.data, data?.total, error, isLoading, isValidating]);

  return {
    ...memoizedValue,
    revalidatePackage,
    revalidateSearch,
  };
}
