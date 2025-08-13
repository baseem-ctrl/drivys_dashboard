import React, { useState } from 'react';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import StarIcon from '@mui/icons-material/Star';
import StarHalfIcon from '@mui/icons-material/StarHalf';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
import { useTranslation } from 'react-i18next';

export default function TrainerReportsRow({ row }) {
  const router = useRouter();
  const { t } = useTranslation();

  const handleTrainerDetails = (trainer_id) => {
    router.push(paths.dashboard.trainer.details(trainer_id));
  };

  const renderStars = (rating) => {
    const maxStars = 5;

    return (
      <>
        {Array.from({ length: maxStars }).map((_, index) => {
          if (index + 1 <= rating) {
            // Full star
            return <StarIcon key={index} color="primary" />;
          } else if (index < rating && rating < index + 1) {
            // Half star
            return <StarHalfIcon key={index} color="primary" />;
          } else {
            // Empty star
            return <StarBorderIcon key={index} color="disabled" />;
          }
        })}
      </>
    );
  };

  return (
    <TableRow hover>
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
          onClick={() => handleTrainerDetails(row['Trainer ID'])}
        >
          {row['Trainer Name'] || t('n/a')}
        </Typography>
      </TableCell>
      <TableCell>
        <Typography variant="body2">{row['School Name'] || t('n/a')}</Typography>
      </TableCell>
      <TableCell>{row['Total Bookings'] ?? '0'}</TableCell>
      <TableCell>{row['Total Sessions'] ?? '0'}</TableCell>
      <TableCell>{row['Total Completed Bookings'] ?? '0'}</TableCell>
      <TableCell>{row['Cancellation Rate'] ?? t('n/a')}</TableCell>
      <TableCell>{renderStars(row['Average Rating'])}</TableCell>
    </TableRow>
  );
}
