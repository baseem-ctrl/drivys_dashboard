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
import { useGetRevenueReportsDownload } from 'src/api/reportDownload';

import {
  useTable,
  TableHeadCustom,
  TableSelectedAction,
  TablePaginationCustom,
} from 'src/components/table';
// types

import { useGetAllLanguage } from 'src/api/language';
import { useAuthContext } from 'src/auth/hooks';
import { useGetBookingReports, useGetRevenueReports } from 'src/api/reportPreview';
import { useTranslation } from 'react-i18next';
import { useGetStudentList } from 'src/api/assistant';
import { useRouter } from 'src/routes/hooks';
import { useGetCommissionList, useGetPayoutList } from 'src/api/booking-assistant';
import CommissionRow from '../commission-table-row';
import CommissionFilter from '../commission-filters';

// ----------------------------------------------------------------------

export default function CommissionListView() {
  const { user } = useAuthContext();
  const router = useRouter();
  const table = useTable({ defaultRowsPerPage: 15 });
  const settings = useSettingsContext();
  const confirm = useBoolean();
  const openFilters = useBoolean();
  const [tableData, setTableData] = useState<any>([]);
  const [viewMode, setViewMode] = useState('table');
  const [localeFilter, setLocaleFilter] = useState('');

  const [selectedOrder, setSelectedOrder] = useState(undefined);
  const { i18n, t } = useTranslation();
  const locale = i18n.language;
  const [startDate, setStartDate] = useState<string | undefined>(undefined);
  const [endDate, setEndDate] = useState<string | undefined>(undefined);
  const [filters, setFilters] = useState<{
    startDate?: string;
    endDate?: string;
    category_id?: any;
  }>({});
  const TABLE_HEAD = [
    { id: 'assistant', label: t('assistant'), width: 200 },
    { id: 'user', label: t('student'), width: 200 },
    { id: 'trainer', label: t('trainer'), width: 200 },
    { id: 'status', label: t('booking_status'), width: 200 },
    { id: 'status', label: t('driver_status'), width: 200 },
    { id: 'amount', label: t('amount'), width: 200 },
    { id: 'remarks', label: t('remarks'), width: 200 },
  ];
  const { commissions, commissionListLoading, totalCommissionPages } = useGetCommissionList({
    page: table.page,
    limit: table.rowsPerPage,
  });
  const handleFiltersChange = (newFilters: any) => {
    setFilters(newFilters);
  };
  const { language } = useGetAllLanguage(0, 1000);

  const localeOptions = (language || []).map((lang) => ({
    value: lang.language_culture,
    label: lang.name,
  }));
  useEffect(() => {
    if (commissions?.length) {
      setTableData(commissions);
    } else {
      setTableData([]);
    }
  }, [commissions]);

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
      direction={{ xs: 'column', sm: 'row' }}
      sx={{ marginBottom: 3 }}
    >
      <CommissionFilter
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
        heading={t('commission')}
        links={[
          { name: t('dashboard'), href: paths.dashboard.root },
          {
            name: t('commission'),
            href: paths.dashboard.assistant.commission.list,
          },
          { name: t('list') },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />
      {/* {renderFilters} */}

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
                  {commissionListLoading
                    ? Array.from(new Array(5)).map((_, index) => (
                        <TableRow key={index}>
                          <TableCell colSpan={TABLE_HEAD?.length || 6}>
                            <Skeleton animation="wave" height={40} />
                          </TableCell>
                        </TableRow>
                      ))
                    : tableData?.map((row) => <CommissionRow row={row} />)}
                </TableBody>
              </Table>
            </Scrollbar>
          </TableContainer>
        )}

        {viewMode === 'table' && (
          <TablePaginationCustom
            count={totalCommissionPages}
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
