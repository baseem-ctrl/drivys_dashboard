import moment from 'moment';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import { useBoolean } from 'src/hooks/use-boolean';
import Label from 'src/components/label';
import { usePopover } from 'src/components/custom-popover';
import {
  Button,
  IconButton,
  Link,
  MenuItem,
  Popover,
  Select,
  Tooltip,
  Typography,
} from '@mui/material';
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
  console.log('heyyyy');
  const { enqueueSnackbar } = useSnackbar();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [refundAmount, setRefundAmount] = useState('');

  const { user, driver, driver_id } = row;
  const { refundRequestStatusEnum } = useGetRefundRequestStatusEnum();
  const mapStatusToValue = (
    statusName: string,
    statusEnum: Array<{ name: string; value: number }>
  ) => {
    const match = statusEnum.find((status) => status.name === statusName);
    return match ? match.value : 0;
  };
  console.log('refundRequestStatusEnum', refundRequestStatusEnum);
  const [refundStatus, setRefundStatus] = useState(
    mapStatusToValue(row.payment_refund_status, refundRequestStatusEnum)
  );
  useEffect(() => {
    setRefundStatus(mapStatusToValue(row.payment_refund_status, refundRequestStatusEnum));
  }, [refundRequestStatusEnum, row.payment_refund_status]);
  const handleRefundStatusChange = (
    event: React.ChangeEvent<{ value: unknown }>,
    anchor: HTMLElement
  ) => {
    const newStatus = event.target.value as string;
    console.log('newStatus', newStatus);
    if (newStatus === '1') {
      // Replace 'APPROVED' with the actual status value
      setAnchorEl(anchor); // Open popover
    } else {
      updateStatus(newStatus);
    }
  };
  const updateStatus = async (newStatus: string, amount = null) => {
    const payload = {
      booking_id: row?.id,
      payment_refund_status: newStatus,
      amount_refunded: amount || row?.amount_refunded,
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
    } catch (error) {
      enqueueSnackbar(error.message, { variant: 'error' });
    }
  };

  const handleClickDetails = (id) => {
    router.push(paths.dashboard.user.details(id));
  };
  const handleClickPackageDetails = (id) => {
    router.push(paths.dashboard.package.details(id));
  };

  return (
    <>
      {' '}
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
              fontSize: 13,
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
              refundStatus === 1
                ? 'This status has already been refunded and cannot be changed'
                : ''
            }
            arrow
          >
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Select
                value={refundStatus ?? ''}
                onChange={(e) => handleRefundStatusChange(e, e.currentTarget)}
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
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <div style={{ padding: 16 }}>
          <Typography variant="subtitle1">Enter Refund Amount</Typography>
          <input
            type="number"
            value={refundAmount}
            onChange={(e) => setRefundAmount(e.target.value)}
            style={{ margin: '8px 0', padding: '4px', width: '100%' }}
          />
          <Button
            onClick={() => {
              updateStatus('APPROVED', refundAmount); // Pass refund amount in payload
              setAnchorEl(null);
            }}
          >
            Submit
          </Button>
        </div>
      </Popover>
    </>
  );
}
