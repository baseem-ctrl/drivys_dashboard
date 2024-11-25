// @mui
import { alpha } from '@mui/material/styles';
import Radio from '@mui/material/Radio';
import Stack from '@mui/material/Stack';
import Badge from '@mui/material/Badge';
import Drawer from '@mui/material/Drawer';
import Rating from '@mui/material/Rating';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import FormControlLabel from '@mui/material/FormControlLabel';
import InputBase, { inputBaseClasses } from '@mui/material/InputBase';
// types
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { Autocomplete, Chip, TextField } from '@mui/material';
import { useCallback } from 'react';

// ----------------------------------------------------------------------

type Props = {
  open?: boolean;
  onOpen?: VoidFunction;
  onClose?: VoidFunction;
  //
  filters: any;
  onFilters: (name: string, value: any) => void;
  //
  canReset?: boolean;
  onResetFilters?: VoidFunction;
  //
  genderOptions?: {
    value: string;
    label: string;
  }[];
  categoryOptions?: string[];
  colorOptions?: string[];
  statusOptions?: {
    value: string;
    label: string;
  }[];
  publishedOptions?: {
    value: string;
    label: string;
  }[];
  schoolOptions: any;
};

export default function ProductFilters({
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
  statusOptions,
  publishedOptions,
  schoolOptions,
}: Props) {
  const handleFilterStocks = (newValue: string) => {
    onFilters('status', newValue);
  };
  const handleFilterPublished = (newValue: string) => {
    onFilters('is_published', newValue);
  };

  const handleFilterVendor = useCallback(
    (newValue: string[]) => {
      onFilters('vendor_id', newValue);
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

  const renderStock = (
    <Stack>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        Status
      </Typography>
      {statusOptions.map((option) => (
        <FormControlLabel
          key={option.value}
          control={
            <Radio
              checked={option.value === filters?.status}
              onClick={() => handleFilterStocks(option?.value)}
            />
          }
          label={option.label}
          sx={{
            ...(option.label === 'all' && {
              textTransform: 'capitalize',
            }),
          }}
        />
      ))}
    </Stack>
  );
  const renderActive = (
    <Stack>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        Publish Status
      </Typography>
      {publishedOptions.map((option) => (
        <FormControlLabel
          key={option.value}
          control={
            <Radio
              checked={option.value === filters?.is_published}
              onClick={() => handleFilterPublished(option?.value)}
            />
          }
          label={option.label}
        />
      ))}
    </Stack>
  );
  const renderPrice = (
    <Stack>
      <Typography variant="subtitle2" sx={{ flexGrow: 1 }}>
        No of sessions
      </Typography>

      {/* <Stack direction="row" spacing={5} sx={{ my: 2 }}>
        <InputRange
          type="min"
          onFilters={onFilters}
          filterName="min_price"
          value={filters.min_price}
        />
        <InputRange
          type="max"
          onFilters={onFilters}
          filterName="max_price"
          value={filters.max_price}
        />

      </Stack> */}

      <NoOfSession
        type="number of sessions"
        onFilters={onFilters}
        filterName="number_of_sessions"
        value={filters.number_of_sessions}
      />
    </Stack>
  );
  let schoolsOptions = schoolOptions?.map((item) => {
    const translations = item.vendor_translations;

    // Find the translation for both Arabic and English locales
    const englishTranslation = translations.find((t) => t.locale === 'en');
    const arabicTranslation = translations.find((t) => t.locale === 'ar');

    return {
      label: `${englishTranslation?.name || 'Unknown'} (${arabicTranslation?.name || 'Unknown'})`,
      value: item.id,
    };
  });
  const renderVendorType = (
    <Stack>
      <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
        Vendor Type
      </Typography>
      <Autocomplete
        options={schoolsOptions?.map((option) => option)}
        getOptionLabel={(option) => option.label}
        value={filters.vendor_id}
        onChange={(event, newValue) => handleFilterVendor(newValue)}
        renderInput={(params) => <TextField placeholder="Select School type" {...params} />}
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
            {/* {renderStock} */}
            {renderPrice}
            {renderActive}
            {renderVendorType}
            {/* {renderDiscountPrice}
            {renderCostPrice}
            {renderWeight} */}
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
  const handleMinChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(event.target.value);
    onFilters('min_price', value); // Call the function with min value
  };

  const handleMaxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(event.target.value);
    onFilters('max_price', value); // Call the function with max value
  };

  return (
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
        {`${type} ($)`}
      </Typography>

      <InputBase
        fullWidth
        value={value}
        onChange={type === 'min' ? handleMinChange : handleMaxChange}
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
  );
}

function NoOfSession({ type, onFilters, filterName, value }: InputRangeProps) {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(event.target.value);
    onFilters('number_of_sessions', value); // Call the function with min value
  };

  return (
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
        {`${type} `}
      </Typography>

      <InputBase
        fullWidth
        value={value}
        onChange={handleChange}
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
  );
}
