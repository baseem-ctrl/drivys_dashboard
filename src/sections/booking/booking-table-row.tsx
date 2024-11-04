import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import { useBoolean } from 'src/hooks/use-boolean';
import { IBookingItem } from 'src/types/booking';
import Label from 'src/components/label';
import { usePopover } from 'src/components/custom-popover';
import { formatDate } from 'src/utils/format-date';
import { Typography } from '@mui/material';
// import BookingCreateEditForm from './booking-create-update'; // Assuming this form exists

// ----------------------------------------------------------------------

type Props = {
  selected: boolean;
  onEditRow: VoidFunction;
  row: IBookingItem;
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
  const confirm = useBoolean();
  const quickEdit = useBoolean();
  const popover = usePopover();
  const zerothIndex = 0;

  const { user, driver, booking_method, payment_status, total, created_at, sessions } = row;

  console.log('rowrow', row);
  const handleRowClick = (bookingId: number) => {
    onSelectRow();
    // navigate(paths.dashboard.bookings.viewDetails(bookingId)); // Adjust navigation if needed
  };

  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell onClick={() => handleRowClick(row.id)}>{user?.name || 'N/A'}</TableCell>
        <TableCell onClick={() => handleRowClick(row.id)}>{driver?.name || 'N/A'}</TableCell>

        <TableCell onClick={() => handleRowClick(row.id)}>
          <Label variant="soft" color={row?.driver_status === 'PENDING' ? 'warning' : 'success'}>
            {row?.driver_status || 'N/A'}
          </Label>
        </TableCell>
        <TableCell onClick={() => handleRowClick(row.id)}>
          <Label variant="soft" color={row.booking_status === 'PENDING' ? 'warning' : 'success'}>
            {row.booking_status || 'N/A'}
          </Label>
        </TableCell>

        <TableCell onClick={() => handleRowClick(row.id)}>{row?.sub_total}</TableCell>
        <TableCell onClick={() => handleRowClick(row.id)}>{row?.payment_method}</TableCell>
        <TableCell onClick={() => handleRowClick(row.id)}>
          {row.coupon_code ? row.coupon_code : 'No Coupon'}
        </TableCell>
        <TableCell onClick={() => handleRowClick(row.id)}>
          {formatDate(row?.created_at)}
          <Typography color="text.secondary" sx={{ fontSize: '0.8rem' }}>
            Updated {formatDate(row?.updated_at)}
          </Typography>
        </TableCell>
      </TableRow>
    </>
  );
}
