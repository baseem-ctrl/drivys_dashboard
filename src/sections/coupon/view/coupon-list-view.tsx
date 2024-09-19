import isEqual from 'lodash/isEqual';
import { useState, useCallback, useEffect } from 'react';
// @mui
import { alpha } from '@mui/material/styles';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
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
import { _userList, _roles, USER_STATUS_OPTIONS } from 'src/_mock';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
import { _discount_types, ACTIVE_OPTIONS } from "src/_mock"
// components
import Label from 'src/components/label';
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
import { ICouponFilter, ICouponItem } from "src/types/language"
//
import CouponTableRow from '../coupon-table-row';
import UserTableToolbar from '../user-table-toolbar';
import UserTableFiltersResult from '../user-table-filters-result';

import { enqueueSnackbar } from 'src/components/snackbar';
import CouponCreateEditForm from '../coupon-create-update';
import { deleteCoupon, useGetAllCoupon } from 'src/api/coupon';
import { Stack } from '@mui/system';
import CouponFilters from '../coupon-filters';
import CouponFiltersResult from '../coupon-filters-result';
import CategorySearch from '../category-search';

// ----------------------------------------------------------------------

const STATUS_OPTIONS = [{ value: 'all', label: 'All' }, ...USER_STATUS_OPTIONS];

const TABLE_HEAD = [
  { id: 'name', label: 'Name' },
  { id: 'coupon_code', label: 'Coupon code', width: 180 },
  { id: 'discount_type_id', label: 'Discount type', width: 220 },
  { id: 'value', label: 'Value', width: 180 },
  { id: 'starting_date', label: 'Starting date', width: 180 },
  { id: 'ending_date', label: 'Ending date', width: 180 },
  { id: 'limitation_times', label: 'Limitation times', width: 180 },
  { id: 'is_active', label: 'Is Active', width: 180 },


  { id: '', width: 88 },
];


const defaultFilters: ICouponFilter = {
  name: '',
  discount_type_id: '',
  starting_date: null,
  ending_date: null,
  is_active: 'all',
  value: 0,
  id: '',

};

// ----------------------------------------------------------------------

