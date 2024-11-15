import { useState, useCallback, useEffect } from 'react';
import { alpha } from '@mui/material/styles';
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
import { useGetBookings } from 'src/api/booking';
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import BookingSchoolAdminTableRow from '../bookin-school-admin-table-row';
import BookingSchoolAdminTableToolbar from '../bookin-school-admin-table-tool-bar';
import { useGetUsers } from 'src/api/users';
import BookingSchoolAdminDetailsComponent from './booking-details-view';
import { useGetBookingsSchoolAdmin } from 'src/api/booking-school-admin';

const TABLE_HEAD = {
  all: [
    { id: 'customerName', label: 'Customer Name', width: 180 },
    { id: 'vendorName', label: 'Driver Name', width: 180 },
    { id: 'orderStatus', label: 'Booking Status', width: 150 },
    { id: 'paymentStatus', label: 'Payment Status', width: 150 },
    { id: 'price', label: 'Price', width: 120 },
    { id: 'paymentMethod', label: 'Payment Method', width: 150 },
    { id: 'coupon', label: 'Coupon', width: 200 },
    { id: 'created', label: 'Created', width: 200 },
  ],
  confirmed: [
    { id: 'customerName', label: 'Customer Name', width: 180 },
    { id: 'vendorName', label: 'Driver Name', width: 180 },
    { id: 'orderStatus', label: 'Booking Status', width: 150 },
    { id: 'paymentStatus', label: 'Payment Status', width: 150 },
    { id: 'price', label: 'Price', width: 120 },
    { id: 'paymentMethod', label: 'Payment Method', width: 150 },
    { id: 'coupon', label: 'Coupon', width: 200 },
    { id: 'created', label: 'Created', width: 200 },
  ],
  cancelled: [
    { id: 'customerName', label: 'Customer Name', width: 180 },
    { id: 'vendorName', label: 'Driver Name', width: 180 },
    { id: 'orderStatus', label: 'Booking Status', width: 150 },
    { id: 'paymentStatus', label: 'Payment Status', width: 150 },
    { id: 'price', label: 'Price', width: 120 },
    { id: 'paymentMethod', label: 'Payment Method', width: 150 },
    { id: 'coupon', label: 'Coupon', width: 200 },
    { id: 'created', label: 'Created', width: 200 },
  ],
  pending: [
    { id: 'customerName', label: 'Customer Name', width: 180 },
    { id: 'vendorName', label: 'Driver Name', width: 180 },
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
};

export default function BookingSchoolAdminListView() {
  const table = useTable({ defaultRowsPerPage: 15, defaultOrderBy: 'id', defaultOrder: 'desc' });

  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();

  const [tableData, setTableData] = useState([]);
  const [filters, setFilters] = useState(defaultFilters);
  // const [bookingTypeOptions, setBookingTypeOptions] = useState([]);
  const confirm = useBoolean();
  const bookingTypeOptions = [
    { value: 'all', label: 'ALL' },
    { value: 'pending', label: 'PENDING' },
    { value: 'confirmed', label: 'CONFIRMED' },
    { value: 'cancelled', label: 'CANCELLED' },
  ];
  const statusMap = {
    PENDING: 0,
    CONFIRMED: 1,
    CANCELLED: 2,
  };

  const paymentStatusCode = statusMap[filters.paymentStatus] ?? undefined;

  const bookingTypeMapping = {
    PENDING: 0,
    CONFIRMED: 1,
    CANCELLED: 2,
  };

  // Retrieve the mapped value, or use undefined if no match
  const bookingTypeValue = filters.bookingType
    ? bookingTypeMapping[filters.bookingType]
    : undefined;

  const { bookings, bookingsLoading, revalidateBookings, totalCount } = useGetBookingsSchoolAdmin({
    page: table.page + 1,
    limit: table.rowsPerPage,
    booking_type: bookingTypeValue,
    payment_status: paymentStatusCode,
    driver_id: filters.vendor,
  });
  // const { users, usersLoading } = useGetUsers({
  //   page: 0,
  //   limit: 1000,
  //   user_types: 'TRAINER',
  // });
  const [bookingCounts, setBookingCounts] = useState({
    all: 0,
    pending: 0,
    confirmed: 0,
    cancelled: 0,
  });

  useEffect(() => {
    if (bookings?.length > 0) {
      const counts = bookings.reduce(
        (acc, booking) => {
          const status = booking.booking_status.toLowerCase();
          acc.all += 1;

          if (acc[status] !== undefined) {
            acc[status] += 1;
          }

          return acc;
        },
        { all: 0, pending: 0, confirmed: 0, cancelled: 0 }
      );

      setBookingCounts(counts);
    }
  }, [bookings, filters.bookingType]);

  // const vendorOptions = usersLoading
  //   ? [{ label: 'Loading...', value: '' }]
  //   : users.map((user) => ({
  //       label: user.name,
  //       value: user.id,
  //     }));
  useEffect(() => {
    if (bookings?.length > 0) {
      setTableData(bookings);
    } else {
      setTableData([]);
    }
  }, [bookings]);
  useEffect(() => {
    if (bookings?.length > 0) {
      const filteredBookings =
        filters.bookingType === 'all'
          ? bookings
          : bookings.filter((booking) => {
              const isMatch = booking.booking_status === filters.bookingType.toUpperCase();

              return isMatch;
            });

      setTableData(filteredBookings);
    } else {
      console.log('No bookings available. Setting table data to empty.');
      setTableData([]);
    }
  }, [bookings, filters.bookingType]);

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
    pending: '#d3f2f7',
    confirmed: '#dbf6e5',
    cancelled: '#ffe4de',
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

  return (
    <Container maxWidth="xl">
      <CustomBreadcrumbs
        heading="Booking Orders List"
        links={[
          { name: 'Dashboard', href: paths.dashboard.booking.root },
          { name: 'Order', href: paths.dashboard.booking.root },
          { name: 'List' },
        ]}
        sx={{ mb: 3 }}
      />

      <Card>
        <Tabs
          value={filters.bookingType}
          onChange={handleTabChange}
          sx={{
            px: 2.5,
            marginBottom: 4,
            boxShadow: (theme) => `inset 0 -2px 0 0 ${alpha(theme.palette.grey[500], 0.08)}`,
            '& .MuiTabs-scroller': {
              overflow: 'hidden',
            },
            '& .MuiTabs-scrollButtons': {
              display: 'none',
            },
          }}
        >
          {bookingTypeOptions.map((tab) => {
            const count = bookingCounts[tab.value] || 0;
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
                    <span>{tab.label}</span>
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
        {/* <BookingSchoolAdminTableToolbar
          filters={filters}
          onFilters={handleFilters}
          // vendorOptions={vendorOptions}
        /> */}
        <Box display="flex" flexDirection="row" gap={1} marginBottom={4} marginLeft={2}>
          {filters.paymentStatus && (
            <Box display="flex" flexDirection="row" alignItems="center">
              <Typography variant="body2">{`Payment Status: ${filters.paymentStatus}`}</Typography>
              <IconButton size="small" onClick={handleClear('paymentStatus')}>
                <Iconify icon="mdi:close" />
              </IconButton>
            </Box>
          )}
          {/* {filters.vendor && (
            <Box display="flex" alignItems="center">
              <Typography variant="body2">{`Vendor: ${vendorOptions.find(
                (v) => v.value === filters.vendor
              )?.label}`}</Typography>
              <IconButton size="small" onClick={handleClear('vendor')}>
                <Iconify icon="mdi:close" />
              </IconButton>
            </Box>
          )} */}
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
                    <BookingSchoolAdminTableRow
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
