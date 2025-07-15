import { useState, useEffect, useCallback } from 'react';
// @mui
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Tooltip from '@mui/material/Tooltip';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import IconButton from '@mui/material/IconButton';
import TableContainer from '@mui/material/TableContainer';
import { Box, Skeleton, Stack, TableCell, TableRow, Button } from '@mui/material';
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
import { useGetRevenueReportsDownload } from 'src/api/reportDownload';

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
import { useGetBookingReports, useGetRevenueReports } from 'src/api/reportPreview';
import RevenueReportRow from '../revenue-report-table-row';
import RevenueReportFilter from '../revenue-report-filters';
import { useTranslation } from 'react-i18next';

// ----------------------------------------------------------------------

// ----------------------------------------------------------------------

export default function RevenueReportListView() {
  const { user } = useAuthContext();
  const table = useTable({ defaultRowsPerPage: 15 });
  const settings = useSettingsContext();
  const confirm = useBoolean();
  const openFilters = useBoolean();
  const [tableData, setTableData] = useState<any>([]);
  const [viewMode, setViewMode] = useState('table');
  const [localeFilter, setLocaleFilter] = useState('');

  const [selectedOrder, setSelectedOrder] = useState(undefined);
  const { i18n, t } = useTranslation();

  const TABLE_HEAD = [
    { id: 'School Name', label: t('school'), width: 200 },
    { id: 'Bookings Revenue By School', label: t('school_revenue'), width: 200 },
    { id: 'Total Number Of Bookings', label: t('total_bookings'), width: 200 },
    { id: 'Total Number Of Completed Bookings', label: t('completed_bookings'), width: 200 },
    { id: '', label: t('revenue_by_trainer'), width: 200 },
  ];

  const locale = i18n.language;
  const [startDate, setStartDate] = useState<string | undefined>(undefined);
  const [endDate, setEndDate] = useState<string | undefined>(undefined);
  const [filters, setFilters] = useState<{
    startDate?: string;
    endDate?: string;
    category_id?: any;
  }>({});
  const {
    revenueReports,
    revenueReportsLoading,
    revenueReportsError,
    revenueReportsValidating,
    totalRecords,
    revalidateRevenueReports,
  } = useGetRevenueReports(
    filters.startDate,
    filters.endDate,
    filters.category_id,

    table.page + 1,
    table.rowsPerPage
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
    if (revenueReports?.length) {
      setTableData(revenueReports);
    } else {
      setTableData([]);
    }
  }, [revenueReports]);

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
        category_id: filters.category_id,
        page: table.page !== undefined ? (table.page + 1).toString() : '',
        limit: table.rowsPerPage !== undefined ? table.rowsPerPage.toString() : '',
      };

      const filteredParams = Object.fromEntries(
        Object.entries(params).filter(([_, value]) => value)
      );

      const queryParams = new URLSearchParams(filteredParams).toString();

      const response = await fetch(
        `${import.meta.env.VITE_HOST_API}admin/reports/revenue?${queryParams}`,
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
      a.download = 'revenue_report.csv';
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

  const renderFilters = (
    <Stack
      spacing={3}
      justifyContent="space-between"
      direction={{ xs: 'column', sm: 'row' }}
      sx={{ marginBottom: 3, marginTop: 3 }}
    >
      <RevenueReportFilter
        open={openFilters.value}
        onOpen={openFilters.onTrue}
        onClose={openFilters.onFalse}
        handleOrderChange={handleOrderChange}
        selectedOrder={selectedOrder}
        filters={filters}
        setFilters={setFilters}
        onFilters={handleFiltersChange}
        // canReset={canReset}
        onResetFilters={handleResetFilters}
        localeOptions={localeOptions}
        onLocaleChange={handleLocaleFilterChange}
      />
    </Stack>
  );
  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading={t('revenue_report_list')}
        links={[
          { name: t('dashboard'), href: paths.dashboard.root },
          {
            name: t('report'),
            href: paths.dashboard.report.booking,
            onClick: (event) => {
              setViewMode('table');
            },
          },
          { name: t('revenue_report') },
        ]}
      />

      {renderFilters}
      <Card>
        {viewMode === 'table' && (
          <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
            <Box style={{ display: 'flex', justifyContent: 'flex-end' }}>
              {revenueReports && revenueReports?.length > 0 && (
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
                  {revenueReportsLoading
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
                          <RevenueReportRow
                            userType={user?.user?.user_type}
                            row={row}
                            selected={table.selected.includes(row.id)}
                            onSelectRow={() => handleRowClick(row)}
                            reload={revalidateRevenueReports}
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
