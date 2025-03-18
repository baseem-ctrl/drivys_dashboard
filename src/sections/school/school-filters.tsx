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
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import { MenuItem } from '@mui/material';
import { AddBulkSchoolCommision } from 'src/api/school';
import BulkSchoolCommission from './commission-bulk';
import { useBoolean } from 'src/hooks/use-boolean';
import { useTranslation } from 'react-i18next';

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
  colorOptions?: string[];
  statusOptions?: {
    value: string;
    label: string;
  }[];
  activeOptions?: {
    value: string;
    label: string;
  }[];
  setBulkEditIds: any;
  bulkEditIds: any;
  setIsBulkEdit: any;
  setSelectedRows: any;
  selectedRows: any;
  handleToggleSelect: any;
  reload: any;
  t: any;
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
  setBulkEditIds,
  bulkEditIds,
  setIsBulkEdit,
  setSelectedRows,
  selectedRows,
  t,
  reload,
}: Props) {
  const handleFilterStocks = (newValue: string) => {
    onFilters('status', newValue);
  };
  const handleFilterActive = (newValue: string) => {
    onFilters('is_active', newValue);
  };
  const renderHead = (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      sx={{ py: 2, pr: 1, pl: 2.5 }}
    >
      <Typography variant="h6" sx={{ flexGrow: 1 }}>
        {t('filters')}
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
        {t('status')}
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
          label={t(option.label)}
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
      {/* <Typography variant="subtitle2" sx={{ mb: 1 }}>
        Active Status
      </Typography> */}
      {activeOptions.map((option) => (
        <FormControlLabel
          key={option.value}
          control={
            <Radio
              checked={option.value === filters?.is_active}
              onClick={() => handleFilterActive(option?.value)}
            />
          }
          label={t(option.label)}
        />
      ))}
    </Stack>
  );
  const renderPrice = (
    <Stack>
      <Typography variant="subtitle2" sx={{ flexGrow: 1 }}>
        {t("Commission")}
      </Typography>

      <Stack direction="row" spacing={5} sx={{ my: 2 }}>
        <InputRange
          type="min"
          onFilters={onFilters}
          filterName="commission"
          value={filters.min_commission}
        />
        <InputRange
          type="max"
          onFilters={onFilters}
          filterName="commission"
          value={filters.max_commission}
        />
      </Stack>
    </Stack>
  );
  const renderRating = (
    <Stack spacing={2} alignItems="flex-start">
      <Typography variant="subtitle2">{t('rating')}</Typography>

      {activeOptions?.map((item, index) => (
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
  const popover = usePopover();
  const commission = useBoolean();

  const handleCloseCommission = () => {
    commission.onFalse();
    setIsBulkEdit(true);
    setBulkEditIds([]);
    setSelectedRows([]);
  };

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
        {t('filters')}{' '}
      </Button>
      <IconButton onClick={popover.onOpen}>
        <Iconify icon="eva:more-vertical-fill" />
      </IconButton>
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
            {renderStock}
            {renderPrice}
            {renderActive}
            {/* {renderDiscountPrice}
            {renderCostPrice}
            {renderWeight} */}
          </Stack>
        </Scrollbar>
      </Drawer>
      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="right-top"
        sx={{ width: 250 }}
      >
        <MenuItem
          onClick={() => {
            popover.onClose();
            commission.onTrue();
          }}
        >
          <Iconify icon="lineicons:hand-taking-dollar" style={{ width: '2em', height: '2em' }} />
          {t('add_bulk_commission')}
        </MenuItem>
      </CustomPopover>
      <BulkSchoolCommission
        bulkIds={bulkEditIds}
        open={commission.value}
        onClose={handleCloseCommission}
        type="vendor"
        reload={reload}
      />
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

  const { t } = useTranslation();

  const handleMinChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(event.target.value);
    onFilters('min_commission', value); // Call the function with min value
  };

  const handleMaxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(event.target.value);
    onFilters('max_commission', value); // Call the function with max value
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
        {`${t(type)} ($)`}
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
