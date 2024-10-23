import { endpoints, drivysCreator, drivysFetcher, barrySmasher } from 'src/utils/axios';
import useSWR, { mutate } from 'swr';
import { useMemo } from 'react';

// ----------------------------------------------------------------------
// Function for creating or updating a package document
export function createOrUpdatePackageDocument(body: any) {
  const URL = endpoints.packageDocument.createOrUpdate;
  const response = drivysCreator([URL, body]);
  return response;
}

// ----------------------------------------------------------------------
// List all package documents
type useGetPackageDocumentsParams = {
  packageId?: number;
  sessionNo?: number;
  status?: string;
  type?: string;
  title?: string;
  search?: string;
  sort?: string;
  sort_dir?: string;
  limit?: number;
  page?: number;
};

export function useGetPackageDocuments({
  packageId,
  sessionNo,
  status,
  type,
  title,
  search,
  sort,
  sort_dir,
  limit,
  page,
}: useGetPackageDocumentsParams = {}) {
  const getTheFullUrl = () => {
    const queryParams: Record<string, any> = {};

    if (packageId !== undefined) queryParams.package_id = packageId;
    if (sessionNo !== undefined) queryParams.session_no = sessionNo;
    if (status !== undefined) queryParams.status = status;
    if (type !== undefined) queryParams.type = type;
    if (title !== undefined) queryParams.title = title;
    if (search !== undefined) queryParams.search = search;
    if (sort !== undefined) queryParams.sort = sort;
    if (sort_dir !== undefined) queryParams.sort_dir = sort_dir;
    if (limit !== undefined) queryParams.limit = limit;
    if (page !== undefined) queryParams.page = page ? page + 1 : 1;

    return `${endpoints.packageDocument.getList}?${new URLSearchParams(queryParams)}`;
  };

  const { data, isLoading, error, isValidating } = useSWR(getTheFullUrl, drivysFetcher);

  const memoizedValue = useMemo(
    () => ({
      documents: data?.data as any,
      docLoading: isLoading,
      docError: error,
      docValidating: isValidating,
      totalpages: data?.total || 0,
    }),
    [data?.data, error, isLoading, isValidating]
  );

  const revalidateDocuments = () => {
    mutate(getTheFullUrl);
  };

  return { ...memoizedValue, revalidateDocuments };
}

// ----------------------------------------------------------------------
// Fetch package document by id
export function useGetPackageDocumentById(docId: number | string) {
  const getDocumentUrl = () => `${endpoints.packageDocument.getById}/${docId}`;

  const { data, isLoading, error, isValidating } = useSWR(
    docId ? getDocumentUrl() : null,
    drivysFetcher
  );

  const memoizedValue = useMemo(
    () => ({
      document: data?.data as any,
      docLoading: isLoading,
      docError: error,
      docValidating: isValidating,
    }),
    [data?.data, error, isLoading, isValidating]
  );

  return memoizedValue;
}

// ----------------------------------------------------------------------
// Function to delete package document by id
export function deletePackageDocumentById(id: any) {
  const URL = `${endpoints.packageDocument.deleteById}/${id}`;
  const response = barrySmasher(URL);
  return response;
}

// ----------------------------------------------------------------------
// Function to delete all package documents by package id
export function deleteAllDocumentsByPackageId(packageId: number | string) {
  const URL = `${endpoints.packageDocument.deleteAllByPackageId}/${packageId}`;
  const response = barrySmasher(URL);
  return response;
}
