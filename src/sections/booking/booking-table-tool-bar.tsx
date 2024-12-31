import { Box, TextField, MenuItem, Autocomplete, Chip } from '@mui/material';
import { useGetPaymentMethodEnum, useGetPaymentStatusEnum } from 'src/api/enum';
import RHFAutocompleteSearch from 'src/components/hook-form/rhf-autocomplete-search';

export default function BookingTableToolbar({
  filters,
  onFilters,
  vendorOptions,
  setSearch,
  loading,
}: any) {
  const { paymentMethodEnum, paymentMethodLoading, paymentMethodError } = useGetPaymentMethodEnum();
  const { paymentStatusEnum, paymentStatusLoading, paymentStatusError } = useGetPaymentStatusEnum();

  const handleChange = (name) => (value) => {
    onFilters(name, value);
  };

  const handleClear = (name) => () => {
    onFilters(name, '');
  };

  return (
    <Box
      display="flex"
      flexDirection={{ xs: 'column', sm: 'row' }}
      alignItems="flex-start"
      gap={2}
      padding={2}
    >
      <Autocomplete
        fullWidth
        options={
          vendorOptions?.map((item: any) => ({
            label: `${item?.name ?? 'NA'}(${item?.email ?? 'NA'})`, // Display full name
            value: item.id,
          })) ?? []
        }
        // getOptionLabel={(option) => option[0].label}
        value={vendorOptions.find((item) => item.id === filters.vendor)?.name || null}
        onChange={
          (event, newValue) => handleChange('vendor')(newValue?.value || '') // Pass the value to handleChange
        }
        renderInput={(params) => (
          <TextField
            placeholder="Select Trainer"
            {...params}
            onChange={(e) => setSearch(e.target.value)}
          />
        )}
        renderOption={(props, option) => (
          <li {...props} key={option.value}>
            {option.label}
          </li>
        )}
      />
    </Box>
  );
}
