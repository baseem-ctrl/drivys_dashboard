import { Container, Grid } from '@mui/material';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs/custom-breadcrumbs';
import { paths } from 'src/routes/paths';
import RefundListView from './view/refund-list-view';
import PendingRequests from 'src/sections/overview/e-commerce/ecommerce-pending-trainer-request';
import TodoListSearch from '../todo-pending-request-filter';
import { useCallback, useState } from 'react';
import { useLocales } from 'src/locales';
import { useTable } from 'src/components/table';
import { IUserTableFilterValue } from 'src/types/city';

const defaultFilters = {
  customerName: '',
  status: '',
  bookingType: 'all',
  paymentStatus: '',
  vendor: '',
};

export default function ToDoListViewRefund() {
  const { t } = useLocales();

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
        heading={t('to_do_list')}
        links={[
          { name: t('dashboard'), href: paths.dashboard.root },
          { name: t('to_do'), href: paths.dashboard.todo.root },
          { name: t('list') },
        ]}
        sx={{ mb: 3 }}
      />
      <Grid item sx={{ mb: 3 }}>
        <TodoListSearch
          placeholder={t('search_placeholder_to_list_refund')}
          filters={filters}
          onFilters={handleFilters}
          searchValue={searchValue}
          setSearchValue={setSearchValue}
        />
      </Grid>
      <Grid>
        <RefundListView
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
