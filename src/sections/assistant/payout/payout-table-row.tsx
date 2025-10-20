import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import { useBoolean } from 'src/hooks/use-boolean';
import Label from 'src/components/label';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  Link,
  Stack,
  Tooltip,
} from '@mui/material';
import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
import { useTranslation } from 'react-i18next';
import Iconify from 'src/components/iconify';
import i18n from 'src/locales/i18n';
import { useState } from 'react';
import { format } from 'date-fns';

type Props = {
  selected?: boolean;
  row: any;
};

export default function PayoutRow({ row, selected }: Props) {
  const { t } = useTranslation();
  const router = useRouter();
  const [openDialog, setOpenDialog] = useState(false);

  const handleOpenDialog = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleClickDetails = (id: number) => {
    router.push(paths.dashboard.user.details(id));
  };

  // Format date helper
  const formatDate = (dateString: string) => {
    if (!dateString) return '--';
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (error) {
      return '--';
    }
  };

  // Format time helper
  const formatTime = (dateString: string) => {
    if (!dateString) return '--';
    try {
      return format(new Date(dateString), 'hh:mm a');
    } catch (error) {
      return '--';
    }
  };

  // Get student name
  const studentName = i18n.language.toLowerCase() === 'ar'
    ? row?.booking?.user?.name_ar || t('n/a')
    : row?.booking?.user?.name || t('n/a');

  // Get trainer name
  const trainerName = i18n.language.toLowerCase() === 'ar'
    ? row?.booking?.driver?.name_ar || t('n/a')
    : row?.booking?.driver?.name || t('n/a');

  return (
    <>
      <TableRow
        hover
        selected={selected}
        sx={{
          '&:hover': {
            backgroundColor: '#fafafa',
          },
        }}
      >
        {/* Student Name */}
        <TableCell sx={{ textAlign: 'left', maxWidth: 180 }}>
          <Tooltip title={studentName} placement="top" arrow>
            <Link
              component="button"
              variant="body2"
              onClick={(event) => {
                event.stopPropagation();
                if (row?.booking?.user_id) {
                  handleClickDetails(row?.booking?.user_id);
                }
              }}
              sx={{
                color: 'text.primary',
                textDecoration: 'none',
                cursor: 'pointer',
                fontWeight: 400,
                display: 'block',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                textAlign: 'left',
                '&:hover': {
                  color: 'primary.main',
                },
              }}
            >
              {studentName}
            </Link>
          </Tooltip>
        </TableCell>

        {/* Trainer */}
        <TableCell sx={{ textAlign: 'left', maxWidth: 180 }}>
          <Tooltip title={trainerName} placement="top" arrow>
            <Link
              component="button"
              variant="body2"
              onClick={(event) => {
                event.stopPropagation();
                if (row?.booking?.driver?.id) {
                  handleClickDetails(row?.booking?.driver?.id);
                }
              }}
              sx={{
                color: 'text.primary',
                textDecoration: 'none',
                cursor: 'pointer',
                fontWeight: 400,
                display: 'block',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                textAlign: 'left',
                '&:hover': {
                  color: 'primary.main',
                },
              }}
            >
              {trainerName}
            </Link>
          </Tooltip>
        </TableCell>

        {/* Booking Status */}
        <TableCell sx={{ textAlign: 'left' }}>
          <Label
            variant="soft"
            color={
              row?.booking?.booking_status === 'PENDING'
                ? 'info'
                : row?.booking?.booking_status === 'CANCELLED'
                ? 'error'
                : row?.booking?.booking_status === 'IN PROGRESS'
                ? 'warning'
                : row?.booking?.booking_status === 'CONFIRMED'
                ? 'secondary'
                : 'success'
            }
          >
            {row?.booking?.booking_status || t('n/a')}
          </Label>
        </TableCell>

        {/* Payment Status */}
        <TableCell sx={{ textAlign: 'left' }}>
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

        {/* Amount */}
        <TableCell sx={{ textAlign: 'left' }}>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            <span className="dirham-symbol">&#x00EA;</span>
            {row?.amount || '0'}
          </Typography>
        </TableCell>

        {/* Remarks */}
        <TableCell sx={{ textAlign: 'left' }}>
          <Tooltip title={row.remarks || t('n/a')} placement="top" arrow>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                display: 'block',
              }}
            >
              {row.remarks || t('n/a')}
            </Typography>
          </Tooltip>
        </TableCell>

        {/* Payment Proof */}
        <TableCell sx={{ textAlign: 'left' }}>
          {row?.booking?.assistant_payment_proof ? (
            <Link
              component="button"
              variant="body2"
              onClick={handleOpenDialog}
              sx={{
                color: 'primary.main',
                textDecoration: 'none',
                fontWeight: 500,
                cursor: 'pointer',
                '&:hover': {
                  textDecoration: 'underline',
                },
              }}
            >
              {t('view_proof')}
            </Link>
          ) : (
            <Typography variant="body2" color="text.disabled">
              --
            </Typography>
          )}
        </TableCell>

        {/* Created Date */}
        <TableCell sx={{ textAlign: 'left' }}>
          <Typography variant="body2" color="text.secondary">
            {formatDate(row?.created_at || row?.booking?.created_at)}
          </Typography>
        </TableCell>

        {/* Created Time */}
        <TableCell sx={{ textAlign: 'left' }}>
          <Typography variant="body2" color="text.secondary">
            {formatTime(row?.created_at || row?.booking?.created_at)}
          </Typography>
        </TableCell>
      </TableRow>

      {/* Payment Proof Details Modal */}
      {row?.booking?.assistant_payment_proof && (
        <Dialog
          open={openDialog}
          onClose={handleCloseDialog}
          fullWidth
          maxWidth="md"
          PaperProps={{
            sx: {
              borderRadius: 2,
            }
          }}
        >
          <DialogTitle
            sx={{
              fontSize: '1.125rem',
              fontWeight: 500,
              bgcolor: '#fafafa',
              borderBottom: '1px solid #e0e0e0',
              py: 2,
              px: 3,
            }}
          >
            {t('payment_proof_details')}
          </DialogTitle>

          <DialogContent
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
                gap: 2,
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
                    sx={{
                      height: 24,
                      fontSize: '0.75rem',
                      fontWeight: 500,
                    }}
                  />
                }
              />

              <DetailItem
                label={t('amount')}
                value={`${row.booking.assistant_payment_proof.amount}`}
              />

              <DetailItem
                label={t('assistant_commission')}
                value={`${row?.assistant_commission_amount || '0'}`}
              />

              <DetailItem
                label={t('drivys_commission')}
                value={`${row?.amount_to_be_paid_after_commission || '0'}`}
              />

              <DetailItem
                label={t('remarks')}
                value={
                  <Typography variant="body2" fontStyle="italic" color="text.secondary">
                    {row.booking.assistant_payment_proof.remarks || t('n/a')}
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
                    sx={{
                      height: 24,
                      fontSize: '0.75rem',
                      fontWeight: 500,
                    }}
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
                      rel="noopener noreferrer"
                      underline="hover"
                      sx={{
                        color: 'primary.main',
                        fontWeight: 500,
                        fontSize: '0.875rem',
                      }}
                    >
                      {t('view_document')}
                    </Link>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      {t('n/a')}
                    </Typography>
                  )
                }
                sx={{ gridColumn: { sm: 'span 2' } }}
              />
            </Box>
          </DialogContent>

          <DialogActions
            sx={{
              bgcolor: '#fafafa',
              py: 2,
              px: 3,
              borderTop: '1px solid #e0e0e0',
            }}
          >
            <Button
              variant="contained"
              onClick={handleCloseDialog}
              sx={{
                textTransform: 'none',
                fontWeight: 500,
                px: 3,
              }}
            >
              {t('close')}
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </>
  );
}

const DetailItem = ({ label, value, sx = {} }: { label: string; value: any; sx?: any }) => (
  <Box
    sx={{
      borderRadius: 2,
      bgcolor: '#f5f3f1',
      border: '1px solid #e0e0e0',
      px: 2,
      py: 1.5,
      display: 'flex',
      flexDirection: 'column',
      gap: 0.5,
      ...sx,
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
