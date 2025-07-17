import React from 'react';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
import { Link } from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import { Chip, Stack } from '@mui/material';
import { useTranslation } from 'react-i18next';

export default function SchoolReportsRow({ row }) {
  const router = useRouter();
  const { t } = useTranslation();

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
          {row['School Name'] || t('n/a')}
        </Typography>
      </TableCell>
      <TableCell>{row['Trainers Count'] ?? t('n/a')}</TableCell>

      <TableCell>
        <Stack direction="row" alignItems="center" spacing={1}>
          <EmailIcon fontSize="small" color="primary" />
          {row['School Admin Email'] ? (
            <Link>{row['School Admin Email']}</Link>
          ) : (
            <Typography color="textSecondary">N/A</Typography>
          )}
        </Stack>
      </TableCell>

      <TableCell>
        <Stack direction="row" alignItems="center" spacing={1}>
          <PhoneIcon fontSize="small" color="success" />
          {row['School Admin Phone Number'] ? (
            <Link
              // href={`tel:${row['School Admin Phone Number']}`}
              // underline="hover"
              color="#22C55E"
            >
              {row['School Admin Phone Number']}
            </Link>
          ) : (
            <Typography color="textSecondary">N/A</Typography>
          )}
        </Stack>
      </TableCell>
    </TableRow>
  );
}
