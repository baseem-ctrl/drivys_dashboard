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
  const { bookingTrainerDetails } = useGetBookingByTrainerId(id);
  const bookingDetails = bookingTrainerDetails.bookings;
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>User</TableCell>
            <TableCell>Email</TableCell>
            <TableCell align="center">Total</TableCell>
            <TableCell align="center">Sessions</TableCell>
            <TableCell align="center">Booking Status</TableCell>
            <TableCell align="center">Payment Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {bookingDetails && bookingDetails.length > 0 ? (
            bookingDetails.map((booking) => (
              <TableRow
                key={booking.id}
                onClick={() => {
                  console.log(`Booking ID clicked: ${booking.id}`);
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
                <TableCell>{booking.user.email}</TableCell>
                <TableCell align="center">${booking.total}</TableCell>
                <TableCell>
                  {booking.sessions.map((session) => (
                    <Typography key={session.id} align="center">
                      {session.id}
                    </Typography>
                  ))}
                </TableCell>
                <TableCell align="center">
                  <Chip
                    label={booking.booking_status}
                    color={booking.booking_status === 'CANCELLED' ? 'error' : 'success'}
                    variant="outlined"
                  />
                </TableCell>
                <TableCell align="center">
                  <Chip
                    label={booking.payment_status}
                    color={booking.payment_status === 'CANCELLED' ? 'error' : 'success'}
                    variant="outlined"
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
