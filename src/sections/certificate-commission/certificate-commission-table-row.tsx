import React, { useState } from 'react';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';

import { Typography, Button, TextField } from '@mui/material';
import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
import { useSnackbar } from 'src/components/snackbar';
import { updateCommission } from 'src/api/commission';
// ----------------------------------------------------------------------

interface RowProps {
  certificate_commission_in_percentage: any;
  max_commission: any;
  min_commission: any;
  vendor_name: any;
}

interface StudentReviewRowProps {
  reload: () => void;
  row: RowProps;
}

export default function CertificateCommissionRow({ reload, row }: StudentReviewRowProps) {
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();

  const {
    certificate_commission_in_percentage,
    max_commission,
    min_commission,
    vendor_name = [],
    vendor_id,
  } = row;

  return (
    <TableRow hover>
      <TableCell>
        <Typography
          variant="body2"
          sx={{
            textDecoration: 'none',
            cursor: 'pointer',
            '&:hover': { textDecoration: 'underline' },
          }}
          onClick={() => router.push(paths.dashboard.school.details(vendor_id))}
        >
          {vendor_name || 'N/A'}
        </Typography>
      </TableCell>
      <TableCell>{max_commission || 'N/A'}</TableCell>
      <TableCell>{min_commission || 'N/A'}</TableCell>
      <TableCell>`{certificate_commission_in_percentage}%`</TableCell>
    </TableRow>
  );
}
