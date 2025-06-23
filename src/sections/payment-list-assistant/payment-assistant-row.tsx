import React from 'react';
import { TableRow, TableCell, Chip, Button, Tooltip, Box, Typography } from '@mui/material';
import Label from 'src/components/label';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
import Iconify from 'src/components/iconify';
import { approveOrDeclineAssistantPayment } from 'src/api/booking-assistant';
import { useSnackbar } from 'src/components/snackbar';

type Props = {
  row: any;
  reload: any;
};

export default function PaymentRow({ row, reload }: Props) {
  const { t } = useTranslation();
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const handleClickBookingDetails = (id: number) => {
    if (id) router.push(paths.dashboard.booking.details(id));
  };

  const handleClickAssistantDetails = () => {
    router.push(paths.dashboard.user.details(row.assistant_id));
  };

  const handlePaymentAction = async (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    isApproved: boolean
  ) => {
    event.stopPropagation();

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
    } catch (error) {
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
    }
  };

  return (
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
        <span className="dirham-symbol">&#x00EA;</span> {row.amount || '0'}
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
              onClick={(e) => handlePaymentAction(e, true)}
              startIcon={<Iconify icon="eva:checkmark-circle-2-outline" />}
            >
              {t('approve')}
            </Button>
            <Button
              variant="soft"
              color="error"
              size="small"
              onClick={(e) => handlePaymentAction(e, false)}
              startIcon={<Iconify icon="eva:close-circle-outline" />}
            >
              {t('decline')}
            </Button>
          </Box>
        )}
      </TableCell>
    </TableRow>
  );
}
