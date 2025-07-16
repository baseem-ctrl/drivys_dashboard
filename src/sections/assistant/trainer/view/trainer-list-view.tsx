import React, { useCallback, useState } from 'react';
import isEqual from 'lodash/isEqual';
import {
  Grid,
  CircularProgress,
  Typography,
  Container,
  Box,
  Stack,
  InputAdornment,
  IconButton,
  TextField,
} from '@mui/material';
import { useGetTrainerList } from 'src/api/assistant';
import { TablePaginationCustom, useTable } from 'src/components/table';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { paths } from 'src/routes/paths';
import { useSettingsContext } from 'src/components/settings';
import { useRouter } from 'src/routes/hooks';
import { useBoolean } from 'src/hooks/use-boolean';
import { IUserTableFilterValue } from 'src/types/city';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import CloseIcon from '@mui/icons-material/Close';
import { useGetGearEnum } from 'src/api/users';
import { useTranslation } from 'react-i18next';
import TrainerProfileCard from '../trainer-profile-card';
import TrainerFilters from '../trainer-filter';

const defaultFilters: any = {
  city_id: '',
  vehicle_type_id: { label: '', value: '' },
  gear: '',
  vendor_id: { label: '', value: '' },
};
const TrainerListPage: React.FC = () => {
  const table = useTable({ defaultRowsPerPage: 3 });
  const settings = useSettingsContext();
  const router = useRouter();
  const openFilters = useBoolean();
  const [filters, setFilters] = useState(defaultFilters);
  const { gearData, gearLoading } = useGetGearEnum();
  const { t } = useTranslation();
  const [searchTermTrainer, setSearchTermTrainer] = useState('');

  const { trainers, trainerListLoading, trainerListError, totalTrainerPages } = useGetTrainerList({
    page: table.page,
    limit: 1000,
    ...(filters.vendor_id?.value ? { vendor_id: filters.vendor_id.value } : {}),
    ...(filters.vehicle_type_id?.value ? { vehicle_type_id: filters.vehicle_type_id.value } : {}),
    ...(filters.gear !== '' && gearData?.length
      ? { gear: gearData.find((g: any) => g.name === filters.gear)?.value }
      : {}),
    ...(filters.city_id ? { city_id: filters.city_id } : {}),
    search: searchTermTrainer,
  });

  const canReset = !isEqual(defaultFilters, filters);
  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);
  const handleFilters = useCallback(
    (name: string, value: IUserTableFilterValue) => {
      table.onResetPage();
      setFilters((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    },
    [table]
  );

  const handleClickTrainerDetails = (id) => {
    router.push(paths.dashboard.assistant.trainer.details(id));
  };

  const renderFilters = (
    <Stack
      spacing={3}
      justifyContent="flex-end"
      alignItems={{ xs: 'flex-end', sm: 'center' }}
      direction={{ xs: 'column', sm: 'row' }}
      margin={3}
    >
      <Stack direction="row" spacing={1} flexShrink={0}>
        <TrainerFilters
          open={openFilters.value}
          onOpen={openFilters.onTrue}
          onClose={openFilters.onFalse}
          //
          filters={filters}
          onFilters={handleFilters}
          //
          canReset={canReset}
          onResetFilters={handleResetFilters}
        />

        {/* <JobSort sort={sortBy} onSort={handleSortBy} sortOptions={JOB_SORT_OPTIONS} /> */}
      </Stack>
    </Stack>
  );
  const handleClearSearch = () => {
    setSearchTermTrainer('');
  };

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading={t('trainer_list')}
        links={[
          { name: t('dashboard'), href: paths.dashboard.root },
          { name: t('trainer'), href: paths.dashboard.assistant.trainer.list },
          { name: t('list') },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />
      <Box mb={3} sx={{ width: '100%', maxWidth: 500 }}>
        <TextField
          label={t('search_students')}
          variant="outlined"
          fullWidth
          value={searchTermTrainer}
          onChange={(e) => setSearchTermTrainer(e.target.value)}
          InputProps={{
            endAdornment: searchTermTrainer && (
              <InputAdornment position="end">
                <IconButton onClick={handleClearSearch}>
                  <CloseIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Box>
      {renderFilters}

      {trainerListLoading ? (
        <Grid container justifyContent="center" mt={5}>
          <CircularProgress />
        </Grid>
      ) : trainerListError ? (
        <Typography color="error" textAlign="center" mt={5}>
          {t('failed_to_load_trainers')}
        </Typography>
      ) : !trainers || trainers.length === 0 ? (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          mt={10}
          sx={{ opacity: 0.75 }}
        >
          <HourglassEmptyIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.primary">
            {t('no_trainers_available')}
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3} padding={3}>
          {trainers.map((trainer: any) => (
            <Grid item xs={12} sm={10} md={4} key={trainer.id} sx={{ padding: 0 }}>
              <Box
                sx={{ textDecoration: 'none' }}
                onClick={() => handleClickTrainerDetails(trainer?.user_id)}
              >
                <TrainerProfileCard row={trainer} />
              </Box>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default TrainerListPage;
