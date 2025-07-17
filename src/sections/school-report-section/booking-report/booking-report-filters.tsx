import {
  Box,
  TextField,
  Autocomplete,
  IconButton,
  Button,
  Stack,
  Typography,
  FormControlLabel,
  Radio,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from '@mui/material';

import { useState, useEffect, useRef } from 'react';
import { useGetUsers } from 'src/api/users';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import DeleteIcon from '@mui/icons-material/Delete';
import { DateRangePicker } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import { enUS } from 'date-fns/locale';
import {
  useGetBookingStatusEnum,
  useGetPaymentMethodEnum,
  useGetPaymentStatusEnum,
} from 'src/api/enum';
import { useGetAllCategory } from 'src/api/category';
import { useTranslation } from 'react-i18next';

export default function BookingReportFilter({ filters, onFilters }: any) {
  const { users } = useGetUsers({ page: 0, limit: 1000, user_types: 'STUDENT' });
  const { users: trainerUsers } = useGetUsers({ page: 0, limit: 1000, user_types: 'TRAINER' });
  const { paymentMethodEnum, paymentMethodLoading, paymentMethodError } = useGetPaymentMethodEnum();
  const { paymentStatusEnum, paymentStatusLoading, paymentStatusError } = useGetPaymentStatusEnum();
  const {
    bookingStatusEnum,
    bookingStatusLoading,
    bookingStatusError,
    bookingStatusValidating,
    revalidateBookingStatusEnum,
  } = useGetBookingStatusEnum();
  const { i18n, t } = useTranslation();

  const { category, categoryLoading } = useGetAllCategory({
    limit: 1000,
    page: 0,
    published: '1',
    locale: i18n.language,
  });
  const handleFilterPaymentStatus = (newValue: string) => {
    onFilters({ ...filters, booking_status: newValue });
  };
  const handleFilterCategory = (newValue: string) => {
    onFilters({ ...filters, category_id: newValue.value });
  };
  const handleFilterPaymentMethod = (newValue: number) => {
    onFilters({ ...filters, payment_method: newValue });
  };

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectionRange, setSelectionRange] = useState({
    startDate: new Date(),
    endDate: new Date(),
    key: 'selection',
  });
  const datePickerRef = useRef<HTMLDivElement>(null);
  const clearFilterClicked = useRef(false);

  const handleSelect = (ranges: any) => {
    const { startDate, endDate } = ranges.selection;
    setSelectionRange(ranges.selection);

    const newFilters = {
      ...filters,
      startDate: startDate ? startDate.toISOString().split('T')[0] : undefined,
      endDate: endDate ? endDate.toISOString().split('T')[0] : undefined,
    };

    onFilters(newFilters);
  };

  const toggleDatePicker = () => {
    setShowDatePicker(!showDatePicker);
  };

  const handleClearDates = () => {
    onFilters({
      ...filters,
      startDate: undefined,
      endDate: undefined,
      payment_method: undefined,
      category_id: undefined,
    });
    setSelectionRange({
      startDate: new Date(),
      endDate: new Date(),
      key: 'selection',
    });
    clearFilterClicked.current = true;
  };
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (clearFilterClicked.current) {
        clearFilterClicked.current = false;
        return;
      }
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setShowDatePicker(false);
      }
    };
    if (showDatePicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDatePicker]);

  const renderPaymentStatus = (
    <Stack>
      <FormControl fullWidth variant="outlined">
        <InputLabel id="booking-status-label">Booking Status</InputLabel>
        <Select
          labelId="booking-status-label"
          id="booking-status"
          value={filters?.booking_status ?? ''}
          onChange={(e) => handleFilterPaymentStatus(Number(e.target.value))}
          label="Booking Status"
        >
          {bookingStatusEnum?.map((status) => (
            <MenuItem key={status.value} value={status.value}>
              {status.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Stack>
  );

  const renderPaymentMethod = (
    <Stack>
      <FormControl fullWidth variant="outlined">
        <InputLabel id="payment-method-label">Payment Method</InputLabel>
        <Select
          labelId="payment-method-label"
          id="payment-method"
          value={filters?.payment_method ?? ''}
          onChange={(e) => handleFilterPaymentMethod(Number(e.target.value))}
          label="Payment Method"
        >
          {paymentMethodEnum?.map((method) => (
            <MenuItem key={method.value} value={method.value}>
              {method.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Stack>
  );
  const categoryOptions =
    category?.map((item: any) => ({
      label: item.category_translations.map((translation: any) => translation.name).join(' - '),
      value: item.id,
    })) ?? [];
  return (
    <Box
      display="flex"
      gap={2}
      width="100%"
      sx={{ '& > *': { flex: '1 1 100%', minWidth: '250px' } }}
    >
      {renderPaymentMethod}
      {/* {renderPaymentStatus} */}
      <Autocomplete
        options={categoryOptions}
        getOptionLabel={(option) => option.label}
        value={categoryOptions.find((opt) => opt.value === filters.category_id) || null}
        isOptionEqualToValue={(option, value) => option.value === value.value}
        onChange={(event, newValue) => handleFilterCategory(newValue)}
        renderInput={(params) => <TextField placeholder={t('Select Category')} {...params} />}
      />

      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Button
          variant="contained"
          onClick={toggleDatePicker}
          startIcon={<CalendarMonthIcon />}
          sx={{
            backgroundColor: 'transparent',
            color: '#CF5A0D',
            border: '1px solid #ccc',
            textTransform: 'none',
            '&:hover': { backgroundColor: '#e0e0e0', borderColor: '#aaa' },
          }}
        >
          Select Date
        </Button>
        {(filters.startDate ||
          filters.endDate ||
          filters.payment_method ||
          filters.category_id) && (
          <IconButton onClick={handleClearDates} aria-label="clear dates" sx={{ marginLeft: 1 }}>
            <DeleteIcon />
          </IconButton>
        )}
      </Box>

      {showDatePicker && (
        <Box
          ref={datePickerRef}
          sx={{
            position: 'absolute',
            top: '110px',
            right: '20px',
            zIndex: 1000,
            backgroundColor: '#fff',
            borderRadius: '8px',
            boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)',
            padding: '16px',
          }}
        >
          <DateRangePicker
            ranges={[selectionRange]}
            onChange={handleSelect}
            showSelectionPreview={true}
            moveRangeOnFirstSelection={false}
            locale={enUS}
            months={2}
            direction="horizontal"
          />
        </Box>
      )}
    </Box>
  );
}
