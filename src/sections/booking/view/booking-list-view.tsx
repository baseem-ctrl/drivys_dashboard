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
import BookingTableRow from '../booking-table-row';

const TABLE_HEAD = {
  all: [
    { id: 'customerName', label: 'Customer Name', width: 200 },
    { id: 'customerEmail', label: 'Email', width: 250 },
    { id: 'bookingDate', label: 'Booking Date', width: 180 },
    { id: 'status', label: 'Status', width: 100 },
    { id: 'paymentStatus', label: 'Payment Status', width: 150 },
    { id: 'totalAmount', label: 'Total Amount', width: 120 },
    { id: 'remarks', label: 'Remarks', width: 200 },
    { id: '', width: 88 },
  ],
  confirmed: [
    { id: 'customerName', label: 'Customer Name' },
    { id: 'customerEmail', label: 'Email' },
    { id: 'bookingDate', label: 'Booking Date' },
    { id: 'status', label: 'Status' },
    { id: 'payment', label: 'Payment' },
    { id: 'totalAmount', label: 'Total Amount' },
    { id: '', width: 88 },
  ],
};

const defaultFilters = {
  customerName: '',
  status: '',
  bookingType: 'all',
};

export default function BookingListView() {
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
    { value: 'awaitingPayment', label: 'AWAITING PAYMENT' },
    { value: 'awaitingConfirmation', label: 'AWAITING CONFIRMATION' },
    { value: 'complete', label: 'COMPLETE' },
    { value: 'cancelled', label: 'CANCELLED' },
    { value: 'expired', label: 'EXPIRED' },
  ];
  const { bookings, bookingsLoading, revalidateBookings } = useGetBookings({
    page: table.page,
    limit: table.rowsPerPage,
    booking_type: filters.bookingType,
    search: filters.customerName,
    status: filters.status,
  });
  console.log('bookings', bookings);
  useEffect(() => {
    if (bookings?.length > 0) {
      setTableData(bookings);
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

  const handleDeleteRow = async (id) => {
    // try {
    //   const response = await deleteBooking(id);
    //   if (response) {
    //     enqueueSnackbar(response.message);
    //     revalidateBookings();
    //   }
    // } catch (error) {
    //   enqueueSnackbar(error.message, { variant: 'error' });
    // }
  };

  const handleDeleteRows = useCallback(() => {
    const deleteRows = tableData.filter((row) => !table.selected.includes(row.id));
    setTableData(deleteRows);
  }, [tableData, table]);

  // const handleEditRow = useCallback(
  //   (id) => {
  //     router.push(paths.dashboard.booking.edit(id));
  //   },
  //   [router]
  // );

  const handleTabChange = useCallback(
    (event, newValue) => {
      handleFilters('bookingType', newValue);
    },
    [handleFilters]
  );

  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  const currentTableHeaders =
    filters.bookingType === 'confirmed' ? TABLE_HEAD.confirmed : TABLE_HEAD.all;

  return (
    <>
      <Container maxWidth="xl">
        <CustomBreadcrumbs
          heading="Booking List"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'Order', href: paths.dashboard.booking.list },
            { name: 'List' },
          ]}
          action={
            <Button
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
              onClick={() => router.push(paths.dashboard.booking.new)}
            >
              New Booking
            </Button>
          }
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
            }}
          >
            {bookingTypeOptions.map((tab) => (
              <Tab key={tab.value} value={tab.value} label={tab.label} />
            ))}
          </Tabs>

          {/* <BookingTableToolbar filters={filters} onFilters={handleFilters} /> */}

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
                  {bookingsLoading
                    ? Array.from(new Array(5)).map((_, index) => (
                        <TableRow key={index}>
                          <TableCell colSpan={currentTableHeaders.length}>
                            <Skeleton animation="wave" height={40} />
                          </TableCell>
                        </TableRow>
                      ))
                    : tableData.map((row) => (
                        <BookingTableRow
                          key={row.id}
                          row={row}
                          selected={table.selected.includes(row.id)}
                          onSelectRow={() => table.onSelectRow(row.id)}
                          onDeleteRow={() => handleDeleteRow(row.id)}
                          onEditRow={() => handleEditRow(row.id)}
                        />
                      ))}
                  {!bookingsLoading && !tableData.length && <TableNoData />}
                </TableBody>
              </Table>
            </Scrollbar>
          </TableContainer>

          {/* {bookingsLength > 0 && (
            <TablePaginationCustom
              count={bookingsLength}
              page={table.page}
              rowsPerPage={table.rowsPerPage}
              onPageChange={table.onChangePage}
              onRowsPerPageChange={table.onChangeRowsPerPage}
              dense={table.dense}
              onChangeDense={table.onChangeDense}
            />
          )} */}
        </Card>
      </Container>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete Bookings"
        content={`Are you sure you want to delete ${table.selected.length} items?`}
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              handleDeleteRows();
              confirm.onFalse();
            }}
          >
            Delete
          </Button>
        }
      />
    </>
  );
}
