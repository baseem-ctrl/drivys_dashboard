import { useState, useCallback, useEffect } from 'react';
import isEqual from 'lodash/isEqual';
import { FormControl, InputLabel, Select, MenuItem, Box } from '@mui/material';

import {
  Container,
  Card,
  Table,
  TableBody,
  TableContainer,
  IconButton,
  Tooltip,
  Skeleton,
  TableCell,
  TableRow,
  Typography,
  Stack,
  Tabs,
  Tab,
} from '@mui/material';
import { useSnackbar } from 'src/components/snackbar';
import Iconify from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import Scrollbar from 'src/components/scrollbar';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import {
  useTable,
  TableHeadCustom,
  TableSelectedAction,
  TablePaginationCustom,
  getComparator,
} from 'src/components/table';
// import BookingTableToolbar from '../booking-table-toolbar';
import { useGetBookingStatusEnum } from 'src/api/booking';
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { useGetUsers } from 'src/api/users';
import { useGetRefundedList, useGetRefundRequestList } from 'src/api/refund';
import RefundTableRow from '../refund-table-row';
import RefundFilters from '../refund-filter';
import RefundedTableRow from '../refunded-table-row';
import { useTranslation } from 'react-i18next';

const defaultFilters = {
  city_id: null,
  category_id: null,
  driver_id: null,
};

