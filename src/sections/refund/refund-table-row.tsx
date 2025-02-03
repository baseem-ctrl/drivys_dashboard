import moment from 'moment';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import { useBoolean } from 'src/hooks/use-boolean';
import Label from 'src/components/label';
import { usePopover } from 'src/components/custom-popover';
import { Button, IconButton, Link, MenuItem, Select, Tooltip, Typography } from '@mui/material';
import { useRouter } from 'src/routes/hooks';
import { useSnackbar } from 'src/components/snackbar';
import { paths } from 'src/routes/paths';
import { updateRefundRequestStatus } from 'src/api/refund';
import { useGetPaymentRefundStatusEnum, useGetRefundRequestStatusEnum } from 'src/api/enum';
import { useEffect, useState } from 'react';
import InfoIcon from '@mui/icons-material/Info';

// ----------------------------------------------------------------------

export default function RefundTableRow({
  row,
  selected,

  reload,
}: Props) {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();

  const { user, driver, driver_id } = row;
  const { refundRequestStatusEnum } = useGetRefundRequestStatusEnum();
  const mapStatusToValue = (
    statusName: string,
    statusEnum: Array<{ name: string; value: string }>
  ) => {
    const match = statusEnum.find(
      (status) => status?.name?.toLowerCase() === statusName?.toLowerCase()
    );
    return match ? match.value : '';
  };

  console.log('row.statu', row);
  const [refundStatus, setRefundStatus] = useState(
    mapStatusToValue(row.status, refundRequestStatusEnum)
  );
  console.log('refundStatus', refundStatus);
  useEffect(() => {
    setRefundStatus(mapStatusToValue(row.status, refundRequestStatusEnum));
  }, [refundRequestStatusEnum, row.status]);

  const handleRefundStatusChange = async (event: React.ChangeEvent<{ value: unknown }>) => {
    const newStatus = event.target.value as string;
    setRefundStatus(newStatus);

    const payload = {
      booking_id: row?.id,
      status: newStatus,
      amount_refunded: row?.amount_refunded,
      payment_refund_id: row?.payment_refund_id,
    };

    try {
      const response = await updateRefundRequestStatus(payload);
      if (response) {
        reload();
        enqueueSnackbar('Refund Status updated successfully!', { variant: 'success' });
      } else {
        enqueueSnackbar('Failed to update Refund Status!', { variant: 'error' });
      }
      reload();
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

  const handleClickDetails = (id) => {
    router.push(paths.dashboard.booking.details(id));
  };
  const handleClickPackageDetails = (id) => {
    router.push(paths.dashboard.package.details(id));
  };

  return (
    <TableRow hover selected={selected}>
      <TableCell
        sx={{
          cursor: 'pointer',
          textDecoration: 'none',
          '&:hover': { textDecoration: 'underline' },
        }}
      >
        <Link
          color="inherit"
          sx={{
            cursor: 'pointer',
            textDecoration: 'none',
            '&:hover': { textDecoration: 'underline' },
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
          if (row?.booking?.id) {
            handleClickDetails(row?.booking?.id);
          }
        }}
      >
        {row?.booking?.id || 'N/A'}
      </TableCell>
      <TableCell>
        <Typography
          sx={{
            fontSize: 13,
            cursor: 'pointer',
            textDecoration: 'none',
            '&:hover': { textDecoration: 'underline' },
          }}
          onClick={(event) => {
            event.stopPropagation();
            if (row.package) {
              handleClickPackageDetails(row?.booking?.package?.id);
            }
          }}
        >
          {row?.booking?.package?.package_translations[0]?.name ?? 'Unknown Package'}
        </Typography>

        <Label variant="soft" sx={{ mt: 1, color: 'darkblue' }}>
          {row?.booking?.package?.is_unlimited
            ? 'Unlimited Sessions'
            : `${row?.booking?.package?.number_of_sessions ?? 0} Sessions`}
        </Label>
      </TableCell>

      <TableCell>
        <Label
          variant="soft"
          color={
            row?.booking_status === 'PENDING'
              ? 'info'
              : row?.booking_status === 'CANCELLED'
              ? 'error'
              : 'success'
          }
        >
          {row?.booking?.booking_status || 'N/A'}
        </Label>
      </TableCell>
      <TableCell>
        <Label
          variant="soft"
          color={
            row.payment_status === 'PENDING'
              ? 'warning'
              : row.payment_status === 'FAILED'
              ? 'error'
              : 'success'
          }
        >
          {row.booking?.payment_status || 'N/A'}
        </Label>
      </TableCell>
      <TableCell>{row?.refund_amount_sanctioned}</TableCell>
      <TableCell>{row?.remaining_amount_to_refund}</TableCell>

      <TableCell>{row?.booking?.payment_method}</TableCell>
      <TableCell>{row.reason ? row?.booking?.refund_reason : 'N/A'}</TableCell>
      <TableCell>
        <Tooltip
          title={
            refundStatus === 'approved'
              ? 'This status has already been refunded and cannot be changed'
              : ''
          }
          arrow
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {refundStatus === 'approved' ? (
              <Button
                variant="outlined"
                color="primary"
                onClick={() => {
                  console.log('Refund the amount');
                }}
              >
                Refund the Amount
              </Button>
            ) : (
              <Select
                value={refundStatus || ''}
                onChange={handleRefundStatusChange}
                displayEmpty
                size="small"
                disabled={refundStatus === 'approved'} // Adjust condition to match string
              >
                {refundRequestStatusEnum.map((status) => (
                  <MenuItem key={status.value} value={status.value}>
                    {status.name}
                  </MenuItem>
                ))}
              </Select>
            )}

            {refundStatus === 'approved' && (
              <IconButton size="small" disabled>
                <InfoIcon />
              </IconButton>
            )}
          </div>
        </Tooltip>
      </TableCell>

      <TableCell>
        {moment(row?.created_at)
          .local()
          .format('DD/MM/YY h:mm a')}
        <Typography color="text.secondary" sx={{ fontSize: '0.8rem' }}>
          Updated{' '}
          {moment(row?.updated_at)
            .local()
            .format('DD/MM/YY h:mm a')}
        </Typography>
      </TableCell>
    </TableRow>
  );
}
