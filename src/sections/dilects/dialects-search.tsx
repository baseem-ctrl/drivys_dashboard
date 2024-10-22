// @mui
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
// components
import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

type Props = {
  onSearch?: any;
  setSearchQuery?: any;
  searchQuery?: any;
};

export default function DilectSearch({
  onSearch,

  setSearchQuery,
  searchQuery,
}: Props) {
  const handleClear = () => {
    setSearchQuery('');
    onSearch('name', '');
  };

  return (
    <TextField
      fullWidth
      value={searchQuery}
      onChange={(e) => {
        setSearchQuery(e.target.value);
        onSearch('name', e.target.value);
      }}
      placeholder="Search..."
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
          </InputAdornment>
        ),
        endAdornment: (
          <InputAdornment position="end">
            {searchQuery && (
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
