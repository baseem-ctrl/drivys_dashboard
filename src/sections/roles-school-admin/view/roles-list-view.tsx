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
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Skeleton,
  Stack,
  TableCell,
  TableRow,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

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
import { useGetBookingReports } from 'src/api/reportPreview';
import { useGetBookingReportsDownload } from 'src/api/reportDownload';
import RolesFilter from '../roles-filters';
import RolesTableRow from '../roles-table-row';
import { useGetRoles } from 'src/api/roles-and-permission';
import CreateRole from '../create-role';
import { useGetRolesBySchoolAdmin } from 'src/api/role-permission-school-admin';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'name', label: 'Role', width: 200 },
  { id: 'description', label: 'Description', width: 200 },
];

// ----------------------------------------------------------------------

export default function RolesListView() {
  const { user } = useAuthContext();
  const table = useTable({ defaultRowsPerPage: 15 });
  const settings = useSettingsContext();
  const confirm = useBoolean();
  const openFilters = useBoolean();
  const [tableData, setTableData] = useState<any>([]);
  const [viewMode, setViewMode] = useState('table');
  const [open, setOpen] = useState(false);
  const [localeFilter, setLocaleFilter] = useState('');
  const [filters, setFilters] = useState<{
    startDate?: string;
    endDate?: string;
    booking_status?: string;
    payment_method?: number;
    category_id?: any;
  }>({});

  const [selectedOrder, setSelectedOrder] = useState(undefined);
  const [locale, setLocale] = useState<string | undefined>(undefined);
  const [startDate, setStartDate] = useState<string | undefined>(undefined);
  const [endDate, setEndDate] = useState<string | undefined>(undefined);

  const { roles, rolesLoading, rolesError, rolesTotalPages, revalidateRoles } =
    useGetRolesBySchoolAdmin(table.page, table.rowsPerPage);

  const handleFiltersChange = (newFilters: any) => {
    setFilters(newFilters);
  };
  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };
  const { language } = useGetAllLanguage(0, 1000);
  const localeOptions = (language || []).map((lang) => ({
    value: lang.language_culture,
    label: lang.name,
  }));
  useEffect(() => {
    if (roles?.length) {
      setTableData(roles);
    } else {
      setTableData([]);
    }
  }, [roles]);

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

  const handleDownloadClick = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = {
        locale: locale,
        start_date: filters.startDate,
        end_date: filters.endDate,
        booking_status: filters.bookingStatus,
        payment_method: filters.paymentMethod,
        category_id: filters.category_id,
        page: table.page !== undefined ? (table.page + 1).toString() : '',
        limit: table.rowsPerPage !== undefined ? table.rowsPerPage.toString() : '',
      };

      const queryParams = new URLSearchParams(
        Object.fromEntries(Object.entries(params).filter(([_, value]) => value))
      ).toString();

      const response = await fetch(
        `${import.meta.env.VITE_HOST_API}admin/reports/bookings?${queryParams}`,
        {
          method: 'GET',
          headers: {
            Accept: 'text/csv',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to download CSV');
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'booking_report.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading CSV:', error);
    }
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
        <RolesFilter
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
        heading="Roles List"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          {
            name: 'Roles',
            href: paths.dashboard.rolesAndPermission.roles,
            onClick: (event) => {
              setViewMode('table');
            },
          },
          { name: 'Roles List' },
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
          <Button color="primary" variant="contained" endIcon={<AddIcon />} onClick={handleOpen}>
            Create New
          </Button>
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
                  {rolesLoading
                    ? Array.from(new Array(5)).map((_, index) => (
                        <TableRow key={index}>
                          <TableCell colSpan={TABLE_HEAD?.length || 6}>
                            <Skeleton animation="wave" height={40} />
                          </TableCell>
                        </TableRow>
                      ))
                    : tableData?.map((row) => (
                        <RolesTableRow
                          userType={user?.user?.user_type}
                          row={row}
                          selected={table.selected.includes(row.id)}
                          onSelectRow={() => handleRowClick(row)}
                        />
                      ))}
                </TableBody>
              </Table>
            </Scrollbar>
          </TableContainer>
        )}

        {viewMode === 'table' && (
          <TablePaginationCustom
            count={rolesTotalPages}
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
        <DialogTitle>Create New Role</DialogTitle>
        <DialogContent>
          <CreateRole onClose={handleClose} reload={revalidateRoles} />
        </DialogContent>
      </Dialog>
    </Container>
  );
}
