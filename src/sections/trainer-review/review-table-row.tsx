import React, { useState } from 'react';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Label from 'src/components/label';
import SaveIcon from '@mui/icons-material/Save';

import {
  Box,
  Paper,
  Table,
  TableBody,
  TableHead,
  Typography,
  Button,
  IconButton,
  TextField,
  Tooltip,
} from '@mui/material';
import StarIcon from '@mui/icons-material/Star'; //
import CommentIcon from '@mui/icons-material/Comment';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
import { deleteReview, updateReview } from 'src/api/review';
import { useSnackbar } from 'src/components/snackbar';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

// ----------------------------------------------------------------------

export default function TrainerReviewRow({ reload, row, userType }) {
  const { enqueueSnackbar } = useSnackbar();
  const { trainer_name, trainer_email, trainer_phone, avg_rating, reviews = [] } = row;
  const [isReviewsVisible, setIsReviewsVisible] = useState(false);
  const router = useRouter();

  const handleRowClick = () => {
    setIsReviewsVisible(!isReviewsVisible);
  };
  const [editedComment, setEditedComment] = useState('');
  const [editingState, setEditingState] = useState({});

  const handleEditClick = (session_id, currentComment) => {
    setEditingState({
      ...editingState,
      [session_id]: { isEditing: true, editedComment: currentComment || '' },
    });
  };

  const handleCommentChange = (session_id, newComment) => {
    setEditingState((prevState) => ({
      ...prevState,
      [session_id]: { ...prevState[session_id], editedComment: newComment },
    }));
    setEditedComment(newComment);
  };
  const handleSaveClick = async (session_id) => {
    try {
      const body = {
        session_id: session_id,
        student_comments: editedComment,
      };
      const response = await updateReview(body);

      if (response.status === 'success') {
        enqueueSnackbar('Comment deleted successfully.');
        setEditingState((prevState) => ({
          ...prevState,
          [session_id]: { isEditing: false, editedComment: '' },
        }));

        reload();
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
        delete_student_comment: 1,
        session_id,
      });

      if (response.status === 'success') {
        enqueueSnackbar('Comment deleted successfully.');
        reload();
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
            {trainer_name || 'N/A'}
          </Typography>
        </TableCell>
        <TableCell>{trainer_email || 'N/A'}</TableCell>
        <TableCell>{trainer_phone || 'N/A'}</TableCell>
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
                          {review.booking_id || 'N/A'}
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
                          {review.student_name || 'N/A'}
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

                      <TableCell>
                        {editingState[review.session_id]?.isEditing ? (
                          <TextField
                            value={editingState[review.session_id]?.editedComment || ''}
                            onChange={(e) => handleCommentChange(review.session_id, e.target.value)}
                            variant="outlined"
                            fullWidth
                          />
                        ) : (
                          review.user_comments || 'No Comments'
                        )}
                      </TableCell>

                      {userType !== 'SCHOOL_ADMIN' && (
                        <TableCell>
                          <Box display="flex" alignItems="center">
                            <Tooltip
                              title={
                                review.user_comments ? 'Delete Comment' : 'No comments to delete'
                              }
                              arrow
                            >
                              <span>
                                <IconButton
                                  color="error"
                                  onClick={() => handleDeleteComment(review.session_id)}
                                  disabled={!review.user_comments}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </span>
                            </Tooltip>
                            <Tooltip
                              title={
                                editingState[review.session_id]?.isEditing
                                  ? 'Save Comment'
                                  : 'Edit Comment'
                              }
                              arrow
                            >
                              <span>
                                <IconButton
                                  onClick={() => {
                                    if (editingState[review.session_id]?.isEditing) {
                                      handleSaveClick(review.session_id); // Save comment when in edit mode
                                    } else {
                                      handleEditClick(review.session_id, review.user_comments); // Start editing when not in edit mode
                                    }
                                  }}
                                >
                                  {editingState[review.session_id]?.isEditing ? (
                                    <SaveIcon />
                                  ) : (
                                    <EditIcon />
                                  )}
                                </IconButton>
                              </span>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      )}
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
