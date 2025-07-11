import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Box,
  Typography,
  Tooltip,
  Button,
} from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
import { deleteReview } from 'src/api/review';
import { useSnackbar } from 'src/components/snackbar';
import { useTranslation } from 'react-i18next';

type Review = {
  session_id: number;
  driver_rating: number | null;
  driver_comments: string | null;
  booking_id: number;
  trainer_id: number;
  trainer_name: string;
  trainer_email: string;
  trainer_phone: string;
};

type Student = {
  student_id: number;
  student_name: string;
  student_email: string;
  student_phone: string;
  reviews: Review[];
};

type Props = {
  students: Student[];
  user: any;
};

const TrainerReviewsTable: React.FC<Props> = ({ trainers, user }) => {
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation();

  const router = useRouter();
  const handleBookingClick = (booking_id) => {
    router.push(paths.dashboard.booking.details(booking_id));
  };
  const handleUserDetails = (user_id) => {
    router.push(paths.dashboard.user.details(user_id));
  };
  const handleDeleteComment = async (session_id) => {
    try {
      const response = await deleteReview({
        delete_student_comment: 1,
        session_id,
      });

      if (response.status === 'success') {
        enqueueSnackbar('Comment deleted successfully.');
      }
    } catch (error) {
      if (error?.errors && typeof error?.errors === 'object' && !Array.isArray(error?.errors)) {
        Object.values(error?.errors).forEach((errorMessage) => {
          if (typeof errorMessage === 'object') {
            enqueueSnackbar(errorMessage[0], { variant: 'error' });
          } else {
            enqueueSnackbar(errorMessage, { variant: 'error' });
          }
        });
      } else {
        enqueueSnackbar(error.message, { variant: 'error' });
      }
    }
  };
  return (
    <div>
      {trainers?.length > 0 ? (
        trainers.map((student) => (
          <div key={student.student_id}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ borderTopLeftRadius: '12px' }}>{t('Session ID')}</TableCell>
                  <TableCell>{t('Student Name')}</TableCell>
                  <TableCell>{t('Booking ID')}</TableCell>
                  <TableCell>{t('Rating')}</TableCell>
                  <TableCell>{t('Comments')}</TableCell>
                  <TableCell sx={{ borderTopRightRadius: '12px' }}></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {student?.reviews?.length > 0 ? (
                  student.reviews.map((review) => (
                    <TableRow key={review?.session_id}>
                      <TableCell>{review?.session_id ?? 'NA'}</TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{
                            textDecoration: 'none',
                            cursor: 'pointer',
                            '&:hover': {
                              textDecoration: 'underline',
                            },
                          }}
                          onClick={() =>
                            review?.student_id ? handleUserDetails(review?.student_id) : ''
                          }
                        >
                          {review?.student_name ?? 'NA'}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{
                            textDecoration: 'none',
                            cursor: 'pointer',
                            '&:hover': {
                              textDecoration: 'underline',
                            },
                          }}
                          onClick={() => handleBookingClick(review.booking_id)}
                        >
                          {review.booking_id}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {review?.user_rating ? (
                          <Box display="flex" alignItems="center">
                            {Array.from({ length: 5 }).map((_, index) =>
                              index < review.user_rating ? (
                                <StarIcon
                                  key={index}
                                  style={{ color: '#CF5A0D', marginRight: '4px' }}
                                />
                              ) : (
                                <StarBorderIcon
                                  key={index}
                                  style={{ color: '#CF5A0D', marginRight: '4px' }}
                                />
                              )
                            )}
                          </Box>
                        ) : (
                          'N/A'
                        )}
                      </TableCell>
                      <TableCell>{review?.user_comments || t('No Comments')}</TableCell>
                      {user?.user?.user_type !== 'SCHOOL_ADMIN' && (
                        <TableCell>
                          <Tooltip
                            title={review?.user_comments ? '' : t('No comments to delete')}
                            arrow
                          >
                            <span>
                              <Button
                                variant="contained"
                                color="error"
                                sx={{
                                  backgroundColor: '#CF5A0D',
                                }}
                                onClick={() => handleDeleteComment(review?.session_id)}
                                disabled={!review.user_comments}
                              >
                                {t('Delete')}
                              </Button>
                            </span>
                          </Tooltip>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Box sx={{ py: 2 }}>
                        <Typography variant="h6" color="textSecondary">
                          {t('No reviews available under this trainer')}
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        ))
      ) : (
        <Box sx={{ py: 2 }}>
          <Typography variant="h6" color="textSecondary">
            {t('No reviews available under this trainer')}
          </Typography>
        </Box>
      )}
    </div>
  );
};

export default TrainerReviewsTable;
