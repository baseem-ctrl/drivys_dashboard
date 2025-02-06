import parse from 'autosuggest-highlight/parse';
import match from 'autosuggest-highlight/match';
// @mui
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { Chip, IconButton, InputAdornment } from '@mui/material';
// components
import Iconify from 'src/components/iconify'; // Assuming you have the Iconify component
import { useState } from 'react';
import { useGetSchool } from 'src/api/school';

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
  const handleChange = (name: string) => (value: any) => {
    onFilters(name, value);
  };

  const { schoolList, schoolLoading } = useGetSchool({
    limit: 1000,
  });

  // Clear filter handler
  const clearFilter = (name: string) => () => {
    onFilters(name, '');
  };

  return (
    <Box
      sx={{
        display: 'flex',
        gridTemplateColumns: '2fr 1fr',
        gap: 2,
        alignItems: 'center',
        width: '50%',
      }}
    >
      {/* Trainer Filter */}
      <Box sx={{ width: '100%' }}>
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
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <InputAdornment position="end">
                    {filters.trainer_id && (
                      <IconButton onClick={clearFilter('trainer_id')}>
                        <Iconify icon="eva:trash-2-outline" width={20} height={20} />
                      </IconButton>
                    )}
                  </InputAdornment>
                ),
              }}
            />
          )}
          renderOption={(props, option) => (
            <li {...props} key={option.value}>
              {option.label}
            </li>
          )}
        />
      </Box>

      {/* School Filter */}
      <Box sx={{ width: '100%' }}>
        <Autocomplete
          fullWidth
          options={
            schoolList?.map((item: any) => ({
              label: item.vendor_translations
                .slice(0, 2)
                .map((translation: any) => translation.name)
                .join(' - '),
              value: item.id,
            })) ?? []
          }
          getOptionLabel={(option) => option.label}
          value={schoolList.find((item) => item.id === filters.vendor_id)?.name || null}
          onChange={(event, newValue) => handleChange('vendor_id')(newValue?.value || '')}
          loading={schoolLoading}
          renderInput={(params) => (
            <TextField
              placeholder="Select School"
              {...params}
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <InputAdornment position="end">
                    {filters.vendor_id && (
                      <IconButton onClick={clearFilter('vendor_id')}>
                        <Iconify icon="eva:trash-2-outline" width={20} height={20} />
                      </IconButton>
                    )}
                  </InputAdornment>
                ),
              }}
            />
          )}
          renderOption={(props, option) => (
            <li {...props} key={option.value}>
              {option.label}
            </li>
          )}
          renderTags={(selected, getTagProps) =>
            selected.map((option, index) => (
              <Chip
                {...getTagProps({ index })}
                key={option}
                label={option}
                size="small"
                variant="soft"
              />
            ))
          }
        />
      </Box>
    </Box>
  );
}
