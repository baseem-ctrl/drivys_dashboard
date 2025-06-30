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
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { useTranslation } from 'react-i18next';
import { collectCashFromAssistant } from 'src/api/booking-assistant';

interface RowProps {
  name: any;
  collected_cash_in_hand: any;
  collected_cash_clearance_date: any;
  id: any;
}

interface CollectedCashListRowProps {
  reload: () => void;
  row: RowProps;
}

const CashInHandListRow = ({ reload, row }: CollectedCashListRowProps) => {
  const { t } = useTranslation();

  const [amount, setAmount] = useState<null | HTMLElement>(null);
  const [assistantId, setAssistantId] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();

  const handleOpen = (event: React.MouseEvent<HTMLButtonElement>, id: string) => {
    setAssistantId(id);
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAssistantId(null);
    setAnchorEl(null);
  };
  const handleCollectClick = async () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      enqueueSnackbar('Please enter a valid amount.', { variant: 'error' });
      return;
    }
    try {
      const requestBody = {
        assistant_id: assistantId,
        amount,
      };

      const response = await collectCashFromAssistant(requestBody);
      if (response.status === 'success') {
        enqueueSnackbar(t('amount_collected_successfully', { amount }), { variant: 'success' });
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
  const handleClickDetails = (id) => {
    router.push(paths.dashboard.user.details(id));
  };
  const handleClickRow = (id, isPayoutDisabled, amount) => {
    setAmount(amount);
    router.push(paths.dashboard.assistantCollectCash.details(id), {
      disablePayout: isPayoutDisabled ? '1' : '0',
      amount: amount,
    });
  };
  return (
    <TableRow
      hover
      onClick={() =>
        handleClickRow(row?.id, row?.collected_cash_in_hand > 0, row?.collected_cash_in_hand)
      }
    >
      <TableCell
        onClick={() => handleClickDetails(row?.id)}
        sx={{
          cursor: 'pointer',
          '&:hover': {
            textDecoration: 'underline',
          },
        }}
      >
        <Typography variant="body2">{row?.name ?? 'N/A'}</Typography>
      </TableCell>

      <TableCell>
        <Typography variant="body2">
          {' '}
          <span className="dirham-symbol">&#x00EA;</span>
          {row?.collected_cash_in_hand ?? '0'}{' '}
        </Typography>
      </TableCell>

      <TableCell>
        <Typography variant="body2">
          {row?.collected_cash_clearance_date
            ? moment(row?.collected_cash_clearance_date).format('DD/MM/YYYY')
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
