import moment from 'moment';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import { useBoolean } from 'src/hooks/use-boolean';
import Label from 'src/components/label';
import { usePopover } from 'src/components/custom-popover';
import { IconButton, Link, MenuItem, Select, Tooltip, Typography } from '@mui/material';
import { useRouter } from 'src/routes/hooks';
import { useSnackbar } from 'src/components/snackbar';
import { paths } from 'src/routes/paths';
import { updateRefundRequestStatus } from 'src/api/refund';
import { useGetPaymentRefundStatusEnum } from 'src/api/enum';
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
  const { paymentRefundStatusEnum } = useGetPaymentRefundStatusEnum();
  const mapStatusToValue = (
    statusName: string,
    statusEnum: Array<{ name: string; value: number }>
  ) => {
    const match = statusEnum.find((status) => status.name === statusName);
    return match ? match.value : 0;
  };
  const [refundStatus, setRefundStatus] = useState(
    mapStatusToValue(row.payment_refund_status, paymentRefundStatusEnum)
  );
  useEffect(() => {
    setRefundStatus(mapStatusToValue(row.payment_refund_status, paymentRefundStatusEnum));
  }, [paymentRefundStatusEnum, row.payment_refund_status]);
  const handleRefundStatusChange = async (event: React.ChangeEvent<{ value: unknown }>) => {
    const newStatus = event.target.value as string;
    setRefundStatus(newStatus);

    const payload = {
      booking_id: row?.id,
      payment_refund_status: newStatus,
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
    router.push(paths.dashboard.user.details(id));
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
          if (row.driver) {
            handleClickDetails(driver_id);
          }
        }}
      >
        {driver?.name || 'N/A'}
      </TableCell>
      <TableCell>
        <Typography
          sx={{
            fontSize: 15,
            cursor: 'pointer',
            textDecoration: 'none',
            '&:hover': { textDecoration: 'underline' },
          }}
          onClick={(event) => {
            event.stopPropagation();
            if (row.package) {
              handleClickPackageDetails(row?.package?.id);
            }
          }}
        >
          {row?.package?.package_translations[0]?.name ?? 'Unknown Package'}
        </Typography>

        <Label variant="soft" sx={{ mt: 1, color: 'darkblue' }}>
          {row?.package?.is_unlimited
            ? 'Unlimited Sessions'
            : `${row?.package?.number_of_sessions ?? 0} Sessions`}
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
          {row?.booking_status || 'N/A'}
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
          {row.payment_status || 'N/A'}
        </Label>
      </TableCell>
      <TableCell>{row?.sub_total}</TableCell>
      <TableCell>{row?.payment_method}</TableCell>
      <TableCell>{row.refund_reason ? row.refund_reason : 'N/A'}</TableCell>
      <TableCell>
        <Tooltip
          title={
            refundStatus === 1 ? 'This status has already been refunded and cannot be changed' : ''
          }
          arrow
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Select
              value={refundStatus ?? ''}
              onChange={handleRefundStatusChange}
              displayEmpty
              size="small"
              disabled={refundStatus === 1}
            >
              {paymentRefundStatusEnum.map((status) => (
                <MenuItem key={status.value} value={status.value}>
                  {status.name}
                </MenuItem>
              ))}
            </Select>
            {refundStatus === 1 && (
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
