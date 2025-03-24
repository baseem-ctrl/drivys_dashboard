import React, { useCallback, useEffect, useState } from 'react';
import {
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  Grid,
  Typography,
  Box,
  Skeleton,
  Button,
} from '@mui/material';
import { useGetBookingByTrainerId } from 'src/api/booking';
import { Download as DownloadIcon } from '@mui/icons-material';
import { useBoolean } from 'src/hooks/use-boolean';
import { TablePaginationCustom, useTable } from 'src/components/table';
import isEqual from 'lodash/isEqual';
import BookingFilters from './booking-filters';

// Define the props type for the component
interface BookingTableProps {
  bookingDetails: {
    id: string;
    user: {
      name: string;
      email: string;
    };
    booking_status: string;
    payment_status: string;
    total: number;
    sessions: { id: string }[];
  }[];
  handleBookingClick: (id: string) => void;
}
const defaultFilters = {
  payment_status: '',
  payment_method: '',
};
// Define the functional component
const BookingTrainerTable: React.FC<BookingTableProps> = ({ handleBookingClick, id }) => {
  const table = useTable({ defaultRowsPerPage: 15, defaultOrderBy: 'id', defaultOrder: 'desc' });

  const [filters, setFilters] = useState(defaultFilters);
  const { bookingTrainerDetails, bookingLoading, totalBookings } = useGetBookingByTrainerId({
    trainer_id: id,
    payment_status: filters.payment_status,
    payment_method: filters.payment_method,
    page: table.page + 1,
    limit: table.rowsPerPage,
  });
  const bookingDetails = bookingTrainerDetails.bookings;
  const openFilters = useBoolean();
  const [tableData, setTableData] = useState([]);

  useEffect(() => {
    if (bookingDetails?.length > 0) {
      setTableData(bookingDetails);
    } else {
      setTableData([]);
    }
  }, [bookingDetails]);
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
  const canReset = !isEqual(defaultFilters, filters);
  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);
  const handleDownloadReport = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = {
        driver_id: id,
        page: table.page !== undefined ? (table.page + 1).toString() : '',
        limit: table.rowsPerPage !== undefined ? table.rowsPerPage.toString() : '',
        payment_status:
          filters.payment_status !== undefined ? filters.payment_status.toString() : '',
        payment_method:
          filters.payment_method !== undefined ? filters.payment_method.toString() : '',
        is_download: 1,
      };

      const filteredParams = Object.fromEntries(
        Object.entries(params).filter(([_, value]) => value)
      );

      const queryParams = new URLSearchParams(filteredParams).toString();

      const response = await fetch(
        `${import.meta.env.VITE_HOST_API}admin/booking/get-bookings-list?${queryParams}`,
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
      a.download = 'trainer_bookings_report.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading CSV:', error);
    }
  };

  return (
    <Box>
      {' '}
      {
        <Box sx={{ textAlign: 'right', mb: 3, display: 'flex', justifyContent: 'space-between' }}>
          {bookingDetails && bookingDetails.length > 0 && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<DownloadIcon />}
              onClick={handleDownloadReport}
            >
              Download Report
            </Button>
          )}
          <BookingFilters
            open={openFilters.value}
            onOpen={openFilters.onTrue}
            onClose={openFilters.onFalse}
            filters={filters}
            onFilters={handleFilters}
            canReset={canReset}
            onResetFilters={handleResetFilters}
          />
        </Box>
      }{' '}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>User</TableCell>
              <TableCell>Email</TableCell>
              <TableCell align="center">Total</TableCell>
              <TableCell align="center">Total Sessions</TableCell>
              <TableCell align="center">Total Sessions Booked</TableCell>
              <TableCell align="center">Completed Sessions</TableCell>
              <TableCell align="center">Booking Status</TableCell>
              <TableCell align="center">Payment Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {bookingLoading ? (
              Array.from(new Array(5)).map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Skeleton animation="wave" height={40} />
                  </TableCell>
                </TableRow>
              ))
            ) : tableData && tableData.length > 0 ? (
              tableData.map((booking) => (
                <TableRow
                  key={booking.id}
                  onClick={() => {
                    handleBookingClick(booking.id);
                  }}
                  sx={{
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.04)',
                    },
                  }}
                >
                  <TableCell>
                    <Grid container alignItems="center" spacing={1}>
                      <Grid item>
                        <Typography>{booking?.user?.name || 'N/A'}</Typography>
                      </Grid>
                    </Grid>
                  </TableCell>
                  <TableCell>{booking?.user?.email || 'N/A'}</TableCell>
                  <TableCell align="center">{booking?.total || 'N/A'} AED</TableCell>
                  <TableCell>{booking?.package?.number_of_sessions || 'N/A'}</TableCell>
                  <TableCell>{booking?.no_of_sessions || 'N/A'}</TableCell>
                  <TableCell>{booking?.no_of_sessions_completed || 'N/A'}</TableCell>
                  <TableCell align="center">
                    <Chip
                      label={booking?.booking_status || 'N/A'}
                      color={
                        booking?.booking_status === 'PENDING'
                          ? 'info'
                          : booking?.booking_status === 'CANCELLED'
                          ? 'error'
                          : booking?.booking_status === 'IN PROGRESS'
                          ? 'warning'
                          : booking?.booking_status === 'CONFIRMED'
                          ? 'secondary'
                          : 'success'
                      }
                      variant="soft"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={booking?.payment_status || 'N/A'}
                      color={
                        booking?.payment_status === 'PENDING'
                          ? 'info'
                          : booking?.payment_status === 'FAILED'
                          ? 'error'
                          : booking?.payment_status === 'REFUNDED'
                          ? 'warning'
                          : booking?.payment_status === 'PARTIALLY PAID'
                          ? 'primary'
                          : 'success'
                      }
                      variant="soft"
                    />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Box sx={{ py: 2 }}>
                    <Typography variant="h6" color="textSecondary">
                      No bookings available under this trainer
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePaginationCustom
          count={totalBookings}
          page={table.page}
          rowsPerPage={table.rowsPerPage}
          onPageChange={table.onChangePage}
          onRowsPerPageChange={table.onChangeRowsPerPage}
          dense={table.dense}
          onChangeDense={table.onChangeDense}
        />
      </TableContainer>
    </Box>
  );
};

export default BookingTrainerTable;
