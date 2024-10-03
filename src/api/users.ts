import useSWR, { mutate } from 'swr';
import React, { useEffect, useMemo, useState } from 'react';
// utils
import { endpoints, drivysFetcher, drivysCreator, barrySmasher } from 'src/utils/axios';
import { IOrderItem } from 'src/types/order';

// ----------------------------------------------------------------------

export function useGetUsers({
  page,
  limit,
  user_types,
  is_active,
  shipping_status_id,
  payment_method_system_name,
  city,
  start_date,
  end_date,
  type,
  store_id,
  search,
}: any) {
  const getTheFullUrl = () => {
    const queryParams: { [key: string]: any } = {
      page: page + 1,
      limit,
    };

    if (user_types !== 'all') {
      queryParams['user_types[]'] = [user_types]; // Set as an array for URL params
    } // if (payment_status_id) queryParams.payment_status_id = payment_status_id;
    // if (shipping_status_id) queryParams.shipping_status_id = shipping_status_id;
    // if (payment_method_system_name)
    //   queryParams.payment_method_system_name = payment_method_system_name;
    // if (city) queryParams.city = city;
    // if (start_date) queryParams.start_date = start_date;
    // if (end_date) queryParams.end_date = end_date;
    // if (type || type === 0) queryParams.type = type === 0 ? 0 : type;
    // if (store_id) queryParams.store_id = store_id;
    if (search) queryParams.search = search;
    if (is_active) queryParams.is_active = is_active;
    return `${endpoints.users.list}?${new URLSearchParams(queryParams)}`;
  };

  const { data, isLoading, error, isValidating } = useSWR(getTheFullUrl, drivysFetcher, {
    revalidateOnFocus: false,
  });

  const memoizedValue = useMemo(
    () => ({
      users: data?.data || [],
      usersLoading: isLoading,
      usersError: error,
      usersValidating: isValidating,
      usersEmpty: !isLoading && !data?.data?.length,
      usersLength: data?.total,
      usersFilter: data?.total,
    }),
    [data, isLoading, error, isValidating]
  );

  const revalidateOrders = () => {
    mutate(getTheFullUrl);
  };

  return {
    ...memoizedValue,
    revalidateOrders,
  };
}

export function useGetUserById(schoolId: string) {
  const URL = endpoints.users.details + schoolId;

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
export function useGetUserTypeEnum() {
  const URL = endpoints.users.enum;

  const { data, isLoading, error, isValidating } = useSWR(URL, drivysFetcher, {
    revalidateOnFocus: false,
  });

  const memoizedValue = useMemo(
    () => ({
      enumData: (data?.values as any) || {},
      enumLoading: isLoading,
      enumError: error,
      enumValdating: isValidating,
    }),
    [data?.values, error, isLoading, isValidating]
  );

  return memoizedValue;
}
export function createUser(body: any) {
  const URL = endpoints.users.create;
  const response = drivysCreator([URL, body]);
  return response;
}
export function updateUser(body: any) {
  const URL = endpoints.users.update;
  const response = drivysCreator([URL, body]);
  return response;
}

export function useGetUserDetails(userId: string) {
  const URL = endpoints.users.getbyId + userId;

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
export function deleteUser(id: any) {
  const URL = `${endpoints.users.delete}?user_id=${id}`;
  const response = barrySmasher(URL);
  return response;
}
