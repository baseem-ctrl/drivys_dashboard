import { Box, TextField, Autocomplete, Grid, Button, IconButton } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { useGetUsers } from 'src/api/users';
import { DateRangePicker } from 'react-date-range';
import { enUS } from 'date-fns/locale';
import { format } from 'date-fns';
import DeleteIcon from '@mui/icons-material/Delete';
import { useTranslation } from 'react-i18next';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

export default function CashInHandFilter({ filters, onFilters }: any) {
  const { t } = useTranslation();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const clearFilterClicked = useRef(false);
  const datePickerRef = useRef<HTMLDivElement>(null);
  const [selectionRange, setSelectionRange] = useState({
    startDate: new Date(),
    endDate: new Date(),
    key: 'selection',
  });

  const { users } = useGetUsers({
    page: 0,
    limit: 1000,
    user_types: 'STUDENT',
  });
  const { users: trainerUsers } = useGetUsers({
    page: 0,
    limit: 1000,
    user_types: 'TRAINER',
  });
  const handleClearDates = () => {
    onFilters('cash_clearance_date_from', '');
    onFilters('cash_clearance_date_to', '');
    setSelectionRange({
      startDate: new Date(),
      endDate: new Date(),
      key: 'selection',
    });

    clearFilterClicked.current = true;
  };
  const toggleDatePicker = () => {
    setShowDatePicker(!showDatePicker);
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
  const handleSelect = (ranges: any) => {
    const { startDate, endDate } = ranges.selection;

    const formattedFrom = format(startDate, 'dd-MM-yyyy');
    const formattedTo = format(endDate, 'dd-MM-yyyy');

    setSelectionRange(ranges.selection);

    onFilters('cash_clearance_date_from', formattedFrom);
    onFilters('cash_clearance_date_to', formattedTo);
  };

  const handleStudentChange = (event: any, value: any) => {
    onFilters((prevFilters: any) => ({
      ...prevFilters,
      student_id: value?.value || null,
    }));
  };

  const handleTrainerChange = (event: any, value: any) => {
    onFilters((prevFilters: any) => ({
      ...prevFilters,
      trainer_id: value?.value || null,
    }));
  };

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
      {/* Student Filter */}
      {/* <Box flex={1} display="flex" alignItems="center" gap={1}>
        <Autocomplete
          fullWidth
          options={
            users?.map((item: any) => ({
              label: `${item?.name ?? 'NA'}`,
              value: item.id,
            })) ?? []
          }
          value={users.find((item) => item.id === filters.student_id) || null}
          getOptionLabel={(option) => option.label || 'NA'}
          isOptionEqualToValue={(option, value) => option.value === value}
          renderInput={(params) => <TextField placeholder="Select Student" {...params} fullWidth />}
          onChange={handleStudentChange}
        />
      </Box> */}

      {/* Trainer Filter */}
      {/* <Box flex={1} display="flex" alignItems="center" gap={1}>
        <Autocomplete
          fullWidth
          options={
            trainerUsers?.map((item: any) => ({
              label: `${item?.name ?? 'NA'}`,
              value: item.id,
            })) ?? []
          }
          value={trainerUsers.find((item) => item.id === filters.trainer_id) || null}
          getOptionLabel={(option) => option.label || 'NA'}
          isOptionEqualToValue={(option, value) => option.value === value}
          renderInput={(params) => <TextField placeholder="Select Trainer" {...params} fullWidth />}
          onChange={handleTrainerChange}
        />
      </Box> */}
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
      <Grid
        item
        xs={12}
        md={3}
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          marginTop: '7px',
          marginBottom: '20px',
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
          {t('Select Clearance Date')}
        </Button>
        {filters?.cash_clearance_date_from && filters?.cash_clearance_date_to && (
          <IconButton onClick={handleClearDates} aria-label="clear dates" sx={{ marginLeft: 2 }}>
            <DeleteIcon />
          </IconButton>
        )}
      </Grid>
    </Box>
  );
}
