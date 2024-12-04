// src/api/createUserDocument.ts

import { endpoints, drivysCreator, drivysFetcher, drivysSmasher } from 'src/utils/axios';
import useSWR, { mutate } from 'swr';
import { useMemo } from 'react';

// ----------------------------------------------------------------------
// Function for creating the user document
export function createUserDocument(body: any) {
  const URL = endpoints.users.userDocument.createOrUpdate;
  const response = drivysCreator([URL, body]);
  return response;
}

// Function for updating the user document
export function updateUserDocument(body: any) {
  const URL = endpoints.users.userDocument.createOrUpdate;
  const response = drivysCreator([URL, body]);
  return response;
}

// ----------------------------------------------------------------------
// List all user documents
type useGetUserDocumentListParams = {
  limit?: number;
  page?: number;
  searchTerm?: string;
};

export function useGetUserDocumentList({
  searchTerm,
  userId,
}: {
  searchTerm?: string;
  userId?: string;
} = {}) {
  console.log('userId', userId); // Log the userId for debugging

  const getTheFullUrl = () => {
    const queryParams: Record<string, any> = {};

    if (searchTerm) queryParams.search = searchTerm;
    if (userId) queryParams.user_id = userId;

    return `${endpoints.users.userDocument.getList}?${new URLSearchParams(queryParams)}`;
  };

  const { data, isLoading, error, isValidating } = useSWR(getTheFullUrl, drivysFetcher);

  const memoizedValue = useMemo(
    () => ({
      userDocuments: data?.data as any,
      userDocumentLoading: isLoading,
      userDocumentError: error,
      userDocumentValidating: isValidating,
      totalPages: data?.total || 0,
    }),
    [data?.data, error, isLoading, isValidating]
  );

  const revalidateUserDocuments = () => {
    mutate(getTheFullUrl);
  };

  return { ...memoizedValue, revalidateUserDocuments };
}

// ----------------------------------------------------------------------
// Get user document by ID
export function useGetUserDocumentById(userId: number | string) {
  const getUserDocumentUrl = () => `${endpoints.users.userDocument.getById}/${userId}`;

  const { data, isLoading, error, isValidating } = useSWR(
    userId ? getUserDocumentUrl() : null,
    drivysFetcher
  );

  const memoizedValue = useMemo(
    () => ({
      userDocument: data?.data as any,
      userDocumentLoading: isLoading,
      userDocumentError: error,
      userDocumentValidating: isValidating,
    }),
    [data?.data, error, isLoading, isValidating]
  );

  return memoizedValue;
}

// ----------------------------------------------------------------------
// Function to delete user document by ID
export function deleteUserDocumentById(id: any) {
  const URL = `${endpoints.users.userDocument.deleteById}/${id}`;
  const response = drivysSmasher(URL);
  return response;
}
export function approveUserDoc(body: any) {
  const URL = endpoints.users.userDocument.approve;
  const response = drivysCreator([URL, body]);
  return response;
}
