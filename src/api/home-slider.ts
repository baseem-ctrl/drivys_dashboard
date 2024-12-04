import { useMemo } from 'react';
import { ISliderItem } from 'src/types/slider';
import { endpoints, drivysCreator, drivysFetcher, drivysSmasher } from 'src/utils/axios';
import useSWR, { mutate } from 'swr';

export function useGetHomeSlider(
  page: number,
  limit: number,
  type?: string | null,
  published?: number | null,
  search?: string | null,
  show_until_from?: string | null,
  show_until_to?: string | null,
  sort?: string | null,
  display_order?: string | null
) {
  // Base URL with required params
  let URL = `${endpoints.slider.list}?page=${page + 1}&limit=${limit}`;

  // Conditionally add filters to the URL if they are not null or undefined
  const filters = {
    type,
    published,
    search,
    show_until_from,
    show_until_to,
    sort,
    display_order,
  };

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      URL += `&${key}=${encodeURIComponent(value)}`;
    }
  });

  const { data, isLoading, error, isValidating } = useSWR(URL, drivysFetcher);

  const memoizedValue = useMemo(
    () => ({
      homeSlider: (data?.data as ISliderItem[]) || [],
      homeSliderLoading: isLoading,
      homeSliderError: error,
      homeSliderValidating: isValidating,
      homeSliderEmpty: !isLoading && !data?.data?.length,
      totalpages: data?.total || 0,
    }),
    [data?.data, data?.total, error, isLoading, isValidating]
  );

  const revalidateHomeSlider = () => {
    mutate(URL);
  };

  return { ...memoizedValue, revalidateHomeSlider };
}

export function useGetFrequencyEnum() {
  const URL = `${endpoints.slider.frequencyEnum}`;

  const { data, isLoading, error, isValidating } = useSWR(URL, drivysFetcher);

  const memoizedValue = useMemo(
    () => ({
      frequencyEnum: (data?.values as any) || [] || [],
      frequencyEnumLoading: isLoading,
      frequencyEnumError: error,
      frequencyEnumValidating: isValidating,
      frequencyEnumEmpty: !isLoading && !data?.sliderItems?.data.length,
      totalpages: data?.total || 0,
    }),
    [data?.data, data?.meta?.total, error, isLoading, isValidating]
  );
  const revalidateFrequencyEnum = () => {
    mutate(URL);
  };
  return { ...memoizedValue, revalidateFrequencyEnum };
}

// export function useGetHomeSliderById(sliderId: string) {
//   const URL = sliderId ? [endpoints.slider.details, { params: { sliderId } }] : null;

//   const { data, isLoading, error, isValidating } = useSWR(URL, drivysFetcher);

//   const memoizedValue = useMemo(
//     () => ({
//       slider: data?.sliderItem as ISliderItem,
//       sliderLoading: isLoading,
//       sliderError: error,
//       sliderValidating: isValidating,
//     }),
//     [data?.sliderItem, error, isLoading, isValidating]
//   );

//   return memoizedValue;
// }

/// __________________________ DELETE ______________________________________//

export function deleteHomeSlider(id: any) {
  const URL = endpoints.slider.delete + id;
  const response = drivysSmasher(URL);
  return response;
}

export function deleteHomeSliderImage(id: any) {
  const URL = endpoints.slider.delete_slider_pictures + id;
  const response = drivysSmasher(URL);
  return response;
}

export function useGetHomeSliderById(sliderId: any) {
  const URL = endpoints.slider.details + sliderId;
  const response = drivysFetcher(URL);
  return response;
}

export function AddSlider(body: any) {
  const URL = endpoints.slider.create;
  const response = drivysCreator([URL, body]);
  return response;
}
export function CreateMapper(body: any) {
  const URL = endpoints.slider.create_mapper;
  const response = drivysCreator([URL, body]);
  return response;
}

export function EditSlider(body: any) {
  const URL = endpoints.slider.update;
  const response = drivysCreator([URL, body]);
  return response;
}

// export function useGetHomeSliderTypeEnum() {
//   const URL = endpoints.enum.homeSliderEnum;

//   const { data, isLoading, error, isValidating } = useSWR(URL, drivysFetcher);

//   const memoizedValue = useMemo(
//     () => ({
//       sliderTypeEnum: (data?.values as any) || [],
//       sliderTypeEnumLoading: isLoading,
//       sliderTypeEnumError: error,
//       sliderTypeEnumValidating: isValidating,
//       sliderTypeEnumEmpty: !isLoading && !data?.values.length,
//     }),
//     [data?.values, error, isLoading, isValidating]
//   );

//   return memoizedValue;
// }
// export function useGetlocalizedPropertyForUpdate2(
//   entity_id: any,
//   language_id: number,
//   locale_key_group: string
// ) {
//   const getTheFullUrl = () => {
//     let queryPrams = {};
//     if (entity_id) {
//       queryPrams = { ...queryPrams, entity_id };
//     }
//     if (language_id) {
//       queryPrams = { ...queryPrams, language_id };
//     }
//     if (locale_key_group) {
//       queryPrams = { ...queryPrams, locale_key_group };
//     }
//     return `${endpoints.product.getLocalizedProperty}?${new URLSearchParams(queryPrams)}`;
//   };

//   const { data, isLoading, error, isValidating } = useSWR(getTheFullUrl, drivysFetcher, {
//     revalidateOnFocus: false,
//   });

//   const memoizedValue = useMemo(
//     () => ({
//       myProperties: (data?.data as any) || [],
//       myPropertiesLoading: isLoading,
//       myPropertiesError: error,
//       myPropertiesValidating: isValidating,
//     }),
//     [data?.myProperties, error, isLoading, isValidating]
//   );
//   const revalidateProducts = () => {
//     mutate(getTheFullUrl);
//   };

//   return {
//     ...memoizedValue,
//     revalidateProducts,
//   };
// }
// -------------------------------------------------

export function CreateHomeSlidermapper(body: any) {
  const URL = endpoints.slider.create_mapper;
  const response = drivysCreator([URL, body]);
  return response;
}
