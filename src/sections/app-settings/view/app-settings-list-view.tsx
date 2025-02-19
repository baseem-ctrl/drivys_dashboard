import isEqual from 'lodash/isEqual';
import { useState, useCallback, useEffect } from 'react';
// @mui
import { alpha } from '@mui/material/styles';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import { LoadingButton } from '@mui/lab';

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
//
import AppSettingTableRow from '../app-settings-table-row';

import { deleteLanguage, useGetAllLanguage } from 'src/api/language';
import { enqueueSnackbar } from 'src/components/snackbar';
import LanguageCreateEditForm from '../app-settings-update';
import { useGetAllAppSettings } from 'src/api/app-settings';
import { width } from '@mui/system';
import { Grid, Skeleton, TableCell, TableRow } from '@mui/material';
import EditableForm from '../app-settings-form';

// ----------------------------------------------------------------------

const STATUS_OPTIONS = [{ value: 'all', label: 'All' }, ...USER_STATUS_OPTIONS];

const TABLE_HEAD = [
  { id: 'key', label: 'Key' },
  { id: 'value', label: 'Value', width: 400 },
  { id: '' },
];

const defaultFilters: IUserTableFilters = {
  name: '',
  role: [],
  status: 'all',
};

// ----------------------------------------------------------------------

export default function AppSettingsListView() {
  const table = useTable({ defaultRowsPerPage: 15 });

  const settings = useSettingsContext();

  const router = useRouter();

  const confirm = useBoolean();

  const createLanguage = useBoolean();

  const [filters, setFilters] = useState(defaultFilters);

  const [tableData, setTableData] = useState<any>([]);

  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getComparator(table.order, table.orderBy),
    filters,
  });

  const { appSettings, appSettingsLoading, totalpages, revalidateAppSettings, appSettingsError } =
    useGetAllAppSettings(table.page, 1000);

  useEffect(() => {
    if (appSettings?.length) {
      setTableData(appSettings);
    } else {
      setTableData([]);
    }
  }, [appSettings]);
  const dataInPage = dataFiltered.slice(
    table.page * table.rowsPerPage,
    table.page * table.rowsPerPage + table.rowsPerPage
  );

  const denseHeight = table.dense ? 52 : 72;

  const canReset = !isEqual(defaultFilters, filters);

  const notFound = (!dataFiltered.length && canReset) || !dataFiltered.length;

  return (
    <>
      <Container maxWidth="xl">
        <CustomBreadcrumbs
          heading="List"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'App Settings', href: paths.dashboard.system.appsettings },
            { name: 'List' },
          ]}
          sx={{
            mb: { xs: 3, md: 5 },
          }}
        />

        {/* <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
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
              <Table size={table.dense ? 'small' : 'medium'}>
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
                  {appSettingsLoading &&
                    Array.from(new Array(5)).map((_, index) => (
                      <TableRow key={index}>
                        <TableCell colSpan={TABLE_HEAD.length}>
                          <Skeleton animation="wave" height={40} />
                        </TableCell>
                      </TableRow>
                    ))}
                 

                  <TableEmptyRows
                    // height={denseHeight}
                    emptyRows={emptyRows(table.page, table.rowsPerPage, tableData.length)}
                  />

                  <TableNoData notFound={notFound} />

                  <Grid item xs={12} sx={{ mt: 2 }}>
                    <LoadingButton
                      fullWidth
                      variant="outlined"
                      color="primary"
                      // onClick={onSubmit}
                      // loading={isSubmitting}
                    >
                      Save
                    </LoadingButton>
                  </Grid>
                </TableBody>
              </Table>
            </Scrollbar>
          </TableContainer> */}

        {/* <Grid container spacing={2}>
          {tableData.length > 0 &&
            tableData.map((row) => (
              <Grid item xs={12} sm={6} md={4} key={row.id}>
                <AppSettingForm row={row} reload={revalidateLanguage} />
              </Grid>
            ))}
        </Grid> */}
        <EditableForm />

        {/* <TablePaginationCustom
            count={totalpages}
            page={table.page}
            rowsPerPage={table.rowsPerPage}
            onPageChange={table.onChangePage}
            onRowsPerPageChange={table.onChangeRowsPerPage}
            //
            dense={table.dense}
            onChangeDense={table.onChangeDense}
          /> */}
      </Container>
      <LanguageCreateEditForm
        title="Create Language"
        open={createLanguage.value}
        onClose={createLanguage.onFalse}
        reload={revalidateAppSettings}
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

  if (role.length) {
    inputData = inputData.filter((user) => role.includes(user.role));
  }

  return inputData;
}