export default function RefundListView() {
  const { t } = useTranslation();

  const TABLE_HEAD = {
    all: [
      { id: 'name', label: t('Customer Name'), width: 180 },
      { id: 'booking_id', label: t('Booking ID') },
      { id: 'packages', label: t('Package'), width: 180 },
      { id: 'orderStatus', label: t('Booking Status'), width: 150 },
      { id: 'paymentStatus', label: t('Payment Status'), width: 150 },
      { id: 'refund_amount_sanctioned', label: t('Amount Sanctioned'), width: 220 },
      { id: 'remaining_amount_to_refund', label: t('Amount to refund'), width: 220 },
      { id: 'paymentMethod', label: t('Payment Method'), width: 150 },
      { id: 'reason', label: t('Reason'), width: 200 },
      { id: 'refundStatus', label: t('Refund Status'), width: 250 },
      { id: 'created', label: t('Created'), width: 200 },
    ],
    refunded: [
      { id: 'name', label: t('Customer Name'), width: 180 },
      { id: 'booking_id', label: t('Booking ID') },
      { id: 'vendorName', label: t('Driver Name'), width: 180 },
      { id: 'packages', label: t('Package'), width: 180 },
      { id: 'orderStatus', label: t('Booking Status'), width: 150 },
      { id: 'paymentStatus', label: t('Payment Status'), width: 150 },
      { id: 'sub_total', label: t('Price'), width: 120 },
      { id: 'paymentMethod', label: t('Payment Method'), width: 150 },

      { id: 'reason', label: t('Reason'), width: 200 },
      { id: 'created', label: t('Created'), width: 200 },
    ],
  };

  const table = useTable({ defaultRowsPerPage: 5, defaultOrderBy: 'id', defaultOrder: 'desc' });

  const [filters, setFilters] = useState(defaultFilters);
  const [selectedTab, setSelectedTab] = useState(0);
  const [statusFilter, setStatusFilter] = useState('all');

  const tablePending = useTable({
    defaultRowsPerPage: 5,
    defaultCurrentPage: 0,
  });
  const tableApproved = useTable({
    defaultRowsPerPage: 5,
    defaultCurrentPage: 0,
  });
  const tableRefunded = useTable({
    defaultRowsPerPage: 5,
    defaultCurrentPage: 0,
  });
  const tableRejected = useTable({
    defaultRowsPerPage: 5,
    defaultCurrentPage: 0,
  });
  const { refundRequests, refundRequestLoading, revalidateRefundRequests, totalCount } =
    useGetRefundRequestList({
      page: tablePending.page,
      limit: tablePending.rowsPerPage,
      status: statusFilter === 'all' ? ['pending', 'approved'] : statusFilter,
      ...(filters?.category_id && { category_id: filters.category_id }),
      ...(filters?.city_id && { city_id: filters.city_id }),
      ...(filters?.driver_id && { driver_id: filters.driver_id }),
    });
  const {
    refundRequests: refundedRequests,
    revalidateRefundRequests: revalidateRefundedRequests,
    refundRequestLoading: refundedRequestLoading,
    totalCount: total,
  } = useGetRefundRequestList({
    page: tableApproved.page,
    limit: tableApproved.rowsPerPage,
    status: ['pending', 'approved'],
    ...(filters?.category_id && { category_id: filters.category_id }),
    ...(filters?.city_id && { city_id: filters.city_id }),
    ...(filters?.driver_id && { driver_id: filters.driver_id }),
  });

  const {
    refundRequests: rejectedRefundRequests,
    refundRequestLoading: rejectedRefundRequestLoading,
    totalCount: rejectedTotalCount,
    revalidateRefundRequests: revalidateRejectedRefundRequests,
  } = useGetRefundRequestList({
    page: tableRejected.page,
    limit: tableRejected.rowsPerPage,
    status: ['rejected'],
    ...(filters?.category_id && { category_id: filters.category_id }),
    ...(filters?.city_id && { city_id: filters.city_id }),
    ...(filters?.driver_id && { driver_id: filters.driver_id }),
  });

  const openFilters = useBoolean();
  const [tableData, setTableData] = useState([]);
  const [refundedTableData, setRefundedTableData] = useState([]);
  const {
    refundedRequests: refundedRequestsList,
    revalidateRefundedRequests: revalidateRefundedRequestsList,
    refundedRequestLoading: refundedRequestLoadingList,
    totalRefundedCount,
  } = useGetRefundedList({
    page: tableRefunded.page,
    limit: tableRefunded.rowsPerPage,
    ...(filters?.category_id && { category_id: filters.category_id }),
    ...(filters?.city_id && { city_id: filters.city_id }),
    ...(filters?.driver_id && { driver_id: filters.driver_id }),
  });
  const confirm = useBoolean();

  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);
  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
    revalidateRefundedRequests();
    revalidateRefundRequests();
    revalidateRefundedRequestsList();
  };
  useEffect(() => {
    if (refundRequests && refundRequests?.length > 0) {
      setTableData(refundRequests);
    } else {
      setTableData([]);
    }
  }, [refundRequests]);

  useEffect(() => {
    if (refundedRequestsList && refundedRequestsList.length > 0) {
      setRefundedTableData(refundedRequestsList);
    } else {
      setRefundedTableData([]);
    }
  }, [refundedRequestsList]);
  const handleFilters = useCallback(
    (name, value) => {
      table.onResetPage();
      setFilters((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    },
    [table]
  );

  const currentTableHeaders = (() => {
    switch (selectedTab) {
      case 0:
        return TABLE_HEAD.all;
      case 1:
        return TABLE_HEAD.refunded;
      case 2:
        return TABLE_HEAD.all;
      default:
        return TABLE_HEAD.all;
    }
  })();
  const handleRowClick = (row: any) => {
    // router.push(paths.dashboard.booking.refundDetails(row?.id));
  };
  const tabStyles = {
    fontWeight: 'bold',
    color: '#CF5A0D',
    padding: '8px 16px',
    borderRadius: '8px',
    textTransform: 'uppercase',
    '&.Mui-selected': {
      fontWeight: 'bold',
    },
  };
  const canReset = !isEqual(defaultFilters, filters);

  const renderFilters = (
    <Stack
      spacing={3}
      justifyContent="flex-end"
      alignItems={{ xs: 'flex-end', sm: 'center' }}
      direction={{ xs: 'column', sm: 'row' }}
      margin={3}
    >
      <Stack direction="row" spacing={1} flexShrink={0}>
        <RefundFilters
          open={openFilters.value}
          onOpen={openFilters.onTrue}
          onClose={openFilters.onFalse}
          //
          filters={filters}
          onFilters={handleFilters}
          //
          canReset={canReset}
          onResetFilters={handleResetFilters}
        />

        {/* <JobSort sort={sortBy} onSort={handleSortBy} sortOptions={JOB_SORT_OPTIONS} /> */}
      </Stack>
    </Stack>
  );
  return (
    <Container maxWidth="xl">
      <CustomBreadcrumbs
        heading={t('Refund List')}
        links={[
          { name: t('Dashboard'), href: paths.dashboard.root },
          { name: t('Refund'), href: paths.dashboard.booking.refund },
          { name: t('List') },
        ]}
        sx={{ mb: 3 }}
      />
      {renderFilters}
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Tabs
          value={selectedTab}
          onChange={handleTabChange}
          centered={false}
          variant="scrollable"
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            backgroundColor: 'background.paper',
          }}
        >
          {[t('Refund Requests'), t('Refunded Requests'), t('Rejected Requests')].map((label) => (
            <Tab key={label} sx={tabStyles} label={label} />
          ))}
        </Tabs>

        {selectedTab === 0 && (
          <Box ml="auto" width={200}>
            <FormControl fullWidth variant="outlined" size="small">
              <InputLabel sx={{ mb: 0.5 }}>{t('Status')}</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label={t('status')}
                sx={{ pt: 1, pb: 1 }}
              >
                <MenuItem value="all">{t('all')}</MenuItem>
                <MenuItem value="pending">{t('pending')}</MenuItem>
                <MenuItem value="approved">{t('approved')}</MenuItem>
              </Select>
            </FormControl>
          </Box>
        )}
      </Box>
      {selectedTab === 0 && (
        <Card sx={{ mb: 5 }}>
          <TableContainer sx={{ position: 'relative', overflow: 'unset', mt: 4 }}>
            {/* <Typography
              variant="h6"
              sx={{ mt: 4, mb: 5, textAlign: 'center', color: 'primary.main' }}
            >
              Pending Refund Requests
            </Typography> */}

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
                  <IconButton onClick={confirm.onTrue}>
                    <Iconify icon="solar:trash-bin-trash-bold" />
                  </IconButton>
                </Tooltip>
              }
            />

            <Scrollbar>
              <Table size={table.dense ? 'small' : 'medium'}>
                <TableHeadCustom
                  order={table.order}
                  orderBy={table.orderBy}
                  headLabel={currentTableHeaders}
                  rowCount={tableData.length}
                  numSelected={table.selected.length}
                  onSort={table.onSort}
                />
                <TableBody>
                  {refundRequestLoading &&
                    Array.from(new Array(5)).map((_, index) => (
                      <TableRow key={index}>
                        <TableCell colSpan={currentTableHeaders.length}>
                          <Skeleton animation="wave" height={40} />
                        </TableCell>
                      </TableRow>
                    ))}

                  {!refundRequestLoading &&
                    tableData.length > 0 &&
                    [...(tableData || [])]
                      .sort(getComparator(table.order, table.orderBy))
                      .map((row) => (
                        <RefundTableRow
                          key={row.id}
                          row={row}
                          selected={table.selected.includes(row.id)}
                          onSelectRow={() => handleRowClick(row)}
                          reload={revalidateRefundRequests}
                          // onDeleteRow={() => handleDeleteRow(row.id)}
                          // onEditRow={() => handleEditRow(row.id)}
                        />
                      ))}

                  {!refundRequestLoading && tableData.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={currentTableHeaders.length} align="center">
                        <Typography variant="h6" color="textSecondary">
                          {t('No data available')}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Scrollbar>
            <TablePaginationCustom
              count={totalCount}
              page={tablePending.page}
              rowsPerPage={tablePending.rowsPerPage}
              onPageChange={tablePending.onChangePage}
              onRowsPerPageChange={tablePending.onChangeRowsPerPage}
              dense={tablePending.dense}
              onChangeDense={tablePending.onChangeDense}
            />
          </TableContainer>
        </Card>
      )}
      {selectedTab === 1 && (
        <Card>
          <TableContainer sx={{ position: 'relative', overflow: 'unset', mt: 4 }}>
            {/* <Typography
              variant="h6"
              sx={{ mt: 4, mb: 5, textAlign: 'center', color: 'primary.main' }}
            >
              Refunded List
            </Typography> */}

            <TableSelectedAction
              dense={table.dense}
              numSelected={table.selected.length}
              rowCount={tableData.length}
              onSelectAllRows={(checked) =>
                table.onSelectAllRows(
                  checked,
                  refundedRequestsList.map((row) => row.id)
                )
              }
              action={
                <Tooltip title="Delete">
                  <IconButton onClick={confirm.onTrue}>
                    <Iconify icon="solar:trash-bin-trash-bold" />
                  </IconButton>
                </Tooltip>
              }
            />

            <Scrollbar>
              <Table size={table.dense ? 'small' : 'medium'}>
                <TableHeadCustom
                  order={table.order}
                  orderBy={table.orderBy}
                  headLabel={currentTableHeaders}
                  rowCount={refundedRequestsList.length}
                  numSelected={table.selected.length}
                  onSort={table.onSort}
                />
                <TableBody>
                  {refundedRequestLoadingList &&
                    Array.from(new Array(5)).map((_, index) => (
                      <TableRow key={index}>
                        <TableCell colSpan={currentTableHeaders.length}>
                          <Skeleton animation="wave" height={40} />
                        </TableCell>
                      </TableRow>
                    ))}

                  {refundedTableData.length > 0 &&
                    [...(refundedTableData || [])]
                      .sort(getComparator(table.order, table.orderBy))
                      .map((row) => (
                        <RefundedTableRow
                          key={row.id}
                          row={row}
                          selected={table.selected.includes(row.id)}
                          onSelectRow={() => handleRowClick(row)}
                          reload={revalidateRefundedRequestsList}
                          // onDeleteRow={() => handleDeleteRow(row.id)}
                          // onEditRow={() => handleEditRow(row.id)}
                        />
                      ))}

                  {refundedRequestsList.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={currentTableHeaders.length} align="center">
                        <Typography variant="h6" color="textSecondary">
                          No data available
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Scrollbar>
            <TablePaginationCustom
              count={totalRefundedCount}
              page={tableRefunded.page}
              rowsPerPage={tableRefunded.rowsPerPage}
              onPageChange={tableRefunded.onChangePage}
              onRowsPerPageChange={tableRefunded.onChangeRowsPerPage}
              dense={tableRefunded.dense}
              onChangeDense={tableRefunded.onChangeDense}
            />
          </TableContainer>
        </Card>
      )}
      {selectedTab === 2 && (
        <Card>
          <TableContainer sx={{ position: 'relative', overflow: 'unset', mt: 4 }}>
            <TableSelectedAction
              dense={table.dense}
              numSelected={table.selected.length}
              rowCount={rejectedRefundRequests.length}
              onSelectAllRows={(checked) =>
                table.onSelectAllRows(
                  checked,
                  rejectedRefundRequests.map((row) => row.id)
                )
              }
              action={
                <Tooltip title="Delete">
                  <IconButton onClick={confirm.onTrue}>
                    <Iconify icon="solar:trash-bin-trash-bold" />
                  </IconButton>
                </Tooltip>
              }
            />

            <Scrollbar>
              <Table size={table.dense ? 'small' : 'medium'}>
                <TableHeadCustom
                  order={table.order}
                  orderBy={table.orderBy}
                  headLabel={currentTableHeaders}
                  rowCount={rejectedRefundRequests.length}
                  numSelected={table.selected.length}
                  onSort={table.onSort}
                />
                <TableBody>
                  {rejectedRefundRequestLoading &&
                    Array.from(new Array(5)).map((_, index) => (
                      <TableRow key={index}>
                        <TableCell colSpan={currentTableHeaders.length}>
                          <Skeleton animation="wave" height={40} />
                        </TableCell>
                      </TableRow>
                    ))}

                  {!rejectedRefundRequestLoading &&
                    rejectedRefundRequests.length > 0 &&
                    rejectedRefundRequests.map((row) => (
                      <RefundTableRow
                        key={row.id}
                        row={row}
                        selected={table.selected.includes(row.id)}
                        onSelectRow={() => handleRowClick(row)}
                        reload={revalidateRejectedRefundRequests}
                      />
                    ))}

                  {!rejectedRefundRequestLoading && rejectedRefundRequests.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={currentTableHeaders.length} align="center">
                        <Typography variant="h6" color="textSecondary">
                          {t('No data available')}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Scrollbar>

            <TablePaginationCustom
              count={rejectedTotalCount}
              page={tableRejected.page}
              rowsPerPage={tableRejected.rowsPerPage}
              onPageChange={tableRejected.onChangePage}
              onRowsPerPageChange={tableRejected.onChangeRowsPerPage}
              dense={tableRejected.dense}
              onChangeDense={tableRejected.onChangeDense}
            />
          </TableContainer>
        </Card>
      )}
    </Container>
  );
}
