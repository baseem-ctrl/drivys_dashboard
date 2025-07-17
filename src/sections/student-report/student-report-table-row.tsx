import React, { useState } from 'react';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
import { Chip } from '@mui/material';
import { useTranslation } from 'react-i18next';

export default function StudentReportsRow({ row }) {
  const router = useRouter();
  const { t } = useTranslation();

  const handleStudentDetails = (id) => {
    router.push(paths.dashboard.user.details(id));
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
          onClick={() => handleStudentDetails(row['Student ID'])}
        >
          {row['Student Name'] || t('n/a')}
        </Typography>
      </TableCell>
      <TableCell>{row['Total Sessions'] ?? '0'}</TableCell>
      <TableCell>{row['Completed Sessions'] ?? '0'}</TableCell>
      <TableCell>{row['Category'] ?? t('n/a')}</TableCell>
      <TableCell>
        {' '}
        <span className="dirham-symbol">&#x00EA;</span>
        {row['Amount Paid'] ?? '0'}{' '}
      </TableCell>
      <TableCell>
        <Chip
          label={row['Certificate Issued'] ? 'Yes' : 'No'}
          color={row['Certificate Issued'] ? 'success' : 'error'}
          variant="soft"
        />
      </TableCell>{' '}
    </TableRow>
  );
}
