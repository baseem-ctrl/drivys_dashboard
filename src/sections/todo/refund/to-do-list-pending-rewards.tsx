import { Container, Grid } from '@mui/material';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs/custom-breadcrumbs';
import { paths } from 'src/routes/paths';
import { useCallback, useState } from 'react';
import { useTable } from 'src/components/table';
import { IUserTableFilterValue } from 'src/types/city';
import PendingRewardListView from './view/pending-reward-list-view';

const defaultFilters = {
  customerName: '',
  status: '',
  bookingType: 'all',
  paymentStatus: '',
  vendor: '',
};

export default function ToDoListPendingReward() {
  const [filters, setFilters] = useState(defaultFilters);
  const [searchValue, setSearchValue] = useState('');
  const table = useTable({ defaultRowsPerPage: 15, defaultOrderBy: 'id', defaultOrder: 'desc' });

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

  return (
    <Container maxWidth="xl">
      <CustomBreadcrumbs
        heading="To Do List"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'To Do', href: paths.dashboard.todo.trainerPendingRewards },
          { name: 'Pending Trainer Rewards' },
        ]}
        sx={{ mb: 3 }}
      />
      {/* <Grid item sx={{ mb: 3 }}>
        <TodoListSearch
          placeholder="Search with student's name, driver's name, city's name, category's name..."
          filters={filters}
          onFilters={handleFilters}
          searchValue={searchValue}
          setSearchValue={setSearchValue}
        />
      </Grid> */}
      <Grid>
        <PendingRewardListView
          table={table}
          searchValue={searchValue}
          setSearchValue={setSearchValue}
          filters={filters}
          setFilters={setFilters}
        />
      </Grid>
    </Container>
  );
}
