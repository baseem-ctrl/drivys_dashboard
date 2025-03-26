import React from 'react';
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
import TextField from '@mui/material/TextField';
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { useTranslation } from 'react-i18next';

type Props = {
  open?: boolean;
  onOpen?: VoidFunction;
  onClose?: VoidFunction;
  filters: any;
  onFilters?: (name: string, value: any) => void;
  canReset?: boolean;
  onResetFilters?: VoidFunction;
  localeOptions?: {
    value: string;
    label: string;
  }[];
  onLocaleChange?: (locale: string) => void;
};

export default function CityFilters({
  open,
  onOpen,
  onClose,
  filters,
  onFilters,
  canReset,
  onResetFilters,
  onLocaleChange,
  localeOptions,
}: Props) {
  const { t } = useTranslation();
  const handleFilterChange = (name: string) => (event: React.ChangeEvent<{ value: unknown }>) => {
    const value = event.target.value;
    onFilters?.(name, value);
  };

  const renderHead = (
    <Stack
      direction="row"
      alignItems="flex-end"
      justifyContent="flex-end"
      sx={{ py: 2, pr: 1, pl: 2.5 }}
    >
      <Typography variant="h6" sx={{ flexGrow: 1 }}>
        {t("Filters")}
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

  const renderFilters = (
    <Stack spacing={3}>
      <Stack>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          {t("Status")}
        </Typography>
        <FormControl fullWidth variant="outlined">
          <Select
            value={filters?.status || ''}
            onChange={handleFilterChange('status')}
            displayEmpty
          >
            <MenuItem value="" disabled>
              {t("Select Status")}
            </MenuItem>
            <MenuItem value="1">Active</MenuItem>
            <MenuItem value="0">Inactive</MenuItem>
          </Select>
        </FormControl>
      </Stack>

      <Stack>
        <Typography variant="subtitle2" sx={{ mb: 2 }}>
          {t("Date Range")}
        </Typography>
        <TextField
          sx={{ mb: 2 }}
          label={t("Start Date")}
          type="date"
          value={filters?.start_date || ''}
          onChange={handleFilterChange('start_date')}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label={t("End Date")}
          type="date"
          value={filters?.end_date || ''}
          onChange={handleFilterChange('end_date')}
          InputLabelProps={{ shrink: true }}
        />
      </Stack>

      <Stack>
        <Typography variant="subtitle2" sx={{ mb: 2 }}>
          {t("Time Range")}
        </Typography>
        <TextField
          label={t("Start Time")}
          type="time"
          sx={{ mb: 2 }}
          value={filters?.start_time || ''}
          onChange={handleFilterChange('start_time')}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label={t("End Time")}
          type="time"
          value={filters?.end_time || ''}
          onChange={handleFilterChange('end_time')}
          InputLabelProps={{ shrink: true }}
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
        {t("Filters")}
      </Button>

      <Drawer
        anchor="right"
        open={open}
        onClose={onClose}
        PaperProps={{
          sx: { width: 280 },
        }}
      >
        {renderHead}
        <Divider />
        <Scrollbar sx={{ px: 2.5, py: 3 }}>{renderFilters}</Scrollbar>
      </Drawer>
    </>
  );
}
