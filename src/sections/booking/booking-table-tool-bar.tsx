import { Box, TextField, MenuItem } from '@mui/material';

const paymentStatusOptions = ['PENDING', 'CONFIRMED', 'CANCELLED'];
const paymentMethodOptions = ['ONLINE', 'OFFLINE'];

export default function BookingTableToolbar({ filters, onFilters, vendorOptions }) {
  const handleChange = (name) => (event) => {
    onFilters(name, event.target.value);
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
      {/* <TextField
        select
        variant="outlined"
        label="Payment Status"
        value={filters.paymentStatus || ''}
        onChange={handleChange('paymentStatus')}
        sx={{ flex: 1 }}
      >
        <MenuItem value="">
          <em>None</em>
        </MenuItem>
        {paymentStatusOptions.map((status) => (
          <MenuItem key={status} value={status}>
            {status}
          </MenuItem>
        ))}
      </TextField> */}

      <TextField
        select
        variant="outlined"
        label="Trainer"
        value={filters.vendor || ''}
        onChange={handleChange('vendor')}
        sx={{ flex: 1 }}
      >
        <MenuItem value="">
          <em>None</em>
        </MenuItem>
        {vendorOptions.map((vendor) => (
          <MenuItem key={vendor.value} value={vendor.value}>
            {vendor.label}
          </MenuItem>
        ))}
      </TextField>
    </Box>
  );
}
