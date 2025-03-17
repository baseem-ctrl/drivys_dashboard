import { Box, TextField, Autocomplete } from '@mui/material';
import { useGetUsers } from 'src/api/users';

export default function SchoolReportFilter({ filters, onFilters }: any) {
  const { users } = useGetUsers({
    page: 0,
    limit: 1000,
    user_types: 'STUDENT',
  });
  const { users: trainerUsers } = useGetUsers({
    page: 0,
    limit: 1000,
    user_types: 'TRAINER',
  });

  const handleStudentChange = (event: any, value: any) => {
    onFilters((prevFilters: any) => ({
      ...prevFilters,
      student_id: value?.value || null,
    }));
  };

  const handleTrainerChange = (event: any, value: any) => {
    onFilters((prevFilters: any) => ({
      ...prevFilters,
      trainer_id: value?.value || null,
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
      {/* Student Filter */}
      <Box flex={1} display="flex" alignItems="center" gap={1}>
        <Autocomplete
          fullWidth
          options={
            users?.map((item: any) => ({
              label: `${item?.name ?? 'NA'}`,
              value: item.id,
            })) ?? []
          }
          value={users.find((item) => item.id === filters.student_id) || null}
          getOptionLabel={(option) => option.label || 'NA'}
          isOptionEqualToValue={(option, value) => option.value === value}
          renderInput={(params) => <TextField placeholder="Select Student" {...params} fullWidth />}
          onChange={handleStudentChange}
        />
      </Box>

      {/* Trainer Filter */}
      <Box flex={1} display="flex" alignItems="center" gap={1}>
        <Autocomplete
          fullWidth
          options={
            trainerUsers?.map((item: any) => ({
              label: `${item?.name ?? 'NA'}`,
              value: item.id,
            })) ?? []
          }
          value={trainerUsers.find((item) => item.id === filters.trainer_id) || null}
          getOptionLabel={(option) => option.label || 'NA'}
          isOptionEqualToValue={(option, value) => option.value === value}
          renderInput={(params) => <TextField placeholder="Select Trainer" {...params} fullWidth />}
          onChange={handleTrainerChange}
        />
      </Box>
    </Box>
  );
}
