import React from 'react';
import { useParams } from 'src/routes/hooks';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  TablePagination,
  Box,
  Container,
} from '@mui/material';
import { useGetPayoutsList } from 'src/api/payouts';
import { TablePaginationCustom, useTable } from 'src/components/table';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs/custom-breadcrumbs';
import { paths } from 'src/routes/paths';
import { useSettingsContext } from 'src/components/settings';
import { useRouter } from 'src/routes/hooks';

// Define types for the booking details
interface BookingDetails {
  bookingId: string;
  customerName: string;
  checkInDate: string;
  checkOutDate: string;
  roomType: string;
  totalAmount: number;
}

export const SchoolBookingDetailsTable: React.FC<{ booking: BookingDetails }> = () => {
  const settings = useSettingsContext();
  const router = useRouter();

  const params = useParams();
  const { id } = params;
  const table = useTable({ defaultRowsPerPage: 15, defaultOrderBy: 'id', defaultOrder: 'desc' });

  const { payoutsList, payoutsLoading, payoutsError, payoutsEmpty, totalPages } = useGetPayoutsList(
    {
      page: table?.page + 1,
      limit: table?.rowsPerPage,
      vendor_id: id,
    }
  );
  const renderCell = (value: any) => {
    return value === 0 ? value : value || 'N/A';
  };
  const handleBookingClick = (id) => {
    router.push(paths.dashboard.booking.details(id));
  };
  const tableCellStyle = { fontWeight: 'bold', fontSize: '1rem' };

  const tableCells = [
    { label: 'Booking ID', width: '150px' },
    { label: 'Total Booking Revenue', width: '240px' },
    { label: "Drivy's Commission", width: '250px' },
    { label: 'Vendor Name', width: '250px' },
    { label: 'Vendor Earnings', width: '250px' },
    { label: 'Trainer Name', width: '250px' },
    { label: 'Trainer Earning', width: '250px' },
  ];
  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Trainer Payout"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          {
            name: 'Payout',
            href: paths.dashboard.payouts.root,
          },
          { name: 'Trainer Payouts Details' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <TableContainer component={Paper}>
        <Table stickyHeader>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              {tableCells.map((cell, index) => (
                <TableCell key={index} sx={{ ...tableCellStyle, width: cell.width }}>
                  {cell.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {payoutsList?.map((booking, index) => (
              <TableRow key={index}>
                <TableCell
                  sx={{
                    cursor: 'pointer',
                    '&:hover': {
                      textDecoration: 'underline',
                    },
                  }}
                  onClick={() => handleBookingClick(booking?.booking_id)}
                >
                  {renderCell(booking?.booking_id)}
                </TableCell>

                <TableCell>{renderCell(booking?.total_booking_revenue)} AED </TableCell>
                <TableCell>{renderCell(booking?.drivys_commission)} AED</TableCell>
                <TableCell>{booking?.vendor_payout?.vendor_name} </TableCell>
                <TableCell>{renderCell(booking?.vendor_payout?.earning)} AED</TableCell>
                <TableCell>{booking?.trainer_details?.trainer_name} </TableCell>
                <TableCell>{renderCell(booking?.trainer_details?.trainer_earning)} AED</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '16px' }}>
        <TablePaginationCustom
          count={totalPages}
          page={table.page}
          rowsPerPage={table.rowsPerPage}
          onPageChange={table.onChangePage}
          onRowsPerPageChange={table.onChangeRowsPerPage}
        />
      </Box>
    </Container>
  );
};
