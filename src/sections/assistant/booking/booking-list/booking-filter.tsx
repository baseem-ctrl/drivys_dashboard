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
  Autocomplete,
  TextField,
  Chip,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import {
  useGetBookingStatusEnum,
  useGetCategories,
  useGetCities,
  useGetPaymentMethodEnum,
  useGetPaymentStatusEnum,
} from 'src/api/enum';
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
  const { t } = useTranslation();
  const { paymentMethodEnum, paymentMethodLoading, paymentMethodError } = useGetPaymentMethodEnum();
  const { paymentStatusEnum, paymentStatusLoading, paymentStatusError } = useGetPaymentStatusEnum();
  const { bookingStatusEnum, bookingStatusError, bookingStatusLoading } = useGetBookingStatusEnum();

  const { categories, categoriesLoading } = useGetCategories(0, 100);
  const { cities } = useGetCities(0, 1000);
  const handleFilterPaymentStatus = (newValue: string) => {
    onFilters('payment_status', newValue);
  };

  const handleFilterBookingStatus = (newValue: number) => {
    if (newValue !== undefined) {
      onFilters('booking_status', newValue);
    }
  };
  const handleFilterChange = (field, value) => {
    onFilters(field, value);
  };

  const renderCategory = (
    <Stack sx={{ mb: 1.5, ml: 2 }}>
      <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
        {t('category')}
      </Typography>

      <Autocomplete
        options={
          categories?.map((item: any) => ({
            label: item.category_translations
              .map((translation: any) => translation.name) // Extract all names
              .join(' - '), // Display full name
            value: item.id,
          })) ?? []
        }
        getOptionLabel={(option) => option.label}
        value={
          categories
            ?.map((item: any) => ({
              label: item.category_translations.map((t: any) => t.name).join(' - '),
              value: item.id,
            }))
            .find((opt) => opt.value === filters.category_id) || null
        }
        onChange={(event, newValue) =>
          handleFilterChange('category_id', newValue ? newValue.value : null)
        }
        renderInput={(params) => <TextField placeholder={t('Select Category')} {...params} />}
        renderOption={(props, option) => (
          <li {...props} key={option.value}>
            {option.label}
          </li>
        )}
        renderTags={(selected, getTagProps) =>
          selected.map((option, index) => (
            <Chip
              {...getTagProps({ index })}
              key={option}
              label={option}
              size="small"
              variant="soft"
            />
          ))
        }
      />
    </Stack>
  );

  const renderCity = (
    <Stack sx={{ mb: 1.5, ml: 3 }}>
      <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
        {t('city')}
      </Typography>

      <Autocomplete
        options={
          cities?.map((item: any) => ({
            label: item.city_translations.map((translation: any) => translation.name).join(' - '),
            value: item.id,
          })) ?? []
        }
        getOptionLabel={(option) => option.label}
        value={
          cities
            ?.map((item: any) => ({
              label: item.city_translations.map((translation: any) => translation.name).join(' - '),
              value: item.id,
            }))
            .find((option: any) => option.value === filters.city_id) || null
        }
        onChange={(event, newValue) =>
          handleFilterChange('city_id', newValue ? newValue.value : null)
        }
        renderInput={(params) => <TextField placeholder={t('select_city')} {...params} />}
        renderOption={(props, option) => (
          <li {...props} key={option.value}>
            {option.label}
          </li>
        )}
        renderTags={(selected, getTagProps) =>
          selected.map((option, index) => (
            <Chip
              {...getTagProps({ index })}
              key={option.value}
              label={option.label}
              size="small"
              variant="soft"
            />
          ))
        }
      />
    </Stack>
  );
  const renderHead = (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      sx={{ py: 2, pr: 1, pl: 2.5 }}
    >
      <Typography variant="h6" sx={{ flexGrow: 1 }}>
        {t('Filters')}
      </Typography>

      <Tooltip title={t('Reset')}>
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

  // const renderPaymentStatus = (
  //   <Stack>
  //     <Typography variant="subtitle2" sx={{ mb: 1 }}>
  //       {t('Payment Status')}
  //     </Typography>
  //     {paymentStatusEnum?.map((status) => (
  //       <FormControlLabel
  //         key={status.value}
  //         control={
  //           <Radio
  //             checked={status.value === filters?.payment_status}
  //             onClick={() => handleFilterPaymentStatus(status.value)}
  //           />
  //         }
  //         label={t(status.name)}
  //       />
  //     ))}
  //   </Stack>
  // );
  const renderBookingStatus = (
    <Stack>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        {t('Booking Status')}
      </Typography>
      {bookingStatusEnum?.map((method) => (
        <FormControlLabel
          key={method.value}
          control={
            <Radio
              checked={method.value === filters?.booking_status}
              onChange={() => handleFilterBookingStatus(method.value)}
            />
          }
          label={t(method.name)}
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
        {t('Filters')}
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
        {renderCategory}
        {renderCity}
        <Divider />

        <Scrollbar sx={{ px: 2.5, py: 3 }}>
          <Stack spacing={3}>
            {/* {paymentStatusLoading || paymentStatusError ? (
              <Typography color="error">{t('Failed to load payment statuses')}</Typography>
            ) : (
              renderPaymentStatus
            )} */}
            {bookingStatusLoading || bookingStatusError ? (
              <Typography color="error">{t('Failed to load payment methods')}</Typography>
            ) : (
              renderBookingStatus
            )}
          </Stack>
        </Scrollbar>
      </Drawer>
    </>
  );
}
