import { useState, useCallback, useEffect } from 'react';
import { alpha } from '@mui/material/styles';
import isEqual from 'lodash/isEqual';
import { STATUS_OPTIONS } from 'src/_mock/_school';
import { _roles, ACTIVE_OPTIONS } from 'src/_mock';

import {
  Container,
  Card,
  Tabs,
  Tab,
  Button,
  Table,
  TableBody,
  TableContainer,
  IconButton,
  Tooltip,
  CircularProgress,
  Skeleton,
  TableCell,
  TableRow,
  Typography,
  Box,
} from '@mui/material';
import { useSnackbar } from 'src/components/snackbar';
import Iconify from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import Scrollbar from 'src/components/scrollbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import {
  useTable,
  TableNoData,
  TableEmptyRows,
  TableHeadCustom,
  TableSelectedAction,
  TablePaginationCustom,
} from 'src/components/table';
// import BookingTableToolbar from '../booking-table-toolbar';
import BookingDetailsToolbar from '../booking-details-toolbar';
import { useGetBookings, useGetBookingStatusEnum } from 'src/api/booking';
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import BookingTableRow from '../booking-table-row';
import BookingTableToolbar from '../booking-table-tool-bar';
import { useGetUsers } from 'src/api/users';
import BookingDetailsComponent from './booking-details-view';
import BookingFilters from '../booking-filter';

const TABLE_HEAD = {
  all: [
    { id: 'customerName', label: 'Student Name', width: 180 },
    { id: 'vendorName', label: 'Trainer Name', width: 180 },
    { id: 'orderStatus', label: 'Booking Status', width: 150 },
    { id: 'paymentStatus', label: 'Payment Status', width: 150 },
    { id: 'price', label: 'Price', width: 120 },
    { id: 'paymentMethod', label: 'Payment Method', width: 150 },
    { id: 'coupon', label: 'Coupon', width: 200 },
    { id: 'created', label: 'Created', width: 200 },
  ],
  confirmed: [
    { id: 'customerName', label: 'Student Name', width: 180 },
    { id: 'vendorName', label: 'Trainer Name', width: 180 },
    { id: 'orderStatus', label: 'Booking Status', width: 150 },
    { id: 'paymentStatus', label: 'Payment Status', width: 150 },
    { id: 'price', label: 'Price', width: 120 },
    { id: 'paymentMethod', label: 'Payment Method', width: 150 },
    { id: 'coupon', label: 'Coupon', width: 200 },
    { id: 'created', label: 'Created', width: 200 },
  ],
  cancelled: [
    { id: 'customerName', label: 'Student Name', width: 180 },
    { id: 'vendorName', label: 'Trainer Name', width: 180 },
    { id: 'orderStatus', label: 'Booking Status', width: 150 },
    { id: 'paymentStatus', label: 'Payment Status', width: 150 },
    { id: 'price', label: 'Price', width: 120 },
    { id: 'paymentMethod', label: 'Payment Method', width: 150 },
    { id: 'coupon', label: 'Coupon', width: 200 },
    { id: 'created', label: 'Created', width: 200 },
  ],
  pending: [
    { id: 'customerName', label: 'Student Name', width: 180 },
    { id: 'vendorName', label: 'Trainer Name', width: 180 },
    { id: 'orderStatus', label: 'Booking Status', width: 150 },
    { id: 'paymentStatus', label: 'Payment Status', width: 150 },
    { id: 'price', label: 'Price', width: 120 },
    { id: 'paymentMethod', label: 'Payment Method', width: 150 },
    { id: 'coupon', label: 'Coupon', width: 200 },
    { id: 'created', label: 'Created', width: 200 },
  ],
};

const defaultFilters = {
  customerName: '',
  status: '',
  bookingType: 'all',
  paymentStatus: '',
  vendor: '',
  payment_status: '',
  payment_method: '',
  start_date: null,
  end_date: null,
};

