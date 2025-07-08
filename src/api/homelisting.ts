import useSWR, { mutate } from 'swr';
import { useMemo, useState } from 'react';
// utils
import { endpoints, drivysFetcher, drivysCreator, drivysSmasher } from 'src/utils/axios';
import { useTranslation } from 'react-i18next';

// ----------------------------------------------------------------------

interface useGetDelivereyParams {
  limit?: number;
  page?: number;
  locale?: string;
  search?: string;
  status?: number;
  is_active?: number | string;
  display_order?: number | string;
  catalogue_type?: number | string;
  trainer_id?: number;
}

export function useGetHomeListing({
  limit,
  page,
  search,
  status,
  is_active,
  display_order,
  catalogue_type,
  trainer_id,
}: Omit<useGetDelivereyParams, 'locale'> = {}) {
  const { i18n } = useTranslation();
  const locale = i18n.language;

  const buildQueryParams = (includeLocale: boolean) => {
    const params: Record<string, any> = {};
    if (limit) params.limit = limit;
    if (page) params.page = page;
    if (includeLocale) params.locale = locale;
    if (search) params.search = search;
    if (status) params.status = status;
    if (is_active) params.is_active = is_active;
    if (display_order) params.display_order = display_order;
    if (catalogue_type) params.catalogue_type = catalogue_type;
    if (trainer_id) params.trainer_id = trainer_id;
    return params;
  };

  const primaryUrl = useMemo(
    () => `${endpoints.homeListing.list}?${new URLSearchParams(buildQueryParams(true))}`,
    [limit, page, locale, search, status, is_active, display_order, catalogue_type, trainer_id]
  );

  const fallbackUrl = useMemo(
    () => `${endpoints.homeListing.list}?${new URLSearchParams(buildQueryParams(false))}`,
    [limit, page, search, status, is_active, display_order, catalogue_type, trainer_id]
  );

  const {
    data: primaryData,
    error,
    isLoading,
    isValidating,
  } = useSWR(primaryUrl, drivysFetcher, { revalidateOnFocus: false });

  const { data: fallbackData } = useSWR(
    () => (!primaryData?.data?.length ? fallbackUrl : null),
    drivysFetcher
  );

  const dataToUse = primaryData?.data?.length ? primaryData : fallbackData;

  const memoizedValue = useMemo(() => {
    const homeData = dataToUse?.data || [];
    return {
      homelistingList: homeData,
      homelistingLoading: isLoading,
      homelistingError: error,
      homelistingValidating: isValidating,
      homelistingEmpty: !isLoading && homeData.length === 0,
      totalPages: dataToUse?.total || 0,
    };
  }, [dataToUse?.data, dataToUse?.total, error, isLoading, isValidating]);

  const revalidateHomeListing = () => {
    mutate(primaryUrl);
  };

  return {
    ...memoizedValue,
    revalidateHomeListing,
  };
}

export function createHomeListing(body: any) {
  const URL = endpoints.homeListing.createUpdate;
  const response = drivysCreator([URL, body]);
  return response;
}
export function createUpdateHomeListingAddress(body: any) {
  const URL = endpoints.homeListing.address;
  const response = drivysCreator([URL, body]);
  return response;
}

export function updateDelivery(body: any) {
  const URL = endpoints.homeListing.update;
  const response = drivysCreator([URL, body]);
  return response;
}

export function deleteHomeListing(id: any) {
  const URL = endpoints.homeListing.delete + id;
  const response = drivysSmasher(URL);
  return response;
}
export function useGetHomeListingById(HomeListingId: string) {
  const URL = endpoints.homeListing.details + HomeListingId;

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
export function useGetHomeListingTrainers({ limit, page, vendor_id }: any) {
  // Construct query parameters dynamically
  const [searchValue, setSearchValue] = useState('');
  const queryParams = useMemo(() => {
    const params: Record<string, any> = {};
    if (limit) params.limit = limit;
    if (page) params.page = page;
    if (vendor_id) params.vendor_id = vendor_id;
    if (searchValue) params.search = searchValue;
    // params.user_types = ['HomeListing_ADMIN'];
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
    return `${endpoints.homeListing.trainers}?${urlSearchParams}`;
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
      HomeListingTrainersList: DelivereyData,
      HomeListingTrainersLoading: isLoading,
      HomeListingTrainersError: error,
      HomeListingTrainersValidating: isValidating,
      HomeListingTrainersEmpty: DelivereyData.length === 0,
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
  const URL = endpoints.homeListing.addTrainer;
  const response = drivysCreator([URL, body]);
  return response;
}

//LOGIN AS HomeListing ADMIN APIS
export function useGetHomeListingByIdAdmin(HomeListingId: string) {
  const URL = endpoints.homeListing.detailsadmin;

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
export function RemoveTrainerFromHomeListing(home_listing_id: number, trainer_id: number) {
  const URL = `${endpoints.homeListing.deleteTrainer}?home_listing_id=${home_listing_id}&trainer_id=${trainer_id}`;
  const response = drivysSmasher(URL);
  return response;
}
