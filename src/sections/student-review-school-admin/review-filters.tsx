import { Box, TextField, Autocomplete, IconButton, Tooltip, Typography } from '@mui/material';
import { ArrowUpward, ArrowDownward } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useGetUsers } from 'src/api/users';

export default function ReviewFilter({ filters, onFilters }: any) {
  const { t } = useTranslation();
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

  const currentSort = filters.sort_dir === 'desc' ? 'lowest' : 'highest';

  const toggleSortOrder = () => {
    onFilters((prevFilters: any) => ({
      ...prevFilters,
      sort_dir: prevFilters.sort_dir === 'asc' ? 'desc' : 'asc',
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
        },
      }}
    >
      {/* Student Filter */}
      <Box flex={1} display="flex" alignItems="center" gap={1}>
        <Autocomplete
          fullWidth
          options={
            users?.map((item: any) => ({
              label: `${item?.name ?? t('n/a')}`,
              value: item.id,
            })) ?? []
          }
          value={
            users
              ?.map((item: any) => ({
                label: `${item?.name ?? t('n/a')}`,
                value: item.id,
              }))
              .find((item) => item.value === filters.student_id) || null
          }
          getOptionLabel={(option) => option.label || t('n/a')}
          isOptionEqualToValue={(option, value) => option.value === value?.value}
          renderInput={(params) => (
            <TextField placeholder={t('Select Student')} {...params} fullWidth />
          )}
          onChange={handleStudentChange}
        />
      </Box>

      {/* Trainer Filter */}
      <Box flex={1} display="flex" alignItems="center" gap={1}>
        <Autocomplete
          fullWidth
          options={
            trainerUsers?.map((item: any) => ({
              label: `${item?.name ?? t('n/a')}`,
              value: item.id,
            })) ?? []
          }
          value={
            trainerUsers
              ?.map((item: any) => ({
                label: `${item?.name ?? t('n/a')}`,
                value: item.id,
              }))
              .find((item) => item.value === filters.trainer_id) || null
          }
          getOptionLabel={(option) => option.label || t('n/a')}
          isOptionEqualToValue={(option, value) => option.value === value}
          renderInput={(params) => (
            <TextField placeholder={t('Select Trainer')} {...params} fullWidth />
          )}
          onChange={handleTrainerChange}
        />
      </Box>

      <Box
        flex="none"
        display="flex"
        alignItems="center"
        gap={1}
        sx={{
          minWidth: 140,
          padding: '6px 12px',
          borderRadius: 1,
          backgroundColor: (theme) => theme.palette.action.hover,
          userSelect: 'none',
        }}
      >
        <Typography variant="body2" color="textSecondary" sx={{ whiteSpace: 'nowrap' }}>
          {t('sort_by_review')}
        </Typography>

        <Tooltip
          title={
            currentSort === 'highest'
              ? t('sort_by_highest_review_first')
              : t('sort_by_lowest_review_first')
          }
        >
          <IconButton
            onClick={toggleSortOrder}
            color="primary"
            size="medium"
            aria-label="Toggle review sort order"
          >
            {currentSort === 'highest' ? <ArrowUpward /> : <ArrowDownward />}
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
}
