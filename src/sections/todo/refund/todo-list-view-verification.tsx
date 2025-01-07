import { Container, Grid } from '@mui/material';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs/custom-breadcrumbs';
import { paths } from 'src/routes/paths';
import RefundListView from './view/refund-list-view';
import PendingRequests from 'src/sections/overview/e-commerce/ecommerce-pending-trainer-request';
import TodoListSearch from '../todo-pending-request-filter';
import { useCallback, useState } from 'react';
import { IUserTableFilterValue } from 'src/types/city';
import { useTable } from 'src/components/table';

const defaultFilters = {
  customerName: '',
  status: '',
  bookingType: 'all',
  paymentStatus: '',
  vendor: '',
};

export default function ToDoListViewVerification() {
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
          { name: 'To Do', href: paths.dashboard.todo.root },
          { name: 'List' },
        ]}
        sx={{ mb: 3 }}
      />
      <Grid item sx={{ mb: 3 }}>
        <TodoListSearch
          filters={filters}
          onFilters={handleFilters}
          searchValue={searchValue}
          setSearchValue={setSearchValue}
          placeholder="Search with trainer name, email, school name..."
        />
      </Grid>
      <Grid>
        <PendingRequests height={''} searchValue={searchValue} setSearchValue={setSearchValue} />
      </Grid>
    </Container>
  );
}
