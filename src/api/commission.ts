import { fetcher, endpoints, drivysFetcher, drivysCreator } from 'src/utils/axios';
import useSWR, { mutate } from 'swr';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

// Fetch all vendor commissions with pagination

export function useGetAllVendorCommissions(page: number, limit: number) {
  const { i18n } = useTranslation();
  const locale = i18n.language;

  const getTheFullUrl = () => {
    let queryParams: Record<string, any> = {
      page: page ? page + 1 : 1,
      limit: limit || 10,
      locale,
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
  const getTheFullUrl = () => {
    let queryParams: Record<string, any> = {};
    if (page) {
      queryParams = { ...queryParams, page: page + 1 };
    } else {
      queryParams = { ...queryParams, page: 1 };
    }
    if (limit) {
      queryParams = { ...queryParams, limit };
    } else {
      queryParams = { ...queryParams, limit: 10 };
    }

    return `${endpoints.commission.listAdminTrainerCommission}?${new URLSearchParams(queryParams)}`;
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
export function updateCommission(body: any) {
  const URL = endpoints.commission.updateCommission;
  const response = drivysCreator([URL, body]);
  return response;
}
