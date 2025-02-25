import { useState, useCallback, useEffect } from 'react';
import isEqual from 'lodash/isEqual';
import { FormControl, InputLabel, Select, MenuItem, Box } from '@mui/material';
import { useLocales } from 'src/locales';

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
} from 'src/components/table';
// import BookingTableToolbar from '../booking-table-toolbar';
import { useGetBookingStatusEnum } from 'src/api/booking';
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { useGetUsers } from 'src/api/users';
import { useGetRefundedList, useGetRefundRequestList } from 'src/api/refund';
import RefundTableRow from '../refund-table-row';
import RefundFilters from '../refund-filter';

const defaultFilters = {
  city_id: null,
  category_id: null,
  driver_id: null,
};

export default function PendingRefundListView({ table, filters, setFilters, searchValue }) {
  const [statusFilter, setStatusFilter] = useState('all');
  const { t } = useLocales();

  const { refundRequests, refundRequestLoading, revalidateRefundRequests, totalCount } =
    useGetRefundRequestList({
      page: table.page,
      limit: table.rowsPerPage,
      search: searchValue,
      status: statusFilter === 'all' ? ['pending', 'approved'] : statusFilter,
      // ...(filters?.category_id && { category_id: filters.category_id }),
      // ...(filters?.city_id && { city_id: filters.city_id }),
      // ...(filters?.driver_id && { driver_id: filters.driver_id }),
    });
  const openFilters = useBoolean();

  const [tableData, setTableData] = useState([]);
  const [refundedTableData, setRefundedTableData] = useState([]);

  const confirm = useBoolean();
  const TABLE_HEAD = [
    { id: 'customerName', label: t('customer_name'), width: 180 },
    { id: 'BookingId', label: t('booking_id'), width: 180 },
    { id: 'packages', label: t('package'), width: 180 },
    { id: 'orderStatus', label: t('booking_status'), width: 150 },
    { id: 'paymentStatus', label: t('payment_status'), width: 150 },
    { id: 'paid', label: t('amount_sanctioned'), width: 220 },
    { id: 'refunded', label: t('amount_to_refund'), width: 220 },
    { id: 'paymentMethod', label: t('payment_method'), width: 150 },
    { id: 'reason', label: t('reason'), width: 200 },
    { id: 'refundStatus', label: t('refund_status'), width: 250 },
    { id: 'created', label: t('created'), width: 200 },
  ];
  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  useEffect(() => {
    if (refundRequests?.length > 0) {
      setTableData(refundRequests);
    } else {
      setTableData([]);
    }
  }, [refundRequests]);
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

  const handleRowClick = (row: any) => {
    // router.push(paths.dashboard.booking.refundDetails(row?.id));
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
    <>
      <Box ml="auto" width={200}>
        <FormControl fullWidth variant="outlined" size="small">
          <InputLabel sx={{ mb: 0.5 }}>{t('status')}</InputLabel>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            label="Status"
            sx={{ pt: 1, pb: 1 }}
          >
            <MenuItem value="all">{t('all')}</MenuItem>
            <MenuItem value="pending">{t('pending')}</MenuItem>
            <MenuItem value="approved">{t('approved')}</MenuItem>
          </Select>
        </FormControl>
      </Box>
      <Card sx={{ mb: 5 }}>
        <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
          <Typography variant="h6" sx={{ m: 2 }}>
            {t('refund_requests')}
          </Typography>

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
                <IconButton onClick={confirm.onTrue}>
                  <Iconify icon="solar:trash-bin-trash-bold" />
                </IconButton>
              </Tooltip>
            }
          />

          <Scrollbar>
            <Table>
              <TableHeadCustom
                order={table.order}
                orderBy={table.orderBy}
                headLabel={TABLE_HEAD}
                rowCount={tableData.length}
                numSelected={table.selected.length}
                onSort={table.onSort}
              />
              <TableBody>
                {refundRequestLoading &&
                  Array.from(new Array(5)).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell colSpan={TABLE_HEAD.length}>
                        <Skeleton animation="wave" height={40} />
                      </TableCell>
                    </TableRow>
                  ))}

                {!refundRequestLoading &&
                  tableData.length > 0 &&
                  tableData.map((row) => (
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
                    <TableCell colSpan={TABLE_HEAD?.length} align="center">
                      <Typography variant="h6" color="textSecondary">
                        {t('no_data_available')}{' '}
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Scrollbar>
        </TableContainer>
        <TablePaginationCustom
          count={totalCount}
          page={table.page}
          rowsPerPage={table.rowsPerPage}
          onPageChange={table.onChangePage}
          onRowsPerPageChange={table.onChangeRowsPerPage}
        />
      </Card>
    </>
  );
}
