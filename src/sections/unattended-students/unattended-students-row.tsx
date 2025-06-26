import React from 'react';
import { TableRow, TableCell, Chip, Button, Tooltip, Box, Typography } from '@mui/material';
import Label from 'src/components/label';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
import Iconify from 'src/components/iconify';
import { approveOrDeclineAssistantPayment } from 'src/api/booking-assistant';
import { useSnackbar } from 'src/components/snackbar';
import moment from 'moment';
import { approveOrRejectUnattendedSession } from 'src/api/unattended-students';

type Props = {
  row: any;
  reload: any;
};

export default function UnattendedStudentRow({ row, reload }: Props) {
  const { t } = useTranslation();
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const handleClickBookingDetails = (id: number) => {
    if (id) router.push(paths.dashboard.booking.details(id));
  };

  const handleClickAssistantDetails = (id) => {
    router.push(paths.dashboard.user.details(id));
  };

  const handlePaymentAction = async (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    isApproved: boolean
  ) => {
    event.stopPropagation();

    const payload = {
      sessions_id: row?.session?.id,
      status: isApproved ? 'approved' : 'rejected',
    };

    try {
      const response = await approveOrRejectUnattendedSession(payload);
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
      onClick={() => handleClickBookingDetails(row.session?.booking_id)}
      sx={{ cursor: 'pointer' }}
    >
      <TableCell
        onClick={(e) => {
          e.stopPropagation();
          handleClickAssistantDetails(row?.session?.booking?.user?.id);
        }}
        sx={{
          cursor: 'pointer',
          textDecoration: 'none',
          '&:hover': { textDecoration: 'underline' },
        }}
      >
        {row?.session?.booking?.user?.name || t('n/a')}
      </TableCell>

      <TableCell
        onClick={(e) => {
          e.stopPropagation();
          handleClickAssistantDetails(row?.session?.driver_id);
        }}
        sx={{
          cursor: 'pointer',
          textDecoration: 'none',
          '&:hover': { textDecoration: 'underline' },
        }}
      >
        {row?.session?.driver_details?.name || t('n/a')}
      </TableCell>

      <TableCell>
        {row?.session_end_time ? moment(row.session_end_time).format('YYYY-MM-DD') : t('n/a')}
      </TableCell>

      <TableCell>
        {row?.session_start_time ? moment(row.session_start_time).format('YYYY-MM-DD') : t('n/a')}
      </TableCell>
      <TableCell>{row?.reason || t('n/a')}</TableCell>

      <TableCell>
        {row.status === 'Approved' ? (
          <Chip label={t('approved')} color="success" variant="soft" size="small" />
        ) : (
          <Box display="flex" alignItems="center" gap={1}>
            <Button
              variant="contained"
              color="primary"
              size="small"
              onClick={(e) => handlePaymentAction(e, true)}
              startIcon={<Iconify icon="eva:checkmark-circle-2-outline" />}
            >
              {t('approve')}
            </Button>
          </Box>
        )}
      </TableCell>
    </TableRow>
  );
}
