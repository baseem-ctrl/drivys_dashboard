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
  Collapse,
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
import { useGetSessionStatusEnum } from 'src/api/enum';
import { useTranslation } from 'react-i18next';

export const BookingDetailsTable: React.FC<{}> = () => {
  const { t } = useTranslation();
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
  const [activeTab, setActiveTab] = useState('PAID');
  const [tableData, setTableData] = useState();
  const [expandedRow, setExpandedRow] = useState(null);

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
    session_payout_category: activeTab,
    trainer_id: id,
  });
  const { sessionStatusEnum, sessionStatusLoading } = useGetSessionStatusEnum();
  const { revalidatePayouts } = useGetTrainerPayouts();
  const { details, detailsLoading, revalidateDetails } = useGetUserDetails(id);
  const { payoutHistoryList, totalPages: historyTotalPages } = useGetPayoutHistory({
    page: historyTable.page + 1,
    limit: historyTable.rowsPerPage,
    trainer_id: id,
  });
  const tabLabels = ['PAID', 'UNPAID', 'PARTIAL_PAID'];

  useEffect(() => {
    if (payoutByBookingList?.length) {
      setTableData(payoutByBookingList);
    } else {
      setTableData([]);
    }
  }, [payoutByBookingList]);

  const handleRowClick = (bookingId) => {
    setExpandedRow(expandedRow === bookingId ? null : bookingId);
  };
  const handleTabChange = (event, newValue) => {
    setActiveTab(tabLabels[newValue]);
  };

  const statusColorMap = {
    0: 'warning', // PENDING
    1: 'info', // CONFIRMED
    2: 'error', // CANCELLED
    3: 'success', // COMPLETED
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
    { label: t('Booking ID'), minWidth: '50px' },
    { label: t('Booking Revenue Amount'), minWidth: '240px' },
    { label: t('Sessions Completed'), minWidth: '140px' },
    { label: t('Trainer Payout'), minWidth: '150px' },
    { label: t('Date'), minWidth: '250px' },
    { label: t('Payment Method'), minWidth: '150px' },
  ];

  const payoutHistoryCells = [
    { label: t('Amount'), width: '200px' },
    { label: t('Notes'), width: '200px' },
    { label: t('Payment Method'), width: '200px' },
    { label: t('Payment Method Details'), width: '200px' },
    { label: t('Processed At'), width: '200px' },
    { label: t('Proof File'), width: '200px' },
    { label: t('Status'), width: '200px' },
  ];
  const isSmallScreen = useMediaQuery('(max-width:600px)');

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
              <Typography variant="body1">{details?.name ?? 'N/A'}</Typography>
              <Typography variant="body2" color="text.secondary">
                {details?.email ?? 'N/A'}
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
            >
              {details?.name ? details.name[0] : 'U'}
            </Avatar>
          )}
        </Tooltip>
      </Box>

      {/* Right Section - Payment Details */}
      <CardContent sx={{ flex: 1, textAlign: isSmallScreen ? 'center' : 'left' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
          <Typography variant="subtitle2" sx={{ minWidth: '180px' }}>
            {t("Total Revenue Amount")}
          </Typography>
          <Typography variant="subtitle2">:</Typography>
          <Typography variant="subtitle2" sx={{ minWidth: '100px', textAlign: 'right' }}>
            {totalRevenueValue ?? '0'} {t("AED")}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
          <Typography variant="subtitle2" sx={{ minWidth: '180px' }}>
            {t("Total Drivys Commission")}
          </Typography>
          <Typography variant="subtitle2">:</Typography>
          <Typography variant="subtitle2" sx={{ minWidth: '100px', textAlign: 'right' }}>
            {totalDrivysCommission ?? '0'} {t("AED")}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
          <Typography variant="subtitle2" sx={{ minWidth: '180px' }}>
            {t("Total Trainer Earning")}
          </Typography>
          <Typography variant="subtitle2">:</Typography>
          <Typography variant="subtitle2" sx={{ minWidth: '100px', textAlign: 'right' }}>
            {totalTrainerEarning ?? '0'} {t("AED")}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
          <Typography variant="subtitle2" sx={{ minWidth: '180px' }}>
            {t("Total School Earning")}
          </Typography>
          <Typography variant="subtitle2">:</Typography>
          <Typography variant="subtitle2" sx={{ minWidth: '100px', textAlign: 'right' }}>
            {totalVendorEarning ?? '0'} {t("AED")}
          </Typography>
        </Box>

        <Typography variant="subtitle2" sx={{ fontSize: '14px', color: '#CF5A0D', mt: 2 }}>
          {t("Amount Required From Admin is")}   {amount} {t("AED")}
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
              {t("Payout")}
            </Button>
          </span>
        </Tooltip>
      </CardContent>
    </Box>
  );

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading={t("Trainer Payout Details")}
        links={[
          { name: t('Dashboard'), href: paths.dashboard.root },
          {
            name: t('Payout'),
            href: paths.dashboard.payouts.root,
          },
          { name: t('Trainer Payout Details') },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />
      <PayoutSummary />

      <Tabs
        value={tabLabels.indexOf(activeTab)}
        onChange={handleTabChange}
        aria-label="payout tabs"
      >
        {tabLabels.map((label) => (
          <Tab key={label} label={t(label)} />
        ))}
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
                <React.Fragment key={index}>
                  <TableRow
                    onClick={() => handleRowClick(item?.booking_id)}
                    sx={{ cursor: 'pointer', '&:hover': { backgroundColor: '#f5f5f5' } }}
                  >
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
                    <TableCell>{renderCell(item?.sessions?.length || '0')} </TableCell>
                    <TableCell>{renderCell(item?.trainer_payout)} AED</TableCell>
                    <TableCell>
                      <Chip
                        icon={<AccessTimeIcon fontSize="small" />}
                        label={moment(item?.transaction_details[0]?.date).format(
                          'MMM DD, YYYY hh:mm A'
                        )}
                        size="small"
                        sx={{ color: '#008B8B' }}
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
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell colSpan={6} sx={{ padding: 0 }}>
                      <Collapse in={expandedRow === item?.booking_id} timeout="auto" unmountOnExit>
                        <Typography
                          variant="body1"
                          color="primary"
                          sx={{ fontWeight: 'bold', fontSize: '15px', px: 2, py: 1, mt: 3, mb: 1 }}
                        >
                          Session Details:
                        </Typography>
                        <Box sx={{ width: '100%', overflowX: 'auto' }}>
                          <Table sx={{ width: '100%' }}>
                            <TableHead>
                              <TableRow>
                                <TableCell sx={{ width: '250px' }}>Start Time</TableCell>
                                <TableCell sx={{ width: '250px' }}>End Time</TableCell>
                                <TableCell sx={{ width: '220px' }}>Outstanding</TableCell>
                                <TableCell sx={{ width: '230px' }}>Drivys Payout</TableCell>
                                <TableCell sx={{ width: '120px' }}>Revenue</TableCell>
                                <TableCell sx={{ width: '130px' }}>School Payout</TableCell>
                                <TableCell sx={{ width: '130px' }}>Trainer Payout</TableCell>
                                <TableCell sx={{ width: '140px' }}>Transferred Amount</TableCell>
                                <TableCell sx={{ width: '160px' }}>Session Status</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {sessionStatusLoading ? (
                                <TableRow>
                                  <TableCell colSpan={9} sx={{ textAlign: 'center' }}>
                                    Loading...
                                  </TableCell>
                                </TableRow>
                              ) : item?.sessions?.length > 0 ? (
                                item.sessions.map((session, sessionIndex) => {
                                  const statusLabel =
                                    sessionStatusEnum.find(
                                      (status) => status.value === session.session_status
                                    )?.name || 'Unknown';

                                  return (
                                    <TableRow key={sessionIndex}>
                                      <TableCell>
                                        {moment(session.start_time).format('MM/DD/YY HH:mm')}
                                      </TableCell>
                                      <TableCell>
                                        {moment(session.end_time).format('MM/DD/YY HH:mm')}
                                      </TableCell>
                                      <TableCell>{session.outstanding}</TableCell>
                                      <TableCell>{session.drivys_payout}</TableCell>
                                      <TableCell>{session.revenue}</TableCell>
                                      <TableCell>{session.school_payout}</TableCell>
                                      <TableCell>{session.trainer_payout}</TableCell>
                                      <TableCell>{session.transferred_amount}</TableCell>
                                      <TableCell>
                                        <Chip
                                          label={statusLabel}
                                          color={
                                            statusColorMap[session.session_status] || 'default'
                                          }
                                          variant="soft"
                                        />
                                      </TableCell>
                                    </TableRow>
                                  );
                                })
                              ) : (
                                <TableRow>
                                  <TableCell colSpan={9} sx={{ textAlign: 'center' }}>
                                    No sessions available
                                  </TableCell>
                                </TableRow>
                              )}
                            </TableBody>
                          </Table>
                        </Box>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                </React.Fragment>
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
        {t("Payout History")}
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
                  {t("No records available")}
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
