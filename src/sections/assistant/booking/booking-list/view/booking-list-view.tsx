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
  <Box sx={{ display: 'flex', minHeight: '100vh' }}>

    {/* SIDEBAR */}
    <Box
      sx={{
        width: { xs: '100%', md: '400px', lg: '360px' },
        position: { xs: 'relative', md: 'fixed' },
        height: '100vh',
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        zIndex: 100,
        overflowY: 'auto',
      }}
    >
      <Card
        sx={{
          bgcolor: SIDEBAR_BG,
          color: '#fff',
          borderRadius: CARD_RADIUS,
          p: 3,
          flex: '1 1 auto',
          display: 'flex',
          flexDirection: 'column',
        }}
        elevation={6}
      >
        <CardContent sx={{ p: 0, flex: '1 1 auto', display: 'flex', flexDirection: 'column' }}>
          <ProfileBlock />
          <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)', my: 2 }} />

          {/* Progress Box */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, py: 1.5, px: 2, bgcolor: 'rgba(255,255,255,0.03)', borderRadius: 1.5 }}>
            <Typography sx={{ color: '#ccc', fontSize: 12, fontWeight: 500 }}>Progress</Typography>
            <Typography sx={{ color: ACCENT, fontWeight: 700, fontSize: 14 }}>{activeStep + 1}/{steps.length}</Typography>
          </Box>

          {/* Stepper */}
          <Box sx={{ flex: 1, overflowY: 'auto', pr: 1 }}>
            <Stepper activeStep={activeStep} orientation="vertical" sx={{ '.MuiStep-root': { padding: '16px 0' } }}>
              {steps.map((label, idx) => (
                <Step key={label}>
                  <StepLabel
                    onClick={() => idx < activeStep && setActiveStep(idx)}
                    sx={{ cursor: idx < activeStep ? 'pointer' : 'default' }}
                  >
                    {label}
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>

          {/* Quick Actions */}
          <Box sx={{ mt: 3 }}>
            <Typography sx={{ color: '#bbb', fontSize: 12, mb: 1 }}>Quick actions</Typography>
            <Stack direction="row" spacing={1}>
              <Button variant="outlined" size="small" disabled={activeStep === 0} onClick={handleBack}>Previous</Button>
              <Button variant="contained" size="small" disabled={activeStep === steps.length - 1} onClick={handleNext}>Next</Button>
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </Box>

    {/* MAIN CONTENT */}
    <Box
      sx={{
        flex: 1,
        ml: { xs: 0, md: '400px', lg: '360px' },
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        p: { xs: 2, md: 4 },
      }}
    >
      <Card sx={{ borderRadius: CARD_RADIUS, flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }} elevation={2}>

        {/* FIXED HEADER */}
        <Box sx={{ p: 3, flexShrink: 0 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>{steps[activeStep]}</Typography>
          <Typography sx={{ color: 'text.secondary', fontSize: 13 }}>Follow the steps to create a booking</Typography>
          <Divider sx={{ mt: 2 }} />
        </Box>

        {/* SCROLLABLE CONTENT */}
        <Box sx={{ flex: 1, overflowY: 'auto', p: 3 }}>
          {renderStepContent()}
        </Box>

        {/* FIXED FOOTER */}
        <Box sx={{ p: 3, flexShrink: 0, borderTop: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button variant="text" onClick={handleBack} disabled={activeStep === 0}>Back</Button>
          {activeStep < steps.length - 1 ? (
            <Button variant="contained" onClick={handleNext}>Next</Button>
          ) : (
            <Button variant="contained" onClick={createBookingStudent}>Submit</Button>
          )}
        </Box>
      </Card>
    </Box>
  </Box>
);

}
