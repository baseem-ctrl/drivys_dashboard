import { endpoints, drivysCreator, drivysFetcher, drivysSmasher } from 'src/utils/axios';
import useSWR, { mutate } from 'swr';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

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
  const { i18n } = useTranslation();
  const locale = i18n.language;

  const buildParams = (includeLocale: boolean) => {
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
    if (page !== undefined) queryParams.page = page + 1;
    if (includeLocale) queryParams.locale = locale;

    return queryParams;
  };

  const primaryUrl = useMemo(
    () => `${endpoints.packageDocument.getList}?${new URLSearchParams(buildParams(true))}`,
    [packageId, sessionNo, status, type, title, search, sort, sort_dir, limit, page, locale]
  );

  const fallbackUrl = useMemo(
    () => `${endpoints.packageDocument.getList}?${new URLSearchParams(buildParams(false))}`,
    [packageId, sessionNo, status, type, title, search, sort, sort_dir, limit, page]
  );

  const { data: primaryData, isLoading, error, isValidating } = useSWR(primaryUrl, drivysFetcher);

  const { data: fallbackData } = useSWR(
    () => (!primaryData?.data?.length ? fallbackUrl : null),
    drivysFetcher
  );

  const dataToUse = primaryData?.data?.length ? primaryData : fallbackData;

  const memoizedValue = useMemo(
    () => ({
      documents: dataToUse?.data || [],
      docLoading: isLoading,
      docError: error,
      docValidating: isValidating,
      totalpages: dataToUse?.total || 0,
    }),
    [dataToUse?.data, error, isLoading, isValidating, dataToUse?.total]
  );

  const revalidateDocuments = () => {
    mutate(primaryUrl);
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
  const response = drivysSmasher(URL);
  return response;
}

// ----------------------------------------------------------------------
// Function to delete all package documents by package id
export function deleteAllDocumentsByPackageId(packageId: number | string) {
  const URL = `${endpoints.packageDocument.deleteAllByPackageId}/${packageId}`;
  const response = drivysSmasher(URL);
  return response;
}
