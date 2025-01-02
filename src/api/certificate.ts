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
export function useGetAllCertificateRequests(page: number, limit: number) {
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
export function updateCertificateRequestStatus(requestId: string, status: string) {
  const URL = endpoints.certificate.updateRequestStatus;
  const body = { requestId, status };
  const response = drivysCreator([URL, body]);
  return response;
}
