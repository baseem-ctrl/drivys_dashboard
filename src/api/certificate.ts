import {
  fetcher,
  endpoints,
  drivysCreator,
  drivysFetcher,
  drivysSmasher,
  drivysCreatorPut,
} from 'src/utils/axios';
import useSWR, { mutate } from 'swr';
import React, { useEffect, useMemo } from 'react';

// Fetch all certificate requests with pagination
export function useGetAllCertificateRequests(
  page: number,
  limit: number,
  search: string,
  status?: string
) {
  const getTheFullUrl = () => {
    let queryPrams: Record<string, any> = {};

    queryPrams.page = page ? page + 1 : 1;
    queryPrams.limit = limit || 10;
    if (search) queryPrams.search = search;
    if (status) queryPrams.status = status;

    return `${endpoints.certificate.list}?${new URLSearchParams(queryPrams)}`;
  };

  const { data, isLoading, error, isValidating } = useSWR(getTheFullUrl, drivysFetcher);

  const memoizedValue = useMemo(
    () => ({
      certificateRequests: data?.data as any,
      certificateLoading: isLoading,
      certificateError: error,
      certificateValidating: isValidating,
      totalpages: data?.total || 0,
    }),
    [data?.data, error, isLoading, isValidating]
  );

  const revalidateCertificateRequests = () => {
    mutate(getTheFullUrl);
  };

  return { ...memoizedValue, revalidateCertificateRequests };
}

// ----------------------------------------------------------------------
// Add a new certificate request
export function addCertificateRequest(body: any) {
  const URL = endpoints.certificate.addRequestByAdmin;
  const response = drivysCreator([URL, body]);
  return response;
}

// ----------------------------------------------------------------------
// Update payment status of a certificate request
export function updateCertificateRequestPaymentStatus(requestId: string, status: string) {
  const URL = endpoints.certificate.updateRequestPaymentStatus;
  const body = { requestId, status };
  const response = drivysCreator([URL, body]);
  return response;
}

// ----------------------------------------------------------------------
// Update the status of a certificate request
export function updateCertificateRequestStatus(body: any) {
  const URL = endpoints.certificate.updateRequestStatus;
  const response = drivysCreator([URL, body]);
  return response;
}
