import React, { useState } from 'react';
import moment from 'moment';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';

import { Typography } from '@mui/material';
import { useRouter } from 'src/routes/hooks';
import { useSnackbar } from 'src/components/snackbar';
import { useAuthContext } from 'src/auth/hooks';
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

export default function TrainerCashInHandRow({ reload, row }: StudentReviewRowProps) {
  return (
    <TableRow hover>
      <TableCell>
        <Typography variant="body2">
          {row?.vendor?.vendor_translations[0]?.name || 'N/A'}
        </Typography>
      </TableCell>
      <TableCell>{row?.user?.name || 'N/A'}</TableCell>
      <TableCell>
        <TableCell>
          {row?.amount_to_be_collected !== undefined && row?.amount_to_be_collected !== null
            ? row.amount_to_be_collected.toFixed(2)
            : 'N/A'}
        </TableCell>
      </TableCell>
      <TableCell>{row?.cash_in_hand.toFixed(2) ?? 'N/A'}</TableCell>
      <TableCell>{row?.number_of_bookings ?? 'N/A'}</TableCell>
      <TableCell>
        {row?.cash_clearance_date ? moment(row.cash_clearance_date).format('DD-MM-YYYY') : 'N/A'}
      </TableCell>{' '}
    </TableRow>
  );
}
