import { useState, useEffect, useCallback } from 'react';
// @mui
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Tooltip from '@mui/material/Tooltip';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import IconButton from '@mui/material/IconButton';
import TableContainer from '@mui/material/TableContainer';
import { Box, Skeleton, Stack, TableCell, TableRow } from '@mui/material';

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
import { useGetSchoolReports, useGetStudentReports } from 'src/api/reportPreview';

import SchoolReportsRow from '../school-report-table-row';
import SchoolReportFilter from '../school-report-filters';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'school-name', label: 'School Name', width: 200 },
  { id: 'bookings', label: 'Bookings Details', width: 200 },
  { id: 'revenue', label: 'Revenue', width: 200 },
  { id: 'trainers-count', label: 'Trainers Count', width: 200 },
  { id: 'avg-rating', label: 'Average Rating', width: 200 },
];

// ----------------------------------------------------------------------

export default function SchoolReportListView() {
  const { user } = useAuthContext();
  const table = useTable({ defaultRowsPerPage: 15 });
  const settings = useSettingsContext();
  const confirm = useBoolean();
  const openFilters = useBoolean();
  const [tableData, setTableData] = useState<any>([]);
  const [viewMode, setViewMode] = useState('table');
  const [localeFilter, setLocaleFilter] = useState('');
  const [filters, setFilters] = useState({
    student_id: null,
    trainer_id: null,
  });
  const [selectedOrder, setSelectedOrder] = useState(undefined);
  const [locale, setLocale] = useState<string | undefined>(undefined);
  const [startDate, setStartDate] = useState<string | undefined>(undefined);
  const [endDate, setEndDate] = useState<string | undefined>(undefined);

  const {
    schoolReports,
    schoolReportsLoading,
    schoolReportsError,
    revalidateSchoolReports,
    totalRecords,
  } = useGetSchoolReports(locale, startDate, endDate, table.page + 1, table.rowsPerPage);

  const handleFiltersChange = (newFilters: any) => {
    setFilters(newFilters);
  };
  const { language } = useGetAllLanguage(0, 1000);

  const localeOptions = (language || []).map((lang) => ({
    value: lang.language_culture,
    label: lang.name,
  }));
  useEffect(() => {
    if (schoolReports?.length) {
      setTableData(schoolReports);
    } else {
      setTableData([]);
    }
  }, [schoolReports]);

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
    setSelectedOrder(undefined);

    setLocaleFilter('');
    // setFilters(defaultFilters);
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
        <SchoolReportFilter
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
        heading="School Report List"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          {
            name: 'Report',
            href: paths.dashboard.report.booking,
            onClick: (event) => {
              setViewMode('table');
            },
          },
          { name: 'School Report' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />
      {renderFilters}
      <Card>
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
                  {schoolReportsLoading
                    ? Array.from(new Array(5)).map((_, index) => (
                        <TableRow key={index}>
                          <TableCell colSpan={TABLE_HEAD?.length || 6}>
                            <Skeleton animation="wave" height={40} />
                          </TableCell>
                        </TableRow>
                      ))
                    : tableData?.map((row) => (
                        <SchoolReportsRow
                          userType={user?.user?.user_type}
                          row={row}
                          selected={table.selected.includes(row.id)}
                          onSelectRow={() => handleRowClick(row)}
                          reload={revalidateSchoolReports}
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
