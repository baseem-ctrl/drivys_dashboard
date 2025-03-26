import { useCallback, useState } from 'react';
// @mui
import Stack from '@mui/material/Stack';
import MenuItem from '@mui/material/MenuItem';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import IconButton from '@mui/material/IconButton';
import FormControl from '@mui/material/FormControl';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import Select, { SelectChangeEvent } from '@mui/material/Select';
// types
import { IUserTableFilters, IUserTableFilterValue } from 'src/types/user';
// components
import Iconify from 'src/components/iconify';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import { useGetGearEnum } from 'src/api/users';
import { useGetSchool } from 'src/api/school';
import { useGetAllCategory } from 'src/api/category';
import { useGetAllCity } from 'src/api/city';
import { useTranslation } from 'react-i18next';

// ----------------------------------------------------------------------

type Props = {
  filters: IUserTableFilters;
  onFilters: (name: string, value: IUserTableFilterValue) => void;
  user_type: string;
  roleOptions: string[];
};

const StatusOptions = [
  {
    label: 'Active',
    value: '1',
  },
  {
    label: 'In Active',
    value: '0',
  },
];

export default function UserTableToolbar({ filters, onFilters, user_type, roleOptions }: Props) {

  const { t } = useTranslation();
  const popover = usePopover();

  const handleFilterName = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onFilters('name', event.target.value);
    },
    [onFilters]
  );

  const handleFilterRole = useCallback(
    (event: SelectChangeEvent<string[]>) => {
      onFilters('status', event.target.value);
    },
    [onFilters]
  );
  const handleFilterChange = (field, value) => {
    onFilters(field, value);
  };

  return (
    <>
      <Stack
        spacing={2}
        alignItems={{ xs: 'flex-end', md: 'center' }}
        direction={{
          xs: 'column',
          md: 'row',
        }}
        sx={{
          p: 2.5,
          pr: { xs: 2.5, md: 1 },
        }}
      >
        <FormControl
          sx={{
            flexShrink: 0,
            width: { xs: 1, md: 200 },
          }}
        >
          <InputLabel>{t("Status")}</InputLabel>

          <Select
            // multiple
            value={filters.status}
            onChange={handleFilterRole}
            input={<OutlinedInput label="Status" />}
            // renderValue={(selected) => selected.map((value) => value).join(', ')}
            MenuProps={{
              PaperProps: {
                sx: { maxHeight: 240 },
              },
            }}
          >
            {StatusOptions.map((option) => (
              <MenuItem key={option?.value} value={option?.value}>
                {/*  F<Checkbox disableRipple size="small" checked={filters.status.includes(option)} /> */}
                {option?.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Stack direction="row" alignItems="center" spacing={2} flexGrow={1} sx={{ width: 1 }}>
          <TextField
            fullWidth
            value={filters.name}
            onChange={handleFilterName}
            placeholder={t("Search...")}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                </InputAdornment>
              ),
            }}
          />
        </Stack>
      </Stack>

      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="right-top"
        sx={{ width: 140 }}
      >
        <MenuItem onClick={() => popover.onClose()}>
          <Iconify icon="solar:printer-minimalistic-bold" />
          Print
        </MenuItem>

        <MenuItem onClick={() => popover.onClose()}>
          <Iconify icon="solar:import-bold" />
          Import
        </MenuItem>

        <MenuItem onClick={() => popover.onClose()}>
          <Iconify icon="solar:export-bold" />
          Export
        </MenuItem>
      </CustomPopover>
    </>
  );
}
