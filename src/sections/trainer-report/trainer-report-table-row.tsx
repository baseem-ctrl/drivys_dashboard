import React, { useState } from 'react';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';

export default function TrainerReportsRow({ row }) {
  const router = useRouter();

  const handleTrainerDetails = (trainer_id) => {
    router.push(paths.dashboard.trainer.details(trainer_id));
  };

  const renderStars = (rating) => {
    const maxStars = 5;
    const filledStars = Math.round(rating);
    return (
      <>
        {[...Array(maxStars)].map((_, index) =>
          index < filledStars ? (
            <StarIcon key={index} color="primary" />
          ) : (
            <StarBorderIcon key={index} color="disabled" />
          )
        )}
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
          {row['Trainer Name'] || 'N/A'}
        </Typography>
      </TableCell>
      <TableCell>
        <Typography variant="body2">{row['School Name'] || 'N/A'}</Typography>
      </TableCell>
      <TableCell>{row['Total Bookings'] ?? '0'}</TableCell>
      <TableCell>{row['Total Sessions'] ?? '0'}</TableCell>
      <TableCell>{row['Total Completed Bookings'] ?? '0'}</TableCell>
      <TableCell>{row['Cancellation Rate'] ?? 'N/A'}</TableCell>
      <TableCell>{renderStars(row['Average Rating'])}</TableCell>
    </TableRow>
  );
}
