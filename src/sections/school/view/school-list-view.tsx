import isEqual from 'lodash/isEqual';
import { useState, useCallback, useEffect } from 'react';
// @mui
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import IconButton from '@mui/material/IconButton';
import TableContainer from '@mui/material/TableContainer';
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';
// _mock
import { _roles, ACTIVE_OPTIONS } from 'src/_mock';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
// components
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import {
  useTable,
  getComparator,
  emptyRows,
  TableNoData,
  TableEmptyRows,
  TableHeadCustom,
  TableSelectedAction,
  TablePaginationCustom,
} from 'src/components/table';
// types
import { IUserItem, IUserTableFilters, IUserTableFilterValue } from 'src/types/user';
//
import { deleteSchool, useGetSchool } from 'src/api/school';
import { IDeliveryItem } from 'src/types/product';
import { useSnackbar } from 'src/components/snackbar';
import SchoolTableRow from '../school-table-row';
import UserTableToolbar from '../school-table-toolbar';
import UserTableFiltersResult from '../school-table-filters-result';
import SchoolCreateForm from './school-create-form';
import SchoolFilters from '../school-filters';
import { CircularProgress, Skeleton, Stack, TableCell, TableRow } from '@mui/material';
import JobSearch from 'src/sections/job/job-search';
import SchoolSearch from '../school-search';
import { STATUS_OPTIONS } from 'src/_mock/_school';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'locale', label: 'Language' },
  { id: 'name', label: 'Name' },
  { id: 'email', label: 'Email' },
  { id: 'phone_number', label: 'Phone Number' },
  { id: 'commission_in_percentage', label: 'Commission (in %)' },

  { id: 'status', label: 'Status' },
  { id: 'is_active', label: 'Active Status ' },
  { id: 'vendor_user', label: 'School Owner' },
  { id: 'action', label: 'Action' },

  // { id: '' },
];

const defaultFilters: any = {
  name: '',
  role: [],
  status: 'all',
  min_commission: 0,
  max_commission: 0,
  is_active: '',
};

// ----------------------------------------------------------------------

