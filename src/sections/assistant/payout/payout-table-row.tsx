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
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Link,
  MenuItem,
  Table,
  TableBody,
  TableHead,
  Tooltip,
  Typography,
} from '@mui/material';
import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
import { useTranslation } from 'react-i18next';
import Iconify from 'src/components/iconify';
import RescheduleSession from './re-schedule-session';
import i18n from 'src/locales/i18n';
import { useState } from 'react';

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
  const [openDialog, setOpenDialog] = useState(false);

  const handleOpenDialog = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

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
    <>
      {' '}
      <TableRow hover selected={selected} onClick={() => handleRowClick(row.id)}>
        <TableCell
          sx={{
            // cursor: 'pointer',
            textDecoration: 'none',
            // '&:hover': { textDecoration: 'underline' },
          }}
        >
          {/* <Link
            color="inherit"
            sx={{
              // cursor: 'pointer',
              textDecoration: 'none',
              // '&:hover': { textDecoration: 'underline' },
            }}
            onClick={(event) => {
              event.stopPropagation();
              if (user) {
                handleClickDetails(user?.id);
              }
            }}
          > */}
          {i18n.language.toLowerCase() === 'ar'
            ? row?.booking?.assistant?.name_ar || t('n/a')
            : row?.booking?.assistant?.name || t('n/a')}
          {/* </Link> */}
        </TableCell>
        <TableCell
          sx={{
            // cursor: 'pointer',
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
          {row?.amount || '0'}
        </TableCell>
        {/* <TableCell>{row?.payment_method}</TableCell> */}
        <TableCell>{row.remarks ? row.remarks : t('n/a')}</TableCell>
        <TableCell align="center">
          <Button
            variant="text"
            size="small"
            startIcon={<Iconify icon="mdi:file-eye-outline" />}
            onClick={handleOpenDialog}
            sx={{
              textTransform: 'none',
              fontWeight: 500,
              color: 'primary.main',
            }}
          >
            {t('view')}
          </Button>
        </TableCell>
      </TableRow>
      <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="md">
        <DialogTitle
          color="primary"
          sx={{
            fontSize: '18px',
            fontWeight: 300,
            bgcolor: 'background.neutral',
            borderBottom: '1px solid #ddd',
            py: 2,
          }}
        >
          {t('payment_proof_details')}
        </DialogTitle>

        <DialogContent
          dividers
          sx={{
            bgcolor: 'background.default',
            px: 3,
            py: 3,
          }}
        >
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
              gap: 2.5,
            }}
          >
            <DetailItem
              label={t('status')}
              value={
                <Chip
                  label={row.booking.assistant_payment_proof.payment_status}
                  color="info"
                  size="small"
                  variant="soft"
                />
              }
            />
            <DetailItem
              label={t('amount')}
              value={` ${row.booking.assistant_payment_proof.amount}`}
            />
            <DetailItem
              label={t('assistant_commission')}
              value={` ${row?.assistant_commission_amount || '0'}`}
            />
            <DetailItem
              label={t('drivys_commission')}
              value={`${row?.amount_to_be_paid_after_commission || '0'}`}
            />
            <DetailItem
              label={t('remarks')}
              value={
                <Typography variant="body2" fontStyle="italic" color="text.secondary">
                  {row.booking.assistant_payment_proof.remarks || 'N/A'}
                </Typography>
              }
            />
            <DetailItem
              label={t('approved')}
              value={
                <Chip
                  label={row.booking.assistant_payment_proof.is_approved ? t('yes') : t('no')}
                  color={row.booking.assistant_payment_proof.is_approved ? 'success' : 'error'}
                  size="small"
                  variant="soft"
                />
              }
            />
            <DetailItem
              label={t('document')}
              value={
                row.booking.assistant_payment_proof.document_path ? (
                  <Link
                    href={row.booking.assistant_payment_proof.document_path}
                    target="_blank"
                    rel="noopener"
                    underline="hover"
                    fontWeight={500}
                  >
                    {t('view_document')}
                  </Link>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    {t('n/a')}
                  </Typography>
                )
              }
            />
          </Box>
        </DialogContent>

        <DialogActions
          sx={{
            bgcolor: 'background.neutral',
            py: 2,
            px: 3,
            borderTop: '1px solid #ddd',
          }}
        >
          <Button variant="contained" color="primary" onClick={handleCloseDialog}>
            {t('close')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
const DetailItem = ({ label, value }) => (
  <Box
    sx={{
      borderRadius: 2,
      bgcolor: '#f5f3f1',
      border: '1px solid  #e0e0e0',
      px: 2,
      py: 1.5,
      display: 'flex',
      flexDirection: 'column',
      gap: 0.5,
    }}
  >
    <Typography variant="caption" color="text.secondary" fontWeight={500}>
      {label}
    </Typography>
    <Box>
      {typeof value === 'string' || typeof value === 'number' ? (
        <Typography variant="body2" fontWeight={500}>
          {value}
        </Typography>
      ) : (
        value
      )}
    </Box>
  </Box>
);
