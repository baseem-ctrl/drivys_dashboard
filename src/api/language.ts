import {
  fetcher,
  endpoints,
  drivysCreator,
  drivysFetcher,
  barrySmasher,
  drivysCreatorPut,
} from 'src/utils/axios';
import useSWR, { mutate } from 'swr';

import React, { useEffect, useMemo } from 'react';

export function useGetAllLanguage(page: number, limit: number) {
  const getTheFullUrl = () => {
    let queryPrams = {};
    if (page) {
      queryPrams = { ...queryPrams, page: page + 1 };
    } else {
      queryPrams = { ...queryPrams, page: 1 };
    }
    if (limit) {
      queryPrams = { ...queryPrams, limit };
    } else {
      queryPrams = { ...queryPrams, limit: 10 };
    }
    return `${endpoints.language.list}?${new URLSearchParams(queryPrams)}`;
  };

  const { data, isLoading, error, isValidating } = useSWR(getTheFullUrl, drivysFetcher);
  const memoizedValue = useMemo(
    () => ({
      language: data?.data as any,
      languageLoading: isLoading,
      languageError: error,
      languageValidating: isValidating,
      totalpages: data?.total || 0,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data?.data, error, isLoading, isValidating]
  );
  const revalidateLanguage = () => {
    mutate(getTheFullUrl);
  };
  return { ...memoizedValue, revalidateLanguage };
}
// ----------------------------------------------------------------------

export function deleteLanguage(id: any) {
  const URL = endpoints.language.delete + id;
  const response = barrySmasher(URL);
  return response;
}

// ----------------------------------------------------------------------

export function createLanguage(body: any) {
  const URL = endpoints.language.create;
  const response = drivysCreator([URL, body]);
  return response;
}

// ----------------------------------------------------------------------

export function updateLanguage(body: any, id: string) {
  const URL = endpoints.language.update + id;
  const response = drivysCreatorPut([URL, body]);
  return response;
}
