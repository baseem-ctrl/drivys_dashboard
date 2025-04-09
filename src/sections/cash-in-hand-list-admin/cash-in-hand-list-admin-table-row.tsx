import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Paper,
  Button,
  Typography,
  TextField,
  Popover,
} from '@mui/material';

import moment from 'moment';
import { useSnackbar } from 'src/components/snackbar';
import { collectCashAdmin } from 'src/api/admin-collector';

interface RowProps {
  name: any;
  collected_cash_in_hand: any;
  collected_max_cash_in_hand_allowed: any;
  id: any;
}

interface CollectedCashListRowProps {
  reload: () => void;
  row: RowProps;
}

const CashInHandListRow = ({ reload, row }: CollectedCashListRowProps) => {
  const [amount, setAmount] = useState<null | HTMLElement>(null);
  const [trainerId, setTrainerId] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const { enqueueSnackbar } = useSnackbar();

  const handleOpen = (event: React.MouseEvent<HTMLButtonElement>, id: string) => {
    setTrainerId(id);
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setTrainerId(null);
    setAnchorEl(null);
  };
  const handleCollectClick = async () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      enqueueSnackbar('Please enter a valid amount.', { variant: 'error' });
      return;
    }
    try {
      const requestBody = {
        collector_id: trainerId,
        amount,
      };

      const response = await collectCashAdmin(requestBody);
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
      setAmount(null);
    }
  };
  return (
    <TableRow hover>
      <TableCell>
        <Typography variant="body2">{row?.name ?? 'N/A'}</Typography>
      </TableCell>

      <TableCell>
        <Typography variant="body2">{row?.collected_cash_in_hand ?? 'N/A'} AED</Typography>
      </TableCell>

      <TableCell>
        <Typography variant="body2">
          {row?.collected_max_cash_in_hand_allowed !== null
            ? `${row?.collected_max_cash_in_hand_allowed} AED`
            : 'N/A'}
        </Typography>
      </TableCell>

      <TableCell>
        <Button
          variant="contained"
          color="primary"
          onClick={(e) => handleOpen(e, row.id)}
          style={{ fontWeight: '600', fontSize: '0.9rem' }}
          disabled={row?.collected_cash_in_hand <= 0}
        >
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
            <Button variant="contained" color="primary" onClick={handleCollectClick}>
              Submit
            </Button>
          </div>
        </Popover>
      </TableCell>
    </TableRow>
  );
};

export default CashInHandListRow;
