import moment from 'moment';
import { TableCell, TableRow, Typography, Chip } from '@mui/material';
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { useTranslation } from 'react-i18next';

interface RowProps {
  id: number;
  collector: {
    id: number;
    name: string;
    email: string;
    phone: string;
    wallet_balance: number;
    wallet_points: number;
    is_active: boolean;
    gender: string;
  };
  payment_method: string;
  txn_amount: number;
  payment_status: string;
  remarks: string;
  collected_on: string;
  collected_cash_in_hand: number;
  collected_max_cash_in_hand_allowed: number | null;
}

interface CollectedCashListRowProps {
  reload: () => void;
  row: RowProps;
}

const CashCollectedRow = ({ reload, row }: CollectedCashListRowProps) => {
  const router = useRouter();
  const handleClickDetails = (id) => {
    router.push(paths.dashboard.user.details(id));
  };
  const { t } = useTranslation();

  return (
    <TableRow hover>
      <TableCell
        onClick={() => handleClickDetails(row?.collector?.id)}
        sx={{
          cursor: 'pointer',
          '&:hover': {
            textDecoration: 'underline',
          },
        }}
      >
        <Typography variant="body2">{row?.collector?.name ?? t('n/a')}</Typography>
      </TableCell>

      <TableCell>
        <Chip
          label={row?.payment_method ?? t('n/a')}
          color="primary"
          variant="soft"
          size="small"
          sx={{ textTransform: 'capitalize' }}
        />
      </TableCell>

      <TableCell>
        <Typography variant="body2">
          {' '}
          <span className="dirham-symbol">&#x00EA;</span>
          {row?.txn_amount ?? '0'}{' '}
        </Typography>
      </TableCell>

      <TableCell>
        <Chip
          label={row?.payment_status ?? t('n/a')}
          color={
            row?.payment_status === 'PAID'
              ? 'success'
              : row?.payment_status === 'PENDING'
              ? 'warning'
              : row?.payment_status === 'PARTIALLY PAID'
              ? 'info'
              : row?.payment_status === 'REFUNDED'
              ? 'secondary'
              : row?.payment_status === 'FAILED'
              ? 'error'
              : 'default'
          }
          variant="soft"
          size="small"
          sx={{ textTransform: 'capitalize' }}
        />
      </TableCell>

      <TableCell>
        <Typography variant="body2">{row?.remarks ?? t('n/a')}</Typography>
      </TableCell>

      <TableCell>
        <Typography variant="body2">
          {row?.collected_on
            ? moment(row.collected_on, 'HH:mm:ss dddd YYYY-MM-DD').format('DD MMM YYYY, hh:mm A')
            : t('n/a')}
        </Typography>
      </TableCell>
    </TableRow>
  );
};

export default CashCollectedRow;
