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
import { useGetAssistantPayoutDetails } from 'src/api/booking-assistant';

export const BookingDetailsCashInHandTable: React.FC<{}> = () => {
  const { t } = useTranslation();
  const settings = useSettingsContext();
  const router = useRouter();
  const quickCreate = useBoolean();
  const { search } = useLocation();
  const params = useParams();
  const { id } = params;
  const queryParams = new URLSearchParams(search);
  const amount = queryParams.get('amount');
  const isPayoutDisabled = queryParams.get('disablePayout') === '0';

  const table = useTable({ defaultRowsPerPage: 15, defaultOrderBy: 'id', defaultOrder: 'desc' });
  const bookingsTable = useTable({
    defaultRowsPerPage: 15,
    defaultOrderBy: 'id',
    defaultOrder: 'desc',
  });

  const [tableData, setTableData] = useState();
  const [expandedRow, setExpandedRow] = useState(null);
  const {
    assistantPayoutList,
    assistantPayoutsLoading,
    assistantPayoutsError,
    totalPages,
    totalCollectedAmount,
    revalidateAssistantPayouts,
  } = useGetAssistantPayoutDetails({
    page: table?.page + 1,
    limit: table?.rowsPerPage,
    assistant_id: id,
  });

  const { sessionStatusEnum, sessionStatusLoading } = useGetSessionStatusEnum();
  const { revalidatePayouts } = useGetTrainerPayouts();
  const { details, detailsLoading, revalidateDetails } = useGetUserDetails(id);

  useEffect(() => {
    if (assistantPayoutList?.length) {
      setTableData(assistantPayoutList);
    } else {
      setTableData([]);
    }
  }, [assistantPayoutList]);

  const statusColorMap = {
    0: 'warning', // PENDING
    1: 'info', // CONFIRMED
    2: 'error', // CANCELLED
    3: 'success', // COMPLETED
  };
  const renderCell = (value: any) => {
    return value === 0 ? value : value || t('n/a');
  };

  const handleUserClick = (id) => {
    router.push(paths.dashboard.user.details(id));
  };
  const tableCellStyle = { fontWeight: 'bold', fontSize: '1.125rem' };

  const bookingTableCells = [
    { label: t('admin'), minWidth: '50px' },
    { label: t('assistant'), minWidth: '240px' },
    { label: t('collected_on'), minWidth: '140px' },
    { label: t('payment_method'), minWidth: '150px' },
    { label: t('payment_status'), minWidth: '250px' },
    { label: t('remarks'), minWidth: '150px' },
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
              <Typography variant="body1">{details?.name ?? t('n/a')}</Typography>
              <Typography variant="body2" color="text.secondary">
                {details?.email ?? t('n/a')}
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
                maxWidth: 200,
                height: isSmallScreen ? 'auto' : 200,
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
                maxWidth: 200,
                height: isSmallScreen ? 'auto' : 200,
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
            {t('name')}
          </Typography>
          <Typography variant="subtitle2">:</Typography>
          <Typography variant="subtitle2" sx={{ minWidth: '100px', textAlign: 'right' }}>
            {details?.name ?? t('n/a')}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
          <Typography variant="subtitle2" sx={{ minWidth: '180px' }}>
            {t('collected_cash')}
          </Typography>
          <Typography variant="subtitle2">:</Typography>
          <Typography variant="subtitle2" sx={{ minWidth: '100px', textAlign: 'right' }}>
            <span className="dirham-symbol" style={{ marginLeft: 4 }}>
              &#x00EA;
            </span>
            {details?.collected_cash_in_hand ?? '0'}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
          <Typography variant="subtitle2" sx={{ minWidth: '180px' }}>
            {t('cash_clearance_date')}
          </Typography>
          <Typography variant="subtitle2">:</Typography>
          <Typography variant="subtitle2" sx={{ minWidth: '100px', textAlign: 'right' }}>
            {details?.collected_cash_clearance_date
              ? moment(details.collected_cash_clearance_date).format('DD/MM/YYYY')
              : t('n/a')}
          </Typography>
        </Box>

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
        heading={t('Payout')}
        links={[
          { name: t('Dashboard'), href: paths.dashboard.root },
          {
            name: t('Payout'),
            href: paths.dashboard.assistantCollectCash.list,
          },
          { name: t('history') },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />
      <PayoutSummary />

      {/* <Tabs
        value={tabLabels.indexOf(activeTab)}
        onChange={handleTabChange}
        aria-label="payout tabs"
      >
        {tabLabels.map((label) => (
          <Tab key={label} label={t(label)} />
        ))}
      </Tabs> */}
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
                  <TableRow sx={{ cursor: 'pointer', '&:hover': { backgroundColor: '#f5f5f5' } }}>
                    <TableCell
                      sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                      onClick={() => handleUserClick(item?.admin?.id)}
                    >
                      {renderCell(item?.admin?.name)}
                    </TableCell>
                    <TableCell
                      sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                      onClick={() => handleUserClick(item?.assistant?.id)}
                    >
                      {renderCell(item?.assistant?.name)}
                    </TableCell>
                    <TableCell>
                      {item?.collected_on
                        ? moment(item.collected_on, 'HH:mm:ss dddd YYYY-MM-DD').format(
                            'DD MMM YYYY, h:mm A'
                          )
                        : t('n/a')}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={renderCell(item?.payment_method)}
                        color="info"
                        variant="soft"
                        size="small"
                      />
                    </TableCell>{' '}
                    <TableCell>
                      <Chip
                        label={renderCell(item?.payment_status)}
                        color={
                          item?.payment_status === 'PAID'
                            ? 'success'
                            : item?.payment_status === 'PENDING'
                            ? 'warning'
                            : 'default'
                        }
                        variant="soft"
                        size="small"
                      />
                    </TableCell>{' '}
                    <TableCell> {renderCell(item?.remarks)} </TableCell>
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
          count={totalPages}
          page={bookingsTable.page}
          rowsPerPage={bookingsTable.rowsPerPage}
          onPageChange={bookingsTable.onChangePage}
          onRowsPerPageChange={bookingsTable.onChangeRowsPerPage}
        />
      </Box>
      <Divider sx={{ my: 4, borderColor: '#ddd' }} />

      {/* <Typography variant="h6" color="primary" sx={{ mt: 4, mb: 2 }}>
        {t('Payout History')}
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
                  {t('No records available')}
                </TableCell>
              </TableRow>
            ) : (
              payoutHistoryList?.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>
                    {' '}
                    <span className="dirham-symbol" style={{ marginLeft: 4 }}>
                      &#x00EA;
                    </span>
                    {renderCell(item?.amount)}{' '}
                  </TableCell>
                  <TableCell>{renderCell(item?.notes)}</TableCell>
                  <TableCell>{renderCell(item?.payment_method)}</TableCell>
                  <TableCell>{renderCell(item?.payment_method_details)}</TableCell>
                  <TableCell>
                    {item?.processed_at
                      ? moment(item.processed_at).format('DD MMM YYYY, HH:mm A')
                      :  t('n/a')}
                  </TableCell>

                  <TableCell>
                    {item?.proof_file ? (
                      <img
                        src={item.proof_file}
                        alt="Proof"
                        style={{ width: '60px', height: 'auto', borderRadius: '4px' }}
                      />
                    ) : (
                       t('n/a')
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
                       t('n/a')
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
      </Box> */}
      <PayoutCreateForm
        open={quickCreate.value}
        onClose={quickCreate.onFalse}
        assistant_id={id}
        reload={revalidatePayouts}
        amount={amount}
      />
    </Container>
  );
};
