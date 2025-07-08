import { useState, useEffect, useCallback } from 'react';

// @mui
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Tooltip from '@mui/material/Tooltip';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import IconButton from '@mui/material/IconButton';
import TableContainer from '@mui/material/TableContainer';
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Skeleton,
  Stack,
  TableCell,
  TableRow,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';

// routes
import { paths } from 'src/routes/paths';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
// components
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import {
  useTable,
  TableHeadCustom,
  TableSelectedAction,
  TablePaginationCustom,
} from 'src/components/table';
// types

import { useGetAllLanguage } from 'src/api/language';
import { useAuthContext } from 'src/auth/hooks';
import { useGetPermissions } from 'src/api/roles-and-permission';
import { useRouter } from 'src/routes/hooks';
import PermissionFilter from '../permissions-filters';
import PermissionTableRow from '../permissions-table-row';
import CreatePermission from '../create-permission';
import { useTranslation } from 'react-i18next';

// ----------------------------------------------------------------------

// ----------------------------------------------------------------------

export default function PermissionListView() {
  const { user } = useAuthContext();
  const router = useRouter();
  const { t } = useTranslation();

  const table = useTable({ defaultRowsPerPage: 15 });
  const settings = useSettingsContext();
  const confirm = useBoolean();
  const openFilters = useBoolean();
  const [open, setOpen] = useState(false);
  const [tableData, setTableData] = useState<any>([]);
  const [viewMode, setViewMode] = useState('table');
  const [localeFilter, setLocaleFilter] = useState('');
  const [filters, setFilters] = useState<{
    startDate?: string;
    endDate?: string;
    booking_status?: string;
    payment_method?: number;
    category_id?: any;
  }>({});
  const TABLE_HEAD = [
    { id: 'name', label: t('role'), width: 100 },
    { id: 'description', label: t('Description'), width: 100 },
    { id: 'action', label: '', width: 200 },
  ];
  const [selectedOrder, setSelectedOrder] = useState(undefined);
  const [startDate, setStartDate] = useState<string | undefined>(undefined);
  const [endDate, setEndDate] = useState<string | undefined>(undefined);

  const {
    permissions,
    permissionsLoading,
    permissionsError,
    permissionsTotalPages,
    revalidatePermissions,
  } = useGetPermissions(table.page, table.rowsPerPage);
  const handleFiltersChange = (newFilters: any) => {
    setFilters(newFilters);
  };
  const { language } = useGetAllLanguage(0, 1000);
  const localeOptions = (language || []).map((lang) => ({
    value: lang.language_culture,
    label: lang.name,
  }));
  useEffect(() => {
    if (permissions?.length) {
      setTableData(permissions);
    } else {
      setTableData([]);
    }
  }, [permissions]);

  const handleRowClick = (row) => {
    // setRowId(row.id);
    // // setViewMode('detail');
    //No Need on click
  };

  const handleFilters = useCallback(
    // (name: string) => {
    //   table.onResetPage();
    //   setFilters((prevState) => ({
    //     ...prevState,
    //     [name]: value,
    //   }));
    // },
    [table]
  );

  const handleClose = () => {
    setOpen(false);
  };

  const handleOrderChange = (event) => {
    const value = event.target.value;

    if (value === '') {
      setSelectedOrder(undefined);
      setLocaleFilter('');
      // setFilters(defaultFilters);
    } else {
      setSelectedOrder(value);
    }
  };
  const handleLocaleFilterChange = (locale: string) => {
    setLocaleFilter(locale);
  };
  // const canReset = !isEqual(defaultFilters, filters);

  const handleResetFilters = useCallback(() => {
    setSelectedOrder(undefined);

    setLocaleFilter('');
    // setFilters(defaultFilters);
  }, []);
  const handleClearAllFilters = () => {
    handleFiltersChange({
      student_id: null,
      trainer_id: null,
      startDate: undefined,
      endDate: undefined,
    });
  };
  const renderFilters = (
    <Stack
      spacing={3}
      justifyContent="space-between"
      alignItems={{ xs: 'flex-end', sm: 'center' }}
      direction={{ xs: 'column', sm: 'row' }}
      sx={{ marginBottom: 3 }}
    >
      <Stack direction="row" spacing={1} flexShrink={0}>
        <PermissionFilter
          open={openFilters.value}
          onOpen={openFilters.onTrue}
          onClose={openFilters.onFalse}
          handleOrderChange={handleOrderChange}
          selectedOrder={selectedOrder}
          filters={filters}
          setFilters={setFilters}
          onFilters={handleFiltersChange}
          startDate={startDate}
          endDate={endDate}
          setStartDate={setStartDate}
          setEndDate={setEndDate}
          // canReset={canReset}
          onResetFilters={handleResetFilters}
          localeOptions={localeOptions}
          onLocaleChange={handleLocaleFilterChange}
        />
      </Stack>
    </Stack>
  );

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading={t('permissions_list')}
        links={[
          { name: t('dashboard'), href: paths.dashboard.root },
          {
            name: t('permission'),
            href: paths.dashboard.rolesAndPermission.permission,
            onClick: (event) => {
              setViewMode('table');
            },
          },
          { name: t('permissions_list') },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />
      {/* {renderFilters} */}
      {/* {Object.values(filters).some((value) => value) && (
        <Button
          variant="outlined"
          onClick={handleClearAllFilters}
          sx={{
            color: '#d32f2f',
            borderColor: '#d32f2f',
            marginBottom: 2,
            ml: 2,
          }}
        >
          Clear All
        </Button>
      )} */}

      <Card>
        <Stack
          direction="row"
          justifyContent="flex-end"
          alignItems="center"
          sx={{ px: 2, pt: 2, pb: 1, mb: 3 }}
        >
          <Button
            variant="contained"
            size="small"
            color="primary"
            onClick={() => router.push(paths.dashboard.rolesAndPermission.rolePermissionMapping)}
          >
            {t('view_mapped_list')}
          </Button>
          {/* <Button color="primary" variant="contained" endIcon={<AddIcon />} onClick={handleOpen}>
            Create New
          </Button> */}
        </Stack>

        {viewMode === 'table' && (
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
                />
                <TableBody>
                  {permissionsLoading
                    ? Array.from(new Array(5)).map((_, index) => (
                        <TableRow key={index}>
                          <TableCell colSpan={TABLE_HEAD?.length || 6}>
                            <Skeleton animation="wave" height={40} />
                          </TableCell>
                        </TableRow>
                      ))
                    : tableData?.map((row) => (
                        <PermissionTableRow
                          userType={user?.user?.user_type}
                          row={row}
                          selected={table.selected.includes(row.id)}
                          onSelectRow={() => handleRowClick(row)}
                          reload={revalidatePermissions}
                        />
                      ))}
                </TableBody>
              </Table>
            </Scrollbar>
          </TableContainer>
        )}

        {viewMode === 'table' && (
          <TablePaginationCustom
            count={permissionsTotalPages}
            page={table.page}
            rowsPerPage={table.rowsPerPage}
            onPageChange={table.onChangePage}
            onRowsPerPageChange={table.onChangeRowsPerPage}
            dense={table.dense}
            onChangeDense={table.onChangeDense}
          />
        )}
      </Card>
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>Create New Permission</DialogTitle>
        <DialogContent>
          <CreatePermission onClose={handleClose} reload={revalidatePermissions} />
        </DialogContent>
      </Dialog>
    </Container>
  );
}
