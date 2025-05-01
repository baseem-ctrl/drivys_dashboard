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
  Button,
  useMediaQuery,
  CardContent,
  Box,
  Container,
  Avatar,
  Tooltip,
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useGetPayoutsList, useGetSchoolPayouts } from 'src/api/payouts';
import { TablePaginationCustom, useTable } from 'src/components/table';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs/custom-breadcrumbs';
import { paths } from 'src/routes/paths';
import { useSettingsContext } from 'src/components/settings';
import { useRouter } from 'src/routes/hooks';
import { useBoolean } from 'src/hooks/use-boolean';
import { useLocation } from 'react-router';
import { useGetSchoolById } from 'src/api/school';
import PayoutCreateForm from './payout-create-form';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
  const settings = useSettingsContext();
  const router = useRouter();
  const quickCreate = useBoolean();

  const params = useParams();
  const { id } = params;
  const table = useTable({ defaultRowsPerPage: 15, defaultOrderBy: 'id', defaultOrder: 'desc' });
  const { details, detailsLoading, revalidateDetails } = useGetSchoolById(id);
  const { revalidatePayouts } = useGetSchoolPayouts();

  const { search } = useLocation();
  const queryParams = new URLSearchParams(search);
  const isPayoutDisabled = queryParams.get('disablePayout') === '0';

  const amount = queryParams.get('amount');

  const {
    payoutsList,
    payoutsLoading,
    payoutsError,
    payoutsEmpty,
    totalPages,
    totalDrivysCommission,
    totalRevenueValue,
    totalTrainerEarning,
    totalVendorEarning,
  } = useGetPayoutsList({
    page: table?.page + 1,
    limit: table?.rowsPerPage,
    vendor_id: id,
  });
  const renderCell = (value: any) => {
    return value === 0 ? value : value || 'N/A';
  };
  const handleBookingClick = (id) => {
    router.push(paths.dashboard.booking.details(id));
  };
  const tableCellStyle = { fontWeight: 'bold', fontSize: '1.125rem' };

  const tableCells = [
    { label: t('School Name'), width: '250px' },
    { label: t('Trainer Name'), width: '250px' },
    { label: t('Booking ID'), width: '150px' },
    { label: t('Total Booking Revenue'), width: '240px' },
    { label: t("Drivy's Commission"), width: '250px' },
    { label: t('School Earnings'), width: '250px' },
    { label: t('Trainer Earning'), width: '250px' },
  ];
  const isSmallScreen = useMediaQuery('(max-width:600px)');
  const handleUserClick = (id) => {
    router.push(paths.dashboard.school.details(id));
  };
  const PayoutSummary = () => (
    <Box
      sx={{
        display: 'flex',
        flexDirection: isSmallScreen ? 'column' : 'row',
        alignItems: isSmallScreen ? 'center' : 'flex-start',
        padding: 3,
        borderRadius: 3,
        mb: 3,
        gap: isSmallScreen ? 2 : 0,
      }}
    >
      {/* Left Section - Profile Image with Avatar Fallback */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          mr: isSmallScreen ? 0 : 3,
        }}
      >
        <Tooltip
          title={
            <Box sx={{ textAlign: 'center', p: 1 }}>
              <Typography variant="body1">
                {details?.vendor_translations?.[0]?.name ?? 'N/A'}
              </Typography>
            </Box>
          }
          arrow
          placement="top"
        >
          {details?.photo_url ? (
            <Box
              component="img"
              src={details.photo_url}
              alt="Profile Photo"
              sx={{
                width: isSmallScreen ? '100%' : 250,
                maxWidth: 250,
                height: isSmallScreen ? 'auto' : 250,
                borderRadius: '20px',
                objectFit: 'cover',
                boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
                border: '3px solid #f5f5f5',
                cursor: 'pointer',
              }}
              onClick={() => handleUserClick(id)}
            />
          ) : (
            <Avatar
              sx={{
                width: isSmallScreen ? '100%' : 250,
                maxWidth: 250,
                height: isSmallScreen ? 'auto' : 250,
                borderRadius: '20px',
                objectFit: 'cover',
                boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
                border: '3px solid #f5f5f5',
                cursor: 'pointer',
              }}
              onClick={() => handleUserClick(id)}
            >
              {details?.vendor_translations?.[0]?.name
                ? details?.vendor_translations?.[0]?.name
                : 'U'}
            </Avatar>
          )}
        </Tooltip>
      </Box>

      {/* Right Section - Payment Details */}
      <CardContent sx={{ flex: 1, textAlign: isSmallScreen ? 'center' : 'left' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
          <Typography variant="subtitle2" sx={{ minWidth: '180px' }}>
            {t('Total Revenue Amount')}
          </Typography>
          <Typography variant="subtitle2">:</Typography>
          <Typography variant="subtitle2" sx={{ minWidth: '100px', textAlign: 'right' }}>
            <span className="dirham-symbol" style={{ marginLeft: 4 }}>
              &#x00EA;
            </span>{' '}
            {totalRevenueValue ?? '0'}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
          <Typography variant="subtitle2" sx={{ minWidth: '180px' }}>
            {t('Total Drivys Commission ')}
          </Typography>
          <Typography variant="subtitle2">:</Typography>
          <Typography variant="subtitle2" sx={{ minWidth: '100px', textAlign: 'right' }}>
            <span className="dirham-symbol" style={{ marginLeft: 4 }}>
              &#x00EA;
            </span>{' '}
            {totalDrivysCommission ?? '0'}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
          <Typography variant="subtitle2" sx={{ minWidth: '180px' }}>
            {t('Total Trainer Earning ')}
          </Typography>
          <Typography variant="subtitle2">:</Typography>
          <Typography variant="subtitle2" sx={{ minWidth: '100px', textAlign: 'right' }}>
            <span className="dirham-symbol" style={{ marginLeft: 4 }}>
              &#x00EA;
            </span>
            {totalTrainerEarning ?? '0'}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
          <Typography variant="subtitle2" sx={{ minWidth: '180px' }}>
            {t('Total School Earning ')}
          </Typography>
          <Typography variant="subtitle2">:</Typography>
          <Typography variant="subtitle2" sx={{ minWidth: '100px', textAlign: 'right' }}>
            <span className="dirham-symbol" style={{ marginLeft: 4 }}>
              &#x00EA;
            </span>
            {totalVendorEarning ?? '0'}
          </Typography>
        </Box>

        <Typography variant="subtitle2" sx={{ fontSize: '14px', color: '#CF5A0D', mt: 2 }}>
          {t('Amount Required From Admin is ')}{' '}
          <span className="dirham-symbol" style={{ marginLeft: 4 }}>
            &#x00EA;
          </span>{' '}
          {amount}
        </Typography>

        <Tooltip title={isPayoutDisabled ? t('No payout remaining') : ''} arrow>
          <span>
            <Button
              variant="contained"
              disabled={isPayoutDisabled}
              sx={{
                mt: 3,
                backgroundColor: '#C25A1D',
                '&:hover': { backgroundColor: '#A04917' },
                padding: '10px 50px',
                width: isSmallScreen ? '100%' : '60%',
                fontWeight: 'bold',
                fontSize: '14px',
                borderRadius: '8px',
              }}
              endIcon={<ArrowForwardIcon />}
              onClick={(e) => {
                quickCreate.onTrue();
              }}
            >
              {t('Payout')}
            </Button>
          </span>
        </Tooltip>
      </CardContent>
    </Box>
  );
  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading={t('School Payout Details')}
        links={[
          { name: t('Dashboard'), href: paths.dashboard.root },
          {
            name: t('Payout'),
            href: paths.dashboard.payouts.school,
          },
          { name: t('School Payouts Details') },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />
      <PayoutSummary />

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
                <TableCell>{booking?.vendor_payout?.vendor_name ?? 'NA'} </TableCell>
                <TableCell>{booking?.trainer_details?.trainer_name ?? 'NA'} </TableCell>

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
                <TableCell>
                  <span className="dirham-symbol" style={{ marginLeft: 4 }}>
                    &#x00EA;
                  </span>
                  {renderCell(booking?.total_booking_revenue)}{' '}
                </TableCell>
                <TableCell>
                  <span className="dirham-symbol" style={{ marginLeft: 4 }}>
                    &#x00EA;
                  </span>
                  {renderCell(booking?.drivys_commission)}{' '}
                </TableCell>
                <TableCell>
                  <span className="dirham-symbol" style={{ marginLeft: 4 }}>
                    &#x00EA;
                  </span>
                  {Math.round(booking?.vendor_payout?.earning * 100) / 100}{' '}
                </TableCell>
                <TableCell>
                  <span className="dirham-symbol" style={{ marginLeft: 4 }}>
                    &#x00EA;
                  </span>
                  {renderCell(booking?.trainer_details?.trainer_earning)}{' '}
                </TableCell>
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
      <PayoutCreateForm
        open={quickCreate.value}
        onClose={quickCreate.onFalse}
        vendorId={id}
        reload={revalidatePayouts}
        amount={amount}
      />
    </Container>
  );
};
