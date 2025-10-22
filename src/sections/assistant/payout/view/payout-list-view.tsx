import { useState, useEffect } from 'react';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import {
  Box,
  Skeleton,
  Stack,
  TableCell,
  TableRow,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  Typography,
  IconButton,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';

// routes
import { paths } from 'src/routes/paths';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
// components
import Scrollbar from 'src/components/scrollbar';
import { useSettingsContext } from 'src/components/settings';

import {
  useTable,
  TableHeadCustom,
  TablePaginationCustom,
} from 'src/components/table';

// API
import { useGetPayoutList } from 'src/api/booking-assistant';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'src/routes/hooks';
import PayoutRow from '../payout-table-row';

// ----------------------------------------------------------------------

export default function PayoutListView() {
  const router = useRouter();
  const table = useTable({ defaultRowsPerPage: 15 });
  const settings = useSettingsContext();
  const [tableData, setTableData] = useState<any>([]);
  const { i18n, t } = useTranslation();

  const [searchQuery, setSearchQuery] = useState('');
  const [bookingStatusFilter, setBookingStatusFilter] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('');

  const TABLE_HEAD = [
    { id: 'user', label: t('student_name'), width: 180 },
    { id: 'trainer', label: t('trainer'), width: 180 },
    { id: 'booking_status', label: t('booking_status'), width: 150 },
    { id: 'payment_status', label: t('payment_status'), width: 150 },
    { id: 'amount', label: t('amount'), width: 120 },
    { id: 'remarks', label: t('remarks'), width: 200 },
    { id: 'payment_proof', label: t('payment_proof'), width: 150 },
    { id: 'created_date', label: t('created_date'), width: 150 },
    { id: 'created_time', label: t('created_time'), width: 120 },
  ];

  // Fetch real data from API
  const { payouts, payoutListLoading, totalPayoutPages } = useGetPayoutList({
    page: table.page,
    limit: table.rowsPerPage,
  });

  // Set real data from API
  useEffect(() => {
    if (payouts?.length) {
      setTableData(payouts);
    } else {
      setTableData([]);
    }
  }, [payouts]);

  // Filter real data
  const filteredData = tableData.filter((row: any) => {
    const matchesSearch =
      searchQuery === '' ||
      row?.booking?.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row?.booking?.user?.name_ar?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row?.booking?.driver?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row?.booking?.driver?.name_ar?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesBookingStatus =
      bookingStatusFilter === '' ||
      row?.booking?.booking_status === bookingStatusFilter;

    const matchesPaymentStatus =
      paymentStatusFilter === '' ||
      row?.payment_status === paymentStatusFilter;

    return matchesSearch && matchesBookingStatus && matchesPaymentStatus;
  });

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  const handleBookingStatusChange = (event) => {
    setBookingStatusFilter(event.target.value);
    table.onResetPage();
  };

  const handlePaymentStatusChange = (event) => {
    setPaymentStatusFilter(event.target.value);
    table.onResetPage();
  };

  return (
    <Box sx={{ p: 4, bgcolor: '#fafafa', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 0.5 }}>
          {t('payout')}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t('Home')} / <span style={{ color: '#ff6b35' }}>{t('payout')}</span>
        </Typography>
      </Box>

      {/* White Card Container */}
      <Card
        sx={{
          borderRadius: 2,
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          overflow: 'hidden',
        }}
      >
        {/* Card Header */}
        <Box
          sx={{
            p: 3,
            borderBottom: '1px solid #f0f0f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {t('payout_list')}
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Search */}
            <TextField
              placeholder={t('search') || 'Search...'}
              size="small"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#999', fontSize: 20 }} />
                  </InputAdornment>
                ),
                endAdornment: searchQuery && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={handleClearSearch}>
                      <CloseIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                width: 250,
                '& .MuiOutlinedInput-root': {
                  bgcolor: '#fafafa',
                },
              }}
            />

            {/* Booking Status Filter */}
            <Select
              size="small"
              value={bookingStatusFilter}
              onChange={handleBookingStatusChange}
              displayEmpty
              sx={{
                minWidth: 150,
                bgcolor: '#fafafa',
                '& .MuiSelect-select': {
                  py: 1,
                },
              }}
            >
              <MenuItem value="">{t('booking_status')}</MenuItem>
              <MenuItem value="SUCCESS">{t('success')}</MenuItem>
              <MenuItem value="FAIL">{t('fail')}</MenuItem>
              <MenuItem value="PENDING">{t('pending')}</MenuItem>
              <MenuItem value="CONFIRMED">{t('confirmed')}</MenuItem>
              <MenuItem value="CANCELLED">{t('cancelled')}</MenuItem>
              <MenuItem value="IN PROGRESS">{t('in_progress')}</MenuItem>
            </Select>

            {/* Clear Booking Status Filter */}
            {bookingStatusFilter && (
              <IconButton size="small" onClick={() => setBookingStatusFilter('')}>
                <CloseIcon sx={{ fontSize: 18 }} />
              </IconButton>
            )}

            {/* Payment Status Filter */}
            <Select
              size="small"
              value={paymentStatusFilter}
              onChange={handlePaymentStatusChange}
              displayEmpty
              sx={{
                minWidth: 150,
                bgcolor: '#fafafa',
                '& .MuiSelect-select': {
                  py: 1,
                },
              }}
            >
              <MenuItem value="">{t('payment_status')}</MenuItem>
              <MenuItem value="PAID">{t('paid')}</MenuItem>
              <MenuItem value="PENDING">{t('pending')}</MenuItem>
              <MenuItem value="PARTIALLY PAID">{t('partially_paid')}</MenuItem>
              <MenuItem value="REFUNDED">{t('refunded')}</MenuItem>
              <MenuItem value="FAILED">{t('failed')}</MenuItem>
            </Select>

            {/* Clear Payment Status Filter */}
            {paymentStatusFilter && (
              <IconButton size="small" onClick={() => setPaymentStatusFilter('')}>
                <CloseIcon sx={{ fontSize: 18 }} />
              </IconButton>
            )}
          </Box>
        </Box>

        {/* Table */}
        <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
          <Scrollbar>
            <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 1350 }}>
              <TableHeadCustom
                order={table.order}
                orderBy={table.orderBy}
                headLabel={TABLE_HEAD}
                rowCount={filteredData.length}
                numSelected={table.selected.length}
                sx={{
                  '& .MuiTableCell-head': {
                    bgcolor: '#f8f8f8',
                    fontWeight: 600,
                    color: '#333',
                  },
                }}
              />
              <TableBody>
                {payoutListLoading
                  ? Array.from(new Array(table.rowsPerPage)).map((_, index) => (
                      <TableRow key={index}>
                        <TableCell colSpan={TABLE_HEAD?.length || 9}>
                          <Skeleton animation="wave" height={40} />
                        </TableCell>
                      </TableRow>
                    ))
                  : filteredData?.map((row: any) => (
                      <PayoutRow
                        key={row.id}
                        row={row}
                        selected={false}
                      />
                    ))}

                {!payoutListLoading && filteredData.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={TABLE_HEAD.length} align="center" sx={{ py: 8 }}>
                      <Typography variant="body2" color="text.secondary">
                        {t('no_data_found')}
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Scrollbar>
        </TableContainer>

        {/* Pagination */}
        <Box
          sx={{
            borderTop: '1px solid #f0f0f0',
            px: 2,
            py: 1,
          }}
        >
          <TablePaginationCustom
            count={totalPayoutPages}
            page={table.page}
            rowsPerPage={table.rowsPerPage}
            onPageChange={table.onChangePage}
            onRowsPerPageChange={table.onChangeRowsPerPage}
            dense={table.dense}
            onChangeDense={table.onChangeDense}
          />
        </Box>
      </Card>
    </Box>
  );
}
