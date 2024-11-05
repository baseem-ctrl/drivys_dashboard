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
} from '@mui/material';

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
    sessions: { id: string }[]; // Assuming sessions is an array of objects with an id property
  }[];
  handleBookingClick: (id: string) => void;
}

// Define the functional component
const BookingTrainerTable: React.FC<BookingTableProps> = ({
  bookingDetails,
  handleBookingClick,
}) => {
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
        {bookingDetails &&
          bookingDetails.length > 0 &&
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
                    <Typography>{booking?.driver?.name || 'N/A'}</Typography>
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
          ))}
      </TableBody>
    </Table>
  </TableContainer>;
};

export default BookingTrainerTable;
