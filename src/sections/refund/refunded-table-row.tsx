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
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { useRouter } from 'src/routes/hooks';
import { useSnackbar } from 'src/components/snackbar';
import { paths } from 'src/routes/paths';
import { updateRefundRequestStatus, updateRequestStatus } from 'src/api/refund';
import { useGetPaymentRefundStatusEnum, useGetRefundRequestStatusEnum } from 'src/api/enum';
import { useEffect, useState } from 'react';
import InfoIcon from '@mui/icons-material/Info';

// ----------------------------------------------------------------------

export default function RefundedTableRow({
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

  const [refundStatus, setRefundStatus] = useState(
    mapStatusToValue(row.status, refundRequestStatusEnum)
  );
  useEffect(() => {
    setRefundStatus(mapStatusToValue(row.status, refundRequestStatusEnum));
  }, [refundRequestStatusEnum, row.status]);

  const handleRefundStatusChange = async (event: React.ChangeEvent<{ value: unknown }>) => {
    const newStatus = event.target.value as string;
    setRefundStatus(newStatus);

    const payload = {
      booking_id: row?.booking_id,
      status: newStatus,
    };

    try {
      const response = await updateRequestStatus(payload);
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