export default function SchoolListView() {
  const table = useTable({ defaultRowsPerPage: 15, defaultOrderBy: 'id', defaultOrder: 'desc' });

  const { enqueueSnackbar } = useSnackbar();

  const settings = useSettingsContext();

  const quickCreate = useBoolean();

  const router = useRouter();

  const confirm = useBoolean();
  const openFilters = useBoolean();

  const [tableData, setTableData] = useState<IDeliveryItem[]>();

  const [filters, setFilters] = useState(defaultFilters);

  const {
    schoolList,
    schoolError,
    schoolLoading,
    schoolValidating,
    totalPages,
    schoolEmpty,
    revalidateSchool,
  } = useGetSchool({
    page: table?.page + 1,
    limit: table?.rowsPerPage,
    search: filters?.name,
    status: filters?.status === 'all' ? '' : filters?.status,
    min_commission: filters?.min_commission,
    max_commission: filters?.max_commission,
    is_active: filters?.is_active,
  });

  useEffect(() => {
    if (schoolList?.length) {
      setTableData(schoolList);
    } else {
      setTableData([]);
    }
  }, [schoolList]);

  const denseHeight = table.dense ? 52 : 72;

  const canReset = !isEqual(defaultFilters, filters);

  const notFound = (!tableData?.length && canReset) || !tableData?.length;

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

  const handleDeleteRow = async (id: string) => {
    try {
      const response = await deleteSchool(id);
      revalidateSchool();
      enqueueSnackbar(response?.message);
    } catch (error) {
      enqueueSnackbar(error?.message, { variant: 'error' });
    }
  };

  const handleEditRow = useCallback(
    (e: any, id: string) => {
      e.stopPropogation();
      router.push(paths.dashboard.user.edit(id));
    },
    [router]
  );

  const handleFilterStatus = useCallback(
    (event: React.SyntheticEvent, newValue: string) => {
      handleFilters('status', newValue);
    },
    [handleFilters]
  );

  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);
  const renderFilters = (
    <Stack
      spacing={3}
      justifyContent="space-between"
      alignItems={{ xs: 'flex-end', sm: 'center' }}
      direction={{ xs: 'column', sm: 'row' }}
    >
      <SchoolSearch query={filters.name} results={filters} onSearch={handleFilters} />

      <Stack direction="row" spacing={1} flexShrink={0}>
        <SchoolFilters
          open={openFilters.value}
          onOpen={openFilters.onTrue}
          onClose={openFilters.onFalse}
          filters={filters}
          onFilters={handleFilters}
          canReset={canReset}
          onResetFilters={handleResetFilters}
          statusOptions={STATUS_OPTIONS}
          activeOptions={ACTIVE_OPTIONS}
        />
      </Stack>
    </Stack>
  );
  // const renderResults = (
  //   <JobFiltersResult
  //     filters={filters}
  //     onResetFilters={handleResetFilters}
  //     //
  //     canReset={canReset}
  //     onFilters={handleFilters}
  //     //
  //     results={dataFiltered.length}
  //   />
  // );
  const handleViewRow = useCallback(
    (id: string) => {
      router.push(paths.dashboard.school.details(id));
    },
    [router]
  );
  return (
    <>
      <Container maxWidth={settings.themeStretch ? false : 'xl'}>
        <CustomBreadcrumbs
          heading="Schools List"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'School', href: paths.dashboard.school.root },
            { name: 'List' },
          ]}
          action={
            <Button
              onClick={quickCreate.onTrue}
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
            >
              New School
            </Button>
          }
          sx={{
            mb: { xs: 3, md: 5 },
          }}
        />
        <Stack
          spacing={2.5}
          sx={{
            mb: { xs: 3, md: 5 },
          }}
        >
          {renderFilters}

          {/* {canReset && renderResults} */}
        </Stack>
        <Card>
          {/* <UserTableToolbar
            filters={filters}
            onFilters={handleFilters}
            //
            roleOptions={_roles}
          />

          {canReset && (
            <UserTableFiltersResult
              filters={filters}
              onFilters={handleFilters}
              //
              onResetFilters={handleResetFilters}
              //
              results={tableData.length}
              sx={{ p: 2.5, pt: 0 }}
            />
          )} */}

          <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
            <TableSelectedAction
              dense={table.dense}
              numSelected={table.selected.length}
              rowCount={tableData?.length}
              onSelectAllRows={(checked) =>
                table.onSelectAllRows(checked, tableData?.map((row) => row?.id))
              }
              action={
                <Tooltip title="Delete">
                  <IconButton color="primary" onClick={confirm.onTrue}>
                    <Iconify icon="solar:trash-bin-trash-bold" />
                  </IconButton>
                </Tooltip>
              }
            />

            <Scrollbar>
              <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 960 }}>
                <TableHeadCustom
                  order={table.order}
                  orderBy={table.orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={tableData?.length}
                  numSelected={table.selected.length}
                  onSort={table.onSort}
                  // onSelectAllRows={(checked) =>
                  //   table.onSelectAllRows(checked, tableData?.map((row) => row.id))
                  // }
                />

                <TableBody>
                  {schoolLoading
                    ? Array.from(new Array(5)).map((_, index) => (
                        <TableRow key={index}>
                          <TableCell colSpan={TABLE_HEAD?.length || 6}>
                            <Skeleton animation="wave" height={40} />
                          </TableCell>
                        </TableRow>
                      ))
                    : tableData?.map((row) => (
                        <SchoolTableRow
                          key={row.id}
                          row={row}
                          selected={table.selected.includes(row.id)}
                          onSelectRow={() => table.onSelectRow(row.id)}
                          onDeleteRow={() => handleDeleteRow(row.id)}
                          onEditRow={(e: any) => handleEditRow(e, row.id)}
                          revalidateSchool={revalidateSchool}
                          onViewRow={() => handleViewRow(row?.id)}
                        />
                      ))}

                  {/* <TableEmptyRows
                    height={denseHeight}
                    emptyRows={emptyRows(table.page, table.rowsPerPage, tableData?.length)}
                  /> */}

                  {tableData?.length === 0 && !schoolLoading && <TableNoData notFound={notFound} />}
                </TableBody>
              </Table>
            </Scrollbar>
          </TableContainer>

          <TablePaginationCustom
            count={totalPages}
            page={table.page}
            rowsPerPage={table.rowsPerPage}
            onPageChange={table.onChangePage}
            onRowsPerPageChange={table.onChangeRowsPerPage}
            //
            dense={table.dense}
            onChangeDense={table.onChangeDense}
          />
        </Card>
      </Container>
      <SchoolCreateForm
        open={quickCreate.value}
        onClose={quickCreate.onFalse}
        revalidateDeliverey={revalidateSchool}
      />
    </>
  );
}

// ----------------------------------------------------------------------

function applyFilter({
  inputData,
  comparator,
  filters,
}: {
  inputData: IUserItem[];
  comparator: (a: any, b: any) => number;
  filters: IUserTableFilters;
}) {
  const { name, status, role } = filters;

  const stabilizedThis = inputData?.map((el, index) => [el, index] as const);

  stabilizedThis?.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis?.map((el) => el[0]);

  if (name) {
    inputData = inputData.filter(
      (user) => user.name.toLowerCase().indexOf(name.toLowerCase()) !== -1
    );
  }

  if (status !== 'all') {
    inputData = inputData.filter((user) => user.status === status);
  }

  if (role.length) {
    inputData = inputData.filter((user) => role.includes(user.role));
  }

  return inputData;
}
