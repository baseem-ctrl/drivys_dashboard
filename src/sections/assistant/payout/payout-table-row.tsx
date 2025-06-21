import moment from 'moment';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import { useBoolean } from 'src/hooks/use-boolean';
import { IBookingItem } from 'src/types/booking';
import Label from 'src/components/label';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import {
  Box,
  Button,
  Chip,
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
import i18n from 'src/locales/i18n';

// import BookingCreateEditForm from './booking-create-update'; // Assuming this form exists

// ----------------------------------------------------------------------

type Props = {
  selected: boolean;
  row: any;
};

export default function PayoutRow({ row, selected }: Props) {
  const { t } = useTranslation();
  const confirm = useBoolean();
  const quickEdit = useBoolean();
  const popover = usePopover();
  const zerothIndex = 0;
  const router = useRouter();
  console.log('row?.booking?.assistant', row?.booking?.assistant);
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
          {i18n.language.toLowerCase() === 'ar'
            ? row?.booking?.assistant?.name_ar || t('n/a')
            : row?.booking?.assistant?.name || t('n/a')}
        </Link>
      </TableCell>
      <TableCell
        sx={{
          cursor: 'pointer',
          textDecoration: 'none',
          // '&:hover': { textDecoration: 'underline' },
        }}
        onClick={(event) => {
          event.stopPropagation();
          if (row.driver) {
            handleClickDetails(driver_id);
          }
        }}
      >
        {i18n.language.toLowerCase() === 'ar'
          ? row?.booking?.user?.name_ar || t('n/a')
          : row?.booking?.user?.name || t('n/a')}
      </TableCell>
      <TableCell
        sx={{
          cursor: 'pointer',
          textDecoration: 'none',
        }}
        onClick={(event) => {
          event.stopPropagation();
          if (row.driver) {
            handleClickDetails(driver_id);
          }
        }}
      >
        <Box>
          <Typography variant="body1">
            {' '}
            {i18n.language.toLowerCase() === 'ar'
              ? row?.booking?.driver?.name_ar || t('n/a')
              : row?.booking?.driver?.name || t('n/a')}
          </Typography>

          {row?.booking?.city?.city_translations && (
            <Chip
              label={
                row.booking.city.city_translations.find(
                  (t) => t.locale?.toLowerCase() === i18n.language?.toLowerCase()
                )?.name || t('n/a')
              }
              size="small"
              color="warning"
              variant="soft"
              sx={{ mt: 0.5 }}
            />
          )}
        </Box>
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
          {row?.booking?.booking_status || t('n/a')}
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
        {row?.amount}
      </TableCell>
      {/* <TableCell>{row?.payment_method}</TableCell> */}
      <TableCell>{row.remarks ? row.remarks : t('n/a')}</TableCell>
    </TableRow>
  );
}
