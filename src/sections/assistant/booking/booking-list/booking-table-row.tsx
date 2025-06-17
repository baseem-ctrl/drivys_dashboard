import moment from 'moment';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import { useBoolean } from 'src/hooks/use-boolean';
import { IBookingItem } from 'src/types/booking';
import Label from 'src/components/label';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Link,
  MenuItem,
  Tooltip,
  Typography,
} from '@mui/material';
import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
import { useTranslation } from 'react-i18next';
import Iconify from 'src/components/iconify';
import RescheduleSession from './re-schedule-session';

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
        {driver?.name || t('n/a')}
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
          {row?.booking_status || t('n/a')}
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
          {row.payment_status || t('n/a')}
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
      <TableCell align="right" sx={{ px: 1, whiteSpace: 'nowrap' }}>
        <IconButton
          color={popover.open ? 'inherit' : 'default'}
          onClick={(e) => {
            e.stopPropagation();
            popover.onOpen(e);
          }}
        >
          <Iconify icon="eva:more-vertical-fill" />
        </IconButton>
      </TableCell>
      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="right-top"
        sx={{ width: 300 }}
      >
        <MenuItem
          onClick={() => {
            quickEdit.onTrue();
            popover.onClose();
          }}
        >
          <Iconify icon="solar:pen-bold" />
          {t('schedule_remaining_sessions')}
        </MenuItem>
      </CustomPopover>
      {quickEdit.value && (
        <Dialog open={quickEdit.value} onClose={quickEdit.onFalse} maxWidth="md" fullWidth>
          <DialogTitle>{t('schedule_remaining_sessions')}</DialogTitle>

          <DialogContent dividers>
            <RescheduleSession
              driverId={driver_id}
              bookingId={row.id}
              sessions={row.sessions}
              open={quickEdit.value}
              onClose={quickEdit.onFalse}
              t={t}
            />
          </DialogContent>
        </Dialog>
      )}
    </TableRow>
  );
}
