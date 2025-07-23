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
import { Box } from '@mui/material';

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
export default function AssistantPayoutFilters({
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
  const { t, i18n } = useTranslation();
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
    user_types: 'ASSISTANT',
  });
  const vendorOptions = usersLoading
    ? [{ label: t('Loading...'), value: '' }]
    : users.map((user) => ({
        label: user.name,
        value: user.id,
      }));

  const handleFilterChange = (field, value) => {
    onFilters(field, value);
  };

  return (
    <Box sx={{ width: '50%' }}>
      <Autocomplete
        options={
          vendorOptions?.map((item) => ({
            label: item.label || t('Unknown'),
            value: item.value,
          })) ?? []
        }
        getOptionLabel={(option) => option.label || ''}
        value={
          filters.assistant_id
            ? vendorOptions?.find((item) => item.value === filters.assistant_id)
              ? {
                  label:
                    vendorOptions?.find((item) => item.value === filters.assistant_id)?.label ||
                    t('Unknown'),
                  value: filters.assistant_id,
                }
              : null
            : null
        }
        onChange={(event, newValue) => {
          handleFilterChange('assistant_id', newValue?.value);
        }}
        isOptionEqualToValue={(option, value) => option.value === value?.value}
        renderInput={(params) => <TextField placeholder={t('assistant')} {...params} />}
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
    </Box>
  );
}
