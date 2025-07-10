import { Container, Grid } from '@mui/material';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs/custom-breadcrumbs';
import { paths } from 'src/routes/paths';
import RefundListView from './view/refund-list-view';
import PendingRequests from 'src/sections/overview/e-commerce/ecommerce-pending-trainer-request';
import PendingSchoolAdminRefundListView from './view/refund-list-view';
import TodoListSearch from '../todo/todo-pending-request-filter';
import { useCallback, useState } from 'react';
import { useTable } from 'src/components/table';
import { IUserTableFilterValue } from 'src/types/city';
import { useTranslation } from 'react-i18next';

const defaultFilters = {
  customerName: '',
  status: '',
  bookingType: 'all',
  paymentStatus: '',
  vendor: '',
};

export default function ToDoListViewRefundSchoolAdmin() {
  const [filters, setFilters] = useState(defaultFilters);
  const [searchValue, setSearchValue] = useState('');
  const table = useTable({ defaultRowsPerPage: 15, defaultOrderBy: 'id', defaultOrder: 'desc' });
  const { t } = useTranslation();

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
          { name: t('to_do'), href: paths.dashboard.todo.pendingRefund },
          { name: t('list') },
        ]}
        sx={{ mb: 3 }}
      />

      <Grid item sx={{ mb: 3 }}>
        <TodoListSearch
          placeholder="Search with student's name, driver's name, city's name, category's name..."
          filters={filters}
          onFilters={handleFilters}
          searchValue={searchValue}
          setSearchValue={setSearchValue}
        />
      </Grid>
      <Grid>
        <PendingSchoolAdminRefundListView
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
