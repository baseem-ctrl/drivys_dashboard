import { endpoints, drivysCreator, drivysFetcher, barrySmasher } from 'src/utils/axios';
import useSWR, { mutate } from 'swr';

import { useMemo } from 'react';

// ----------------------------------------------------------------------
export function createCategory(body: any) {
  const URL = endpoints.category.create;
  const response = drivysCreator([URL, body]);
  return response;
}

// ----------------------------------------------------------------------
interface useGetCategoryParams {
  limit?: number;
  page?: number;
  search?: any;
  published?: any;
  parent_id?: any;
  keywords?: any;
  language_name?: any;
  dialect_name?: any;
  is_published?: any;
}
export function useGetAllDialect({
  limit,
  page,
  search,
  published,
  parent_id,
  language_name,
  dialect_name,
  keywords,
  is_published,
}: useGetCategoryParams = {}) {
  // Memoize the query parameters
  const queryParams = useMemo(() => {
    const params: Record<string, any> = {};
    if (limit) params.limit = limit;
    if (page) params.page = page;
    if (search) params.search = search;
    if (parent_id) params.parent_id = parent_id;
    if (published || published === '0') params.published = published;

    if (language_name) params.language_name = language_name;
    if (dialect_name) params.dialect_name = dialect_name;
    if (keywords) params.keywords = keywords;

    if (is_published === 'published') {
      params.is_published = 1; // Pass 1 if 'published'
    } else if (is_published === 'unpublished') {
      params.is_published = 0; // Pass 0 if 'unpublished'
    }
    return params;
  }, [
    limit,
    page,
    search,
    parent_id,
    published,
    language_name,
    dialect_name,
    keywords,
    is_published,
  ]);

  const getTheFullUrl = useMemo(
    () => `${endpoints.dialect.list}?${new URLSearchParams(queryParams)}`,
    [queryParams]
  );

  // Fetch data using SWR
  const { data, isLoading, error, isValidating } = useSWR(getTheFullUrl, drivysFetcher);

  const memoizedValue = useMemo(
    () => ({
      dialect: data?.data as any,
      dialectLoading: isLoading,
      dialectError: error,
      dialectValidating: isValidating,
      dialectEmpty: !isLoading && data?.data?.length === 0,
      totalpages: data?.total || 0,
    }),
    [data?.data, error, isLoading, isValidating]
  );

  const revalidateCategory = () => {
    mutate(getTheFullUrl);
  };

  return { ...memoizedValue, revalidateCategory };
}

// ----------------------------------------------------------------------

// Fetch a dialect by ID
export function useGetDialectById(dialectId: number | string) {
  const getDialectUrl = () => `admin/dialect/get-by-id/${dialectId}`;

  const { data, isLoading, error, isValidating } = useSWR(
    dialectId ? getDialectUrl() : null,
    drivysFetcher
  );

  const memoizedValue = useMemo(
    () => ({
      dialect: data?.data as any,
      dialectLoading: isLoading,
      dialectError: error,
      dialectValidating: isValidating,
    }),
    [data?.data, error, isLoading, isValidating]
  );

  return memoizedValue;
}

// ----------------------------------------------------------------------
// Delete a dialect by ID
export function deleteDialect(id: any) {
  const URL = `${endpoints.dialect.deleteDilect}/${id}`;
  const response = barrySmasher(URL);
  return response;
}

// ----------------------------------------------------------------------
// Create or update a dialect
export function createOrUpdateDialect(body: any) {
  const URL = endpoints.dialect.createDialect;
  const response = drivysCreator([URL, body]);
  return response;
}
