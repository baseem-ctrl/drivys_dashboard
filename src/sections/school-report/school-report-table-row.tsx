import React from 'react';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';

import { Chip, Stack } from '@mui/material';

export default function SchoolReportsRow({ row }) {
  const router = useRouter();

  const handleSchoolDetails = (id) => {
    router.push(paths.dashboard.school.details(id));
  };

  const renderStars = (rating) => {
    const maxStars = 5;
    const filledStars = Math.round(parseFloat(rating));
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
          onClick={() => handleSchoolDetails(row['School ID'])}
        >
          {row['School Name'] || 'N/A'}
        </Typography>
      </TableCell>
      <TableCell>
        <Stack direction="row" spacing={1}>
          <Chip
            label={`Bookings: ${row['Bookings Count'] ?? '0'}`}
            variant="outlined"
            color="secondary"
            size="small"
          />
          <Chip
            label={`Completed: ${row['Completed Bookings Count'] ?? '0'}`}
            variant="outlined"
            color="success"
            size="small"
          />
          <Chip
            label={`Confirmed: ${row['Confirmed Bookings Count'] ?? '0'}`}
            variant="outlined"
            color="info"
            size="small"
          />
        </Stack>
      </TableCell>

      <TableCell>{row['Revenue'] ?? 'N/A'}</TableCell>

      <TableCell>{row['Trainers Count'] ?? 'N/A'}</TableCell>
      <TableCell>{renderStars(row['Average Rating'])}</TableCell>
    </TableRow>
  );
}
