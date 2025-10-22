import { useState, useCallback, useEffect } from 'react';
import isEqual from 'lodash/isEqual';
import {
  Card,
  Button,
  Table,
  TableBody,
  TableContainer,
  IconButton,
  Tooltip,
  Skeleton,
  TableCell,
  TableRow,
  Typography,
  Box,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import FilterListIcon from '@mui/icons-material/FilterList';
import { useSnackbar } from 'src/components/snackbar';
import Iconify from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import Scrollbar from 'src/components/scrollbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
import {
  useTable,
  TableHeadCustom,
  TableSelectedAction,
  TablePaginationCustom,
} from 'src/components/table';
import { useGetBookingStatusEnum } from 'src/api/booking';
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import BookingTableRow from '../booking-table-row';
import { useGetUsers } from 'src/api/users';
import BookingFilters from '../booking-filter';
import { useTranslation } from 'react-i18next';
import { useGetBookingList } from 'src/api/booking-assistant';

const defaultFilters = {
  city_id: '',
  category_id: '',
  trainer_id: '',
  student_id: '',
  booking_status: '',
  is_payment_approved: '',
  search: '',
};

export default function BookingListAssistantView() {
  const { t } = useTranslation();
  const table = useTable({ defaultRowsPerPage: 15, defaultOrderBy: 'id', defaultOrder: 'desc' });
  const { bookingStatusEnum, bookingStatusError, bookingStatusLoading } = useGetBookingStatusEnum();
  const openFilters = useBoolean();
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();
  const [tableData, setTableData] = useState([]);
  const [filters, setFilters] = useState(defaultFilters);
  const confirm = useBoolean();

  const {
    bookings,
    bookingListLoading,
    bookingListError,
    bookingListValidating,
    totalBookingPages,
    revalidateBookingList,
  } = useGetBookingList({
    city_id: filters?.city_id,
    category_id: filters?.category_id,
    trainer_id: filters?.trainer_id,
    student_id: filters?.student_id,
    booking_status: filters?.booking_status,
    is_payment_approved: filters?.is_payment_approved,
    page: table.page,
    limit: table.rowsPerPage,
    search: filters.search,
  });

  const [searchValue, setSearchValue] = useState('');
  const { users, usersLoading } = useGetUsers({
    page: 0,
    limit: 10,
    user_types: 'TRAINER',
    search: searchValue,
  });

  const [bookingCounts, setBookingCounts] = useState({
    all: 0,
    PENDING: 0,
    CONFIRMED: 0,
    CANCELLED: 0,
    COMPLETED: 0,
    IN_PROGRESS: 0,
  });

  const TABLE_HEAD = [
    { id: 'id', label: t('ID'), width: 180 },
    { id: 'customerName', label: t('Student Name'), width: 180 },
    { id: 'vendorName', label: t('Trainer Name'), width: 180 },
    { id: 'orderStatus', label: t('Booking Status'), width: 150 },
    { id: 'paymentStatus', label: t('Payment Status'), width: 150 },
    { id: 'price', label: t('Price'), width: 120 },
    { id: 'paymentMethod', label: t('Payment Method'), width: 150 },
    { id: 'coupon', label: t('Coupon'), width: 200 },
    { id: 'created', label: t('Created'), width: 200 },
    { id: 'action', label: '', width: 200 },
  ];

  useEffect(() => {
    if (bookings.booking_status_counts) {
      const initialCounts = { all: 0 };

      bookingStatusEnum.forEach((status) => {
        initialCounts[status.name] = 0;
      });

      Object.keys(bookings.booking_status_counts).forEach((statusKey) => {
        const statusCount = bookings.booking_status_counts[statusKey] || 0;

        const matchingStatus = bookingStatusEnum.find(
          (status) => status.name.replace(/\s+/g, '_').toUpperCase() === statusKey
        );

        if (matchingStatus) {
          initialCounts[matchingStatus.name] = statusCount;
          initialCounts.all += statusCount;
        }
      });

      setBookingCounts(initialCounts);
    }
  }, [bookings.booking_status_counts, bookingStatusEnum]);

  const vendorOptions = usersLoading
    ? [{ label: 'Loading...', value: '' }]
    : users.map((user) => ({
        label: user.name,
        value: user.id,
      }));

  useEffect(() => {
    if (bookings?.length > 0) {
      setTableData(bookings);
    } else {
      setTableData([]);
    }
  }, [bookings]);

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

  const handleClearSearch = () => {
    handleFilters('search', '');
  };

  const handleRowClick = (row: any) => {
    router.push(paths.dashboard.booking.details(row?.id));
  };

  const canReset = !isEqual(defaultFilters, filters);

  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  return (
    <Box sx={{ p: 4, bgcolor: '#fafafa', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 0.5 }}>
          {t('Bookings')}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t('Home')} / <span style={{ color: '#ff6b35' }}>{t('Bookings')}</span>
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
            {t('Booking List')}
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Search */}
            <TextField
              placeholder={t('Search bookings') || 'Search...'}
              size="small"
              value={filters.search}
              onChange={(e) => handleFilters('search', e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#999', fontSize: 20 }} />
                  </InputAdornment>
                ),
                endAdornment: filters.search && (
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
              value={filters.booking_status}
              onChange={(e) => handleFilters('booking_status', e.target.value)}
              displayEmpty
              sx={{
                minWidth: 150,
                bgcolor: '#fafafa',
                '& .MuiSelect-select': {
                  py: 1,
                },
              }}
            >
              <MenuItem value="">{t('Booking Status')}</MenuItem>
              {bookingStatusEnum.map((status) => (
                <MenuItem key={status.value} value={status.value}>
                  {t(status.name)}
                </MenuItem>
              ))}
            </Select>

            {/* Clear Booking Status Filter */}
            {filters.booking_status && (
              <IconButton
                size="small"
                onClick={() => handleFilters('booking_status', '')}
              >
                <CloseIcon sx={{ fontSize: 18 }} />
              </IconButton>
            )}

            {/* Payment Status Filter */}
            <Select
              size="small"
              value={filters.is_payment_approved}
              onChange={(e) => handleFilters('is_payment_approved', e.target.value)}
              displayEmpty
              sx={{
                minWidth: 150,
                bgcolor: '#fafafa',
                '& .MuiSelect-select': {
                  py: 1,
                },
              }}
            >
              <MenuItem value="">{t('Payment Status')}</MenuItem>
              <MenuItem value="1">{t('Approved')}</MenuItem>
              <MenuItem value="0">{t('Pending')}</MenuItem>
            </Select>

            {/* Clear Payment Status Filter */}
            {filters.is_payment_approved && (
              <IconButton
                size="small"
                onClick={() => handleFilters('is_payment_approved', '')}
              >
                <CloseIcon sx={{ fontSize: 18 }} />
              </IconButton>
            )}

            {/* Advanced Filters Button */}
            <Button
              variant="outlined"
              startIcon={<FilterListIcon />}
              onClick={openFilters.onTrue}
              sx={{
                textTransform: 'none',
                borderColor: '#ddd',
                color: '#666',
                '&:hover': {
                  borderColor: '#bbb',
                  bgcolor: '#f5f5f5',
                },
              }}
            >
              {t('More Filters')}
            </Button>

            {/* Reset Filters Button */}
            {canReset && (
              <Button
                variant="text"
                onClick={handleResetFilters}
                sx={{
                  textTransform: 'none',
                  color: '#ff6b35',
                  '&:hover': {
                    bgcolor: '#fff3f0',
                  },
                }}
              >
                {t('Reset')}
              </Button>
            )}
          </Box>
        </Box>

        {/* Active Filters Display */}
        {(filters.city_id || filters.category_id || filters.trainer_id || filters.student_id) && (
          <Box
            sx={{
              px: 3,
              py: 2,
              bgcolor: '#f8f8f8',
              borderBottom: '1px solid #f0f0f0',
              display: 'flex',
              flexWrap: 'wrap',
              gap: 1,
              alignItems: 'center',
            }}
          >
            <Typography variant="body2" sx={{ color: '#666', mr: 1 }}>
              {t('Active Filters')}:
            </Typography>

            {filters.city_id && (
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  bgcolor: 'white',
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 1,
                  border: '1px solid #e0e0e0',
                }}
              >
                <Typography variant="body2" sx={{ mr: 0.5 }}>
                  {t('City')}: {filters.city_id}
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => handleFilters('city_id', '')}
                  sx={{ ml: 0.5, p: 0.25 }}
                >
                  <CloseIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Box>
            )}

            {filters.category_id && (
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  bgcolor: 'white',
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 1,
                  border: '1px solid #e0e0e0',
                }}
              >
                <Typography variant="body2" sx={{ mr: 0.5 }}>
                  {t('Category')}: {filters.category_id}
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => handleFilters('category_id', '')}
                  sx={{ ml: 0.5, p: 0.25 }}
                >
                  <CloseIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Box>
            )}

            {filters.trainer_id && (
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  bgcolor: 'white',
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 1,
                  border: '1px solid #e0e0e0',
                }}
              >
                <Typography variant="body2" sx={{ mr: 0.5 }}>
                  {t('Trainer')}: {filters.trainer_id}
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => handleFilters('trainer_id', '')}
                  sx={{ ml: 0.5, p: 0.25 }}
                >
                  <CloseIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Box>
            )}

            {filters.student_id && (
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  bgcolor: 'white',
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 1,
                  border: '1px solid #e0e0e0',
                }}
              >
                <Typography variant="body2" sx={{ mr: 0.5 }}>
                  {t('Student')}: {filters.student_id}
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => handleFilters('student_id', '')}
                  sx={{ ml: 0.5, p: 0.25 }}
                >
                  <CloseIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Box>
            )}
          </Box>
        )}

        {/* Table with TableSelectedAction */}
        <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
          <TableSelectedAction
            dense={table.dense}
            numSelected={table.selected.length}
            rowCount={tableData.length}
            onSelectAllRows={(checked) =>
              table.onSelectAllRows(
                checked,
                tableData.map((row) => row.id)
              )
            }
            action={
              <Tooltip title="Delete">
                <IconButton onClick={confirm.onTrue}>
                  <Iconify icon="solar:trash-bin-trash-bold" />
                </IconButton>
              </Tooltip>
            }
          />

          <Scrollbar>
            <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 960 }}>
              <TableHeadCustom
                order={table.order}
                orderBy={table.orderBy}
                headLabel={TABLE_HEAD}
                rowCount={tableData.length}
                numSelected={table.selected.length}
                onSort={table.onSort}
                sx={{
                  '& .MuiTableCell-head': {
                    bgcolor: '#f8f8f8',
                    fontWeight: 600,
                    color: '#333',
                  },
                }}
              />
              <TableBody>
                {bookingListLoading &&
                  Array.from(new Array(5)).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell colSpan={TABLE_HEAD.length}>
                        <Skeleton animation="wave" height={40} />
                      </TableCell>
                    </TableRow>
                  ))}

                {!bookingListLoading &&
                  tableData.length > 0 &&
                  tableData.map((row) => (
                    <BookingTableRow
                      key={row.id}
                      row={row}
                      selected={table.selected.includes(row.id)}
                      onSelectRow={() => handleRowClick(row)}
                    />
                  ))}

                {!bookingListLoading && tableData.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={TABLE_HEAD.length} align="center" sx={{ py: 8 }}>
                      <Typography variant="body2" color="text.secondary">
                        {t('No data available')}
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
            count={totalBookingPages}
            page={table.page}
            rowsPerPage={table.rowsPerPage}
            onPageChange={table.onChangePage}
            onRowsPerPageChange={table.onChangeRowsPerPage}
            dense={table.dense}
            onChangeDense={table.onChangeDense}
          />
        </Box>
      </Card>

      {/* Advanced Filters Dialog */}
      <BookingFilters
        open={openFilters.value}
        onOpen={openFilters.onTrue}
        onClose={openFilters.onFalse}
        filters={filters}
        onFilters={handleFilters}
        canReset={canReset}
        onResetFilters={handleResetFilters}
      />

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title={t('Delete')}
        content={t('Are you sure you want to delete selected items?')}
        action={
          <Button variant="contained" color="error" onClick={confirm.onFalse}>
            {t('Delete')}
          </Button>
        }
      />
    </Box>
  );
}
