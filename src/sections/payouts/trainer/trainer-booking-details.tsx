import React, { useEffect, useState } from 'react';
import { useParams } from 'src/routes/hooks';
import moment from 'moment';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

import Avatar from '@mui/material/Avatar';

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
  Tabs,
  Tab,
  Chip,
  Button,
  Card,
  CardContent,
  Tooltip,
  useMediaQuery,
  Divider,
} from '@mui/material';
import {
  useGetPayoutByBooking,
  useGetPayoutHistory,
  useGetPayoutsList,
  useGetTrainerPayouts,
} from 'src/api/payouts';
import { TablePaginationCustom, useTable } from 'src/components/table';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs/custom-breadcrumbs';
import { paths } from 'src/routes/paths';
import { useSettingsContext } from 'src/components/settings';
import { useBoolean } from 'src/hooks/use-boolean';
import { useRouter } from 'src/routes/hooks';
import { useGetUserDetails } from 'src/api/users';
import PayoutCreateForm from '../payout-create-form';
import { useLocation } from 'react-router';

export const BookingDetailsTable: React.FC<{}> = () => {
  const settings = useSettingsContext();
  const router = useRouter();
  const quickCreate = useBoolean();
  const { search } = useLocation();
  const params = useParams();
  const { id } = params;
  const queryParams = new URLSearchParams(search);
  const isPayoutDisabled = queryParams.get('disablePayout') === '0';
  const amount = queryParams.get('amount');

  const table = useTable({ defaultRowsPerPage: 15, defaultOrderBy: 'id', defaultOrder: 'desc' });
  const bookingsTable = useTable({
    defaultRowsPerPage: 15,
    defaultOrderBy: 'id',
    defaultOrder: 'desc',
  });
  const historyTable = useTable({
    defaultRowsPerPage: 15,
    defaultOrderBy: 'processed_at',
    defaultOrder: 'desc',
  });
  const [activeTab, setActiveTab] = useState(0);
  const [tableData, setTableData] = useState();

  const { payoutsList, payoutsLoading, payoutsError, payoutsEmpty, totalPages, totalPaidValue } =
    useGetPayoutsList({
      page: table?.page + 1,
      limit: table?.rowsPerPage,
      trainer_id: id,
    });
  const {
    payoutByBookingList,
    payoutByBookingLoading,
    payoutByBookingError,
    payoutByBookingEmpty,
    totalPages: totalPagesInBooking,
    revalidatePayoutByBooking,
  } = useGetPayoutByBooking({
    page: bookingsTable.page + 1,
    limit: bookingsTable.rowsPerPage,
    is_paid: activeTab,
    trainer_id: id,
  });
  const { revalidatePayouts } = useGetTrainerPayouts();
  const { details, detailsLoading, revalidateDetails } = useGetUserDetails(id);
  const { payoutHistoryList, totalPages: historyTotalPages } = useGetPayoutHistory({
    page: historyTable.page + 1,
    limit: historyTable.rowsPerPage,
    trainer_id: id,
  });

  useEffect(() => {
    if (payoutByBookingList?.length) {
      setTableData(payoutByBookingList);
    } else {
      setTableData([]);
    }
  }, [payoutByBookingList]);
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  const renderCell = (value: any) => {
    return value === 0 ? value : value || 'N/A';
  };
  const handleBookingClick = (id) => {
    router.push(paths.dashboard.booking.details(id));
  };
  const handleUserClick = (id) => {
    router.push(paths.dashboard.user.details(id));
  };
  const tableCellStyle = { fontWeight: 'bold', fontSize: '1.125rem' };

  const bookingTableCells = [
    { label: 'Booking ID', width: '150px' },
    { label: 'Booking Revenue Amount', width: '240px' },
    { label: 'Trainer Payout', width: '250px' },
    { label: 'Date', width: '250px' },
    { label: 'Payment Method', width: '250px' },
  ];

  const payoutHistoryCells = [
    { label: 'Amount', width: '200px' },
    { label: 'Notes', width: '200px' },
    { label: 'Payment Method', width: '200px' },
    { label: 'Payment Method Details', width: '200px' },
    { label: 'Processed At', width: '200px' },
    { label: 'Proof File', width: '200px' },
    { label: 'Status', width: '200px' },
  ];
  const isSmallScreen = useMediaQuery('(max-width:600px)');

  const PayoutSummary = () => (
    <Box
      onClick={() => handleUserClick(id)}
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
              <Typography variant="body1">{details?.name ?? 'User Name'}</Typography>
              <Typography variant="body2" color="text.secondary">
                {details?.email ?? 'user@example.com'}
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
            >
              {details?.name ? details.name[0] : 'U'}
            </Avatar>
          )}
        </Tooltip>
      </Box>

      {/* Right Section - Payment Details */}
      <CardContent sx={{ flex: 1, textAlign: isSmallScreen ? 'center' : 'left' }}>
        <Typography variant="subtitle2" sx={{ color: '#666', fontSize: '14px', mb: 1 }}>
          Total Paid Amount
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          {totalPaidValue ?? '0'} AED{' '}
          <Chip
            label="Paid"
            color="success"
            variant="soft"
            sx={{
              fontWeight: 'bold',
              fontSize: '14px',
              ml: isSmallScreen ? 0 : 2,
              mt: isSmallScreen ? 1 : 0,
              width: isSmallScreen ? '40%' : '10%',
            }}
          />
        </Typography>
        <Typography color="primary" sx={{ fontSize: '14px', color: '#CF5A0D', mt: 2 }}>
          Amount Required From Admin is {amount} AED
        </Typography>
        <Tooltip title={isPayoutDisabled ? 'No payout remaining' : ''} arrow>
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
              Payout
            </Button>
          </span>
        </Tooltip>
      </CardContent>
    </Box>
  );

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Trainer Payout Details"
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
      <PayoutSummary />

      <Tabs value={activeTab} onChange={handleTabChange} aria-label="payout tabs">
        <Tab label="Unpaid Bookings" />
        <Tab label="Paid Bookings" />
      </Tabs>
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              {bookingTableCells.map((cell, index) => (
                <TableCell key={index} sx={{ ...tableCellStyle, width: cell.width }}>
                  {cell.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {tableData?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} sx={{ textAlign: 'center', fontStyle: 'italic' }}>
                  No records available
                </TableCell>
              </TableRow>
            ) : (
              tableData?.map((item, index) => (
                <TableRow key={index}>
                  {activeTab === 0 ? (
                    <>
                      <TableCell
                        sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                        onClick={() => handleBookingClick(item?.booking_id)}
                      >
                        {renderCell(item?.booking_id)}
                      </TableCell>
                      <TableCell>
                        {renderCell(item?.transaction_details[0]?.txn_amount)}{' '}
                        {renderCell(item?.transaction_details[0]?.currency)}
                      </TableCell>
                      <TableCell>{renderCell(item?.trainer_payout)} AED</TableCell>
                      <TableCell>
                        {' '}
                        <Chip
                          icon={<AccessTimeIcon fontSize="small" />}
                          label={moment(item?.transaction_details[0]?.date).format(
                            'MMM DD, YYYY hh:mm A'
                          )}
                          size="small"
                          color="success"
                          variant="soft"
                        />
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={item?.transaction_details[0]?.payment_method ?? 'N/A'}
                          variant="soft"
                          color="warning"
                          sx={{ fontWeight: 'bold', textTransform: 'capitalize' }}
                        />

                        {/* {renderCell(item?.transaction_details[0]?.payment_method)} */}
                      </TableCell>
                    </>
                  ) : (
                    <>
                      <TableCell
                        sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                        onClick={() => handleBookingClick(item?.booking_id)}
                      >
                        {renderCell(item?.booking_id)}
                      </TableCell>
                      <TableCell>
                        {renderCell(item?.transaction_details[0]?.txn_amount)}{' '}
                        {renderCell(item?.transaction_details[0]?.currency)}
                      </TableCell>
                      <TableCell>{renderCell(item?.trainer_payout)} AED</TableCell>
                      <TableCell>
                        {' '}
                        <Chip
                          icon={<AccessTimeIcon fontSize="small" />}
                          label={moment(item?.transaction_details[0]?.date).format(
                            'MMM DD, YYYY hh:mm A'
                          )}
                          size="small"
                          color="success"
                          variant="soft"
                        />
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={item?.transaction_details[0]?.payment_method ?? 'N/A'}
                          variant="soft"
                          color="warning"
                          sx={{ fontWeight: 'bold', textTransform: 'capitalize' }}
                        />

                        {/* {renderCell(item?.transaction_details[0]?.payment_method)} */}
                      </TableCell>
                    </>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '16px' }}>
        <TablePaginationCustom
          count={totalPagesInBooking}
          page={bookingsTable.page}
          rowsPerPage={bookingsTable.rowsPerPage}
          onPageChange={bookingsTable.onChangePage}
          onRowsPerPageChange={bookingsTable.onChangeRowsPerPage}
        />
      </Box>
      <Divider sx={{ my: 4, borderColor: '#ddd' }} />

      <Typography variant="h6" color="primary" sx={{ mt: 4, mb: 2 }}>
        Payout History
      </Typography>
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              {payoutHistoryCells.map((cell, index) => (
                <TableCell key={index} sx={{ ...tableCellStyle, width: cell.width }}>
                  {cell.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {payoutHistoryList?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} sx={{ textAlign: 'center', fontStyle: 'italic' }}>
                  No records available
                </TableCell>
              </TableRow>
            ) : (
              payoutHistoryList?.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{renderCell(item?.amount)} AED</TableCell>
                  <TableCell>{renderCell(item?.notes)}</TableCell>
                  <TableCell>{renderCell(item?.payment_method)}</TableCell>
                  <TableCell>{renderCell(item?.payment_method_details)}</TableCell>
                  <TableCell>
                    {item?.processed_at
                      ? moment(item.processed_at).format('DD MMM YYYY, HH:mm A')
                      : 'N/A'}
                  </TableCell>

                  <TableCell>
                    {item?.proof_file ? (
                      <img
                        src={item.proof_file}
                        alt="Proof"
                        style={{ width: '60px', height: 'auto', borderRadius: '4px' }}
                      />
                    ) : (
                      'N/A'
                    )}
                  </TableCell>

                  <TableCell>
                    {item?.status ? (
                      <Chip
                        label={item.status}
                        color={
                          item.status === 'Processed'
                            ? 'success'
                            : item.status === 'Pending'
                            ? 'warning'
                            : item.status === 'Failed'
                            ? 'error'
                            : 'default'
                        }
                        variant="soft"
                        size="small"
                      />
                    ) : (
                      'N/A'
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '16px' }}>
        <TablePaginationCustom
          count={historyTotalPages}
          page={historyTable.page}
          rowsPerPage={historyTable.rowsPerPage}
          onPageChange={historyTable.onChangePage}
          onRowsPerPageChange={historyTable.onChangeRowsPerPage}
        />
      </Box>
      <PayoutCreateForm
        open={quickCreate.value}
        onClose={quickCreate.onFalse}
        trainerId={id}
        reload={revalidatePayouts}
        amount={amount}
      />
    </Container>
  );
};
