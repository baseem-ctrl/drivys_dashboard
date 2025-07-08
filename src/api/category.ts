import { fetcher, endpoints, drivysCreator, drivysFetcher, drivysSmasher } from 'src/utils/axios';
import useSWR, { mutate } from 'swr';

import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

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
  locale,
}: useGetCategoryParams & { locale?: string } = {}) {
  const { i18n } = useTranslation();
  const currentLocale = locale || i18n.language;

  const buildParams = (includeLocale: boolean) => {
    const params: Record<string, any> = {};
    if (limit) params.limit = limit;
    if (page) params.page = page;
    if (search) params.search = search;
    if (parent_id) params.parent_id = parent_id;
    if (published || published === '0') params.published = published;
    if (has_child || has_child === '0') params.has_child = has_child;
    if (includeLocale) params.locale = currentLocale;

    return params;
  };

  const primaryUrl = useMemo(
    () => `${endpoints.category.list}?${new URLSearchParams(buildParams(true))}`,
    [limit, page, search, parent_id, published, has_child, currentLocale]
  );

  const fallbackUrl = useMemo(
    () => `${endpoints.category.list}?${new URLSearchParams(buildParams(false))}`,
    [limit, page, search, parent_id, published, has_child]
  );

  const { data: primaryData, isLoading, error, isValidating } = useSWR(primaryUrl, drivysFetcher);

  const { data: fallbackData } = useSWR(
    () => (!primaryData?.data?.length ? fallbackUrl : null),
    drivysFetcher
  );

  const dataToUse = primaryData?.data?.length ? primaryData : fallbackData;

  const memoizedValue = useMemo(
    () => ({
      category: dataToUse?.data || [],
      categoryLoading: isLoading,
      categoryError: error,
      categoryValidating: isValidating,
      categoryEmpty: !isLoading && dataToUse?.data?.length === 0,
      totalpages: dataToUse?.total || 0,
    }),
    [dataToUse?.data, error, isLoading, isValidating, dataToUse?.total]
  );

  const revalidateCategory = () => {
    mutate(primaryUrl);
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
