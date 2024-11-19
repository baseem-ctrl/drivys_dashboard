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
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
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
  localeOptions?: {
    value: string;
    label: string;
  }[];

  categoryOptions?: string[];
  colorOptions?: string[];
  statusOptions?: {
    value: string;
    label: string;
  }[];
  activeOptions?: {
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
  statusOptions,
  activeOptions,
  localeOptions,
}: Props) {
  const handleFilterActive = (newValue: string) => {
    onFilters('is_active', newValue);
  };

  const handleCatalogueTypeChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    onFilters('catalogue_type', event.target.value);
  };
  const handleFilterLocale = (event: React.ChangeEvent<{ value: unknown }>) => {
    onFilters('locale', event.target.value); // Call the function with selected locale
  };
  const handleDisplayOrderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    onFilters('display_order', value); // Call the function with display order value
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

  const renderCatalogueType = (
    <Stack>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        Catalogue Type
      </Typography>
      <Select
        value={filters?.catalogue_type || ''}
        onChange={handleCatalogueTypeChange}
        displayEmpty
        fullWidth
        sx={{ mb: 2 }}
      >
        <MenuItem value="" disabled>
          Select a category
        </MenuItem>
        <MenuItem value="1">Categories</MenuItem>
        <MenuItem value="2">Drivers</MenuItem>
      </Select>
    </Stack>
  );

  const renderLocale = (
    <Stack>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        Locale
      </Typography>
      <Select value={filters?.locale || ''} onChange={handleFilterLocale} displayEmpty fullWidth>
        <MenuItem value="" disabled>
          Select Locale
        </MenuItem>
        {localeOptions.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </Stack>
  );

  const renderActive = (
    <Stack>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        Active Status
      </Typography>
      {activeOptions.map((option) => (
        <FormControlLabel
          key={option.value}
          control={
            <Radio
              checked={option.value === filters?.is_active}
              onClick={() => handleFilterActive(option?.value)}
            />
          }
          label={option.label}
        />
      ))}
    </Stack>
  );

  const renderDisplayOrder = (
    <Stack>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        Display Order
      </Typography>
      <InputBase
        value={filters?.display_order || ''}
        onChange={handleDisplayOrderChange}
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 0.75,
          px: 1,
          py: 0.5,
          width: '100%',
        }}
        placeholder="Enter display order"
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
            {/* {renderLocale} */}
            {/* {renderCatalogueType} */}
            {renderDisplayOrder}

            {renderActive}
          </Stack>
        </Scrollbar>
      </Drawer>
    </>
  );
}
