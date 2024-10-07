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
import { _roles, PUBLISHED_OPTIONS } from 'src/_mock';
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
import { useGetSchool } from 'src/api/school';
import { IDeliveryItem } from 'src/types/product';
import { useSnackbar } from 'src/components/snackbar';
import PackageTableRow from '../package-table-row';
import UserTableToolbar from '../package-table-toolbar';
import UserTableFiltersResult from '../package-table-filters-result';
import PackageCreateForm from './package-create-form';
import PackageFilters from '../package-filters';
import { CircularProgress, Skeleton, Stack, TableCell, TableRow } from '@mui/material';
import JobSearch from 'src/sections/job/job-search';
import PackageSearch from '../package-search';
import { STATUS_OPTIONS } from 'src/_mock/_school';
import { deletePackage, useGetPackage } from 'src/api/package';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'locale', label: 'Language' },
  { id: 'name', label: 'Name' },
  { id: 'session_inclusions', label: 'Session inclusions' },
  { id: 'number_of_sessions', label: 'Number of sessions' },
  { id: 'is_published', label: 'Is published' },
  { id: 'Vendor', label: 'School' },
  { id: 'action', label: 'Action' },

  // { id: '' },
];

const defaultFilters: any = {
  name: '',
  min_price: 0,
  max_price: 0,
  number_of_sessions: 0,
  vendor_id: '',
  is_published: '',
  locale: '',

};

// ----------------------------------------------------------------------

export default function PackageListView() {
  const table = useTable({ defaultRowsPerPage: 15, defaultOrderBy: 'id', defaultOrder: 'desc' });

  const { enqueueSnackbar } = useSnackbar();

  const settings = useSettingsContext();

  const quickCreate = useBoolean();

  const router = useRouter();

  const confirm = useBoolean();
  const openFilters = useBoolean();

  const [tableData, setTableData] = useState<IDeliveryItem[]>();

  const [schoolOptions, setSchoolOptions] = useState([])

  const [filters, setFilters] = useState(defaultFilters);

  const { schoolList, schoolLoading } = useGetSchool(1000, 1);



  const {
    packageList,
    packageError,
    packageLoading,
    packageValidating,
    totalPages,
    packageEmpty,
    revalidatePackage,
  } = useGetPackage({
    page: table?.page + 1,
    limit: table?.rowsPerPage,
    search: filters?.name,
    number_of_sessions: filters?.number_of_sessions,
    min_price: filters?.min_price,
    max_price: filters?.max_price,
    is_published: filters?.is_published,
    vendor_id: filters?.vendor_id,
  });

  useEffect(() => {
    if (packageList?.length) {
      setTableData(packageList);
    } else {
      setTableData([]);
    }
  }, [packageList]);

  useEffect(() => {
    const enNamesArray = schoolList
      .flatMap(vendor =>
        vendor.vendor_translations
          .filter(trans => trans.locale.toLowerCase() === 'en')
          .map(trans => trans.name)
      );

    setSchoolOptions(enNamesArray);
  }, [schoolList]);


  const denseHeight = table.dense ? 52 : 72;

  const canReset = !isEqual(defaultFilters, filters);

  const notFound = (!tableData?.length && canReset) || !tableData?.length;

  const handleFilters = useCallback(
    (name: string, value: IUserTableFilterValue) => {
      table.onResetPage();
      console.log(name, value, "name");

      setFilters((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    },
    [table]
  );

  const handleDeleteRow = async (id: string) => {
    try {
      const response = await deletePackage(id);
      revalidatePackage();
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
      <PackageSearch query={filters.name} results={filters} onSearch={handleFilters} />

      <Stack direction="row" spacing={1} flexShrink={0}>
        <PackageFilters
          open={openFilters.value}
          onOpen={openFilters.onTrue}
          onClose={openFilters.onFalse}
          filters={filters}
          onFilters={handleFilters}
          canReset={canReset}
          onResetFilters={handleResetFilters}
          statusOptions={STATUS_OPTIONS}
          publishedOptions={PUBLISHED_OPTIONS}
          schoolOptions={schoolOptions}
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
          heading="Package List"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'Package', href: paths.dashboard.package.root },
            { name: 'List' },
          ]}
          action={
            <Button
              onClick={quickCreate.onTrue}
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
            >
              New Package
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

        </Stack>
        <Card>


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
                  {packageLoading
                    ? Array.from(new Array(5)).map((_, index) => (
                      <TableRow key={index}>
                        <TableCell colSpan={TABLE_HEAD?.length || 6}>
                          <Skeleton animation="wave" height={40} />
                        </TableCell>
                      </TableRow>
                    ))
                    : tableData?.map((row) => (
                      <PackageTableRow
                        key={row.id}
                        row={row}
                        selected={table.selected.includes(row.id)}
                        onSelectRow={() => table.onSelectRow(row.id)}
                        onDeleteRow={() => handleDeleteRow(row.id)}
                        onEditRow={(e: any) => handleEditRow(e, row.id)}
                        revalidatePackage={revalidatePackage}
                        onViewRow={() => handleViewRow(row?.id)}
                        schoolList={schoolList}
                      />
                    ))}

                  {/* <TableEmptyRows
                    height={denseHeight}
                    emptyRows={emptyRows(table.page, table.rowsPerPage, tableData?.length)}
                  /> */}

                  {tableData?.length === 0 && !packageLoading && <TableNoData notFound={notFound} />}
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
      <PackageCreateForm
        open={quickCreate.value}
        onClose={quickCreate.onFalse}
        revalidateDeliverey={revalidatePackage}
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
