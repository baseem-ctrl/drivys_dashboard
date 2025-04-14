import React, { useState } from 'react';
import moment from 'moment';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import { Button, Typography, Popover, TextField } from '@mui/material';
import { useSnackbar } from 'src/components/snackbar';
import { collectCash } from 'src/api/collector';
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

interface RowProps {
  certificate_commission_in_percentage: any;
  max_commission: any;
  min_commission: any;
  user_id: any;
  vendor_name: any;
  amount_to_be_collected: number | null;
  cash_in_hand: number;
  number_of_bookings: number;
  cash_clearance_date: string | null;
}

interface StudentReviewRowProps {
  reload: () => void;
  row: RowProps;
}

export default function TrainerCashInHandRow({ reload, row }: StudentReviewRowProps) {
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [amount, setAmount] = useState<null | HTMLElement>(null);
  const [trainerId, setTrainerId] = useState<string | null>(null);

  // Open popover and set trainer ID
  const handleOpen = (event: React.MouseEvent<HTMLButtonElement>, id: string) => {
    setTrainerId(id);
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setTrainerId(null);
    setAnchorEl(null);
  };

  const handleSubmit = async () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      enqueueSnackbar('Please enter a valid amount.', { variant: 'error' });
      return;
    }
    try {
      const requestBody = {
        trainer_id: trainerId,
        amount,
      };

      const response = await collectCash(requestBody);
      if (response.status === 'success') {
        enqueueSnackbar(`Amount of ${amount} collected successfully.`, { variant: 'success' });
        handleClose();
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
      handleClose();
      reload();
    }
  };

  const handleVendorClick = (vendor_id: any) => {
    router.push(paths.dashboard.school.details(vendor_id));
  };
  const handleTrainerClick = (trainer_id: any) => {
    router.push(paths.dashboard.user.details(trainer_id));
  };
  return (
    <TableRow hover>
      <TableCell
        onClick={() => handleVendorClick(row?.vendor?.id)}
        sx={{
          cursor: 'pointer',
          '&:hover': {
            textDecoration: 'underline',
          },
        }}
      >
        <Typography variant="body2">
          {row?.vendor?.vendor_translations[0]?.name || 'N/A'}
        </Typography>
      </TableCell>
      <TableCell
        sx={{
          cursor: 'pointer',
          '&:hover': {
            textDecoration: 'underline',
          },
        }}
        onClick={() => handleTrainerClick(row?.user_id)}
      >
        {row?.user?.name || 'N/A'}
      </TableCell>
      <TableCell>
        {row?.amount_to_be_collected !== undefined && row?.amount_to_be_collected !== null
          ? row.amount_to_be_collected.toFixed(2)
          : 'N/A'}
      </TableCell>
      <TableCell>{row?.cash_in_hand.toFixed(2) ?? 'N/A'}</TableCell>
      <TableCell>{row?.number_of_bookings ?? 'N/A'}</TableCell>
      <TableCell>
        {row?.cash_clearance_date ? moment(row.cash_clearance_date).format('DD-MM-YYYY') : 'N/A'}
      </TableCell>
      <TableCell>
        <Button variant="contained" color="primary" onClick={(e) => handleOpen(e, row.user_id)}>
          Collect
        </Button>

        <Popover
          open={Boolean(anchorEl)}
          anchorEl={anchorEl}
          onClose={handleClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        >
          <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <Typography sx={{ fontSize: '13px' }}>Enter Amount</Typography>
            <TextField
              label="Amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              fullWidth
            />
            <Button variant="contained" color="primary" onClick={handleSubmit}>
              Submit
            </Button>
          </div>
        </Popover>
      </TableCell>
    </TableRow>
  );
}
