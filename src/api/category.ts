import { fetcher, endpoints, drivysCreator, drivysFetcher, drivysSmasher } from 'src/utils/axios';
import useSWR, { mutate } from 'swr';

import React, { useEffect, useMemo, useState } from 'react';

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
  has_child?: any;
}
export function useGetAllCategory({
  limit,
  page,
  search,
  published,
  parent_id,
  has_child,
}: useGetCategoryParams = {}) {
  const queryParams = useMemo(() => {
    const params: Record<string, any> = {};
    if (limit) params.limit = limit;
    if (page) params.page = page;
    if (search) params.search = search;
    if (parent_id) params.parent_id = parent_id;
    if (published || published === '0') params.published = published;
    if (has_child || has_child === '0') params.has_child = has_child;

    return params;
  }, [limit, page, search, parent_id, published]);
  const getTheFullUrl = useMemo(
    () => `${endpoints.category.list}?${new URLSearchParams(queryParams)}`,
    [queryParams]
  );

  const { data, isLoading, error, isValidating } = useSWR(getTheFullUrl, drivysFetcher);

  const memoizedValue = useMemo(
    () => ({
      category: data?.data as any,
      categoryLoading: isLoading,
      categoryError: error,
      categoryValidating: isValidating,
      categoryEmpty: !isLoading && data?.data?.length === 0,
      totalpages: data?.total || 0,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data?.data, error, isLoading, isValidating]
  );
  const revalidateCategory = () => {
    mutate(getTheFullUrl);
  };
  return { ...memoizedValue, revalidateCategory };
}
// ----------------------------------------------------------------------

export function deleteCategory(category_translation_id: any, pictures_ids: any) {
  const URL =
    endpoints.category.delete +
    '?category_translation_id=' +
    category_translation_id +
    '&' +
    'pictures_ids[]=' +
    pictures_ids;
  const response = drivysSmasher(URL);
  return response;
}

export function deleteCategoryById(id: any) {
  const URL = endpoints.category.deleteId + id;
  const response = drivysSmasher(URL);
  return response;
}
