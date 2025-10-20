import React, { useCallback, useState } from 'react';
import isEqual from 'lodash/isEqual';
import {
  Grid,
  CircularProgress,
  Typography,
  Box,
  InputAdornment,
  IconButton,
  TextField,
  Card,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import { useGetTrainerList } from 'src/api/assistant';
import { TablePaginationCustom, useTable } from 'src/components/table';
import { paths } from 'src/routes/paths';
import { useSettingsContext } from 'src/components/settings';
import { useRouter } from 'src/routes/hooks';
import { useBoolean } from 'src/hooks/use-boolean';
import { IUserTableFilterValue } from 'src/types/city';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import { useTranslation } from 'react-i18next';
import TrainerProfileCard from '../trainer-profile-card';
import TrainerFilters from '../trainer-filter';

const defaultFilters: any = {
  city_id: '',
  vehicle_type_id: null,
  gear: '',
  vendor_id: null,
};

const TrainerListPage: React.FC = () => {
  const table = useTable({ defaultRowsPerPage: 10 });
  const settings = useSettingsContext();
  const router = useRouter();
  const openFilters = useBoolean();
  const [filters, setFilters] = useState(defaultFilters);
  const { t } = useTranslation();
  const [searchTermTrainer, setSearchTermTrainer] = useState('');

  const { trainers, trainerListLoading, trainerListError, totalTrainerPages } = useGetTrainerList({
    page: table.page + 1,
    limit: table.rowsPerPage,
    ...(filters.vendor_id?.value ? { vendor_id: filters.vendor_id.value } : {}),
    ...(filters.vehicle_type_id?.value ? { vehicle_type_id: filters.vehicle_type_id.value } : {}),
    ...(filters.gear ? { gear: filters.gear } : {}),
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

  const handleClearSearch = () => {
    setSearchTermTrainer('');
  };

  return (
    <Box sx={{ p: 4, bgcolor: '#fafafa', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 0.5 }}>
          {t('trainers')}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t('Home')} / <span style={{ color: '#ff6b35' }}>{t('trainers')}</span>
        </Typography>
      </Box>

      {/* White Card Container */}
      <Card
        sx={{
          borderRadius: 2,
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          overflow: 'hidden',
        }}
      >
        {/* Card Header */}
        <Box
          sx={{
            p: 3,
            borderBottom: '1px solid #f0f0f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {t('trainer_list')}
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Search */}
            <TextField
              placeholder={t('search_trainer') || 'Search...'}
              size="small"
              value={searchTermTrainer}
              onChange={(e) => setSearchTermTrainer(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#999', fontSize: 20 }} />
                  </InputAdornment>
                ),
                endAdornment: searchTermTrainer && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={handleClearSearch}>
                      <CloseIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                width: 250,
                '& .MuiOutlinedInput-root': {
                  bgcolor: '#fafafa',
                },
              }}
            />

            {/* Filter Component */}
            <TrainerFilters
              open={openFilters.value}
              onOpen={openFilters.onTrue}
              onClose={openFilters.onFalse}
              filters={filters}
              onFilters={handleFilters}
              canReset={canReset}
              onResetFilters={handleResetFilters}
            />
          </Box>
        </Box>

        {/* Content Area */}
        <Box sx={{ p: 3 }}>
          {trainerListLoading ? (
            <Box display="flex" justifyContent="center" py={10}>
              <CircularProgress />
            </Box>
          ) : trainerListError ? (
            <Typography color="error" textAlign="center" py={10}>
              {t('failed_to_load_trainers')}
            </Typography>
          ) : !trainers || trainers.length === 0 ? (
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              py={10}
              sx={{ opacity: 0.75 }}
            >
              <HourglassEmptyIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" color="text.primary">
                {t('no_trainers_available')}
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {trainers.map((trainer: any) => (
                <Grid item xs={12} md={6} key={trainer.id}>
                  <Box
                    sx={{
                      cursor: 'pointer',
                      '&:hover': {
                        opacity: 0.9,
                      },
                    }}
                    onClick={() => handleClickTrainerDetails(trainer?.user_id)}
                  >
                    <TrainerProfileCard row={trainer} />
                  </Box>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>

        {/* Pagination */}
        {!trainerListLoading && trainers && trainers.length > 0 && (
          <Box
            sx={{
              borderTop: '1px solid #f0f0f0',
              px: 2,
              py: 1,
            }}
          >
            <TablePaginationCustom
              count={totalTrainerPages}
              page={table.page}
              rowsPerPage={table.rowsPerPage}
              onPageChange={table.onChangePage}
              onRowsPerPageChange={table.onChangeRowsPerPage}
              dense={table.dense}
              onChangeDense={table.onChangeDense}
            />
          </Box>
        )}
      </Card>
    </Box>
  );
};

export default TrainerListPage;