export default function CouponListView() {
  const table = useTable();

  const settings = useSettingsContext();

  const router = useRouter();

  const confirm = useBoolean();

  const createCoupon = useBoolean();

  const [filters, setFilters] = useState(defaultFilters);

  const [tableData, setTableData] = useState<any>([]);

  const discountTypeMap = {
    All: '0',
    Product: '1',
    Category: '2',
  };

  const discount_type_id_value = discountTypeMap[filters.discount_type_id] || null;


  const isActiveMap = {
    All: '',
    Active: '1',
    Inactive: '0',
  };

  const is_active_value = isActiveMap[filters.is_active] || null;



  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getComparator(table.order, table.orderBy),
    filters,
  });

  const { coupon, couponLoading, totalpages, revalidateCoupon, couponError } =
    useGetAllCoupon(
      {
        limit: table.rowsPerPage,
        page: table.page + 1,
        search: filters.name,
        starting_date: filters?.starting_date?.toISOString()?.split('T')[0],
        ending_date: filters?.ending_date?.toISOString()?.split('T')[0],
        value: filters?.value,
        discount_type_id: discount_type_id_value,
        is_active: is_active_value
      }

    );

  useEffect(() => {
    if (coupon?.length) {
      setTableData(coupon);
    } else {
      setTableData([]);
    }
  }, [coupon]);
  const dataInPage = dataFiltered.slice(
    table.page * table.rowsPerPage,
    table.page * table.rowsPerPage + table.rowsPerPage
  );

  const denseHeight = table.dense ? 52 : 72;

  const canReset = !isEqual(defaultFilters, filters);

  const notFound = (!dataFiltered.length && canReset) || !dataFiltered.length;

  const openFilters = useBoolean();


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

  const dateError =
    filters.starting_date && filters.ending_date
      ? filters.starting_date.getTime() > filters.ending_date.getTime()
      : false;

  console.log(filters, 'filters');

  // const handleDeleteRow = useCallback(
  //   (id: string) => {
  //     const deleteRow = tableData.filter((row) => row.id !== id);
  //     setTableData(deleteRow);

  //     table.onUpdatePageDeleteRow(dataInPage.length);
  //   },
  //   [dataInPage.length, table, tableData]
  // );

  const handleDeleteRow = async (id: string) => {
    try {
      // Call your delete API
      const response = await deleteCoupon(id);
      revalidateCoupon();
      // Update the UI or state after successful deletion
      enqueueSnackbar(response?.message);
    } catch (error) {
      console.log(error, "error");

      enqueueSnackbar('error deleting coupon', { variant: 'error' });
    }
  };


  const handleEditRow = useCallback(
    (id: string) => {
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
      sx={{ paddingTop: 2, paddingLeft: 2 }}
    >
      <CategorySearch query={filters.name} results={filters} onSearch={handleFilters} />

      <Stack direction="row" spacing={1} flexShrink={0}>
        <CouponFilters
          open={openFilters.value}
          onOpen={openFilters.onTrue}
          onClose={openFilters.onFalse}
          //
          filters={filters}
          onFilters={handleFilters}
          //
          canReset={canReset}
          onResetFilters={handleResetFilters}
          dateError={dateError}
          discountOptions={_discount_types}

          activeOptions={['all', ...ACTIVE_OPTIONS.map((option) => option.label)]}
        //
        // locationOptions={countries}
        // roleOptions={_roles}
        // benefitOptions={JOB_BENEFIT_OPTIONS.map((option) => option.label)}
        // stockOptions={STOCK_OPTIONS}
        // employmentTypeOptions={JOB_EMPLOYMENT_TYPE_OPTIONS.map((option) => option.label)}
        />
      </Stack>
    </Stack>
  );
  const renderResults = (
    <CouponFiltersResult
      // filters={filters}
      onResetFilters={handleResetFilters}
      //
      canReset={canReset}
      // onFilters={handleFilters}
      //
      results={tableData?.length}
    />
  );

  return (
    <>
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Coupon List"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'Coupon', href: paths.dashboard.coupon.list },
            { name: 'List' },
          ]}
          action={
            <Button
              // component={RouterLink}
              onClick={() => {
                createCoupon.onTrue();
              }}
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
            >
              New Coupon
            </Button>
          }
          sx={{
            mb: { xs: 3, md: 5 },
          }}
        />

        <Card>
          <Stack
            spacing={2.5}
            sx={{
              mb: { xs: 3, md: 5 },
            }}
          >
            {renderFilters}

            {canReset && renderResults}
          </Stack>


          <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
            <TableSelectedAction
              dense={table.dense}
              numSelected={table.selected.length}
              rowCount={tableData.length}
              onSelectAllRows={(checked) =>
                table.onSelectAllRows(
                  checked,
                  tableData.map((row) => row.id)
                )
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
                  rowCount={tableData.length}
                  numSelected={table.selected.length}
                  onSort={table.onSort}
                // onSelectAllRows={(checked) =>
                //   table.onSelectAllRows(
                //     checked,
                //     tableData.map((row) => row.id)
                //   )
                // }
                />

                <TableBody>
                  {dataFiltered
                    .slice(
                      table.page * table.rowsPerPage,
                      table.page * table.rowsPerPage + table.rowsPerPage
                    )
                    .map((row) => (
                      <CouponTableRow
                        key={row.id}
                        row={row}
                        selected={table.selected.includes(row.id)}
                        onSelectRow={() => table.onSelectRow(row.id)}
                        onDeleteRow={() => handleDeleteRow(row.id)}
                        onEditRow={() => handleEditRow(row.id)}
                        reload={revalidateCoupon}
                      />
                    ))}

                  <TableEmptyRows
                    height={denseHeight}
                    emptyRows={emptyRows(table.page, table.rowsPerPage, tableData.length)}
                  />

                  <TableNoData notFound={notFound} />
                </TableBody>
              </Table>
            </Scrollbar>
          </TableContainer>

          <TablePaginationCustom
            count={dataFiltered.length}
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
      <CouponCreateEditForm
        title="Create Coupon"
        open={createCoupon.value}
        onClose={createCoupon.onFalse}
        reload={revalidateCoupon}
      />

      {/* <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete"
        content={
          <>
            Are you sure want to delete <strong> {table.selected.length} </strong> items?
          </>
        }
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              handleDeleteRows();
              confirm.onFalse();
            }}
          >
            Delete
          </Button>
        }
      /> */}
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

  const stabilizedThis = inputData.map((el, index) => [el, index] as const);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  if (name) {
    inputData = inputData.filter(
      (user) => user.name.toLowerCase().indexOf(name.toLowerCase()) !== -1
    );
  }

  if (status !== 'all') {
    inputData = inputData.filter((user) => user.status === status);
  }

  if (role?.length) {
    inputData = inputData.filter((user) => role.includes(user.role));
  }

  return inputData;
}
