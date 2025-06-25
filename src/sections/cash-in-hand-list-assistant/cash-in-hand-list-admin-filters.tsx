import {
  Box,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  Switch,
  FormControlLabel,
} from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { DateRangePicker } from 'react-date-range';
import { enUS } from 'date-fns/locale';
import { format } from 'date-fns';
import DeleteIcon from '@mui/icons-material/Delete';
import { useTranslation } from 'react-i18next';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ClearIcon from '@mui/icons-material/Clear';

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

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onFilters('search', event.target.value);
  };

  const handleCheckCashToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    onFilters('check_cash_in_hand', event.target.checked ? 1 : 0);
  };

  return (
    <Box
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      flexWrap="wrap"
      sx={{ width: '100%', py: 1, gap: 2 }}
    >
      <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
        <TextField
          size="small"
          variant="outlined"
          placeholder={t('search')}
          value={filters.search}
          onChange={handleSearchChange}
          InputProps={{
            endAdornment: filters.search ? (
              <InputAdornment position="end">
                <IconButton
                  aria-label="clear search"
                  onClick={() => onFilters('search', '')}
                  edge="end"
                >
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            ) : null,
          }}
          sx={{ minWidth: 220 }}
        />

        <FormControlLabel
          control={
            <Switch
              checked={Boolean(filters.check_cash_in_hand)}
              onChange={handleCheckCashToggle}
              color="primary"
            />
          }
          label={t('cash_in_hand')}
        />
      </Box>

      <Box display="flex" alignItems="center">
        <Button
          variant="outlined"
          onClick={toggleDatePicker}
          startIcon={<CalendarMonthIcon />}
          sx={{
            textTransform: 'none',
            color: '#CF5A0D',
            borderColor: '#ccc',
            '&:hover': {
              borderColor: '#aaa',
              backgroundColor: '#f5f5f5',
            },
          }}
        >
          {t('cash_clearance_date')}
        </Button>

        {filters?.cash_clearance_date_from && filters?.cash_clearance_date_to && (
          <IconButton
            onClick={handleClearDates}
            aria-label="clear dates"
            size="small"
            sx={{ ml: 1 }}
          >
            <DeleteIcon fontSize="small" />
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
            showSelectionPreview
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
