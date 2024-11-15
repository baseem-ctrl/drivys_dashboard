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
  const popover = usePopover();
  const { city, cityLoading } = useGetAllCity({
    limit: 1000,
    page: 0,
  });
  const { category, categoryLoading } = useGetAllCategory({
    limit: 1000,
    page: 0,
  });
  const [searchValue, setSearchValue] = useState('');

  const { gearData, gearLoading } = useGetGearEnum();
  const { schoolList, schoolLoading, revalidateSchool } = useGetSchool({
    limit: 1000,
    search: searchValue ?? '',
  });
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
          <InputLabel>Status</InputLabel>

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
            placeholder="Search..."
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                </InputAdornment>
              ),
            }}
          />

          {user_type === 'TRAINER' && (
            <>
              {/* City filter */}
              <FormControl fullWidth>
                <InputLabel>City</InputLabel>
                <Select
                  value={filters.city_id || ''}
                  onChange={(e) => handleFilterChange('city_id', e.target.value)}
                  input={<OutlinedInput label="City" />}
                >
                  {cityLoading ? (
                    <MenuItem disabled>Loading cities...</MenuItem>
                  ) : (
                    city?.map((cityItem: any) => (
                      <MenuItem key={cityItem.id} value={cityItem.id}>
                        {cityItem.city_translations.find(
                          (translation: any) => translation.locale === 'en'
                        )?.name || cityItem.city_translations[0]?.name}
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>

              {/* Vehicle Type filter */}
              <FormControl fullWidth>
                <InputLabel>Vehicle Type</InputLabel>
                <Select
                  value={filters.vehicle_type_id || ''}
                  onChange={(e) => handleFilterChange('vehicle_type_id', e.target.value)}
                  input={<OutlinedInput label="Vehicle Type" />}
                >
                  {categoryLoading ? (
                    <MenuItem disabled>Loading vehicle types...</MenuItem>
                  ) : (
                    category?.map((option: any) => (
                      <MenuItem key={option.id} value={option.id}>
                        {option.category_translations.find(
                          (translation: any) => translation.locale === 'en'
                        )?.name ||
                          option.category_translations[0]?.name ||
                          'Unknown'}
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>

              {/* Gear filter */}
              <FormControl fullWidth>
                <InputLabel>Gear</InputLabel>
                <Select
                  value={filters.gear || ''}
                  onChange={(e) => handleFilterChange('gear', e.target.value)}
                  input={<OutlinedInput label="Gear" />}
                >
                  {gearLoading ? (
                    <MenuItem disabled>Loading gears...</MenuItem>
                  ) : (
                    gearData?.map((gear: any) => (
                      <MenuItem key={gear.id} value={gear.name}>
                        {gear.name}
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>

              {/* School filter */}
              <FormControl fullWidth>
                <InputLabel>School</InputLabel>
                <Select
                  value={filters.vendor_id || ''}
                  onChange={(e) => handleFilterChange('vendor_id', e.target.value)}
                  input={<OutlinedInput label="School" />}
                >
                  {schoolLoading ? (
                    <MenuItem disabled>Loading schools...</MenuItem>
                  ) : (
                    schoolList?.map((school: any) => {
                      const schoolName = school.vendor_translations[0]?.name || 'Default Name';

                      return (
                        <MenuItem key={school.id} value={school.id}>
                          {schoolName}
                        </MenuItem>
                      );
                    })
                  )}
                </Select>
              </FormControl>
            </>
          )}
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
