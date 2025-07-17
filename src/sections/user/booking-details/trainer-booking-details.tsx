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
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
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
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>{t('User')}</TableCell>
            <TableCell>{t('Email')}</TableCell>
            <TableCell align="center">{t('Total')}</TableCell>
            <TableCell align="center">{t('Total Sessions')}</TableCell>
            <TableCell align="center">{t('Total Sessions Booked')}</TableCell>
            <TableCell align="center">{t('Completed Sessions')}</TableCell>
            <TableCell align="center">{t('Booking Status')}</TableCell>
            <TableCell align="center">{t('Payment Status')}</TableCell>
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
                      <Typography>{booking?.user?.name || t('n/a')}</Typography>
                    </Grid>
                  </Grid>
                </TableCell>
                <TableCell>{booking?.user?.email || t('n/a')}</TableCell>
                <TableCell align="center">
                  {' '}
                  <span className="dirham-symbol">&#x00EA;</span>
                  {booking?.total || t('n/a')}{' '}
                </TableCell>
                <TableCell>{booking?.package?.number_of_sessions || t('n/a')}</TableCell>
                <TableCell>{booking?.no_of_sessions || t('n/a')}</TableCell>
                <TableCell>{booking?.no_of_sessions_completed || t('n/a')}</TableCell>
                <TableCell align="center">
                  <Chip
                    label={booking?.booking_status || t('n/a')}
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
                    label={booking?.payment_status || t('n/a')}
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
                    {t('No bookings available under this trainer')}
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
