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
  Card,
  Skeleton,
} from '@mui/material';
import { useGetBookingByStudentId } from 'src/api/school';
import { useTranslation } from 'react-i18next';

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

  const { t } = useTranslation();

  return (
    <TableContainer component={Card}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>{t('Trainer Name')}</TableCell>
            <TableCell>{t('Trainer Email')}</TableCell>
            <TableCell align="center">{t('Total')}</TableCell>
            <TableCell align="center">{t('Total Sessions')}</TableCell>
            <TableCell align="center">{t('Total Sessions Booked')}</TableCell>
            <TableCell align="center">{t('Completed Sessions')}</TableCell>
            <TableCell align="center">{t('Booking Status')}</TableCell>
            <TableCell align="center">{t('Payment Status')}</TableCell>
            <TableCell align="center">{t('Payment Method')}</TableCell>
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
                      <Typography>{booking?.driver?.name || t('n/a')}</Typography>
                    </Grid>
                  </Grid>
                </TableCell>
                <TableCell>{booking?.driver?.email ?? t('n/a')}</TableCell>
                <TableCell align="center">
                  <span className="dirham-symbol">&#x00EA;</span>
                  {booking.total}
                </TableCell>
                <TableCell align="center">
                  {booking?.package?.number_of_sessions ?? t('n/a')}
                </TableCell>
                <TableCell>{booking?.no_of_sessions}</TableCell>
                <TableCell>{booking?.no_of_sessions_completed}</TableCell>
                <TableCell align="center">
                  <Chip
                    label={booking.booking_status}
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
                <TableCell align="center">{booking?.payment_method ?? t('n/a')}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} align="center">
                <Box sx={{ py: 2 }}>
                  <Typography variant="h6" color="textSecondary">
                    {t('No bookings available under this student')}
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
