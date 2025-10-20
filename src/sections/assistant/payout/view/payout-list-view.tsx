import { useState, useEffect, useCallback } from 'react';
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
  FormControl,
  Typography,
  Tooltip,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

// routes
import { paths } from 'src/routes/paths';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
// components
import Scrollbar from 'src/components/scrollbar';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

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
  const table = useTable({ defaultRowsPerPage: 10 });
  const settings = useSettingsContext();
  const [tableData, setTableData] = useState<any>([]);
  const { i18n, t } = useTranslation();

  const [searchQuery, setSearchQuery] = useState('');
  const [bookingStatusFilter, setBookingStatusFilter] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('');

  const TABLE_HEAD = [
    { id: 'user', label: t('student_name'), width: 180, align: 'left' as const },
    { id: 'trainer', label: t('trainer'), width: 180, align: 'left' as const },
    { id: 'booking_status', label: t('booking_status'), width: 150, align: 'left' as const },
    { id: 'payment_status', label: t('payment_status'), width: 150, align: 'left' as const },
    { id: 'amount', label: t('amount'), width: 120, align: 'left' as const },
    { id: 'remarks', label: t('remarks'), width: 200, align: 'left' as const },
    { id: 'payment_proof', label: t('payment_proof'), width: 150, align: 'left' as const },
    { id: 'created_date', label: t('created_date'), width: 150, align: 'left' as const },
    { id: 'created_time', label: t('created_time'), width: 120, align: 'left' as const },
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

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <CustomBreadcrumbs
        heading={t('payout')}
        links={[
          { name: t('home'), href: paths.dashboard.root },
          { name: t('payout'), href: paths.dashboard.assistant.payout.list },
        ]}
        sx={{
          mb: { xs: 3, md: 4 },
        }}
      />

      <Card
        sx={{
          boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
          borderRadius: 2,
        }}
      >
        {/* Filters Section */}
        <Box
          sx={{
            p: 2.5,
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            alignItems={{ xs: 'stretch', sm: 'center' }}
            justifyContent="space-between"
          >
            <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.125rem' }}>
              {t('payout_list')}
            </Typography>

            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1.5}
              sx={{ width: { xs: '100%', sm: 'auto' } }}
            >
              {/* Search Field */}
              <TextField
                placeholder={t('search') + '...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                size="small"
                sx={{
                  minWidth: { sm: 240 },
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1.5,
                    bgcolor: 'background.paper',
                    '& fieldset': {
                      borderColor: 'divider',
                    },
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: 'text.disabled', width: 20, height: 20 }} />
                    </InputAdornment>
                  ),
                }}
              />

              {/* Booking Status Filter */}
              <FormControl size="small" sx={{ minWidth: 180 }}>
                <Select
                  value={bookingStatusFilter}
                  onChange={(e) => setBookingStatusFilter(e.target.value)}
                  displayEmpty
                  IconComponent={KeyboardArrowDownIcon}
                  sx={{
                    borderRadius: 1.5,
                    bgcolor: 'background.paper',
                    '& fieldset': {
                      borderColor: 'divider',
                    },
                  }}
                >
                  <MenuItem value="">
                    <Typography variant="body2" color="text.secondary">
                      {t('booking_status')}
                    </Typography>
                  </MenuItem>
                  <MenuItem value="SUCCESS">{t('success')}</MenuItem>
                  <MenuItem value="FAIL">{t('fail')}</MenuItem>
                  <MenuItem value="PENDING">{t('pending')}</MenuItem>
                  <MenuItem value="CONFIRMED">{t('confirmed')}</MenuItem>
                  <MenuItem value="CANCELLED">{t('cancelled')}</MenuItem>
                  <MenuItem value="IN PROGRESS">{t('in_progress')}</MenuItem>
                </Select>
              </FormControl>

              {/* Payment Status Filter */}
              <FormControl size="small" sx={{ minWidth: 180 }}>
                <Select
                  value={paymentStatusFilter}
                  onChange={(e) => setPaymentStatusFilter(e.target.value)}
                  displayEmpty
                  IconComponent={KeyboardArrowDownIcon}
                  sx={{
                    borderRadius: 1.5,
                    bgcolor: 'background.paper',
                    '& fieldset': {
                      borderColor: 'divider',
                    },
                  }}
                >
                  <MenuItem value="">
                    <Typography variant="body2" color="text.secondary">
                      {t('payment_status')}
                    </Typography>
                  </MenuItem>
                  <MenuItem value="PAID">{t('paid')}</MenuItem>
                  <MenuItem value="PENDING">{t('pending')}</MenuItem>
                  <MenuItem value="PARTIALLY PAID">{t('partially_paid')}</MenuItem>
                  <MenuItem value="REFUNDED">{t('refunded')}</MenuItem>
                  <MenuItem value="FAILED">{t('failed')}</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </Stack>
        </Box>

        {/* Table Section */}
        <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
          <Scrollbar>
            <Table
              size={table.dense ? 'small' : 'medium'}
              sx={{
                minWidth: 1350,
                '& .MuiTableCell-root': {
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  maxWidth: 0,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                },
              }}
            >
              <TableHeadCustom
                order={table.order}
                orderBy={table.orderBy}
                headLabel={TABLE_HEAD}
                rowCount={filteredData.length}
                numSelected={table.selected.length}
                sx={{
                  '& .MuiTableCell-head': {
                    bgcolor: '#fafafa',
                    color: 'text.secondary',
                    fontWeight: 600,
                    fontSize: '0.6875rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    py: 1.5,
                    textAlign: 'left',
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
        <TablePaginationCustom
          count={totalPayoutPages}
          page={table.page}
          rowsPerPage={table.rowsPerPage}
          onPageChange={table.onChangePage}
          onRowsPerPageChange={table.onChangeRowsPerPage}
          dense={table.dense}
          onChangeDense={table.onChangeDense}
          sx={{
            borderTop: '1px solid',
            borderColor: 'divider',
            '& .MuiTablePagination-toolbar': {
              py: 1.5,
            },
          }}
        />
      </Card>
    </Container>
  );
}
