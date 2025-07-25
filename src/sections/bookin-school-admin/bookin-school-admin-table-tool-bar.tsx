import { Box, TextField, Autocomplete, IconButton, Button, Grid } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { useGetPaymentMethodEnum, useGetPaymentStatusEnum } from 'src/api/enum';
import { useGetSchool } from 'src/api/school';
import { useGetUsers } from 'src/api/users';
import ClearIcon from '@mui/icons-material/Clear';
import DeleteIcon from '@mui/icons-material/Delete';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

import { DateRangePicker } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import { enUS, arSA } from 'date-fns/locale';
import '../overview/e-commerce/view/CustomDateRangePicker.css';
import { useLocales } from 'src/locales';

export default function BookingTableToolbar({
  filters,
  onFilters,
  vendorOptions,
  setSearch,
  studentOptions,
  loading,
}: any) {
  const { paymentMethodEnum, paymentMethodLoading, paymentMethodError } = useGetPaymentMethodEnum();
  const { paymentStatusEnum, paymentStatusLoading, paymentStatusError } = useGetPaymentStatusEnum();
  const [schoolOptions, setSchoolOptions] = useState([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectionRange, setSelectionRange] = useState({
    startDate: new Date(),
    endDate: new Date(),
    key: 'selection',
  });
  const { t, currentLang } = useLocales();
  const localeMap = {
    en: enUS,
    ar: arSA,
  };
  const currentLocale = localeMap[currentLang] || enUS;
  const handleSelect = (ranges: any) => {
    const { startDate, endDate } = ranges.selection;
    setSelectionRange(ranges.selection);

    onFilters('start_date', startDate.toISOString().split('T')[0]);
    onFilters('end_date', endDate.toISOString().split('T')[0]);
  };

  const toggleDatePicker = () => {
    setShowDatePicker(!showDatePicker);
  };
  const datePickerRef = useRef<HTMLDivElement>(null);
  const clearFilterClicked = useRef(false);
  const handleClearDates = () => {
    onFilters('start_date', '');
    onFilters('end_date', '');
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

  const { schoolList, schoolLoading } = useGetSchool({ limit: 1000, page: 1 });
  const { users, usersLoading, revalidateUsers } = useGetUsers({
    page: 0,
    limit: 1000,
    user_types: 'STUDENT',
  });
  const handleChange = (name: string) => (value: any) => {
    onFilters(name, value);
  };
  useEffect(() => {
    const schoolData = schoolList
      .map((vendor) => {
        const translation = vendor.vendor_translations.find(
          (trans) => trans.locale.toLowerCase() === 'en'
        );
        return translation ? { label: translation.name, value: vendor.id } : null;
      })
      .filter((school) => school !== null);

    setSchoolOptions(schoolData);
  }, [schoolList]);

  const handleClear = (name) => () => {
    onFilters(name, '');
  };

  const handleClearSearch = () => {
    onFilters('search', '');
    setSearch('');
  };
  return (
    <Box
      display="flex"
      flexDirection={{ xs: 'column', sm: 'row' }}
      alignItems="flex-start"
      gap={2}
      padding={2}
    >
      {/* Vendor Filter (Autocomplete) */}
      <Box sx={{ flex: 1 }}>
        <Autocomplete
          fullWidth
          options={
            vendorOptions?.map((item: any) => ({
              label: `${item?.name ?? t('n/a')}(${item?.email ?? t('n/a')})`,
              value: item.id,
            })) ?? []
          }
          value={vendorOptions.find((item) => item.id === filters.vendor)?.name || null}
          onChange={(event, newValue) => handleChange('vendor')(newValue?.value || '')}
          renderInput={(params) => (
            <TextField
              placeholder={t('Select School')}
              {...params}
              onChange={(e) => setSearch(e.target.value)}
              fullWidth
            />
          )}
          renderOption={(props, option) => (
            <li {...props} key={option.value}>
              {option.label}
            </li>
          )}
        />
      </Box>

      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center' }}>
        <TextField
          label="Search by Name"
          value={filters.search || ''}
          onChange={(e) => handleChange('search')(e.target.value)}
          placeholder="Search by student, driver, or school name"
          fullWidth
        />
        {filters.search && (
          <IconButton onClick={handleClearSearch} sx={{ marginLeft: 1 }} aria-label="clear search">
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
            locale={currentLocale}
            months={2} // Show two months side by side
            direction="horizontal"
          />
        </Box>
      )}
      <Grid
        item
        xs={12}
        md={3}
        sx={{
          display: 'flex',
          justifyContent: 'center',
          marginTop: '7px',
        }}
      >
        <Button
          variant="contained"
          onClick={toggleDatePicker}
          startIcon={<CalendarMonthIcon />}
          sx={{
            backgroundColor: 'transparent',
            color: '#CF5A0D',
            border: '1px solid #ccc',

            textTransform: 'none',
            '&:hover': {
              backgroundColor: '#e0e0e0',
              borderColor: '#aaa',
            },
          }}
        >
          Select Date
        </Button>
        {filters.start_date && filters.end_date && (
          <IconButton onClick={handleClearDates} aria-label="clear dates" sx={{ marginLeft: 2 }}>
            <DeleteIcon />
          </IconButton>
        )}
      </Grid>
    </Box>
  );
}
