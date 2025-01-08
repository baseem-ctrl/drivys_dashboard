import React, { useState } from 'react';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Label from 'src/components/label';
import Tooltip from '@mui/material/Tooltip';
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

interface EditingState {
  [key: number]: {
    isEditing: boolean;
    editedComment: string;
  };
}

interface RowProps {
  student_id: number;
  student_name: string;
  student_email: string;
  student_phone: string;
  avg_rating?: number;
  reviews?: Array<any>; // You can define a more specific type for reviews if needed
}

interface StudentReviewRowProps {
  reload: () => void;
  row: RowProps;
  userType: string;
}

export default function StudentReviewRow({ reload, row, userType }: StudentReviewRowProps) {
  const { enqueueSnackbar } = useSnackbar();

  const { student_name, student_email, student_phone, avg_rating, reviews = [] } = row;
  const [isReviewsVisible, setIsReviewsVisible] = useState(false);
  const router = useRouter();
  const [editedComment, setEditedComment] = useState('');
  const [editingState, setEditingState] = useState<EditingState>({});

  const handleEditClick = (session_id: number, currentComment: string) => {
    setEditingState({
      ...editingState,
      [session_id]: { isEditing: true, editedComment: currentComment || '' },
    });
  };

  const handleCommentChange = (session_id: number, newComment: string) => {
    setEditingState((prevState) => ({
      ...prevState,
      [session_id]: { ...prevState[session_id], editedComment: newComment },
    }));
    setEditedComment(newComment);
  };

  const handleRowClick = () => {
    setIsReviewsVisible(!isReviewsVisible);
  };
  const handleBookingClick = (booking_id) => {
    router.push(paths.dashboard.booking.details(booking_id));
  };

  const handleUserDetails = (user_id) => {
    router.push(paths.dashboard.user.details(user_id));
  };

  // Function to delete the comments
  const handleDeleteComment = async (session_id: number) => {
    try {
      const response = await deleteReview({
        delete_trainer_comment: 1,
        session_id,
      });

      if (response.status === 'success') {
        enqueueSnackbar('Comment deleted successfully.');
        reload();
      }
    } catch (error) {
      if (error?.errors && typeof error?.errors === 'object' && !Array.isArray(error?.errors)) {
        Object.values(error?.errors).forEach((errorMessage) => {
          if (errorMessage && typeof errorMessage === 'object') {
            enqueueSnackbar(errorMessage[0], { variant: 'error' });
          } else if (errorMessage) {
            enqueueSnackbar(errorMessage, { variant: 'error' });
          }
        });
      } else {
        enqueueSnackbar(error.message, { variant: 'error' });
      }
    }
  };
  const handleSaveClick = async (session_id: number) => {
    try {
      const body = {
        session_id,
        driver_comments: editedComment,
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
          if (errorMessage && typeof errorMessage === 'object') {
            enqueueSnackbar(errorMessage[0], { variant: 'error' });
          } else if (errorMessage) {
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
      {/* Trainer Row */}
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
            onClick={() => handleUserDetails(row.student_id)}
          >
            {student_name}
          </Typography>
        </TableCell>
        <TableCell>{student_email}</TableCell>
        <TableCell>{student_phone}</TableCell>

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
                Reviews
              </Typography>

              <Table>
                <TableHead sx={{ borderRadius: '8px', overflow: 'hidden' }}>
                  {' '}
                  <TableRow>
                    <TableCell sx={{ borderTopLeftRadius: '12px' }}>Session ID</TableCell>
                    <TableCell>Booking ID</TableCell>
                    <TableCell>Trainer Name</TableCell>
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
                        {' '}
                        <Typography
                          variant="body2"
                          sx={{
                            textDecoration: 'none',
                            cursor: 'pointer',
                            '&:hover': {
                              textDecoration: 'underline',
                            },
                          }}
                          onClick={() => handleUserDetails(review.trainer_id)}
                        >
                          {review.trainer_name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {review.driver_rating ? (
                          <Box display="flex" alignItems="center">
                            {Array.from({ length: 5 }).map((_, index) =>
                              index < review.driver_rating ? (
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
                          review.driver_comments || 'No Comments'
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
                                      handleSaveClick(review.session_id);
                                    } else {
                                      handleEditClick(review.session_id, review.user_comments);
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
