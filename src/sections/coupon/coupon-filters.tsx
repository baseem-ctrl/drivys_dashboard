import { useCallback, useState } from 'react';
// @mui
import { alpha } from '@mui/material/styles';
import Radio from '@mui/material/Radio';
import Stack from '@mui/material/Stack';
import Badge from '@mui/material/Badge';
import Drawer from '@mui/material/Drawer';
import Rating from '@mui/material/Rating';
import Button from '@mui/material/Button';
import Slider from '@mui/material/Slider';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import FormControlLabel from '@mui/material/FormControlLabel';
import InputBase, { inputBaseClasses } from '@mui/material/InputBase';
// types
import { IProductFilters, IProductFilterValue } from 'src/types/product';
// components
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { ColorPicker } from 'src/components/color-utils';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Autocomplete, Chip, TextField } from '@mui/material';
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
  //
  genderOptions?: {
    value: string;
    label: string;
  }[];
  categoryOptions?: string[];
  ratingOptions?: string[];
  colorOptions?: string[];
  discountOptions?: string[];
  dateError?: any;
  activeOptions?: string[];
  stockOptions?: {
    value: string;
    label: string;
  }[];
};

export default function CouponFilters({
  open,
  onOpen,
  onClose,
  //
  filters,
  onFilters,
  //
  canReset,
  onResetFilters,
  //
  colorOptions,
  stockOptions,
  ratingOptions,
  categoryOptions,
  dateError,
  discountOptions,
  activeOptions,
}: Props) {
  const marksLabel = [...Array(21)].map((_, index) => {
    const value = index * 10;

    const firstValue = index === 0 ? `$${value}` : `${value}`;

    return {
      value,
      label: index % 4 ? '' : firstValue,
    };
  });

  const handleFilterStocks = (newValue: string) => {
    onFilters('in_stock', newValue);
  };

  const handleFilterStartDate = useCallback(
    (newValue: Date | null) => {
      if (newValue) {
        onFilters('starting_date', newValue);
      }
    },
    [onFilters]
  );

  const handleFilterDiscount = useCallback(
    (newValue: Date | null) => {
      onFilters('discount_type_id', newValue);
    },
    [onFilters]
  );

  const handleFilterEndDate = useCallback(
    (newValue: Date | null) => {
      onFilters('ending_date', newValue);
    },
    [onFilters]
  );

  const handleFilterActive = useCallback(
    (newValue: string) => {
      let isActiveFilterValue;

      if (newValue === 'Show All Active') {
        isActiveFilterValue = '1';
      } else if (newValue === 'Show All Inactive') {
        isActiveFilterValue = '0';
      } else {
        isActiveFilterValue = '';
      }
      onFilters('is_active', isActiveFilterValue);
    },
    [onFilters]
  );

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

  const renderDiscountType = (
    <Stack>
      <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
        Discount Types
      </Typography>
      <Autocomplete
        disableCloseOnSelect
        options={discountOptions?.map((option) => option)}
        getOptionLabel={(option) => option}
        value={filters.discount_type_id}
        onChange={(event, newValue) => handleFilterDiscount(newValue)}
        renderInput={(params) => <TextField placeholder="Select Discount type" {...params} />}
        renderOption={(props, option) => (
          <li {...props} key={option}>
            {option}
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

  const renderIsActive = (
    <Stack>
      <Typography variant="subtitle2" sx={{ mb: 1, mt: 2 }}>
        Status
      </Typography>
      {activeOptions?.map((option) => (
        <FormControlLabel
          key={option}
          control={
            <Radio
              checked={
                (option === 'all' && filters.is_active === '') ||
                (option === 'Show All Active' && filters.is_active === '1') ||
                (option === 'Show All Inactive' && filters.is_active === '0')
              }
              onClick={() => handleFilterActive(option)}
            />
          }
          label={option}
          sx={{
            ...(option === 'Show All' && {
              textTransform: 'capitalize',
            }),
          }}
        />
      ))}
    </Stack>
  );

  const renderPrice = (
    <Stack>
      <Typography variant="subtitle2" sx={{ flexGrow: 1 }}>
        Price
      </Typography>

      <Stack direction="row" spacing={5} sx={{ my: 2 }}>
        <InputRange type="max" onFilters={onFilters} filterName="value" value={filters.value} />
      </Stack>
    </Stack>
  );

  const renderDateRange = (
    <Stack spacing={1.5} sx={{ mb: 3 }}>
      <Typography variant="subtitle2">Range</Typography>

      <Stack spacing={2}>
        <DatePicker
          label="Start date"
          value={filters.starting_date}
          onChange={(newValue) => {
            handleFilterStartDate(newValue);
          }}
        />

        <DatePicker
          label="End date"
          value={filters.ending_date}
          onChange={handleFilterEndDate}
          slotProps={{
            textField: {
              error: dateError,
              helperText: dateError && 'End date must be later than start date',
            },
          }}
        />
      </Stack>
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
            {renderDateRange}
            {renderPrice}
            {renderDiscountType}
            {renderIsActive}
          </Stack>
        </Scrollbar>
      </Drawer>
    </>
  );
}

// ----------------------------------------------------------------------

type InputRangeProps = {
  type: 'min' | 'max';
  onFilters: (name: string, value: any) => void;
  filterName: string;
  value: any;
};

function InputRange({ type, onFilters, filterName, value }: InputRangeProps) {
  const handlePriceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(event.target.value);
    onFilters(filterName, value); // Call the function with max value
  };

  return (
    <>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ width: 1 }}>
        <Typography
          variant="caption"
          sx={{
            flexShrink: 0,
            color: 'text.disabled',
            textTransform: 'capitalize',
            fontWeight: 'fontWeightSemiBold',
          }}
        >
          Discount Price
        </Typography>

        <InputBase
          fullWidth
          value={value}
          onChange={handlePriceChange}
          sx={{
            maxWidth: 48,
            borderRadius: 0.75,
            bgcolor: (theme) => alpha(theme.palette.grey[500], 0.08),
            [`& .${inputBaseClasses.input}`]: {
              pr: 1,
              py: 0.75,
              textAlign: 'right',
              typography: 'body2',
            },
          }}
        />
      </Stack>
    </>
  );
}
