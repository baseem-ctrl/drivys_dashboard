import { Box, TextField, Autocomplete, IconButton } from '@mui/material';
import { useEffect, useState } from 'react';
import { useGetPaymentMethodEnum, useGetPaymentStatusEnum } from 'src/api/enum';
import { useGetSchool } from 'src/api/school';
import { useGetUsers } from 'src/api/users';
import ClearIcon from '@mui/icons-material/Clear';
import DeleteIcon from '@mui/icons-material/Delete';
export default function BookingTableToolbar({
  filters,
  onFilters,
  vendorOptions,
  setSearch,
  studentOptions,
  loading,
}: any) {
  const { paymentMethodEnum, paymentMethodLoading, paymentMethodError } = useGetPaymentMethodEnum();
  const { paymentStatusEnum, paymentStatusLoading, paymentStatusError } = useGetPaymentStatusEnum();
  const [schoolOptions, setSchoolOptions] = useState([]);
  const { schoolList, schoolLoading } = useGetSchool({ limit: 1000, page: 1 });
  const { users, usersLoading, revalidateUsers } = useGetUsers({
    page: 0,
    limit: 1000,
    user_types: 'STUDENT',
  });
  const handleChange = (name: string) => (value: any) => {
    onFilters(name, value);
  };
  useEffect(() => {
    const schoolData = schoolList
      .map((vendor) => {
        const translation = vendor.vendor_translations.find(
          (trans) => trans.locale.toLowerCase() === 'en'
        );
        return translation ? { label: translation.name, value: vendor.id } : null;
      })
      .filter((school) => school !== null);

    setSchoolOptions(schoolData);
  }, [schoolList]);

  const handleClear = (name) => () => {
    onFilters(name, '');
  };

  const handleClearSearch = () => {
    onFilters('search', '');
    setSearch('');
  };
  return (
    <Box
      display="flex"
      flexDirection={{ xs: 'column', sm: 'row' }}
      alignItems="flex-start"
      gap={2}
      padding={2}
    >
      {/* Vendor Filter (Autocomplete) */}
      <Box sx={{ flex: 1 }}>
        <Autocomplete
          fullWidth
          options={
            vendorOptions?.map((item: any) => ({
              label: `${item?.name ?? 'NA'}(${item?.email ?? 'NA'})`,
              value: item.id,
            })) ?? []
          }
          value={vendorOptions.find((item) => item.id === filters.vendor)?.name || null}
          onChange={(event, newValue) => handleChange('vendor')(newValue?.value || '')}
          renderInput={(params) => (
            <TextField
              placeholder="Select Trainer"
              {...params}
              onChange={(e) => setSearch(e.target.value)}
              fullWidth
            />
          )}
          renderOption={(props, option) => (
            <li {...props} key={option.value}>
              {option.label}
            </li>
          )}
        />
      </Box>

      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center' }}>
        <TextField
          label="Search by Name"
          value={filters.search || ''}
          onChange={(e) => handleChange('search')(e.target.value)}
          placeholder="Search by student, driver, or school name"
          fullWidth
        />
        {filters.search && (
          <IconButton onClick={handleClearSearch} sx={{ marginLeft: 1 }} aria-label="clear search">
            <DeleteIcon />
          </IconButton>
        )}
      </Box>
    </Box>
  );
}
