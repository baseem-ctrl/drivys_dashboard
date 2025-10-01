import React, { useState } from 'react';
import { TableRow, TableCell, Chip, Button, Box } from '@mui/material';
import Label from 'src/components/label';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
import Iconify from 'src/components/iconify';
import { approveOrDeclineAssistantPayment } from 'src/api/booking-assistant';
import { useSnackbar } from 'src/components/snackbar';
import { ConfirmDialog } from 'src/components/custom-dialog';

type Props = {
  row: any;
  reload: any;
};

export default function PaymentRow({ row, reload }: Props) {
  const { t } = useTranslation();
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();

  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    type: 'approve' | 'decline' | null;
  }>({ open: false, type: null });

  const handleClickBookingDetails = (id: number) => {
    if (id) router.push(paths.dashboard.booking.details(id));
  };

  const handleClickAssistantDetails = () => {
    router.push(paths.dashboard.user.details(row.assistant_id));
  };

  const handlePaymentAction = async (isApproved: boolean) => {
    const payload = {
      mapping_id: row?.id,
      is_approved: isApproved ? 1 : 0,
    };

    try {
      const response = await approveOrDeclineAssistantPayment(payload);
      if (response) {
        enqueueSnackbar(response.message, { variant: 'success' });
        reload();
      }
    } catch (error: any) {
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
    } finally {
      setConfirmDialog({ open: false, type: null });
    }
  };

  return (
    <>
      <TableRow
        hover
        onClick={() => handleClickBookingDetails(row.booking_id)}
        sx={{ cursor: 'pointer' }}
      >
        <TableCell
          onClick={(e) => {
            e.stopPropagation();
            handleClickAssistantDetails();
          }}
          sx={{
            cursor: 'pointer',
            textDecoration: 'none',
            '&:hover': { textDecoration: 'underline' },
          }}
        >
          {row?.assistant?.name || t('n/a')}
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
            {t(row.payment_status?.toLowerCase() || 'n/a')}
          </Label>
        </TableCell>

        <TableCell>
          <span className="dirham-symbol">&#x00EA;</span> {Number(row.amount ?? 0).toFixed(2)}
        </TableCell>

        <TableCell>{row.remarks || t('n/a')}</TableCell>

        <TableCell>
          {row.document_path ? (
            <a
              href={row.document_path}
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: 'underline', color: '#1976d2' }}
              onClick={(e) => e.stopPropagation()}
            >
              {t('view_document')}
            </a>
          ) : (
            t('n/a')
          )}
        </TableCell>

        <TableCell>
          {row.is_approved ? (
            <Chip
              label={t('approved')}
              color="success"
              variant="soft"
              size="small"
              icon={<Iconify icon="eva:checkmark-circle-2-outline" />}
            />
          ) : (
            <Box display="flex" alignItems="center" gap={1}>
              <Button
                variant="soft"
                color="success"
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  setConfirmDialog({ open: true, type: 'approve' });
                }}
                startIcon={<Iconify icon="eva:checkmark-circle-2-outline" />}
              >
                {t('approve')}
              </Button>
              <Button
                variant="soft"
                color="error"
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  setConfirmDialog({ open: true, type: 'decline' });
                }}
                startIcon={<Iconify icon="eva:close-circle-outline" />}
              >
                {t('decline')}
              </Button>
            </Box>
          )}
        </TableCell>
      </TableRow>

      <ConfirmDialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ open: false, type: null })}
        title={confirmDialog.type === 'approve' ? t('Approve Payment') : t('Decline Payment')}
        content={
          confirmDialog.type === 'approve'
            ? t('Are you sure you want to approve this payment?')
            : t('Are you sure you want to decline this payment?')
        }
        onConfirm={() => handlePaymentAction(confirmDialog.type === 'approve')}
        confirmText={confirmDialog.type === 'approve' ? t('Approve') : t('Decline')}
        confirmColor={confirmDialog.type === 'approve' ? 'success' : 'error'}
      />
    </>
  );
}
