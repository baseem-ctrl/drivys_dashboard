import { drivysCreator, drivysFetcher, endpoints } from 'src/utils/axios';
import useSWR, { mutate } from 'swr';
import { useMemo } from 'react';

export function useGetRoles(page: number, limit: number) {
  const queryParams: Record<string, any> = {};
  queryParams.page = page ? page + 1 : 1;
  queryParams.limit = limit || 10;

  const endpoint = `${endpoints.rolesAndPermission.getRoles}?${new URLSearchParams(queryParams)}`;

  const { data, isLoading, error, isValidating } = useSWR(endpoint, drivysFetcher);

  const memoizedValue = useMemo(
    () => ({
      roles: data?.data || [],
      rolesLoading: isLoading,
      rolesError: error,
      rolesValidating: isValidating,
      rolesTotalPages: data?.total || 0,
    }),
    [data?.data, isLoading, error, isValidating, data?.total]
  );

  const revalidateRoles = () => {
    mutate(endpoint);
  };

  return { ...memoizedValue, revalidateRoles };
}

export function useGetPermissions(page: number, limit: number) {
  const queryParams: Record<string, any> = {};
  queryParams.page = page ? page + 1 : 1;
  queryParams.limit = limit || 10;

  const endpoint = `${endpoints.rolesAndPermission.getPermissions}?${new URLSearchParams(
    queryParams
  )}`;

  const { data, isLoading, error, isValidating } = useSWR(endpoint, drivysFetcher);

  const memoizedValue = useMemo(
    () => ({
      permissions: data?.data || [],
      permissionsLoading: isLoading,
      permissionsError: error,
      permissionsValidating: isValidating,
      permissionsTotalPages: data?.total || 0,
    }),
    [data?.data, isLoading, error, isValidating, data?.total]
  );

  const revalidatePermissions = () => {
    mutate(endpoint);
  };

  return { ...memoizedValue, revalidatePermissions };
}

export function createPermission(body: any) {
  const URL = endpoints.rolesAndPermission.createPermission;
  const response = drivysCreator([URL, body]);
  return response;
}
export function createRole(body: any) {
  const URL = endpoints.rolesAndPermission.createRole;
  const response = drivysCreator([URL, body]);
  return response;
}
