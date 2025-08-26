import useSWR, { mutate } from 'swr';
import React, { useMemo } from 'react';
// utils
import { endpoints, drivysFetcher, drivysSmasher, drivysCreator } from 'src/utils/axios';
import { INotification } from 'src/types/notification';
import { useTranslation } from 'react-i18next';
import { useAuthContext } from 'src/auth/hooks';

// ----------------------------------------------------------------------

interface UseGetNotificationListProps {
  page: number;
  limit: number;
  searchQuery?: string;
  locale?: string;
  user_id?: string;
}

export function useGetNotificationList({ page, limit, user_id }: UseGetNotificationListProps) {
  const { i18n } = useTranslation();
  const locale = i18n.language;
  const { user } = useAuthContext();
  const user_type = user?.user?.user_type;

  // Choose endpoint based on logged-in user_type
  const getEndpoint = () => {
    switch (user_type) {
      case 'ASSISTANT':
        return endpoints.notification.getListAssistant;
      case 'COLLECTOR':
        return endpoints.notification.getListCollector;
      case 'SCHOOL_ADMIN':
        return endpoints.notification.getListSchoolAdmin;
      default:
        return endpoints.notification.getList;
    }
  };

  const buildQueryParams = () => {
    const params: Record<string, any> = {
      limit: limit || 10,
      page: page ? page + 1 : 1,
      locale, // always include locale
    };

    if (user_id) {
      params.user_id = user_id;
    }

    // Extra filter for school admin
    if (user_type === 'SCHOOL_ADMIN') {
      params.type = 'self';
    }

    return params;
  };

  const url = useMemo(
    () => `${getEndpoint()}?${new URLSearchParams(buildQueryParams()).toString()}`,
    [limit, page, locale, user_id, user_type]
  );

  const { data, isLoading, error, isValidating } = useSWR(url, drivysFetcher);

  const memoizedValue = useMemo(
    () => ({
      notifications: (data?.data as INotification[]) || [],
      notificationsError: error,
      notificationsLoading: isLoading,
      notificationsValidating: isValidating,
      totalpages: data?.total || 0,
    }),
    [data?.data, data?.total, error, isLoading, isValidating]
  );

  const revalidateNotifications = () => {
    mutate(url);
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
