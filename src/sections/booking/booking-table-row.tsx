import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import { useBoolean } from 'src/hooks/use-boolean';
import { IBookingItem } from 'src/types/booking';
import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import { ConfirmDialog } from 'src/components/custom-dialog';
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

  const handleRowClick = (bookingId: number) => {
    onSelectRow();
    // navigate(paths.dashboard.bookings.viewDetails(bookingId)); // Adjust navigation if needed
  };
  console.log('user', user);
  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell onClick={() => handleRowClick(row.id)}>{user?.name}</TableCell>
        <TableCell onClick={() => handleRowClick(row.id)}>{user?.email}</TableCell>
        <TableCell onClick={() => handleRowClick(row.id)}>{payment_status}</TableCell>
        <TableCell onClick={() => handleRowClick(row.id)}>{total}</TableCell>
        <TableCell onClick={() => handleRowClick(row.id)}>
          <Label variant="soft" color={row.booking_status === 'PENDING' ? 'warning' : 'success'}>
            {row.booking_status}
          </Label>
        </TableCell>
        <TableCell align="right">
          <IconButton color={popover.open ? 'inherit' : 'default'} onClick={popover.onOpen}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>

      {/* <BookingCreateEditForm
        title="Edit Booking"
        currentBooking={row}
        open={quickEdit.value}
        onClose={quickEdit.onFalse}
        reload={reload}
      /> */}

      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="right-top"
        sx={{ width: 140 }}
      >
        <MenuItem
          onClick={() => {
            confirm.onTrue();
            popover.onClose();
          }}
          sx={{ color: 'error.main' }}
        >
          <Iconify icon="solar:trash-bin-trash-bold" />
          Delete
        </MenuItem>

        <MenuItem
          onClick={() => {
            quickEdit.onTrue();
            popover.onClose();
          }}
        >
          <Iconify icon="solar:pen-bold" />
          Edit
        </MenuItem>
      </CustomPopover>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete"
        content="Are you sure you want to delete this booking?"
        onConfirm={() => {
          confirm.onFalse();
          onDeleteRow();
        }}
        action={
          <Button variant="contained" color="error" onClick={onDeleteRow}>
            Delete
          </Button>
        }
      />
    </>
  );
}
