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
import { useGetRevenueReports, useGetTrainerReports } from 'src/api/reportPreview';
import { useGetTrainerReportsDownload } from 'src/api/reportDownload';

import TrainerReportRow from '../trainer-report-table-row';
import TrainerReportFilter from '../trainer-report-filters';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'trainer-name', label: 'Trainer', width: 200 },
  { id: 'cancellation-rate', label: 'Cancellation Rate', width: 200 },
  { id: 'total-sessions', label: 'Total Session', width: 200 },
  { id: 'avg-rating', label: 'Average Rating', width: 200 },
];

// ----------------------------------------------------------------------

export default function TrainerReportListView() {
  const { user } = useAuthContext();
  const table = useTable({ defaultRowsPerPage: 15 });
  const settings = useSettingsContext();
  const confirm = useBoolean();
  const openFilters = useBoolean();
  const [tableData, setTableData] = useState<any>([]);
  const [viewMode, setViewMode] = useState('table');
  const [localeFilter, setLocaleFilter] = useState('');
  const [filters, setFilters] = useState({
    city_id: null,
    trainer_id: null,
    startDate: null,
    endDate: null,
  });

  const [selectedOrder, setSelectedOrder] = useState(undefined);
  const [locale, setLocale] = useState<string | undefined>(undefined);

  const {
    trainerReports,
    trainerReportsLoading,
    trainerReportsError,
    revalidateTrainerReports,
    totalRecords,
  } = useGetTrainerReports(
    locale,
    filters.startDate,
    filters.endDate,
    table.page + 1,
    table.rowsPerPage,
    filters.city_id,
    filters.trainer_id
  );
  const {
    trainerReports: downloadReportsData,
    revalidateTrainerReports: revalidateDownloadReports,
    trainerReportsLoading: downloadReportsLoading,
  } = useGetTrainerReportsDownload(
    locale,
    filters.startDate,
    filters.endDate,
    table.page + 1,
    table.rowsPerPage,
    filters.city_id,
    filters.trainer_id
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
      link.download = 'trainer_report.csv';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error in downloading report:', error);
    }
  };

  const handleFiltersChange = (newFilters: any) => {
    setFilters(newFilters);
  };
  const { language } = useGetAllLanguage(0, 1000);

  const localeOptions = (language || []).map((lang) => ({
    value: lang.language_culture,
    label: lang.name,
  }));
  useEffect(() => {
    if (trainerReports?.length) {
      setTableData(trainerReports);
    } else {
      setTableData([]);
    }
  }, [trainerReports]);

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
    setFilters({
      city_id: null,
      trainer_id: null,
    });
  }, []);

  const renderFilters = (
    <Stack
      spacing={3}
      justifyContent="space-between"
      alignItems={{ xs: 'flex-end', sm: 'center' }}
      direction={{ xs: 'column', sm: 'row' }}
      sx={{ marginBottom: 3 }}
    >
      <Stack direction="row" spacing={1} flexShrink={0}>
        <TrainerReportFilter
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
    </Stack>
  );
  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Trainer Report List"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          {
            name: 'Report',
            href: paths.dashboard.report.booking,
            onClick: (event) => {
              setViewMode('table');
            },
          },
          { name: 'Trainer Report' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />
      {renderFilters}

      {Object.values(filters).some((value) => value) && (
        <Button
          variant="outlined"
          color="primary"
          onClick={handleResetFilters}
          sx={{ mb: 2, ml: 2 }}
        >
          Clear Filters
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
                  {trainerReportsLoading
                    ? Array.from(new Array(5)).map((_, index) => (
                        <TableRow key={index}>
                          <TableCell colSpan={TABLE_HEAD?.length || 6}>
                            <Skeleton animation="wave" height={40} />
                          </TableCell>
                        </TableRow>
                      ))
                    : tableData?.map((row) => (
                        <TrainerReportRow
                          userType={user?.user?.user_type}
                          row={row}
                          selected={table.selected.includes(row.id)}
                          onSelectRow={() => handleRowClick(row)}
                          reload={revalidateTrainerReports}
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
