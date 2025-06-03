import React from 'react';
import { Grid, CircularProgress, Typography, Container, Box } from '@mui/material';
import { useGetTrainerList } from 'src/api/assistant';
import { TablePaginationCustom, useTable } from 'src/components/table';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { paths } from 'src/routes/paths';
import { useSettingsContext } from 'src/components/settings';
import TrainerProfileCard from '../trainer-profile-card';
import { useRouter } from 'src/routes/hooks';

const TrainerListPage: React.FC = () => {
  const table = useTable({ defaultRowsPerPage: 3 });
  const settings = useSettingsContext();
  const router = useRouter();

  const { trainers, trainerListLoading, trainerListError, totalTrainerPages } = useGetTrainerList({
    page: table.page,
    limit: table.rowsPerPage,
  });

  if (trainerListLoading) {
    return (
      <Grid container justifyContent="center" mt={5}>
        <CircularProgress />
      </Grid>
    );
  }

  if (trainerListError) {
    return (
      <Typography color="error" textAlign="center" mt={5}>
        Failed to load trainers.
      </Typography>
    );
  }
  const handleClickDetails = () => {
    console.log('hagshagshaghdsags');
    // router.push(paths.dashboard.category.details(id));
  };
  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Trainer List"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          {
            name: 'Trainer',
            href: paths.dashboard.assistant.trainer.list,
          },
          { name: 'List' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />{' '}
      <Grid container spacing={3} padding={3}>
        {trainers.map((trainer: any) => (
          <Grid item xs={12} sm={10} md={4} key={trainer.id} sx={{ padding: 0 }}>
            <Box sx={{ textDecoration: 'none' }} onclick={() => handleClickDetails()}>
              <TrainerProfileCard row={trainer} />
            </Box>
          </Grid>
        ))}
      </Grid>{' '}
      <TablePaginationCustom
        count={totalTrainerPages}
        page={table.page}
        rowsPerPage={table.rowsPerPage}
        onPageChange={table.onChangePage}
        onRowsPerPageChange={table.onChangeRowsPerPage}
        dense={table.dense}
        onChangeDense={table.onChangeDense}
      />
    </Container>
  );
};

export default TrainerListPage;
