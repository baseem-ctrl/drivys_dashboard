import { fetcher, endpoints, drivysCreator, drivysFetcher } from 'src/utils/axios';
import useSWR, { mutate } from 'swr';

import React, { useEffect, useMemo } from 'react';
// ----------------------------------------------------------------------
export function createImageMultiple(body: any) {
  const URL = endpoints.allimage.create;
  const response = drivysCreator([URL, body]);
  return response;
}

// ----------------------------------------------------------------------
export function createImageSingle(body: any) {
  const URL = endpoints.allimage.createSingle;
  const response = drivysCreator([URL, body]);
  return response;
}

// ----------------------------------------------------------------------

export function useGetAllImages(page: number, limit: number) {
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
    return `${endpoints.allimage.list}?${new URLSearchParams(queryPrams)}`;
  };

  const { data, isLoading, error, isValidating } = useSWR(getTheFullUrl, drivysFetcher);
  const memoizedValue = useMemo(
    () => ({
      allImages: data?.data as any,
      allImagesLoading: isLoading,
      allImagesError: error,
      allImagesValidating: isValidating,
      totalpages: data?.total || 0,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data?.data, error, isLoading, isValidating]
  );
  const revalidateAllImages = () => {
    mutate(getTheFullUrl);
  };
  return { ...memoizedValue, revalidateAllImages };
}
