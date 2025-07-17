import { useCallback, useEffect, useState } from 'react';
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
// components
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { useGetAllCategory } from 'src/api/category';
import { useGetAllCity } from 'src/api/city';
import { useGetGearEnum, useGetUsers } from 'src/api/users';
import { useGetSchool } from 'src/api/school';
import { useTranslation } from 'react-i18next';

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
export default function RefundFilters({
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
  const { i18n, t } = useTranslation();

  const { category } = useGetAllCategory({
    limit: 1000,
    page: 0,
    published: '1',
    locale: i18n.language,
  });
  const { city } = useGetAllCity({
    limit: 1000,
    page: 0,
  });
  const { users, usersLoading } = useGetUsers({
    page: 0,
    limit: 1000,
    user_types: 'TRAINER',
  });
  const vendorOptions = usersLoading
    ? [{ label: 'Loading...', value: '' }]
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

  const renderCategory = (
    <Stack>
      <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
        Category
      </Typography>
      <Autocomplete
        options={
          category?.map((item: any) => ({
            label: item.category_translations
              .map((translation: any) => translation.name)
              .join(' - '),
            value: item.id,
          })) ?? []
        }
        getOptionLabel={(option) => option.label || ''}
        value={
          filters.category_id
            ? {
                label:
                  category
                    ?.find((item: any) => item.id === filters.category_id)
                    ?.category_translations?.map((translation: any) => translation.name)
                    .join(' - ') || 'Unknown Category',
                value: filters.category_id,
              }
            : null
        }
        onChange={(event, newValue) => {
          handleFilterChange('category_id', newValue?.value);
        }}
        isOptionEqualToValue={(option, value) => option.value === value?.value}
        renderInput={(params) => <TextField placeholder={t('Select Category')} {...params} />}
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

  const renderTrainer = (
    <Stack>
      <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
        Trainer
      </Typography>
      <Autocomplete
        options={
          vendorOptions?.map((item) => ({
            label: item.label || 'Unknown Trainer',
            value: item.value,
          })) ?? []
        }
        getOptionLabel={(option) => option.label || ''}
        value={
          filters.driver_id
            ? vendorOptions?.find((item) => item.value === filters.driver_id)
              ? {
                  label:
                    vendorOptions?.find((item) => item.value === filters.driver_id)?.label ||
                    'Unknown Trainer',
                  value: filters.driver_id,
                }
              : null
            : null
        }
        onChange={(event, newValue) => {
          handleFilterChange('driver_id', newValue?.value);
        }}
        isOptionEqualToValue={(option, value) => option.value === value?.value}
        renderInput={(params) => <TextField placeholder="Select Trainer" {...params} />}
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

  const renderCity = (
    <Stack>
      <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
        City
      </Typography>
      <Autocomplete
        options={
          city?.map((city: any) => ({
            label:
              city.city_translations?.length > 0 ? city.city_translations[0].name : 'Unknown City',
            value: city.id,
          })) ?? []
        }
        getOptionLabel={(option) => option.label || 'Unknown'}
        value={
          filters.city_id
            ? {
                label:
                  city.find((item: any) => item.id === filters.city_id)?.city_translations?.[0]
                    ?.name || 'Unknown City',
                value: filters.city_id,
              }
            : null
        }
        onChange={(event, newValue) => {
          handleFilterChange('city_id', newValue?.value);
        }}
        isOptionEqualToValue={(option, value) => option.value === value?.value}
        renderInput={(params) => <TextField placeholder="Select City" {...params} />}
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
            {renderCategory}
            {renderCity}
            {renderTrainer}
          </Stack>
        </Scrollbar>
      </Drawer>
    </>
  );
}
