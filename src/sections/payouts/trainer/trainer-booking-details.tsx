import React, { useState } from 'react';
import { useParams } from 'src/routes/hooks';
import moment from 'moment';

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
} from '@mui/material';
import { useGetPayoutHistory, useGetPayoutsList } from 'src/api/payouts';
import { TablePaginationCustom, useTable } from 'src/components/table';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs/custom-breadcrumbs';
import { paths } from 'src/routes/paths';
import { useSettingsContext } from 'src/components/settings';
import { useRouter } from 'src/routes/hooks';

export const BookingDetailsTable: React.FC<{}> = () => {
  const settings = useSettingsContext();
  const router = useRouter();

  const params = useParams();
  const { id } = params;
  const table = useTable({ defaultRowsPerPage: 15, defaultOrderBy: 'id', defaultOrder: 'desc' });

  const { payoutsList, payoutsLoading, payoutsError, payoutsEmpty, totalPages, totalPaidValue } =
    useGetPayoutsList({
      page: table?.page + 1,
      limit: table?.rowsPerPage,
      trainer_id: id,
    });
  console.log('payoutsList', payoutsList);
  console.log('totalPaidValue', totalPaidValue);
  const { payoutHistoryList, totalPages: historyTotalPages } = useGetPayoutHistory({
    page: table.page + 1,
    limit: table.rowsPerPage,
    trainer_id: id,
  });
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  const renderCell = (value: any) => {
    return value === 0 ? value : value || 'N/A';
  };
  const handleBookingClick = (id) => {
    router.push(paths.dashboard.booking.details(id));
  };
  const tableCellStyle = { fontWeight: 'bold', fontSize: '1.125rem' };

  const bookingTableCells = [
    { label: 'Trainer Name', width: '250px' },
    { label: 'Booking ID', width: '150px' },
    { label: 'Total Booking Revenue', width: '240px' },
    { label: "Drivy's Commission", width: '250px' },
    { label: 'Trainer Earning', width: '250px' },
    { label: 'School Name', width: '250px' },
    { label: 'School Earnings', width: '250px' },
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
  const PayoutSummary = () => (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        padding: 2,
        backgroundColor: '#fff',
        borderRadius: 2,
        boxShadow: 1,
        mb: 3,
      }}
    >
      <Box sx={{ width: 200, height: 200, backgroundColor: '#ddd' }} />
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="subtitle1">Total paid amount</Typography>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          {totalPaidValue ?? '0'} AED
        </Typography>
        <Chip label="Paid" color="success" variant="soft" sx={{ mt: 1 }} />
        <Button
          variant="contained"
          sx={{ mt: 2, backgroundColor: '#C25A1D', '&:hover': { backgroundColor: '#A04917' } }}
          endIcon={<span>&rarr;</span>}
        >
          Payout
        </Button>
      </Box>
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
        <Tab label="Payout Details" />
        <Tab label="Payout History" />
      </Tabs>
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              {(activeTab === 0 ? bookingTableCells : payoutHistoryCells).map((cell, index) => (
                <TableCell key={index} sx={{ ...tableCellStyle, width: cell.width }}>
                  {cell.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {(activeTab === 0 ? payoutsList : payoutHistoryList)?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} sx={{ textAlign: 'center', fontStyle: 'italic' }}>
                  No records available
                </TableCell>
              </TableRow>
            ) : (
              (activeTab === 0 ? payoutsList : payoutHistoryList)?.map((item, index) => (
                <TableRow key={index}>
                  {activeTab === 0 ? (
                    <>
                      <TableCell>{item?.trainer_details?.trainer_name}</TableCell>
                      <TableCell
                        sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                        onClick={() => handleBookingClick(item?.booking_id)}
                      >
                        {renderCell(item?.booking_id)}
                      </TableCell>
                      <TableCell>{renderCell(item?.total_booking_revenue)} AED</TableCell>
                      <TableCell>{renderCell(item?.drivys_commission)} AED</TableCell>
                      <TableCell>
                        {renderCell(item?.trainer_details?.trainer_earning)} AED
                      </TableCell>
                      <TableCell>{item?.vendor_payout?.vendor_name ?? 'NA'}</TableCell>
                      <TableCell>
                        {Math.round(item?.vendor_payout?.earning * 100) / 100} AED
                      </TableCell>
                    </>
                  ) : (
                    <>
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
          count={activeTab === 0 ? totalPages : historyTotalPages}
          page={table.page}
          rowsPerPage={table.rowsPerPage}
          onPageChange={table.onChangePage}
          onRowsPerPageChange={table.onChangeRowsPerPage}
        />
      </Box>
    </Container>
  );
};
