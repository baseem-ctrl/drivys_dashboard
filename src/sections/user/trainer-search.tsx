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
// components
import Iconify from 'src/components/iconify';
import SearchNotFound from 'src/components/search-not-found';
// types
import { IProductItem } from 'src/types/product';

// ----------------------------------------------------------------------

type Props = {
  query?: string;
  results?: any;
  onSearch?: any;
  hrefItem?: (id: string) => string;
  loading?: boolean;
};

export default function TrainerSearch({ query, results, onSearch, hrefItem, loading }: Props) {
  return (
    <TextField
      fullWidth
      value={results?.name}
      onChange={(e) => {
        onSearch('name', e.target.value);
      }}
      placeholder="Search..."
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
          </InputAdornment>
        ),
      }}
      sx={{ width: { xs: 1, sm: 360 } }}
    />
  );
}
