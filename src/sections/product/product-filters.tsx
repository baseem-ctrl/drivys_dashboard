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
  stockOptions?: {
    value: string;
    label: string;
  }[];
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
  stockOptions,
  ratingOptions,
}: Props) {

  
  const handleFilterStocks = (newValue: string) => {
    onFilters('in_stock', newValue);
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

  const renderStock = (
    <Stack>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        Stock availability
      </Typography>
      {stockOptions.map((option) => (
        <FormControlLabel
          key={option.value}
          control={
            <Radio
              checked={option.value === filters.in_stock}
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
  const renderPrice = (
    <Stack>
      <Typography variant="subtitle2" sx={{ flexGrow: 1 }}>
        Price
      </Typography>

      <Stack direction="row" spacing={5} sx={{ my: 2 }}>
        <InputRange type="min" onFilters={onFilters} filterName="price" value={filters.price_min} />
        <InputRange type="max" onFilters={onFilters} filterName="price" value={filters.price_max} />
      </Stack>
    </Stack>
  );
  const renderDiscountPrice = (
    <Stack>
      <Typography variant="subtitle2" sx={{ flexGrow: 1 }}>
        Disacount Price
      </Typography>

      <Stack direction="row" spacing={5} sx={{ my: 2 }}>
        <InputRange
          type="min"
          onFilters={onFilters}
          filterName="discount_price"
          value={filters.discount_price_min}
        />
        <InputRange
          type="max"
          onFilters={onFilters}
          filterName="discount_price"
          value={filters.discount_price_max}
        />
      </Stack>
    </Stack>
  );
  const renderCostPrice = (
    <Stack>
      <Typography variant="subtitle2" sx={{ flexGrow: 1 }}>
        Cost Price
      </Typography>

      <Stack direction="row" spacing={5} sx={{ my: 2 }}>
        <InputRange
          type="min"
          onFilters={onFilters}
          filterName="cost_price"
          value={filters.cost_price_min}
        />
        <InputRange
          type="max"
          onFilters={onFilters}
          filterName="cost_price"
          value={filters.cost_price_max}
        />
      </Stack>
    </Stack>
  );
  const renderWeight = (
    <Stack>
      <Typography variant="subtitle2" sx={{ flexGrow: 1 }}>
        Weight
      </Typography>

      <Stack direction="row" spacing={5} sx={{ my: 2 }}>
        <InputRange
          type="min"
          onFilters={onFilters}
          filterName="weight"
          value={filters.weight_min}
        />
        <InputRange
          type="max"
          onFilters={onFilters}
          filterName="weight"
          value={filters.weight_max}
        />
      </Stack>
    </Stack>
  );

  const renderRating = (
    <Stack spacing={2} alignItems="flex-start">
      <Typography variant="subtitle2">Rating</Typography>

      {ratingOptions?.map((item, index) => (
        <Stack
          key={item}
          direction="row"
          onClick={() => handleFilterRating(item)}
          sx={{
            borderRadius: 1,
            cursor: 'pointer',
            typography: 'body2',
            '&:hover': { opacity: 0.48 },
            ...(filters.rating === item && {
              pl: 0.5,
              pr: 0.75,
              py: 0.25,
              bgcolor: 'action.selected',
            }),
          }}
        >
          <Rating readOnly value={4 - index} sx={{ mr: 1 }} /> & Up
        </Stack>
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
            {renderPrice}
            {renderDiscountPrice}
            {renderCostPrice}
            {renderWeight}
            {renderStock}
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
    onFilters(`${filterName}_min`, value); // Call the function with min value
  };

  const handleMaxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(event.target.value);
    onFilters(`${filterName}_max`, value); // Call the function with max value
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
