// @mui
import Stack from '@mui/material/Stack';
import Badge from '@mui/material/Badge';
import Drawer from '@mui/material/Drawer';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Radio from '@mui/material/Radio';
import FormControlLabel from '@mui/material/FormControlLabel';
// types
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { TextField } from '@mui/material';

// ----------------------------------------------------------------------

type Props = {
  open?: boolean;
  selectedOrder?: any;
  handleOrderChange?: any;
  onOpen?: VoidFunction;
  onClose?: VoidFunction;
  //
  filters: any;
  onFilters?: (name: string, value: any) => void;
  //
  canReset?: boolean;
  onResetFilters?: VoidFunction;
  localeOptions?: {
    value: string;
    label: string;
  }[];
  onLocaleChange?: (locale: string) => void;
};

export default function CertificateFilters({
  open,
  onOpen,
  onClose,
  filters,
  onFilters,
  canReset,
  onResetFilters,
  onLocaleChange,
  localeOptions,
  selectedOrder,
  handleOrderChange,
}: Props) {
  // Function that handles the filter using locale
  const handleFilterLocale = (event: React.ChangeEvent<{ value: unknown }>) => {
    const newValue = event.target.value as string;
    onFilters('locale', newValue);
    if (onLocaleChange) {
      onLocaleChange(newValue);
    }
  };

  // Function to handle the publish status change
  const handlePublishStatusChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onFilters('is_published', event.target.value);
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

  const renderLocale = (
    <Stack>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        Locale
      </Typography>
      <FormControl fullWidth variant="outlined">
        <Select value={filters?.locale || ''} onChange={handleFilterLocale} displayEmpty>
          <MenuItem value="" disabled>
            Select Locale
          </MenuItem>
          {localeOptions?.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Stack>
  );

  const renderPublishStatus = (
    <Stack>
      <Typography variant="subtitle2" sx={{ mb: 1, mt: 1 }}>
        Publish Status
      </Typography>
      <FormControl>
        <FormControlLabel
          control={
            <Radio
              checked={filters?.is_published === 'published'}
              onChange={handlePublishStatusChange}
              value="published"
            />
          }
          label="Show All Published"
        />
        <FormControlLabel
          control={
            <Radio
              checked={filters?.is_published === 'unpublished'}
              onChange={handlePublishStatusChange}
              value="unpublished"
            />
          }
          label="Show All Unpublished"
        />
      </FormControl>
    </Stack>
  );

  // Render the input box for the order ID
  const renderOrderInput = (
    <Stack>
      <Typography variant="subtitle2" sx={{ mb: 1, mt: 2 }}>
        Display Order ID
      </Typography>
      <TextField
        value={selectedOrder === undefined ? ' ' : selectedOrder}
        onChange={handleOrderChange}
        fullWidth
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
            {renderLocale}
            {renderPublishStatus}
            {renderOrderInput}
          </Stack>
        </Scrollbar>
      </Drawer>
    </>
  );
}
