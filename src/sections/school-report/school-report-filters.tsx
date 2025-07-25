import { Box, TextField, Autocomplete, Button, IconButton } from '@mui/material';
import { DateRangePicker } from 'react-date-range';
import { useGetAllCity } from 'src/api/city';
import { useGetUsers } from 'src/api/users';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import DeleteIcon from '@mui/icons-material/Delete';
import { useEffect, useRef, useState } from 'react';
import { arSA, enUS } from 'date-fns/locale';
import { useGetSchool } from 'src/api/school';
import { useTranslation } from 'react-i18next';

export default function SchoolReportFilter({ filters, onFilters }: any) {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectionRange, setSelectionRange] = useState({
    startDate: new Date(),
    endDate: new Date(),
    key: 'selection',
  });
  const datePickerRef = useRef<HTMLDivElement>(null);
  const clearFilterClicked = useRef(false);
  const { city, cityLoading } = useGetAllCity({
    limit: 1000,
    page: 0,
  });
  const { users } = useGetUsers({
    page: 0,
    limit: 1000,
    user_types: 'STUDENT',
  });
  const { schoolList, schoolLoading } = useGetSchool({
    limit: 1000,
  });
  const { i18n } = useTranslation();
  const localeMap = {
    en: enUS,
    ar: arSA,
  };
  const currentLocale = localeMap[i18n.language] || enUS;
  const handleSchoolChange = (event: any, value: any) => {
    onFilters((prevFilters: any) => ({
      ...prevFilters,
      school_id: value?.value || null,
    }));
  };
  const toggleDatePicker = () => {
    setShowDatePicker(!showDatePicker);
  };
  const handleTrainerChange = (event: any, value: any) => {
    onFilters((prevFilters: any) => ({
      ...prevFilters,
      student_id: value?.value || null,
    }));
  };
  const handleClearDates = () => {
    onFilters({ ...filters, startDate: undefined, endDate: undefined });
    setSelectionRange({
      startDate: new Date(),
      endDate: new Date(),
      key: 'selection',
    });
    clearFilterClicked.current = true;
  };
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
  const schoolOptions =
    schoolList?.map((school) => ({
      label: school.vendor_translations.map((translation) => translation.name).join(' - '),
      value: school.id,
    })) ?? [];
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
  return (
    <Box
      display="flex"
      gap={2}
      width="100%"
      sx={{
        '& > *': {
          flex: '1 1 100%',
          minWidth: '300px',
        },
      }}
    >
      {/* City Filter */}
      {/* <Box flex={1} display="flex" alignItems="center" gap={1}>
        <Autocomplete
          fullWidth
          options={schoolOptions}
          getOptionLabel={(option) => option.label}
          value={schoolOptions.find((option) => option.value === filters.school_id) || null}
          isOptionEqualToValue={(option, value) => option.value === value?.value}
          renderInput={(params) => <TextField placeholder="Select School" {...params} fullWidth />}
          onChange={handleSchoolChange}
        />
      </Box> */}

      <Box display="flex" gap={2} width="100%">
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
          {(filters.startDate || filters.endDate) && (
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
              locale={currentLocale}
              months={2}
              direction="horizontal"
            />
          </Box>
        )}
      </Box>
    </Box>
  );
}
