import { drivysCreator, drivysFetcher, endpoints } from 'src/utils/axios';
import useSWR, { mutate } from 'swr';
import { useMemo } from 'react';

export function useGetRolesBySchoolAdmin(page: number, limit: number) {
  const queryParams: Record<string, any> = {
    page: page ? page + 1 : 1,
    limit: limit || 10,
  };

  const endpoint = `${endpoints.rolesAndPermissionSchoolAdmin.getRoles}?${new URLSearchParams(
    queryParams
  )}`;

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

export function useGetPermissionsBySchoolAdmin(page: number, limit: number) {
  const queryParams: Record<string, any> = {
    page: page ? page + 1 : 1,
    limit: limit || 10,
  };

  const endpoint = `${endpoints.rolesAndPermissionSchoolAdmin.getPermissions}?${new URLSearchParams(
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

export function createRoleBySchoolAdmin(body: any) {
  const URL = endpoints.rolesAndPermissionSchoolAdmin.createRole;
  return drivysCreator([URL, body]);
}

export function createPermissionBySchoolAdmin(body: any) {
  const URL = endpoints.rolesAndPermissionSchoolAdmin.createPermission;
  return drivysCreator([URL, body]);
}

export function mapRoleToPermissionBySchoolAdmin(body: any) {
  const URL = endpoints.rolesAndPermissionSchoolAdmin.mapRoleToPermission;
  return drivysCreator([URL, body]);
}

export function useMappedRolesBySchoolAdmin(page: number, limit: number) {
  const queryParams: Record<string, any> = {
    page: page + 1,
    limit,
  };

  const endpoint = `${
    endpoints.rolesAndPermissionSchoolAdmin.listMappedRoles
  }?${new URLSearchParams(queryParams)}`;

  const { data, isLoading, error, isValidating } = useSWR(endpoint, drivysFetcher);

  const memoizedValue = useMemo(
    () => ({
      mappedRoles: data?.data || [],
      mappedRolesLoading: isLoading,
      mappedRolesError: error,
      mappedRolesValidating: isValidating,
      mappedRolesTotal: data?.total || 0,
    }),
    [data?.data, isLoading, error, isValidating, data?.total]
  );

  const revalidateMappedRoles = () => {
    mutate(endpoint);
  };

  return { ...memoizedValue, revalidateMappedRoles };
}
