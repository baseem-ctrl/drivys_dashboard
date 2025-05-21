import useSWR, { mutate } from 'swr';
import { useTranslation } from 'react-i18next';
import React, { useEffect, useMemo, useState } from 'react';
// utils
import { endpoints, drivysFetcher, drivysCreator, drivysSmasher } from 'src/utils/axios';
import { IOrderItem } from 'src/types/order';

// ----------------------------------------------------------------------

export function useGetUsers({
  page,
  limit,
  user_types,
  is_active,
  shipping_status_id,
  payment_method_system_name,
  city_id,
  vehicle_type_id,
  gear,
  vendor_id,
  start_date,
  end_date,
  type,
  store_id,
  search,
  is_verified,
}: any) {
  const { i18n } = useTranslation();
  const locale = i18n.language;

  const getTheFullUrl = () => {
    const queryParams: { [key: string]: any } = {
      page: page + 1,
      limit,
    };

    if (locale) queryParams.locale = locale;
    if (user_types !== 'all') queryParams['user_types[]'] = [user_types];
    if (search) queryParams.search = search;
    if (is_active) queryParams.is_active = is_active;
    if (city_id) queryParams.city_id = city_id;
    if (vehicle_type_id) queryParams.vehicle_type_id = vehicle_type_id;
    if (gear !== undefined && gear !== null) queryParams.gear = gear;
    if (vendor_id) queryParams.vendor_id = vendor_id;
    if (start_date) queryParams.start_date = start_date;
    if (end_date) queryParams.end_date = end_date;
    if (type) queryParams.type = type;
    if (store_id) queryParams.store_id = store_id;
    if (is_verified) queryParams.is_verified = is_verified;

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

  const revalidateUsers = () => {
    mutate(getTheFullUrl);
  };

  return {
    ...memoizedValue,
    revalidateUsers,
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

export function useGetGenderEnum() {
  const URL = endpoints.users.genderenum;

  const { data, isLoading, error, isValidating } = useSWR(URL, drivysFetcher, {
    revalidateOnFocus: false,
  });

  const memoizedValue = useMemo(
    () => ({
      genderData: (data?.values as any) || {},
      genderLoading: isLoading,
      genderError: error,
      genderValdating: isValidating,
    }),
    [data?.values, error, isLoading, isValidating]
  );

  return memoizedValue;
}

export function useGetGearEnum() {
  const URL = endpoints.users.gearenum;

  const { data, isLoading, error, isValidating } = useSWR(URL, drivysFetcher, {
    revalidateOnFocus: false,
  });

  const memoizedValue = useMemo(
    () => ({
      gearData: (data?.values as any) || {},
      gearLoading: isLoading,
      gearError: error,
      gearValdating: isValidating,
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
  const response = drivysSmasher(URL);
  return response;
}

// Function to delete a user adress
export function deleteUserAddress(addressId: any) {
  const URL = `${endpoints.users.deleteAddressFromList}/${addressId}`;
  const response = drivysSmasher(URL);
  return response;
}

// Function to create user address (add new user address)

export function createNewAddressForUser(body: any) {
  const URL = endpoints.users.createNewAdressForUser;
  const response = drivysCreator([URL, body]);
  return response;
}
// Function to update the user address
export function updateExistingUserAddress(body: any, id?: any, user_id?: any) {
  const updatedBody = {
    ...body,
    id,
    user_id,
  };
  const URL = endpoints.users.createNewAdressForUser; // Use the endpoint for creating/updating user address
  const response = drivysCreator([URL, updatedBody]); // Make the API request using the updated body
  return response;
}

//  Function to fetch address list
export function useGetAddressList({
  page,
  limit,
  search,
  userId,
}: {
  page: number;
  limit: number;
  search?: string;
  userId: any;
}) {
  const getAddressUrl = () => {
    const queryParams: { [key: string]: any } = {};

    if (page > 0) queryParams.page = page + 1;
    if (limit > 0) queryParams.limit = limit;
    if (search) queryParams.search = search;
    if (userId) queryParams.user_id = userId;

    return `${endpoints.users.addressList}?${new URLSearchParams(queryParams)}`;
  };

  const { data, isLoading, error, isValidating } = useSWR(getAddressUrl, drivysFetcher, {
    revalidateOnFocus: false,
  });

  const memoizedValue = useMemo(
    () => ({
      addresses: data?.data || [],
      addressesLoading: isLoading,
      addressesError: error,
      addressesValidating: isValidating,
      addressesEmpty: !isLoading && !data?.data?.length,
      addressesLength: data?.total,
    }),
    [data, isLoading, error, isValidating]
  );

  const revalidateAddresses = () => {
    mutate(getAddressUrl);
  };

  return {
    ...memoizedValue,
    revalidateAddresses,
  };
}
export function createTrainer(body: any) {
  const URL = endpoints.trainer.createTrainer;
  const response = drivysCreator([URL, body]);
  return response;
}
