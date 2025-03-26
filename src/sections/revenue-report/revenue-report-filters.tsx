import { Box, IconButton, Button } from '@mui/material';
import { useState, useEffect, useRef } from 'react';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import DeleteIcon from '@mui/icons-material/Delete';
import { DateRangePicker } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import { enUS } from 'date-fns/locale';

export default function RevenueReportFilter({ filters, onFilters }: any) {
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
    onFilters({ ...filters, startDate: undefined, endDate: undefined });
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

  return (
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
            locale={enUS}
            months={2}
            direction="horizontal"
          />
        </Box>
      )}
    </Box>
  );
}
