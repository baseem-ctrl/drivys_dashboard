import moment from 'moment';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import { useBoolean } from 'src/hooks/use-boolean';
import { useLocales } from 'src/locales';
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
import { useTranslation } from 'react-i18next';

// ----------------------------------------------------------------------

export default function RefundTableRow({
  row,
  selected,

  reload,
}: Props) {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const { i18n, t } = useTranslation();

  const { user, driver, driver_id } = row;
  const { refundRequestStatusEnum } = useGetRefundRequestStatusEnum();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [refundAmount, setRefundAmount] = useState<number | string>('');
  // const [refundStatus, setRefundStatus] = useState<string>(
  //   mapStatusToValue(row.status, refundRequestStatusEnum)
  // );

  const handleRefundAmountClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const handleRefundAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRefundAmount(event.target.value);
  };

  const handleRefundSubmit = async () => {
    const payload = {
      booking_id: row?.booking_id,
      amount_refunded: refundAmount,
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
    } finally {
      handlePopoverClose();
    }
  };
  const open = Boolean(anchorEl);
  const id = open ? 'refund-popover' : undefined;
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
          {user?.name || t('n/a')}
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
        {row?.booking?.id || t('n/a')}
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
              handleClickPackageDetails(row?.booking?.package?.id);
            }
          }}
        >
          {(() => {
            const translation =
              row?.booking?.package?.package_translations?.find(
                (t: any) => t?.locale?.toLowerCase() === i18n.language.toLowerCase()
              ) || row?.booking?.package?.package_translations?.[0];

            return translation?.name ?? t('unknown_package');
          })()}
        </Typography>

        <Label variant="soft" sx={{ mt: 1, color: 'darkblue' }}>
          {row?.booking?.package?.is_unlimited
            ? t('unlimited_sessions')
            : `${row?.booking?.package?.number_of_sessions ?? 0} ${t('sessions')}`}
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
          {t(row?.booking?.booking_status) || t('n/a')}
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
          {t(row.booking?.payment_status) || t('n/a')}
        </Label>
      </TableCell>
      <TableCell>
        <span className="dirham-symbol">&#x00EA;</span>
        {row?.refund_amount_sanctioned || '0'}
      </TableCell>
      <TableCell>
        <span className="dirham-symbol">&#x00EA;</span>
        {row?.remaining_amount_to_refund || '0'}
      </TableCell>

      <TableCell>{t(row?.booking?.payment_method)}</TableCell>
      <TableCell>{row.reason ? row?.booking?.refund_reason : t('n/a')}</TableCell>
      <TableCell>
        <Tooltip title={refundStatus === 'approved' ? 'You can process the refund now' : ''} arrow>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {refundStatus === 'approved' ? (
              <Button variant="outlined" color="primary" onClick={handleRefundAmountClick}>
                {t('refund')}
              </Button>
            ) : (
              <Select
                value={refundStatus || ''}
                onChange={handleRefundStatusChange}
                displayEmpty
                size="small"
                disabled={refundStatus === 'approved'}
              >
                {refundRequestStatusEnum.map((status) => (
                  <MenuItem key={status.value} value={status.value}>
                    {status.name}
                  </MenuItem>
                ))}
              </Select>
            )}

            {/* {refundStatus === 'approved' && (
              <IconButton size="small" disabled>
                <InfoIcon />
              </IconButton>
            )} */}
          </div>
        </Tooltip>
        <Popover
          id={id}
          open={open}
          anchorEl={anchorEl}
          onClose={handlePopoverClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'center',
          }}
        >
          <div style={{ padding: 16 }}>
            <TextField
              label="Refund Amount"
              value={refundAmount}
              onChange={handleRefundAmountChange}
              type="number"
              fullWidth
              variant="outlined"
              margin="normal"
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleRefundSubmit}
              disabled={!refundAmount || Number(refundAmount) <= 0}
            >
              Submit Refund
            </Button>
          </div>
        </Popover>
      </TableCell>

      <TableCell>
        {moment(row?.created_at)
          .local()
          .format('DD/MM/YY h:mm a')}
        <Typography color="text.secondary" sx={{ fontSize: '0.925rem' }}>
          {t('updated')}{' '}
          {moment(row?.updated_at)
            .local()
            .format('DD/MM/YY h:mm a')}
        </Typography>
      </TableCell>
    </TableRow>
  );
}
