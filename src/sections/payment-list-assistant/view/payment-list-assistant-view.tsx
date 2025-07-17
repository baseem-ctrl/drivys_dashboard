import { useState, useEffect, useCallback } from 'react';
// @mui
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Tooltip from '@mui/material/Tooltip';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import IconButton from '@mui/material/IconButton';
import TableContainer from '@mui/material/TableContainer';
import { Box, Skeleton, Stack, TableCell, TableRow, Button, Tab, Tabs } from '@mui/material';

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
  getComparator,
} from 'src/components/table';
// types

import { useGetAllLanguage } from 'src/api/language';
import { useAuthContext } from 'src/auth/hooks';
import { useActiveLink } from 'src/routes/hooks/use-active-link';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'src/routes/hooks';
import PayoutFilter from '../payout-filters';
import { useGetPaymentList } from 'src/api/booking-assistant';
import PaymentRow from '../payment-assistant-row';

// ----------------------------------------------------------------------

// ----------------------------------------------------------------------

export default function PaymentAssistantView() {
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
  const isAwaitingBookingRoute = useActiveLink('dashboard/todo/awaiting-booking-request');

  const [currentTab, setCurrentTab] = useState('unapproved');

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setCurrentTab(newValue);
  };
  const TABLE_HEAD = [
    { id: 'assistant', label: t('assistant'), width: 200 },
    { id: 'payment_status', label: t('payment_status'), width: 200 },
    { id: 'amount', label: t('amount'), width: 200 },
    { id: 'remarks', label: t('remarks'), width: 200 },
    { id: 'payment_proof', label: t('payment_proof'), width: 200 },
    { id: 'action', label: '', width: 200 },
  ];
  const [filters, setFilters] = useState<{
    startDate?: string;
    endDate?: string;
    category_id?: any;
  }>({});

  const { payments, paymentListLoading, totalPaymentPages, revalidatePaymentList } =
    useGetPaymentList({
      page: table.page,
      limit: table.rowsPerPage,
      is_approved: isAwaitingBookingRoute ? 2 : currentTab === 'approved' ? 1 : 2,
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
    if (payments?.length) {
      setTableData(payments);
    } else {
      setTableData([]);
    }
  }, [payments]);

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
      <PayoutFilter
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
        heading={t('pending_booking_requests')}
        links={[
          { name: t('dashboard'), href: paths.dashboard.root },
          {
            name: t('booking'),
            href: paths.dashboard.assistant.student.list,
          },
          { name: t('list') },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />
      {/* {renderFilters} */}
      {!isAwaitingBookingRoute && (
        <Box sx={{ mb: 3 }}>
          <Tabs value={currentTab} onChange={handleTabChange}>
            <Tab label={t('pending')} value="unapproved" />
            <Tab label={t('approved')} value="approved" />
          </Tabs>
        </Box>
      )}

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
                  rowCount={tableData?.length}
                  numSelected={table.selected.length}
                  onSort={table.onSort}
                  // onSelectAllRows={(checked) =>
                  //   table.onSelectAllRows(checked, tableData?.map((row) => row.id))
                  // }
                />
                <TableBody>
                  {paymentListLoading ? (
                    Array.from(new Array(5)).map((_, index) => (
                      <TableRow key={index}>
                        <TableCell colSpan={TABLE_HEAD?.length || 6}>
                          <Skeleton animation="wave" height={40} />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : tableData?.length > 0 ? (
                    [...tableData]
                      .sort(getComparator(table.order, table.orderBy))
                      .map((row) => (
                        <PaymentRow key={row.id} row={row} reload={revalidatePaymentList} />
                      ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={TABLE_HEAD?.length || 6} align="center" sx={{ py: 5 }}>
                        {t('No data available')}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Scrollbar>
          </TableContainer>
        )}

        {viewMode === 'table' && (
          <TablePaginationCustom
            count={totalPaymentPages}
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
