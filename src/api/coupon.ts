import {
  fetcher,
  endpoints,
  drivysCreator,
  drivysFetcher,
  drivysSmasher,
  drivysCreatorPut,
} from 'src/utils/axios';
import useSWR, { mutate } from 'swr';

import React, { useEffect, useMemo } from 'react';
interface useGetCouponParams {
  limit?: number;
  page?: number;
  search?: any;
  starting_date?: any;
  ending_date?: any;
  value?: number;
  discount_type_id?: string;
  is_active?: any;
}

export function useGetAllCoupon({
  limit,
  page,
  search,
  starting_date,
  ending_date,
  value,
  discount_type_id,
  is_active,
}: useGetCouponParams = {}) {
  const queryParams = useMemo(() => {
    const params: Record<string, any> = {};
    if (limit) params.limit = limit;
    if (page) params.page = page;
    if (search) params.search = search;
    if (starting_date) params.starting_date = starting_date;
    if (ending_date) params.ending_date = ending_date;
    if (value) params.value = value;
    if (discount_type_id) params.discount_type_id = discount_type_id;
    if (is_active || is_active === '0') params.is_active = is_active;

    return params;
  }, [limit, page, search, starting_date, ending_date, value, discount_type_id, is_active]);
  const getTheFullUrl = useMemo(
    () => `${endpoints.coupon.list}?${new URLSearchParams(queryParams)}`,
    [queryParams]
  );

  const { data, isLoading, error, isValidating } = useSWR(getTheFullUrl, drivysFetcher);
  const memoizedValue = useMemo(
    () => ({
      coupon: data?.data as any,
      couponLoading: isLoading,
      couponError: error,
      couponValidating: isValidating,
      totalpages: data?.total || 0,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data?.data, error, isLoading, isValidating]
  );
  const revalidateCoupon = () => {
    mutate(getTheFullUrl);
  };
  return { ...memoizedValue, revalidateCoupon };
}
// ----------------------------------------------------------------------

export function deleteCoupon(id: any) {
  const URL = endpoints.coupon.delete + id;
  const response = drivysSmasher(URL);
  return response;
}

// ----------------------------------------------------------------------

export function createUpdateCoupon(body: any) {
  const URL = endpoints.coupon.createUpdate;
  const response = drivysCreator([URL, body]);
  return response;
}
