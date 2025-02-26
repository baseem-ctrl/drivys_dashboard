import { Container, Grid } from '@mui/material';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs/custom-breadcrumbs';
import { paths } from 'src/routes/paths';
import PendingRequests from 'src/sections/overview/e-commerce/ecommerce-pending-trainer-request';
import { useCallback, useState } from 'react';
import { IUserTableFilterValue } from 'src/types/city';
import { useTable } from 'src/components/table';
import { useLocales } from 'src/locales';
import TodoListSearch from '../todo-pending-request-filter';

const defaultFilters = {
  customerName: '',
  status: '',
  bookingType: 'all',
  paymentStatus: '',
  vendor: '',
};

export default function ToDoListViewVerification() {
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
          filters={filters}
          onFilters={handleFilters}
          searchValue={searchValue}
          setSearchValue={setSearchValue}
          placeholder={t('search_placeholder_to_list')}
        />
      </Grid>
      <Grid>
        <PendingRequests height={''} searchValue={searchValue} setSearchValue={setSearchValue} />
      </Grid>
    </Container>
  );
}
