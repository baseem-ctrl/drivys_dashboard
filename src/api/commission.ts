import { fetcher, endpoints, drivysFetcher, drivysCreator } from 'src/utils/axios';
import useSWR, { mutate } from 'swr';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

// Fetch all vendor commissions with pagination

export function useGetAllVendorCommissions(page: number, limit: number) {
  const { i18n } = useTranslation();

  const getTheFullUrl = () => {
    let queryParams: Record<string, any> = {
      page: page ? page + 1 : 1,
      limit: limit || 10,
    };

    return `${endpoints.commission.listAdmin}?${new URLSearchParams(queryParams)}`;
  };

  const { data, isLoading, error, isValidating } = useSWR(getTheFullUrl, drivysFetcher);

  const memoizedValue = useMemo(
    () => ({
      vendorCommissions: data?.data as any,
      commissionsLoading: isLoading,
      commissionsError: error,
      commissionsValidating: isValidating,
      totalPages: data?.total || 0,
    }),
    [data?.data, error, isLoading, isValidating]
  );

  const revalidateVendorCommissions = () => {
    mutate(getTheFullUrl);
  };

  return { ...memoizedValue, revalidateVendorCommissions };
}

// Fetch all vendor commissions with pagination
export function useGetAllVendorCommissionList(page: number, limit: number) {
  const { i18n } = useTranslation();
  const locale = i18n.language;

  const buildQueryParams = (includeLocale: boolean) => {
    const params: Record<string, any> = {
      page: page ? page + 1 : 1,
      limit: limit || 10,
    };
    if (includeLocale) {
      params.locale = locale;
    }
    return params;
  };

  const primaryUrl = useMemo(
    () =>
      `${endpoints.commission.listAdminTrainerCommission}?${new URLSearchParams(
        buildQueryParams(true)
      )}`,
    [page, limit, locale]
  );

  const fallbackUrl = useMemo(
    () =>
      `${endpoints.commission.listAdminTrainerCommission}?${new URLSearchParams(
        buildQueryParams(false)
      )}`,
    [page, limit]
  );

  const { data: primaryData, isLoading, error, isValidating } = useSWR(primaryUrl, drivysFetcher);

  const { data: fallbackData } = useSWR(
    () => (!primaryData?.data?.length ? fallbackUrl : null),
    drivysFetcher
  );

  const dataToUse = primaryData?.data?.length ? primaryData : fallbackData;

  const memoizedValue = useMemo(
    () => ({
      vendorCommissions: dataToUse?.data || [],
      commissionsLoading: isLoading,
      commissionsError: error,
      commissionsValidating: isValidating,
      totalPages: dataToUse?.total || 0,
    }),
    [dataToUse?.data, error, isLoading, isValidating, dataToUse?.total]
  );

  const revalidateVendorCommissions = () => {
    mutate(primaryUrl);
  };

  return { ...memoizedValue, revalidateVendorCommissions };
}

export function updateCommission(body: any) {
  const URL = endpoints.commission.updateCommission;
  const response = drivysCreator([URL, body]);
  return response;
}
