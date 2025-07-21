import { useState, useEffect, useCallback } from 'react';

// @mui
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Tooltip from '@mui/material/Tooltip';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import IconButton from '@mui/material/IconButton';
import TableContainer from '@mui/material/TableContainer';
import { Box, Button, Skeleton, Stack, TableCell, TableRow } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';

// routes
import { paths } from 'src/routes/paths';
import { useTranslation } from 'react-i18next';

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
  getComparator,
} from 'src/components/table';
// types

import { useGetAllLanguage } from 'src/api/language';
import { useAuthContext } from 'src/auth/hooks';
import { useGetBookingReports } from 'src/api/reportPreview';
import ReportBookingRow from '../booking-report-table-row';
import BookingReportFilter from '../booking-report-filters';
import { useGetBookingReportsDownload } from 'src/api/reportDownload';

// ----------------------------------------------------------------------

// ----------------------------------------------------------------------

export default function BookingReportListView() {
  const { user } = useAuthContext();
  const table = useTable({ defaultRowsPerPage: 15 });
  const settings = useSettingsContext();
  const confirm = useBoolean();
  const openFilters = useBoolean();
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

  const [selectedOrder, setSelectedOrder] = useState(undefined);
  const { i18n, t } = useTranslation();
  const TABLE_HEAD = [
    { id: 'School Name', label: t('school'), width: 200 },
    { id: 'Total Number of Paid Bookings', label: t('total_bookings'), width: 200 },
    { id: 'Total Number of Students', label: t('total_students'), width: 200 },
    { id: 'Total Number of Active Trainers', label: t('total_trainers'), width: 200 },
    { id: 'Total Number of Paid Bookings', label: t('total_paid_booking_sessions'), width: 200 },
    { id: 'Total Number of Completed Bookings', label: t('completed_sessions'), width: 200 },
  ];

  const locale = i18n.language;
  const [startDate, setStartDate] = useState<string | undefined>(undefined);
  const [endDate, setEndDate] = useState<string | undefined>(undefined);

  const {
    bookingReports,
    bookingReportsLoading,
    bookingReportsError,
    revalidateBookingReports,
    totalRecords,
  } = useGetBookingReports(
    filters.startDate,
    filters.endDate,
    table.page + 1,
    table.rowsPerPage,
    filters.booking_status,
    filters.payment_method,
    filters.category_id
  );

  const handleFiltersChange = (newFilters: any) => {
    setFilters(newFilters);
  };
  const { language } = useGetAllLanguage(0, 1000);
  const localeOptions = (language || []).map((lang) => ({
    value: lang.language_culture,
    label: lang.name,
  }));
  useEffect(() => {
    if (bookingReports?.length) {
      setTableData(bookingReports);
    } else {
      setTableData([]);
    }
  }, [bookingReports]);

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
        locale,
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
        `${import.meta.env.VITE_HOST_API}/admin/reports/bookings?${queryParams}`,
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
        <BookingReportFilter
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
        heading={t('booking_report_list')}
        links={[
          { name: t('dashboard'), href: paths.dashboard.root },
          {
            name: t('report'),
            href: paths.dashboard.report.booking,
            onClick: (event) => {
              setViewMode('table');
            },
          },
          { name: t('booking') },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />
      {renderFilters}
      {Object.values(filters).some((value) => value) && (
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
          {t('clear_all')}
        </Button>
      )}

      <Card>
        {viewMode === 'table' && (
          <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
            <Box style={{ display: 'flex', justifyContent: 'flex-end' }}>
              {bookingReports && bookingReports?.length > 0 && (
                <Button
                  variant="outlined"
                  onClick={handleDownloadClick}
                  sx={{
                    color: '#d32f2f',
                    borderColor: '#d32f2f',
                    marginBottom: 2,
                    mr: 3,
                    mt: 3,
                  }}
                  startIcon={<DownloadIcon />}
                >
                  {t('download')}
                </Button>
              )}
            </Box>

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
                <Tooltip title={t('delete')}>
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
                />
                <TableBody>
                  {bookingReportsLoading
                    ? Array.from(new Array(5)).map((_, index) => (
                        <TableRow key={index}>
                          <TableCell colSpan={TABLE_HEAD?.length || 6}>
                            <Skeleton animation="wave" height={40} />
                          </TableCell>
                        </TableRow>
                      ))
                    : [...(tableData || [])]
                        .sort(getComparator(table.order, table.orderBy))
                        .map((row) => (
                          <ReportBookingRow
                            userType={user?.user?.user_type}
                            row={row}
                            selected={table.selected.includes(row.id)}
                            onSelectRow={() => handleRowClick(row)}
                            reload={revalidateBookingReports}
                          />
                        ))}
                </TableBody>
              </Table>
            </Scrollbar>
          </TableContainer>
        )}

        {viewMode === 'table' && (
          <TablePaginationCustom
            count={totalRecords}
            page={table.page}
            rowsPerPage={table.rowsPerPage}
            onPageChange={table.onChangePage}
            onRowsPerPageChange={table.onChangeRowsPerPage}
            dense={table.dense}
            onChangeDense={table.onChangeDense}
          />
        )}
      </Card>
    </Container>
  );
}
