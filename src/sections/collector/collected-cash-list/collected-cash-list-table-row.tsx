import moment from 'moment';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import { Typography } from '@mui/material';

interface RowProps {
  user_id: string;
  txn_amount: number;
  payment_method: string;
  payment_status: string;
  created_at: string;
  remarks: string | null;
}

interface RowProps {
  reload: () => void;
  row: RowProps;
}

export default function CollectedCashListRow({ reload, row }: RowProps) {
  return (
    <TableRow hover>
      <TableCell>
        <Typography variant="body2">{row?.user_id || 'N/A'}</Typography>
      </TableCell>
      <TableCell>{row?.txn_amount || 'N/A'}</TableCell>
      <TableCell>{row?.payment_method || 'N/A'}</TableCell>
      <TableCell>{row?.payment_status || 'N/A'}</TableCell>
      <TableCell>
        {row?.created_at
          ? moment(row.created_at, 'HH:mm:ss dddd YYYY-MM-DD').format('DD MMM YYYY, hh:mm A')
          : 'N/A'}
      </TableCell>

      <TableCell>{row?.remarks ?? 'N/A'}</TableCell>
    </TableRow>
  );
}
