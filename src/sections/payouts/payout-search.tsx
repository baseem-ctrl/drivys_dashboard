import parse from 'autosuggest-highlight/parse';
import match from 'autosuggest-highlight/match';
// @mui
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import Autocomplete, { autocompleteClasses } from '@mui/material/Autocomplete';
// routes
import { useRouter } from 'src/routes/hooks';
// types
import { ITourItem } from 'src/types/tour';
// components
import Iconify from 'src/components/iconify';
import SearchNotFound from 'src/components/search-not-found';
import { useGetUsers } from 'src/api/users';
import { useState } from 'react';

// ----------------------------------------------------------------------
type Props = {
  filters: any;
  onFilters: any;
  options: [];
  setSearchValue: any;
  usersLoading: any;
};
export default function PayoutSearch({
  filters,
  onFilters,
  options,
  setSearchValue,
  usersLoading,
}: Props) {
  const router = useRouter();
  const handleChange = (name: string) => (value: any) => {
    onFilters(name, value);
  };
  return (
    <Box sx={{ flex: 1 }}>
      <Autocomplete
        fullWidth
        options={
          options?.map((item: any) => ({
            label: `${item?.name ?? item?.vendor_translations?.[0]?.name ?? 'NA'}(${
              item?.email ?? 'NA'
            })`,
            value: item.id,
          })) ?? []
        }
        value={options.find((item) => item.id === filters.trainer_id)?.name || null}
        onChange={(event, newValue) => handleChange('trainer_id')(newValue?.value || '')}
        loading={usersLoading}
        renderInput={(params) => (
          <TextField
            placeholder="Select Trainer"
            {...params}
            onChange={(e) => setSearchValue(e.target.value)}
            fullWidth
          />
        )}
        renderOption={(props, option) => (
          <li {...props} key={option.value}>
            {option.label}
          </li>
        )}
        clearIcon
      />
    </Box>
  );
}
