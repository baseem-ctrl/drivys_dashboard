import useSWR, { mutate } from 'swr';
import { useMemo } from 'react';
import { endpoints, drivysFetcher } from 'src/utils/axios';

export function useGetBookingMethodEnum() {
  const URL = endpoints.enum.bookingMethodEnum;

  const { data, isLoading, error, isValidating } = useSWR(URL, drivysFetcher, {
    revalidateOnFocus: false,
  });

  const memoizedValue = useMemo(() => {
    const bookingMethodEnum = data?.values || [];
    return {
      bookingMethodEnum,
      bookingMethodError: error,
      bookingMethodLoading: isLoading,
      bookingMethodValidating: isValidating,
    };
  }, [data, error, isLoading, isValidating]);

  const revalidateBookingMethodEnum = () => {
    mutate(URL);
  };

  return { ...memoizedValue, revalidateBookingMethodEnum };
}

export function useGetBookingStatusEnum() {
  const URL = endpoints.enum.bookingStatusEnum;

  const { data, isLoading, error, isValidating } = useSWR(URL, drivysFetcher, {
    revalidateOnFocus: false,
  });

  const memoizedValue = useMemo(() => {
    const bookingStatusEnum = data?.values || [];
    return {
      bookingStatusEnum,
      bookingStatusError: error,
      bookingStatusLoading: isLoading,
      bookingStatusValidating: isValidating,
    };
  }, [data, error, isLoading, isValidating]);

  const revalidateBookingStatusEnum = () => {
    mutate(URL);
  };

  return { ...memoizedValue, revalidateBookingStatusEnum };
}

export function useGetDriverStatusEnum() {
  const URL = endpoints.enum.driverStatusEnum;

  const { data, isLoading, error, isValidating } = useSWR(URL, drivysFetcher, {
    revalidateOnFocus: false,
  });

  const memoizedValue = useMemo(() => {
    const driverStatusEnum = data?.values || [];
    return {
      driverStatusEnum,
      driverStatusError: error,
      driverStatusLoading: isLoading,
      driverStatusValidating: isValidating,
    };
  }, [data, error, isLoading, isValidating]);

  const revalidateDriverStatusEnum = () => {
    mutate(URL);
  };

  return { ...memoizedValue, revalidateDriverStatusEnum };
}

export function useGetPaymentMethodEnum() {
  const URL = endpoints.enum.paymentMethodEnum;

  const { data, isLoading, error, isValidating } = useSWR(URL, drivysFetcher, {
    revalidateOnFocus: false,
  });

  const memoizedValue = useMemo(() => {
    const paymentMethodEnum = data?.values || [];
    return {
      paymentMethodEnum,
      paymentMethodError: error,
      paymentMethodLoading: isLoading,
      paymentMethodValidating: isValidating,
    };
  }, [data, error, isLoading, isValidating]);

  const revalidatePaymentMethodEnum = () => {
    mutate(URL);
  };

  return { ...memoizedValue, revalidatePaymentMethodEnum };
}

export function useGetPaymentRefundStatusEnum() {
  const URL = endpoints.enum.paymentRefundStatusEnum;

  const { data, isLoading, error, isValidating } = useSWR(URL, drivysFetcher, {
    revalidateOnFocus: false,
  });

  const memoizedValue = useMemo(() => {
    const paymentRefundStatusEnum = data?.values || [];
    return {
      paymentRefundStatusEnum,
      paymentRefundStatusError: error,
      paymentRefundStatusLoading: isLoading,
      paymentRefundStatusValidating: isValidating,
    };
  }, [data, error, isLoading, isValidating]);

  const revalidatePaymentRefundStatusEnum = () => {
    mutate(URL);
  };

  return { ...memoizedValue, revalidatePaymentRefundStatusEnum };
}

export function useGetPaymentStatusEnum() {
  const URL = endpoints.enum.paymentStatusEnum;

  const { data, isLoading, error, isValidating } = useSWR(URL, drivysFetcher, {
    revalidateOnFocus: false,
  });

  const memoizedValue = useMemo(() => {
    const paymentStatusEnum = data?.values || [];
    return {
      paymentStatusEnum,
      paymentStatusError: error,
      paymentStatusLoading: isLoading,
      paymentStatusValidating: isValidating,
    };
  }, [data, error, isLoading, isValidating]);

  const revalidatePaymentStatusEnum = () => {
    mutate(URL);
  };

  return { ...memoizedValue, revalidatePaymentStatusEnum };
}

export function useGetSessionStatusEnum() {
  const URL = endpoints.enum.sessionStatusEnum;

  const { data, isLoading, error, isValidating } = useSWR(URL, drivysFetcher, {
    revalidateOnFocus: false,
  });

  const memoizedValue = useMemo(() => {
    const sessionStatusEnum = data?.values || [];
    return {
      sessionStatusEnum,
      sessionStatusError: error,
      sessionStatusLoading: isLoading,
      sessionStatusValidating: isValidating,
    };
  }, [data, error, isLoading, isValidating]);

  const revalidateSessionStatusEnum = () => {
    mutate(URL);
  };

  return { ...memoizedValue, revalidateSessionStatusEnum };
}

export function useGetSessionTypeEnum() {
  const URL = endpoints.enum.sessionTypeEnum;

  const { data, isLoading, error, isValidating } = useSWR(URL, drivysFetcher, {
    revalidateOnFocus: false,
  });

  const memoizedValue = useMemo(() => {
    const sessionTypeEnum = data?.values || [];
    return {
      sessionTypeEnum,
      sessionTypeError: error,
      sessionTypeLoading: isLoading,
      sessionTypeValidating: isValidating,
    };
  }, [data, error, isLoading, isValidating]);

  const revalidateSessionTypeEnum = () => {
    mutate(URL);
  };

  return { ...memoizedValue, revalidateSessionTypeEnum };
}
export function useGetRefundRequestStatusEnum() {
  const URL = endpoints.enum.refundRequestStatus;

  const { data, isLoading, error, isValidating } = useSWR(URL, drivysFetcher, {
    revalidateOnFocus: false,
  });

  const memoizedValue = useMemo(() => {
    const refundRequestStatusEnum = data?.values || [];
    return {
      refundRequestStatusEnum,
      refundRequestStatusError: error,
      refundRequestStatusLoading: isLoading,
      refundRequestStatusValidating: isValidating,
    };
  }, [data, error, isLoading, isValidating]);

  const revalidateRefundRequestStatusEnum = () => {
    mutate(URL);
  };

  return { ...memoizedValue, revalidateRefundRequestStatusEnum };
}
export function usePaymentMethodEnum() {
  const URL = endpoints.enum.getPaymentMethodEnum;

  const { data, isLoading, error, isValidating } = useSWR(URL, drivysFetcher, {
    revalidateOnFocus: false,
  });

  const memoizedValue = useMemo(() => {
    const paymentMethodEnum = data?.values || [];
    return {
      paymentMethodEnum,
      paymentMethodError: error,
      paymentMethodLoading: isLoading,
      paymentMethodValidating: isValidating,
    };
  }, [data, error, isLoading, isValidating]);

  const revalidatePaymentMethodEnum = () => {
    mutate(URL);
  };

  return { ...memoizedValue, revalidatePaymentMethodEnum };
}
