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
  Stack,
} from '@mui/material';
import { useGetBookingByStudentId } from 'src/api/school';

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
const BookingStudentTable: React.FC<BookingTableProps> = ({ handleBookingClick, id }) => {
  const { bookingDetails, bookingError, bookingLoading, revalidateBookingDetails } =
    useGetBookingByStudentId(id);

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Trainer Name</TableCell>
            <TableCell>Trainer Email</TableCell>
            <TableCell align="center">Total</TableCell>
            <TableCell align="center">Total Sessions</TableCell>
            <TableCell align="center">Session No </TableCell>
            <TableCell align="center">Booking Status</TableCell>
            <TableCell align="center">Payment Status</TableCell>
            <TableCell align="center">Payment Method</TableCell>
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
                      <Typography>{booking?.driver?.name || 'N/A'}</Typography>
                    </Grid>
                  </Grid>
                </TableCell>
                <TableCell>{booking?.driver?.email ?? 'NA'}</TableCell>
                <TableCell align="center">${booking.total}</TableCell>
                <TableCell align="center">{booking?.no_of_sessions ?? 'NA'}</TableCell>
                <TableCell>
                  {booking?.sessions && (
                    <Stack spacing={1}>
                      {booking.sessions
                        .reduce((rows, session, index) => {
                          if (index % 3 === 0) rows.push([]); // Start a new row every 3 items
                          rows[rows.length - 1].push(session?.session_no); // Add session_no to the current row
                          return rows;
                        }, [])
                        .map((row, rowIndex) => (
                          <Box key={rowIndex}>
                            {row.join(', ')} {/* Join the row items with commas */}
                          </Box>
                        ))}
                    </Stack>
                  )}
                </TableCell>
                <TableCell align="center">
                  <Chip
                    label={booking.booking_status}
                    color={
                      booking.booking_status === 'PENDING'
                        ? 'info'
                        : booking.booking_status === 'CANCELLED'
                        ? 'error'
                        : 'success'
                    }
                    variant="soft"
                  />
                </TableCell>
                <TableCell align="center">
                  <Chip
                    label={booking.payment_status}
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
                    No bookings available under this student
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

export default BookingStudentTable;
