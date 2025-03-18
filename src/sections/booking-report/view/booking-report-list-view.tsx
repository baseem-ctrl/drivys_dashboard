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
import ReportBookingRow from '../booking-report-table-row';
import BookingReportFilter from '../booking-report-filters';
import { useGetBookingReportsDownload } from 'src/api/reportDownload';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'school-name', label: 'School', width: 200 },
  { id: 'top-booking-times', label: 'Top Booking Times', width: 200 },
  { id: 'total-cancelled-session', label: 'Cancelled Sessions', width: 200 },
  { id: 'total-completed-session', label: 'Completed Sessions', width: 200 },
  { id: 'total-pending-session', label: 'Pending Sessions', width: 200 },
  { id: 'total-rescheduled-session', label: 'Rescheduled Sessions', width: 200 },
  { id: 'total-booked-session', label: 'Total Bookings', width: 200 },
];

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
  }>({});

  const [selectedOrder, setSelectedOrder] = useState(undefined);
  const [locale, setLocale] = useState<string | undefined>(undefined);
  const [startDate, setStartDate] = useState<string | undefined>(undefined);
  const [endDate, setEndDate] = useState<string | undefined>(undefined);

  const {
    bookingReports,
    bookingReportsLoading,
    bookingReportsError,
    revalidateBookingReports,
    totalRecords,
  } = useGetBookingReports(
    locale,
    filters.startDate,
    filters.endDate,
    table.page + 1,
    table.rowsPerPage,
    filters.booking_status,
    filters.payment_method
  );
  const {
    bookingReports: downloadReportsData,
    revalidateBookingReports: revalidateDownloadReports,
    bookingReportsLoading: downloadReportsLoading,
  } = useGetBookingReportsDownload(
    locale,
    filters.startDate,
    filters.endDate,
    table.page + 1,
    table.rowsPerPage,
    filters.booking_status,
    filters.payment_method
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
      if (downloadReportsLoading) {
        console.warn('Reports are still loading...');
        return;
      }

      if (!downloadReportsData || downloadReportsData.length === 0) {
        console.error('No valid CSV data available to download.');
        return;
      }

      const headers = Object.keys(downloadReportsData[0]).join(',');

      // Convert data to CSV format
      const csvRows = downloadReportsData.map((row) =>
        Object.values(row)
          .map((value) => `"${value}"`)
          .join(',')
      );

      const csvContent = [headers, ...csvRows].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'booking_report.csv';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error in downloading report:', error);
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
        heading="Booking Report List"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          {
            name: 'Report',
            href: paths.dashboard.report.booking,
            onClick: (event) => {
              setViewMode('table');
            },
          },
          { name: 'Booking Report' },
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
          Clear All
        </Button>
      )}

      <Card>
        {viewMode === 'table' && (
          <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
            <Box style={{ display: 'flex', justifyContent: 'flex-end' }}>
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
                Download
              </Button>
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
                  {bookingReportsLoading
                    ? Array.from(new Array(5)).map((_, index) => (
                        <TableRow key={index}>
                          <TableCell colSpan={TABLE_HEAD?.length || 6}>
                            <Skeleton animation="wave" height={40} />
                          </TableCell>
                        </TableRow>
                      ))
                    : tableData?.map((row) => (
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
