import React from 'react';
import { Grid, CircularProgress, Typography, Container } from '@mui/material';
import { useGetTrainerList } from 'src/api/assistant';
import { TablePaginationCustom, useTable } from 'src/components/table';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { paths } from 'src/routes/paths';
import { useSettingsContext } from 'src/components/settings';
import TrainerProfileCard from '../trainer-profile-card';

const TrainerListPage: React.FC = () => {
  const table = useTable({ defaultRowsPerPage: 6 });
  const settings = useSettingsContext();

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

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Student List"
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
          <Grid item xs={12} sm={12} md={6} lg={4} key={trainer.id}>
            <TrainerProfileCard row={trainer} />
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
