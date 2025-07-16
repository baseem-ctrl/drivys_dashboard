import { Box, TextField, Autocomplete, CircularProgress, InputAdornment } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useGetUsers } from 'src/api/users';

export default function NotificationFilter({ filters, onFilters }: any) {
  const { t } = useTranslation();
  const { users, usersLoading } = useGetUsers({
    page: 0,
    limit: 1000,
    user_types: 'all',
  });

  const handleUserChange = (event: any, value: any) => {
    onFilters((prevFilters: any) => ({
      ...prevFilters,
      user_id: value?.value || null,
    }));
  };

  const userOptions =
    users?.map((item: any) => ({
      label: `${item?.name ?? 'NA'}`,
      value: item.id,
    })) ?? [];

  return (
    <Box
      display="flex"
      gap={2}
      width="100%"
      sx={{
        '& > *': {
          flex: '1 1 100%',
        },
      }}
    >
      <Box flex={1} display="flex" alignItems="center" gap={1}>
        <Autocomplete
          fullWidth
          options={userOptions}
          loading={usersLoading}
          value={userOptions.find((item) => item.value === filters.user_id) || null}
          getOptionLabel={(option) => option.label || 'N/A'}
          isOptionEqualToValue={(option, value) => option.value === value?.value}
          onChange={handleUserChange}
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder={t('Select User')}
              fullWidth
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {usersLoading ? (
                      <InputAdornment position="end">
                        <CircularProgress color="inherit" size={20} />
                      </InputAdornment>
                    ) : null}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
            />
          )}
        />
      </Box>
    </Box>
  );
}
