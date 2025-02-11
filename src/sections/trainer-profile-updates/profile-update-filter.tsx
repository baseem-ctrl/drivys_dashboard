import { Box, TextField, Autocomplete, FormControlLabel, Switch } from '@mui/material';
import { useGetUsers } from 'src/api/users';

export default function ProfileUpdateFilter({ filters, onFilters }: any) {
  const { users: trainerUsers } = useGetUsers({
    page: 0,
    limit: 1000,
    user_types: 'TRAINER',
  });

  const handleTrainerChange = (event: any, value: any) => {
    onFilters((prevFilters: any) => ({
      ...prevFilters,
      trainer_id: value?.value || null,
    }));
  };
  const handleVerifiedToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    onFilters((prevFilters: any) => ({
      ...prevFilters,
      is_verified: event.target.checked ? 1 : 0,
    }));
  };
  return (
    <Box
      display="flex"
      gap={2}
      width="100%"
      sx={{
        '& > *': {
          flex: '1 1 100%',
          minWidth: '300px',
        },
      }}
    >
      {/* Trainer Filter */}
      <Box flex={1} display="flex" alignItems="center" gap={1}>
        <Autocomplete
          fullWidth
          options={
            trainerUsers?.map((item: any) => ({
              label: `${item?.name ?? 'No Name'}`,
              value: item.id,
            })) ?? []
          }
          value={trainerUsers.find((item) => item.id === filters.trainer_id) || null}
          getOptionLabel={(option) => option.label || 'No Name'}
          isOptionEqualToValue={(option, value) => option.value === value}
          renderInput={(params) => <TextField placeholder="Select Trainer" {...params} fullWidth />}
          onChange={handleTrainerChange}
        />
      </Box>
      <Box flex={1} display="flex" alignItems="center" gap={1}>
        <FormControlLabel
          control={
            <Switch
              checked={Boolean(filters.is_verified)}
              onChange={handleVerifiedToggle}
              color="primary"
            />
          }
          label="Verified Trainer"
        />
      </Box>
    </Box>
  );
}
