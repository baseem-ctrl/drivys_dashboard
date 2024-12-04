import useSWR, { mutate } from 'swr';
import { useMemo } from 'react';
// utils
import { fetcher, endpoints, drivysCreator, drivysFetcher, drivysSmasher } from 'src/utils/axios';
// types
import { IProductItem } from 'src/types/product';

// ----------------------------------------------------------------------

interface useGetProductsParams {
  limit?: number;
  page?: number;
  locale?: any;
  search?: any;
  weight?: any;
  price_min?: any;
  price_max?: any;
  discount_price_max?: any;
  discount_price_min?: any;
  cost_price_max?: any;
  cost_price_min?: any;
  weight_max?: any;
  weight_min?: any;
  in_stock?: any;
}

export function useGetProducts({
  limit,
  page,
  locale,
  search,
  weight,
  price_max,
  price_min,
  discount_price_max,
  discount_price_min,
  cost_price_max,
  cost_price_min,
  weight_max,
  weight_min,
  in_stock,
}: useGetProductsParams = {}) {
  // Construct query parameters dynamically
  const queryParams = useMemo(() => {
    const params: Record<string, any> = {};
    if (limit) params.limit = limit;
    if (page) params.page = page;
    if (locale) params.locale = locale;
    if (search) params.search = search;
    if (weight) params.weight = weight;
    if (price_max) params.price_max = price_max;
    if (price_min) params.price_min = price_min;
    if (discount_price_max) params.discount_price_max = discount_price_max;
    if (discount_price_min) params.discount_price_min = discount_price_min;
    if (cost_price_max) params.cost_price_max = cost_price_max;
    if (cost_price_min) params.cost_price_min = cost_price_min;
    if (weight_max) params.weight_max = weight_max;
    if (weight_min) params.weight_min = weight_min;
    if (in_stock) params.in_stock = in_stock;
    return params;
  }, [
    limit,
    page,
    locale,
    search,
    weight,
    price_max,
    price_min,
    discount_price_max,
    discount_price_min,
    cost_price_max,
    cost_price_min,
    weight_max,
    weight_min,
    in_stock,
  ]);
  const fullUrl = useMemo(
    () => `${endpoints.product.list}?${new URLSearchParams(queryParams)}`,
    [queryParams]
  );

  const { data, error, isLoading, isValidating } = useSWR(fullUrl, drivysFetcher, {
    revalidateOnFocus: false,
  });

  const revalidateProducts = () => {
    mutate(fullUrl);
  };

  // Memoize the return value for performance
  const memoizedValue = useMemo(() => {
    const productsData = data?.data || [];
    return {
      products: productsData,
      productsLoading: isLoading,
      productsError: error,
      productsValidating: isValidating,
      productsEmpty: productsData.length === 0,
      totalPages: data?.total || 0,
    };
  }, [data?.data, data?.total, error, isLoading, isValidating]);

  return {
    ...memoizedValue,
    revalidateProducts,
  };
}

// ----------------------------------------------------------------------

export function useGetProduct(productId: string) {
  const URL = productId ? [endpoints.product.details, { params: { productId } }] : null;

  const { data, isLoading, error, isValidating } = useSWR(URL, fetcher);

  const memoizedValue = useMemo(
    () => ({
      product: data?.product as IProductItem,
      productLoading: isLoading,
      productError: error,
      productValidating: isValidating,
    }),
    [data?.product, error, isLoading, isValidating]
  );

  return memoizedValue;
}

// ----------------------------------------------------------------------

export function useSearchProducts(query: string) {
  const URL = query ? [endpoints.product.search, { params: { query } }] : null;

  const { data, isLoading, error, isValidating } = useSWR(URL, fetcher, {
    keepPreviousData: true,
  });

  const memoizedValue = useMemo(
    () => ({
      searchResults: (data?.results as IProductItem[]) || [],
      searchLoading: isLoading,
      searchError: error,
      searchValidating: isValidating,
      searchEmpty: !isLoading && !data?.results.length,
    }),
    [data?.results, error, isLoading, isValidating]
  );

  return memoizedValue;
}

export function createProduct(body: any) {
  const URL = endpoints.product.create;
  const response = drivysCreator([URL, body]);
  return response;
}
export function updateProduct(body: any) {
  const URL = endpoints.product.update;
  const response = drivysCreator([URL, body]);
  return response;
}

export function deleteProductById(id: any) {
  const URL = endpoints.product.delete + id;
  const response = drivysSmasher(URL);
  return response;
}

export function deleteProduct(pictures_ids: any) {
  const URL = `${endpoints.product.delete_pic}?product_picture_ids[]=${pictures_ids}`;
  const response = drivysSmasher(URL);
  return response;
}
