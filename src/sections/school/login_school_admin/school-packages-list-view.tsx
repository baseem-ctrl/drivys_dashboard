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
import { deleteLanguage, useGetAllLanguage } from 'src/api/language';
import { enqueueSnackbar } from 'src/components/snackbar';
import {
  Avatar,
  ListItemText,
  MenuItem,
  Skeleton,
  Stack,
  TableCell,
  TableRow,
} from '@mui/material';
import {
  RemoveTrainerFromSchool,
  useGetSchoolPackageList,
  useGetSchoolTrainerList,
  useGetSchoolTrainers,
} from 'src/api/school';
import moment from 'moment';
import { updateUserVerification } from 'src/api/school-admin';
import TrainerCreateEditForm from './trainer-create-update';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import SchoolSearch from 'src/sections/packages/package-search';

// ----------------------------------------------------------------------

const STATUS_OPTIONS = [{ value: 'all', label: 'All' }, ...USER_STATUS_OPTIONS];

const TABLE_HEAD = [
  { id: 'locale', label: 'Language' },
  { id: 'name', label: 'Name' },
  // { id: 'session_inclusions', label: 'Session inclusions' },
  { id: 'number_of_sessions', label: 'Number of sessions' },
  { id: 'is_published', label: 'Is published' },
  { id: 'drivys_commision', label: 'Drivys Commision' },
  { id: 'category', label: 'Category' },

  // { id: '' },
];

const defaultFilters: any = {
  name: '',
  min_price: 0,
  max_price: 0,
  number_of_sessions: 0,
  is_published: '',
  locale: '',
};

// ----------------------------------------------------------------------

export default function SchoolPackageListView() {
  const table = useTable({ defaultRowsPerPage: 15 });

  const settings = useSettingsContext();

  const router = useRouter();

  const confirm = useBoolean();

  const [filters, setFilters] = useState(defaultFilters);

  const [tableData, setTableData] = useState<any>([]);

  const {
    schoolPackageList,
    schoolPackageLoading,
    schoolPackageError,
    totalPages,
    revalidatePackage,
    revalidateSearch,
  } = useGetSchoolPackageList({
    page: table?.page + 1,
    limit: table?.rowsPerPage,
    search: filters.name,
  });

  useEffect(() => {
    if (schoolPackageList?.length) {
      setTableData(schoolPackageList);
    } else {
      setTableData([]);
    }
  }, [schoolPackageList]);
  const denseHeight = table.dense ? 52 : 72;
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

  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);
  const canReset = !isEqual(defaultFilters, filters);

  const notFound = (!tableData?.length && canReset) || !tableData?.length;
  const handleRowClick = (e: any, user_id: string) => {
    e.stopPropagation();

    router.push(paths.dashboard.school.detailsadmin(user_id));
  };
  const renderFilters = (
    <Stack
      spacing={3}
      justifyContent="space-between"
      alignItems={{ xs: 'flex-end', sm: 'center' }}
      direction={{ xs: 'column', sm: 'row' }}
    >
      <SchoolSearch query={filters.name} results={filters} onSearch={handleFilters} />
    </Stack>
  );
  return (
    <>
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="List"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'Packages', href: paths.dashboard.school.package },
            { name: 'List' },
          ]}
          sx={{
            mb: { xs: 3, md: 5 },
          }}
        />

        <Card>
          <Stack
            spacing={2.5}
            sx={{
              m: 1,
            }}
          >
            {renderFilters}
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
                  // onSort={table.onSort}
                  // onSelectAllRows={(checked) =>
                  //   table.onSelectAllRows(
                  //     checked,
                  //     tableData.map((row) => row.id)
                  //   )
                  // }
                />

                <TableBody>
                  {schoolPackageLoading
                    ? Array.from(new Array(5)).map((_, index) => (
                        <TableRow key={index}>
                          <TableCell colSpan={TABLE_HEAD?.length || 6}>
                            <Skeleton animation="wave" height={40} />
                          </TableCell>
                        </TableRow>
                      ))
                    : tableData &&
                      tableData?.length > 0 &&
                      tableData?.map((row) => (
                        <TableRow
                          hover
                          onClick={(e) => (row?.vendor_id ? handleRowClick(e, row?.vendor_id) : '')}
                          style={{ cursor: 'pointer' }}
                        >
                          <TableCell sx={{ display: 'flex', alignItems: 'center' }}>
                            {row?.package_translations[0]?.locale ?? 'NA'}
                          </TableCell>

                          <TableCell>{row?.package_translations[0]?.name}</TableCell>

                          <TableCell sx={{ whiteSpace: 'nowrap' }}>
                            {(row?.number_of_sessions || 'N/A') ?? 'NA'}
                          </TableCell>

                          <TableCell sx={{ whiteSpace: 'nowrap' }}>
                            <Label variant="soft" color={!!row?.is_published ? 'success' : 'error'}>
                              {!!row?.is_published ? 'Published' : 'Un Published'}
                            </Label>
                          </TableCell>

                          <TableCell sx={{ whiteSpace: 'nowrap' }}>
                            {row?.drivys_commision ?? 'NA'}
                          </TableCell>
                          <TableCell>
                            {row?.category?.category_translations[0]?.name ?? 'NA'}
                          </TableCell>
                        </TableRow>
                      ))}

                  <TableNoData notFound={notFound} />
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
    </>
  );
}

// ----------------------------------------------------------------------
