import moment from 'moment';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import { useBoolean } from 'src/hooks/use-boolean';
import { IBookingItem } from 'src/types/booking';
import Label from 'src/components/label';
import { usePopover } from 'src/components/custom-popover';
import { Link, Typography } from '@mui/material';
import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
import { useTranslation } from 'react-i18next';

// import BookingCreateEditForm from './booking-create-update'; // Assuming this form exists

// ----------------------------------------------------------------------

type Props = {
  selected: boolean;
  onEditRow: VoidFunction;
  row: any;
  onSelectRow: VoidFunction;
  onDeleteRow: VoidFunction;
  reload: VoidFunction;
};

export default function BookingTableRow({
  row,
  selected,
  onEditRow,
  onSelectRow,
  onDeleteRow,
  reload,
}: Props) {
  const { t } = useTranslation();
  const confirm = useBoolean();
  const quickEdit = useBoolean();
  const popover = usePopover();
  const zerothIndex = 0;
  const router = useRouter();

  const { user, driver, booking_method, payment_status, total, created_at, sessions, driver_id } =
    row;

  const handleRowClick = (bookingId: number) => {
    // onSelectRow();
    // navigate(paths.dashboard.bookings.viewDetails(bookingId)); // Adjust navigation if needed
  };
  const handleClickDetails = (id) => {
    // router.push(paths.dashboard.user.details(id));
  };

  return (
    <TableRow hover selected={selected} onClick={() => handleRowClick(row.id)}>
      <TableCell
        sx={{
          cursor: 'pointer',
          textDecoration: 'none',
          // '&:hover': { textDecoration: 'underline' },
        }}
      >
        <Link
          color="inherit"
          sx={{
            cursor: 'pointer',
            textDecoration: 'none',
            // '&:hover': { textDecoration: 'underline' },
          }}
          onClick={(event) => {
            event.stopPropagation();
            if (user) {
              handleClickDetails(user?.id);
            }
          }}
        >
          {user?.name || 'N/A'}
        </Link>
      </TableCell>
      <TableCell
        sx={{
          cursor: 'pointer',
          textDecoration: 'none',
          '&:hover': { textDecoration: 'underline' },
        }}
        onClick={(event) => {
          event.stopPropagation();
          if (row.driver) {
            handleClickDetails(driver_id);
          }
        }}
      >
        {driver?.name || 'N/A'}
      </TableCell>
      <TableCell>
        <Label
          variant="soft"
          color={
            row?.booking_status === 'PENDING'
              ? 'info'
              : row?.booking_status === 'CANCELLED'
              ? 'error'
              : row?.booking_status === 'IN PROGRESS'
              ? 'warning'
              : row?.booking_status === 'CONFIRMED'
              ? 'secondary'
              : 'success'
          }
        >
          {row?.booking_status || 'N/A'}
        </Label>
      </TableCell>
      <TableCell>
        <Label
          variant="soft"
          color={
            row.payment_status === 'PENDING'
              ? 'info'
              : row.payment_status === 'REFUNDED'
              ? 'warning'
              : row.payment_status === 'PARTIALLY PAID'
              ? 'default'
              : row.payment_status === 'FAILED'
              ? 'error'
              : 'success'
          }
        >
          {row.payment_status || 'N/A'}
        </Label>
      </TableCell>
      <TableCell>
        <span className="dirham-symbol">&#x00EA;</span>
        {row?.sub_total}
      </TableCell>
      <TableCell>{row?.payment_method}</TableCell>
      <TableCell>{row.coupon_code ? row.coupon_code : t('No Coupon')}</TableCell>
      <TableCell onClick={() => handleRowClick(row.id)}>
        {moment(row?.created_at)
          .local()
          .format('DD/MM/YY h:mm a')}
        <Typography color="text.secondary" sx={{ fontSize: '0.925rem' }}>
          Updated{' '}
          {moment(row?.updated_at)
            .local()
            .format('DD/MM/YY h:mm a')}
        </Typography>
      </TableCell>
    </TableRow>
  );
}
