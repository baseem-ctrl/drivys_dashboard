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
    console.log(page, user_types);

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
  console.log(data, 'data');

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

// export function useGetOrderById(orderId: number) {
//   const URL = endpoints.order.details + orderId;

//   const { data, isLoading, error, isValidating } = useSWR(URL, drivysFetcher, {
//     revalidateOnFocus: false,
//   });

//   const memoizedValue = useMemo(
//     () => ({
//       order: (data?.data as any) || {},
//       orderLoading: isLoading,
//       orderError: error,
//       orderValdating: isValidating,
//     }),
//     [data?.data, error, isLoading, isValidating]
//   );

//   const revalidateOrders = () => {
//     mutate(URL);
//   };

//   return { ...memoizedValue, revalidateOrders };
// }

// export function useGetOrderByFeedback(orderId: number) {
//   const URL = endpoints.order.feedback + orderId;

//   const { data, isLoading, error, isValidating } = useSWR(URL, drivysFetcher, {
//     revalidateOnFocus: false,
//   });

//   const memoizedValue = useMemo(
//     () => ({
//       feedback: (data?.data as any) || {},
//       feedbackLoading: isLoading,
//       feedbackError: error,
//       feedbackValdating: isValidating,
//     }),
//     [data?.data, error, isLoading, isValidating]
//   );

//   const revalidateFeedback = () => {
//     mutate(URL);
//   };

//   return { ...memoizedValue, revalidateFeedback };
// }

// export function updateOrderById(id: any, data: any) {
//   const URL = endpoints.order.update + id;
//   return drivysCreator([URL, data]);
// }
// export function updateShippingStatus(data: any) {
//   const URL = endpoints.order.shippingstatus;
//   return drivysCreator([URL, data]);
// }
// export function assignVendor(data: any) {
//   const URL = endpoints.order.assign_vendor;
//   return drivysCreator([URL, data]);
// }
// export function updateOrderBooking(data: any) {
//   const URL = endpoints.order.orderBooking;
//   return drivysCreator([URL, data]);
// }

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
// export function createBookingOrder(body: any) {
//   const URL = endpoints.order.createBookingOrder;
//   const response = drivysCreator([URL, body]);
//   return response;
// }
