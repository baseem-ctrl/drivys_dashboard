import {
  Stack,
  Typography,
  Select,
  MenuItem,
  FormControlLabel,
  Radio,
  Divider,
  Drawer,
  Button,
  Badge,
  IconButton,
  Tooltip,
  RadioGroup,
} from '@mui/material';
import { useGetPaymentMethodEnum, useGetPaymentStatusEnum } from 'src/api/enum';
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';

// ----------------------------------------------------------------------

type Props = {
  open?: boolean;
  onOpen?: VoidFunction;
  onClose?: VoidFunction;
  //
  filters: any;
  onFilters?: (name: string, value: any) => void;
  //
  canReset?: boolean;
  onResetFilters?: VoidFunction;
};

export default function BookingFilters({
  open,
  onOpen,
  onClose,
  //
  filters,
  onFilters,
  //
  canReset,
  onResetFilters,
}: Props) {
  const { paymentMethodEnum, paymentMethodLoading, paymentMethodError } = useGetPaymentMethodEnum();
  const { paymentStatusEnum, paymentStatusLoading, paymentStatusError } = useGetPaymentStatusEnum();
  const handleFilterPaymentStatus = (newValue: string) => {
    onFilters('payment_status', newValue);
  };

  const handleFilterPaymentMethod = (newValue: number) => {
    if (newValue !== undefined) {
      onFilters('payment_method', newValue);
    }
  };

  const renderHead = (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      sx={{ py: 2, pr: 1, pl: 2.5 }}
    >
      <Typography variant="h6" sx={{ flexGrow: 1 }}>
        Filters
      </Typography>

      <Tooltip title="Reset">
        <IconButton onClick={onResetFilters}>
          <Badge color="error" variant="dot" invisible={!canReset}>
            <Iconify icon="solar:restart-bold" />
          </Badge>
        </IconButton>
      </Tooltip>

      <IconButton onClick={onClose}>
        <Iconify icon="mingcute:close-line" />
      </IconButton>
    </Stack>
  );

  const renderPaymentStatus = (
    <Stack>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        Payment Status
      </Typography>
      {paymentStatusEnum?.map((status) => (
        <FormControlLabel
          key={status.value}
          control={
            <Radio
              checked={status.value === filters?.payment_status}
              onClick={() => handleFilterPaymentStatus(status.value)}
            />
          }
          label={status.name}
        />
      ))}
    </Stack>
  );
  const renderPaymentMethod = (
    <Stack>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        Payment Method
      </Typography>
      {paymentMethodEnum?.map((method) => (
        <FormControlLabel
          key={method.value}
          control={
            <Radio
              checked={method.value === filters?.payment_method}
              onChange={() => handleFilterPaymentMethod(method.value)}
            />
          }
          label={method.name}
        />
      ))}
    </Stack>
  );

  return (
    <>
      <Button
        disableRipple
        color="inherit"
        endIcon={
          <Badge color="error" variant="dot" invisible={!canReset}>
            <Iconify icon="ic:round-filter-list" />
          </Badge>
        }
        onClick={onOpen}
      >
        Filters
      </Button>

      <Drawer
        anchor="right"
        open={open}
        onClose={onClose}
        slotProps={{
          backdrop: { invisible: true },
        }}
        PaperProps={{
          sx: { width: 280 },
        }}
      >
        {renderHead}

        <Divider />

        <Scrollbar sx={{ px: 2.5, py: 3 }}>
          <Stack spacing={3}>
            {paymentStatusLoading || paymentStatusError ? (
              <Typography color="error">Failed to load payment statuses</Typography>
            ) : (
              renderPaymentStatus
            )}
            {paymentMethodLoading || paymentMethodError ? (
              <Typography color="error">Failed to load payment methods</Typography>
            ) : (
              renderPaymentMethod
            )}
          </Stack>
        </Scrollbar>
      </Drawer>
    </>
  );
}
