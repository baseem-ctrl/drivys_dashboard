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

  const buildQueryParams = (includeLocale: boolean) => {
    const params: Record<string, any> = {
      limit: limit || 10,
      page: page ? page + 1 : 1,
    };

    if (includeLocale) {
      params.locale = locale;
    }

    if (user_id) {
      params.user_id = user_id;
    }

    // Extra filter for school admin
    if (user_type === 'SCHOOL_ADMIN') {
      params.type = 'self';
    }

    return params;
  };

  const primaryUrl = useMemo(
    () => `${getEndpoint()}?${new URLSearchParams(buildQueryParams(true))}`,
    [limit, page, locale, user_id, user_type]
  );

  const fallbackUrl = useMemo(
    () => `${getEndpoint()}?${new URLSearchParams(buildQueryParams(false))}`,
    [limit, page, user_id, user_type]
  );

  const { data: primaryData, isLoading, error, isValidating } = useSWR(primaryUrl, drivysFetcher);

  const { data: fallbackData } = useSWR(
    () => (!primaryData?.data?.length ? fallbackUrl : null),
    drivysFetcher
  );

  const dataToUse = primaryData?.data?.length ? primaryData : fallbackData;

  const memoizedValue = useMemo(
    () => ({
      notifications: (dataToUse?.data as INotification[]) || [],
      notificationsError: error,
      notificationsLoading: isLoading,
      notificationsValidating: isValidating,
      totalpages: dataToUse?.total || 0,
    }),
    [dataToUse?.data, error, isLoading, isValidating, dataToUse?.total]
  );

  const revalidateNotifications = () => {
    mutate(primaryUrl);
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
