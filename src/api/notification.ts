import useSWR, { mutate } from 'swr';
import React, { useMemo } from 'react';
// utils
import { endpoints, drivysFetcher, drivysSmasher, drivysCreator } from 'src/utils/axios';
import { INotification } from 'src/types/notification';
import { useTranslation } from 'react-i18next';

// ----------------------------------------------------------------------

interface UseGetNotificationListProps {
  page: number;
  limit: number;
  searchQuery?: string;
  locale?: string;
}

export function useGetNotificationList({ page, limit }: UseGetNotificationListProps) {
  const { i18n } = useTranslation();
  const locale = i18n.language;

  const getTheFullUrl = () => {
    const queryParams: Record<string, any> = {
      limit: limit || 10,
      page: page ? page + 1 : 1,
      locale,
    };

    return `${endpoints.notification.getList}?${new URLSearchParams(queryParams)}`;
  };

  const { data, isLoading, error, isValidating } = useSWR(getTheFullUrl, drivysFetcher);

  const memoizedValue = useMemo(
    () => ({
      notifications: (data?.data as INotification[]) || [],
      notificationsError: error,
      notificationsLoading: isLoading,
      notificationsValidating: isValidating,
      totalpages: data?.total || 0,
    }),
    [data?.data, error, isLoading, isValidating, data?.total]
  );

  const revalidateNotifications = () => {
    mutate(getTheFullUrl);
  };

  return { ...memoizedValue, revalidateNotifications };
}

export async function sendNotification(notificationData: Body) {
  const URL = endpoints.notification.send;
  try {
    const response = await drivysCreator([URL, notificationData]);
    return response;
  } catch (error) {
    console.error('Error sending notification:', error);
    throw error;
  }
}
export async function updateFcm(fcmToken: string) {
  const URL = endpoints.updateFCMToken;
  const payload = { fcm_token: fcmToken };

  try {
    const response = await drivysCreator([URL, payload]);
    return response;
  } catch (error) {
    console.error('Error updating FCM token:', error);
    throw error;
  }
}
