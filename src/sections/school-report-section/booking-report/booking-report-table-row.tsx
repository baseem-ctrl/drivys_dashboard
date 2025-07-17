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
import { useTranslation } from 'react-i18next';

// ----------------------------------------------------------------------

export default function ReportBookingRow({ reload, row, userType }) {
  const [isReviewsVisible, setIsReviewsVisible] = useState(false);
  const router = useRouter();
  const handleRowClick = () => {
    setIsReviewsVisible(!isReviewsVisible);
  };
  const { t } = useTranslation();

  const handleUserDetails = (user_id) => {
    router.push(paths.dashboard.user.details(user_id));
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
          {row['School Name'] || t('n/a')}
        </Typography>
      </TableCell>
      <TableCell>{row['Total Number of Bookings'] || '0'}</TableCell>
      <TableCell>{row['Total Number of Students'] || '0'}</TableCell>
      <TableCell>{row['Total Number of Active Trainers'] || '0'}</TableCell>
      <TableCell>{row['Total Number of Paid Bookings'] || '0'}</TableCell>
      <TableCell>{row['Total Number of Completed Bookings'] || '0'}</TableCell>
    </TableRow>
  );
}
