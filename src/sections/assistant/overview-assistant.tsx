import { useEffect, useState } from 'react';
import {
  Box,
  Card,
  Typography,
  Avatar,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Skeleton,
  Grid,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import moment from 'moment';
import { useAuthContext } from 'src/auth/hooks';
import { useRouter } from 'src/routes/hooks';
import { useTranslation } from 'react-i18next';
import { useTable, TablePaginationCustom } from 'src/components/table';
import { useGetBookingList } from 'src/api/booking-assistant';
import { paths } from 'src/routes/paths';

const ORANGE = '#ff8c42';

const OverviewAssistant = () => {
  const { user } = useAuthContext();
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const table = useTable({ defaultRowsPerPage: 7, defaultOrderBy: 'id', defaultOrder: 'desc' });

  const [filters, setFilters] = useState({
    city_id: '',
    category_id: '',
    trainer_id: '',
    student_id: '',
    booking_status: '',
    is_payment_approved: '',
    search: '',
  });

  const {
    bookings,
    bookingListLoading,
    totalBookingPages,
  } = useGetBookingList({
    ...filters,
    page: table.page,
    limit: table.rowsPerPage,
  });

  const [tableData, setTableData] = useState([]);

  useEffect(() => {
    setTableData(bookings?.length ? bookings : []);
  }, [bookings]);

  const handleClickSave = () => router.push(paths.dashboard.assistant.edit);
  const handleRowClick = (row) => router.push(paths.dashboard.booking.details(row?.id));

  const getStatusColor = (status) => {
    if (status === 'COMPLETED') return '#28a745';
    if (status === 'PENDING') return '#f6a21e';
    return '#ccc';
  };

  const getPaymentColor = (status) => {
    if (status === 'Paid') return '#28a745';
    if (status === 'Not Paid') return '#e53935';
    return '#ccc';
  };

  return (
    <Box
      sx={{
        p: { xs: 2, md: 4 },
        bgcolor: '#fafafa',
        minHeight: '100vh',
      }}
    >
      <Typography variant="h5" fontWeight={700} mb={3}>
        {t('Profile')}
      </Typography>

      <Grid container spacing={3}>
        {/* PROFILE CARD */}
        <Grid item xs={12} md={5}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 4,
              overflow: 'hidden',
              boxShadow: '0 6px 20px rgba(0,0,0,0.06)',
              bgcolor: '#fff',
            }}
          >
            {/* Header image with gradient overlay */}
            <Box
              sx={{
                height: 180,
                backgroundImage: 'url(/public/assets/bg.png)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(45,80,22,0.8) 50%, rgba(0,0,0,0.7) 100%)',
                },
              }}
            >
              <Avatar
                src={user?.user?.photo_url || '/static/images/avatar_placeholder.png'}
                sx={{
                  width: 130,
                  height: 130,
                  position: 'absolute',
                  bottom: -65,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  borderRadius: 2,
                  border: '5px solid #fff',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                }}
              />
            </Box>

            {/* Content */}
            <Box sx={{ pt: 9, pb: 4, px: 4 }}>
              <Grid container spacing={3}>
                <Grid item xs={6}>
                  <Field label="Full Name" value={user?.user?.name} centered />
                </Grid>
                <Grid item xs={6}>
                  <Field label="Role" value={user?.user?.user_type || 'Admin'} centered />
                </Grid>
                <Grid item xs={6}>
                  <Field label="Gender" value={user?.user?.gender || 'N/A'} centered />
                </Grid>
                <Grid item xs={6}>
                  <Field label="Date of Birth" value={user?.user?.dob || 'N/A'} centered />
                </Grid>
                <Grid item xs={6}>
                  <Field label="Phone" value={`+971 ${user?.user?.phone || 'N/A'}`} centered />
                </Grid>
                <Grid item xs={6}>
                  <Field
                    label="Status"
                    value={user?.user?.is_active ? 'Active' : 'Inactive'}
                    valueColor={user?.user?.is_active ? '#28a745' : '#e53935'}
                    centered
                  />
                </Grid>
              </Grid>

              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={handleClickSave}
                  sx={{
                    color: ORANGE,
                    borderColor: ORANGE,
                    textTransform: 'none',
                    borderRadius: 2,
                    fontWeight: 600,
                    px: 3,
                    '&:hover': { bgcolor: `${ORANGE}10`, borderColor: ORANGE },
                  }}
                >
                  {t('Edit Profile')}
                </Button>
              </Box>
            </Box>
          </Card>
        </Grid>

        {/* RECENT BOOKINGS */}
        <Grid item xs={12} md={7}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 4,
              boxShadow: '0 6px 20px rgba(0,0,0,0.06)',
              bgcolor: '#fff',
              p: 3,
            }}
          >
            <Typography variant="h6" fontWeight={700} mb={2}>
              {t('Recent Bookings')}
            </Typography>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#fafafa' }}>
                    {['#ID', 'Student Name', 'Trainer Name', 'Booking Status', 'Payment Status'].map((col) => (
                      <TableCell key={col} sx={{ fontWeight: 600, fontSize: '13px', color: '#333' }}>
                        {col}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>

                <TableBody>
                  {bookingListLoading &&
                    Array.from({ length: 6 }).map((_, index) => (
                      <TableRow key={index}>
                        <TableCell colSpan={5}>
                          <Skeleton animation="wave" height={40} />
                        </TableCell>
                      </TableRow>
                    ))}

                  {!bookingListLoading && tableData.length > 0 &&
                    tableData.map((row) => (
                      <TableRow
                        key={row.id}
                        hover
                        onClick={() => handleRowClick(row)}
                        sx={{ cursor: 'pointer', '&:hover': { bgcolor: '#f9f9f9' } }}
                      >
                        <TableCell sx={{ fontSize: '13px', color: '#555' }}>BK{row.id}</TableCell>
                        <TableCell sx={{ fontSize: '13px', color: '#555' }}>
                          {row.user?.name || t('N/A')}
                        </TableCell>
                        <TableCell sx={{ fontSize: '13px', color: '#555' }}>
                          {row.driver?.name || t('N/A')}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={row.booking_status || 'Pending'}
                            size="small"
                            sx={{
                              fontSize: '12px',
                              fontWeight: 500,
                              color: '#fff',
                              bgcolor: getStatusColor(row.booking_status),
                              borderRadius: '20px',
                              px: 1.5,
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={row.payment_status || 'Not Paid'}
                            size="small"
                            sx={{
                              fontSize: '12px',
                              fontWeight: 500,
                              color: row.payment_status === 'Paid' ? '#28a745' : '#e53935',
                              bgcolor: `${row.payment_status === 'Paid' ? '#28a74522' : '#e5393522'}`,
                              borderRadius: '20px',
                              px: 1.5,
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}

                  {!bookingListLoading && tableData.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        <Typography variant="body2" color="text.secondary">
                          {t('No bookings found')}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {!bookingListLoading && tableData.length > 0 && (
              <TablePaginationCustom
                count={totalBookingPages}
                page={table.page}
                rowsPerPage={table.rowsPerPage}
                onPageChange={table.onChangePage}
                onRowsPerPageChange={table.onChangeRowsPerPage}
              />
            )}
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

const Field = ({ label, value, valueColor, centered }) => (
  <Box sx={{
    textAlign: centered ? 'center' : 'left',
    minHeight: '80px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    p: 2,
    bgcolor: '#fafafa',
    borderRadius: 2,
  }}>
    <Typography
      sx={{
        color: ORANGE,
        fontSize: '11px',
        fontWeight: 700,
        textTransform: 'uppercase',
        mb: 0.5,
      }}
    >
      {label}
    </Typography>
    <Typography
      sx={{
        fontSize: '15px',
        fontWeight: 600,
        color: valueColor || '#333',
      }}
    >
      {value}
    </Typography>
  </Box>
);

export default OverviewAssistant;
