// @mui
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Badge from '@mui/material/Badge';
import Drawer from '@mui/material/Drawer';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Autocomplete from '@mui/material/Autocomplete';
// types
import { IJobFilters, IJobFilterValue } from 'src/types/job';
import { useLocales } from 'src/locales';

// components
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { useGetUsers } from 'src/api/users';

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  onOpen: VoidFunction;
  onClose: VoidFunction;
  //
  filters: IJobFilters;
  onFilters: (name: string, value: IJobFilterValue) => void;
  //
  canReset: boolean;
  onResetFilters: VoidFunction;
  verificationOptions: string[];
  publishOptions: string[];
};
export default function TrainerRewardFilters({
  open,
  onOpen,
  onClose,
  //
  filters,
  onFilters,
  //
  canReset,
  onResetFilters,
}: Props) {
  const { t } = useLocales();

  const { users, usersLoading } = useGetUsers({
    page: 0,
    limit: 1000,
    user_types: 'TRAINER',
  });
  const vendorOptions = usersLoading
    ? [{ label: t('loading'), value: '' }]
    : users.map((user) => ({
        label: user.name,
        value: user.id,
      }));

  const handleFilterChange = (field, value) => {
    onFilters(field, value);
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

      <Tooltip title={t('reset')}>
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

  const renderTrainer = (
    <Stack>
      <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
        {t('trainer')}
      </Typography>

      <Autocomplete
        options={
          vendorOptions?.map((item) => ({
            label: item.label || t('unknown_trainer'),
            value: item.value,
          })) ?? []
        }
        getOptionLabel={(option) => option.label || ''}
        value={vendorOptions?.find((item) => item.value === filters.trainer_id) || null}
        onChange={(event, newValue) => {
          handleFilterChange('trainer_id', newValue ? newValue.value : null);
        }}
        isOptionEqualToValue={(option, value) => option.value === value?.value}
        renderInput={(params) => <TextField placeholder={t('select_trainer')} {...params} />}
        renderOption={(props, option) => (
          <li {...props} key={option.value}>
            {option.label}
          </li>
        )}
        renderTags={(selected, getTagProps) =>
          selected.map((option, index) => (
            <Chip
              {...getTagProps({ index })}
              key={option.value}
              label={option.label}
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
        {t('filters')}{' '}
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
          <Stack spacing={3}>{renderTrainer}</Stack>
        </Scrollbar>
      </Drawer>
    </>
  );
}
