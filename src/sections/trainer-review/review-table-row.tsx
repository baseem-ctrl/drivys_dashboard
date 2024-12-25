import React, { useState } from 'react';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Label from 'src/components/label';
import { Box, Button, Paper, Table, TableBody, TableHead, Typography } from '@mui/material';
import StarIcon from '@mui/icons-material/Star'; //
import CommentIcon from '@mui/icons-material/Comment';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
import { deleteReview } from 'src/api/review';
import { useSnackbar } from 'src/components/snackbar';

// ----------------------------------------------------------------------

export default function TrainerReviewRow({ row }) {
  const { enqueueSnackbar } = useSnackbar();

  const { trainer_name, trainer_email, trainer_phone, avg_rating, reviews = [] } = row;
  const [isReviewsVisible, setIsReviewsVisible] = useState(false);
  const router = useRouter();

  const handleRowClick = () => {
    setIsReviewsVisible(!isReviewsVisible);
  };
  const handleBookingClick = (booking_id) => {
    router.push(paths.dashboard.booking.details(booking_id));
  };
  const handleUserDetails = (user_id) => {
    router.push(paths.dashboard.user.details(user_id));
  };
  const handleDeleteComment = async (session_id) => {
    try {
      // Call the deleteReview function with the necessary parameters
      const response = await deleteReview({
        delete_trainer_comment: 1,
        session_id,
      });

      if (response.status === 'success') {
        enqueueSnackbar('Comment deleted successfully.');
        // If deletion is successful, filter out the deleted review
      } else {
        // Handle failure case (optional)
        alert('Failed to delete comment');
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
    <>
      <TableRow hover onClick={handleRowClick}>
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
            onClick={() => handleUserDetails(row.trainer_id)}
          >
            {trainer_name}
          </Typography>
        </TableCell>
        <TableCell>{trainer_email}</TableCell>
        <TableCell>{trainer_phone}</TableCell>
        <TableCell>
          <Box display="flex" alignItems="center">
            {avg_rating
              ? Array.from({ length: 5 }).map((_, index) =>
                  index < avg_rating ? (
                    <StarIcon key={index} style={{ color: '#CF5A0D' }} />
                  ) : (
                    <StarBorderIcon key={index} style={{ color: '#CF5A0D' }} />
                  )
                )
              : 'No Ratings'}
          </Box>
        </TableCell>
        <TableCell>{reviews.length} Reviews</TableCell>
      </TableRow>

      {isReviewsVisible && (
        <TableRow>
          <TableCell colSpan={5} style={{ padding: '16px' }}>
            <Box>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ color: 'primary.main', mt: 3, fontSize: '20px' }}
              >
                Reviews:
              </Typography>

              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ borderTopLeftRadius: '12px' }}>Session ID</TableCell>
                    <TableCell>Booking ID</TableCell>
                    <TableCell>Student Name</TableCell>
                    <TableCell>Rating</TableCell>
                    <TableCell>Comments</TableCell>
                    <TableCell sx={{ borderTopRightRadius: '12px' }}></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reviews.map((review) => (
                    <TableRow key={review.session_id}>
                      <TableCell>{review.session_id}</TableCell>
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
                        <Typography
                          variant="body2"
                          sx={{
                            textDecoration: 'none',
                            cursor: 'pointer',
                            '&:hover': {
                              textDecoration: 'underline',
                            },
                          }}
                          onClick={() => handleUserDetails(review.student_id)}
                        >
                          {review.student_name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {review.user_rating ? (
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

                      <TableCell>{review.user_comments || 'No Comments'}</TableCell>
                      <TableCell>
                        <Button
                          variant="contained"
                          color="error"
                          sx={{
                            backgroundColor: '#CF5A0D',
                          }}
                          onClick={() => handleDeleteComment(review.session_id)}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}
