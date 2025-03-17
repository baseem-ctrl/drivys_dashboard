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

export default function ReportBookingRow({ reload, row, userType }) {
  const { enqueueSnackbar } = useSnackbar();
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
          {row['School Name'] || 'N/A'}
        </Typography>
      </TableCell>
      <TableCell>{row['Top Booking Times'] || 'N/A'}</TableCell>
      <TableCell>{row['Total Number of Cancelled Sessions'] || 'N/A'}</TableCell>
      <TableCell>{row['Total Number of Completed Sessions'] || 'N/A'}</TableCell>
      <TableCell>{row['Total Number of Pending Sessions'] || 'N/A'}</TableCell>
      <TableCell>{row['Total Number of Rescheduled Sessions'] || 'N/A'}</TableCell>
      <TableCell>{row['Total Number of Sessions Booked'] || 'N/A'}</TableCell>
    </TableRow>
  );
}
