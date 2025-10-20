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
  FormControl,
  Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

// routes
import { paths } from 'src/routes/paths';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
// components
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import {
  useTable,
  TableHeadCustom,
  TablePaginationCustom,
} from 'src/components/table';

// API
import { useGetCommissionList } from 'src/api/booking-assistant';
import { useTranslation } from 'react-i18next';
import CommissionRow from '../commission-table-row';

// ----------------------------------------------------------------------

export default function CommissionListView() {
  const table = useTable({ defaultRowsPerPage: 15 });
  const settings = useSettingsContext();
  const [tableData, setTableData] = useState<any>([]);
  const { i18n, t } = useTranslation();

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [bookingStatusFilter, setBookingStatusFilter] = useState('');
  const [driverStatusFilter, setDriverStatusFilter] = useState('');

  const TABLE_HEAD = [
    { id: 'user', label: t('student'), width: 200 },
    { id: 'trainer', label: t('trainer'), width: 200 },
    { id: 'booking_status', label: t('booking_status'), width: 200 },
    { id: 'driver_status', label: t('driver_status'), width: 200 },
    { id: 'amount', label: t('amount'), width: 200 },
    { id: 'remarks', label: t('remarks'), width: 200 },
  ];

  // Fetch real data from API
  const { commissions, commissionListLoading, totalCommissionPages } = useGetCommissionList({
    page: table.page,
    limit: table.rowsPerPage,
  });

  // Set real data from API
  useEffect(() => {
    if (commissions?.length) {
      setTableData(commissions);
    } else {
      setTableData([]);
    }
  }, [commissions]);

  // Client-side filtering - similar to Payout view
  const filteredData = tableData.filter((row: any) => {
    // Search filter - matches student name, trainer name (including Arabic names if available)
    const matchesSearch =
      searchQuery === '' ||
      row?.student?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row?.student?.name_ar?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row?.trainer?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row?.trainer?.name_ar?.toLowerCase().includes(searchQuery.toLowerCase());

    // Booking status filter
    const matchesBookingStatus =
      bookingStatusFilter === '' ||
      row?.booking_status === bookingStatusFilter;

    // Driver status filter
    const matchesDriverStatus =
      driverStatusFilter === '' ||
      row?.driver_status === driverStatusFilter;

    return matchesSearch && matchesBookingStatus && matchesDriverStatus;
  });

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <CustomBreadcrumbs
        heading={t('commission')}
        links={[
          { name: t('dashboard'), href: paths.dashboard.root },
          {
            name: t('commission'),
            href: paths.dashboard.assistant.commission.list,
          },
          { name: t('list') },
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
              {t('commission_list')}
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

              {/* Driver Status Filter */}
              <FormControl size="small" sx={{ minWidth: 180 }}>
                <Select
                  value={driverStatusFilter}
                  onChange={(e) => setDriverStatusFilter(e.target.value)}
                  displayEmpty
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
                      {t('driver_status')}
                    </Typography>
                  </MenuItem>
                  <MenuItem value="AVAILABLE">{t('available')}</MenuItem>
                  <MenuItem value="BUSY">{t('busy')}</MenuItem>
                  <MenuItem value="OFFLINE">{t('offline')}</MenuItem>
                  <MenuItem value="ON_DUTY">{t('on_duty')}</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </Stack>
        </Box>

        {/* Table Section */}
        <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
          <Table
            size={table.dense ? 'small' : 'medium'}
            sx={{
              minWidth: 1200,
              '& .MuiTableCell-root': {
                borderBottom: '1px solid',
                borderColor: 'divider',
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
                },
              }}
            />
            <TableBody>
              {commissionListLoading
                ? Array.from(new Array(table.rowsPerPage)).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell colSpan={TABLE_HEAD?.length || 6}>
                        <Skeleton animation="wave" height={40} />
                      </TableCell>
                    </TableRow>
                  ))
                : filteredData?.map((row: any) => (
                    <CommissionRow
                      key={row.id}
                      row={row}
                      selected={false}
                    />
                  ))}

              {!commissionListLoading && filteredData.length === 0 && (
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
        </TableContainer>

        {/* Pagination */}
        <TablePaginationCustom
          count={totalCommissionPages}
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
