import React from 'react';
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
} from '@mui/material';
import { useGetBookingByTrainerId } from 'src/api/booking';

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

// Define the functional component
const BookingTrainerTable: React.FC<BookingTableProps> = ({ handleBookingClick, id }) => {
  const { bookingTrainerDetails, bookingLoading } = useGetBookingByTrainerId(id);
  const bookingDetails = bookingTrainerDetails.bookings;

  return (
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
          ) : bookingDetails && bookingDetails.length > 0 ? (
            bookingDetails.map((booking) => (
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
    </TableContainer>
  );
};

export default BookingTrainerTable;
