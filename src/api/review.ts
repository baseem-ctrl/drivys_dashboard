import { endpoints, drivysFetcher, drivysSmasher } from 'src/utils/axios';
import useSWR, { mutate } from 'swr';
import { useMemo } from 'react';

// ----------------------------------------------------------------------
// Fetch Student Reviews
type useGetStudentReviewParams = {
  student_id: number;
  trainer_id?: number;
};

export function useGetStudentReview({
  student_id,
  trainer_id,
}: Partial<useGetStudentReviewParams> = {}) {
  const getTheFullUrl = () => {
    const queryParams: Record<string, any> = {};

    if (student_id) queryParams.student_id = student_id;
    if (trainer_id) queryParams.trainer_id = trainer_id;

    return `${endpoints.review.getStudentReview}?${new URLSearchParams(queryParams)}`;
  };

  const { data, isLoading, error, isValidating } = useSWR(getTheFullUrl, drivysFetcher);

  const memoizedValue = useMemo(
    () => ({
      studentReviews: data?.data as any,
      studentReviewsLoading: isLoading,
      studentReviewsError: error,
      studentReviewsValidating: isValidating,
      totalpages: data?.data?.length || 0,
    }),
    [data?.data, error, isLoading, isValidating]
  );

  const revalidateStudentReviews = () => {
    mutate(getTheFullUrl());
  };

  return { ...memoizedValue, revalidateStudentReviews };
}

// ----------------------------------------------------------------------
// Fetch Trainer Reviews
type useGetTrainerReviewParams = {
  trainer_id: number;
  student_id?: number;
};

export function useGetTrainerReview({
  student_id,
  trainer_id,
}: Partial<useGetTrainerReviewParams> = {}) {
  const getTheFullUrl = () => {
    const queryParams: Record<string, any> = {};

    if (student_id) queryParams.student_id = student_id;
    if (trainer_id) queryParams.trainer_id = trainer_id;

    return `${endpoints.review.getTrainerReview}?${new URLSearchParams(queryParams)}`;
  };

  const { data, isLoading, error, isValidating } = useSWR(getTheFullUrl, drivysFetcher);
  const memoizedValue = useMemo(
    () => ({
      trainerReviews: data?.data as any,
      trainerReviewsLoading: isLoading,
      trainerReviewsError: error,
      trainerReviewsValidating: isValidating,
      totalpages: data?.data?.length || 0,
    }),
    [data?.data, error, isLoading, isValidating]
  );

  const revalidateTrainerReviews = () => {
    mutate(getTheFullUrl());
  };

  return { ...memoizedValue, revalidateTrainerReviews };
}

// ----------------------------------------------------------------------
type DeleteReviewParams = {
  delete_trainer_comment?: number;
  delete_student_comment?: number;
  session_id?: number;
};

export function deleteReview({
  delete_trainer_comment,
  delete_student_comment,
  session_id,
}: DeleteReviewParams) {
  const queryParams: Record<string, any> = {};
  if (delete_trainer_comment) queryParams.delete_trainer_comment = delete_trainer_comment;
  if (delete_student_comment) queryParams.delete_student_comment = delete_student_comment;
  if (session_id) queryParams.session_id = session_id;

  const URL = `${endpoints.review.deleteReview}${new URLSearchParams(queryParams)}`;
  const response = drivysSmasher(URL);
  return response;
}
