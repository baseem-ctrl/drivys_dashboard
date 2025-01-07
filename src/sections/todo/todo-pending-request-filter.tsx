// @mui
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
// components
import Iconify from 'src/components/iconify';
import { useState } from 'react';

// ----------------------------------------------------------------------

type Props = {
  query?: string;
  results?: any;
  onSearch?: any;
  hrefItem?: (id: string) => string;
  loading?: boolean;
};

export default function TodoListSearch({
  searchValue,
  query,
  results,
  onSearch,
  hrefItem,
  loading,
  setSearchValue,
  placeholder,
}: Props) {
  const handleClear = () => {
    setSearchValue('');
    onSearch('name', '');
  };

  return (
    <TextField
      fullWidth
      value={searchValue}
      onChange={(e) => {
        setSearchValue(e.target.value);
        // onSearch('name', e.target.value);
      }}
      placeholder={placeholder}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
          </InputAdornment>
        ),
        endAdornment: (
          <InputAdornment position="end">
            {searchValue && (
              <Iconify
                icon="eva:trash-2-outline"
                onClick={handleClear}
                sx={{ color: 'error.main', cursor: 'pointer' }}
              />
            )}
          </InputAdornment>
        ),
      }}
      sx={{ width: { xs: 1, sm: 360 } }}
    />
  );
}