export default function BookingListView() {
  const table = useTable({ defaultRowsPerPage: 15, defaultOrderBy: 'id', defaultOrder: 'desc' });
  const { bookingStatusEnum, bookingStatusError, bookingStatusLoading } = useGetBookingStatusEnum();
  const openFilters = useBoolean();

  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();
  const [tableData, setTableData] = useState([]);
  const [filters, setFilters] = useState(defaultFilters);
  const confirm = useBoolean();

  const { bookings, bookingsLoading, revalidateBookings, totalCount } = useGetBookings({
    page: table.page,
    limit: table.rowsPerPage,
    booking_status: filters.bookingType,
    search: filters.search,
    payment_status: filters.payment_status,
    payment_method: filters.payment_method,
    driver_id: filters.vendor,
    start_date: filters.start_date,
    end_date: filters.end_date,
  });

  const [searchValue, setSearchValue] = useState('');
  const { users, usersLoading } = useGetUsers({
    page: 0,
    limit: 10,
    user_types: 'TRAINER',
    search: searchValue,
  });
  const [bookingCounts, setBookingCounts] = useState({
    all: 0,
    PENDING: 0,
    CONFIRMED: 0,
    CANCELLED: 0,
    COMPLETED: 0,
    IN_PROGRESS: 0,
  });

  useEffect(() => {
    if (bookings.booking_status_counts) {
      const initialCounts = { all: 0 };

      // Initialize counts for all statuses
      bookingStatusEnum.forEach((status) => {
        initialCounts[status.name] = 0; // Use `status.name` as the key
      });

      // Update counts based on booking_status_counts
      Object.keys(bookings.booking_status_counts).forEach((statusKey) => {
        const statusCount = bookings.booking_status_counts[statusKey] || 0;

        // Find the corresponding `status.name` from bookingStatusEnum
        const matchingStatus = bookingStatusEnum.find(
          (status) => status.name.replace(/\s+/g, '_').toUpperCase() === statusKey
        );

        if (matchingStatus) {
          initialCounts[matchingStatus.name] = statusCount;
          initialCounts.all += statusCount;
        }
      });

      setBookingCounts(initialCounts);
    }
  }, [bookings.booking_status_counts, bookingStatusEnum]);

  const vendorOptions = usersLoading
    ? [{ label: 'Loading...', value: '' }]
    : users.map((user) => ({
        label: user.name,
        value: user.id,
      }));
  useEffect(() => {
    if (bookings?.bookings?.length > 0) {
      setTableData(bookings.bookings);
    } else {
      setTableData([]);
    }
  }, [bookings]);
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

  const handleTabChange = useCallback(
    (event, newValue) => {
      handleFilters('bookingType', newValue);
    },
    [handleFilters]
  );

  const currentTableHeaders = (() => {
    switch (filters.bookingType) {
      case 'confirmed':
        return TABLE_HEAD.confirmed;
      case 'cancelled':
        return TABLE_HEAD.cancelled;
      case 'pending':
        return TABLE_HEAD.pending;
      default:
        return TABLE_HEAD.all;
    }
  })();

  const handleClear = (name) => () => {
    handleFilters(name, '');
  };

  const tabBackgroundColors = {
    all: '#49525b',
    0: '#ffab0029',
    1: '#8e33ff29',
    2: '#ffe4de',
    3: '#dbf6e5',
    4: '#d3f2f7',
  };
  const tabTextColors = {
    all: '#ffff',
    pending: '#212b36',
    confirmed: '#4ca97e',
    cancelled: '#ce605b',
  };

  const handleRowClick = (row: any) => {
    router.push(paths.dashboard.booking.details(row?.id));
  };
  const canReset = !isEqual(defaultFilters, filters);
  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);
  return (
    <Container maxWidth="xl">
      <CustomBreadcrumbs
        heading="Bookings"
        links={[
          { name: 'Dashboard', href: paths.dashboard.booking.root },
          { name: 'Booking', href: paths.dashboard.booking.root },
          { name: 'List' },
        ]}
        sx={{ mb: 3 }}
      />
      <Box display="flex" justifyContent="flex-end" padding={2}>
        <BookingFilters
          open={openFilters.value}
          onOpen={openFilters.onTrue}
          onClose={openFilters.onFalse}
          filters={filters}
          onFilters={handleFilters}
          canReset={canReset}
          onResetFilters={handleResetFilters}
          statusOptions={STATUS_OPTIONS}
          activeOptions={ACTIVE_OPTIONS}
        />
      </Box>

      <Card>
        <Tabs
          value={filters.bookingType}
          onChange={handleTabChange}
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          <Tab
            value="all"
            label={
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span>All</span>
                <Typography
                  sx={{
                    backgroundColor: '#f0f0f0',
                    display: 'inline-block',
                    padding: '4px 9px',
                    borderRadius: '4px',
                    marginLeft: '8px',
                    color: '#000',
                  }}
                >
                  {bookingCounts.all || 0}
                </Typography>
              </div>
            }
            sx={{
              display: 'flex',
              alignItems: 'center',
              padding: '8px',
              borderRadius: '4px',
            }}
          />
          {bookingStatusEnum.map((tab) => {
            const count = bookingCounts[tab.name] || 0;
            const backgroundColor = tabBackgroundColors[tab.value] || '#fff';
            const textColor = tabTextColors[tab.value] || '#000';

            return (
              <Tab
                key={tab.value}
                value={tab.value}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '8px',
                  borderRadius: '4px',
                }}
                label={
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span>{tab.name}</span>
                    <Typography
                      sx={{
                        backgroundColor: backgroundColor,
                        display: 'inline-block',
                        padding: '4px 9px',
                        borderRadius: '4px',
                        marginLeft: '8px',
                        color: textColor,
                      }}
                    >
                      {count}
                    </Typography>
                  </div>
                }
              />
            );
          })}
        </Tabs>

        <BookingTableToolbar
          filters={filters}
          onFilters={handleFilters}
          vendorOptions={users}
          setSearch={setSearchValue}
          loading={usersLoading}
        />
        <Box display="flex" flexDirection="row" gap={1} marginBottom={4} marginLeft={2}>
          {filters.paymentStatus && (
            <Box display="flex" flexDirection="row" alignItems="center">
              <Typography variant="body2">{`Payment Status: ${filters.paymentStatus}`}</Typography>
              <IconButton size="small" onClick={handleClear('paymentStatus')}>
                <Iconify icon="mdi:close" />
              </IconButton>
            </Box>
          )}
          {filters.vendor && (
            <Box display="flex" alignItems="center">
              <Typography variant="body2">{`Vendor: ${vendorOptions.find(
                (v) => v.value === filters.vendor
              )?.label}`}</Typography>
              <IconButton size="small" onClick={handleClear('vendor')}>
                <Iconify icon="mdi:close" />
              </IconButton>
            </Box>
          )}
        </Box>
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
                {bookingsLoading &&
                  Array.from(new Array(5)).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell colSpan={currentTableHeaders.length}>
                        <Skeleton animation="wave" height={40} />
                      </TableCell>
                    </TableRow>
                  ))}

                {!bookingsLoading &&
                  tableData.length > 0 &&
                  tableData.map((row) => (
                    <BookingTableRow
                      key={row.id}
                      row={row}
                      selected={table.selected.includes(row.id)}
                      onSelectRow={() => handleRowClick(row)}
                      // onDeleteRow={() => handleDeleteRow(row.id)}
                      // onEditRow={() => handleEditRow(row.id)}
                    />
                  ))}

                {!bookingsLoading && tableData.length === 0 && (
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
        </TableContainer>

        <TablePaginationCustom
          count={totalCount}
          page={table.page}
          rowsPerPage={table.rowsPerPage}
          onPageChange={table.onChangePage}
          onRowsPerPageChange={table.onChangeRowsPerPage}
          dense={table.dense}
          onChangeDense={table.onChangeDense}
        />
      </Card>
    </Container>
  );
}
