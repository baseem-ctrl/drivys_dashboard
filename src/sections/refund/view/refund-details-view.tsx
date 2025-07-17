import React, { useState } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  Button,
  useTheme,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  CircularProgress,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Chip,
  Switch,
  Container,
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { Star } from '@mui/icons-material';

import { Phone, Email } from '@mui/icons-material';
import {
  updatePaymentBookingStatus,
  useGetBookingById,
  useGetBookingStatusEnum,
  useGetPaymentStatusEnum,
} from 'src/api/booking';
import EditIcon from '@mui/icons-material/Edit';
import { useSnackbar } from 'src/components/snackbar';
import { useParams, useRouter } from 'src/routes/hooks';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs/custom-breadcrumbs';
import { paths } from 'src/routes/paths';
import BookingDetailsToolbar from 'src/sections/booking/booking-details-toolbar';
import { useSettingsContext } from 'src/components/settings';
import Iconify from 'src/components/iconify';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import moment from 'moment';
import { useTranslation } from 'react-i18next';

const RefundDetailsComponent = () => {
  const settings = useSettingsContext();
  const { t } = useTranslation();

  const { id } = useParams();
  const { enqueueSnackbar } = useSnackbar();

  const theme = useTheme();
  const router = useRouter();

  const { bookingDetails, bookingError, bookingLoading, revalidateBooking } = useGetBookingById(id);
  const { user, package: pkg, driver, pickup_location, total, sessions } = bookingDetails;
  const [value, setValue] = useState(0);
  const popover = usePopover();

  const handleBookingStatusChange = async (event: any) => {
    const selectedStatus = event;
    const formData = new FormData();
    formData.append('booking_status', selectedStatus);
    formData.append('id', id);

    try {
      const response = await updatePaymentBookingStatus(formData);
      enqueueSnackbar(response.message ?? 'Status Updated successfully', {
        variant: 'success',
      });

      revalidateBooking();
    } catch (error) {
      console.error('Failed to update payment status:', error);
      revalidateBooking();
    }
  };
  const handlePaymentStatusChange = async (event: any) => {
    const selectedStatus = event;
    const formData = new FormData();
    formData.append('payment_status', selectedStatus);
    formData.append('id', id);
    try {
      const response = await updatePaymentBookingStatus(formData);
      enqueueSnackbar(response.message ?? 'Status Updated successfully', {
        variant: 'success',
      });

      revalidateBooking();
    } catch (error) {
      console.error('Failed to update payment status:', error);
      revalidateBooking();
    }
  };
  const { bookingStatusEnum, bookingStatusError, bookingStatusLoading } = useGetBookingStatusEnum();
  const { paymentStatusEnum, paymentStatusError, paymentStatusLoading } = useGetPaymentStatusEnum();

  const handleClickDetails = (id) => {
    router.push(paths.dashboard.user.details(id));
  };
  const cardHeight = 370;
  const statusId = bookingStatusEnum.find(
    (item: any) => item?.name === bookingDetails?.booking_status
  )?.id;
  if (bookingLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh', // Full viewport height
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <BookingDetailsToolbar
        backLink={paths.dashboard.booking.root}
        orderNumber={bookingDetails?.id}
        createdAt={bookingDetails?.created_at}
        status={bookingDetails.booking_status}
        onChangeStatus={handleBookingStatusChange}
        statusOptions={bookingStatusEnum}
        statusId={statusId}
      />
      <Grid container spacing={4} sx={{ maxWidth: 1200, mx: 'auto', mt: 4 }}>
        <Grid item xs={12}>
          <Tabs value={value} onChange={(event, newValue) => setValue(newValue)}>
            <Tab label={t('booking_details')} />
            <Tab label={t('payment_and_summary')} />
          </Tabs>
        </Grid>
        {/* User Information */}
        {value === 0 && (
          <Grid
            item
            xs={12}
            md={6}
            onClick={() => handleClickDetails(user.id)}
            sx={{ cursor: 'pointer' }}
          >
            <Card
              sx={{
                boxShadow: 3,
                borderRadius: 2,
                height: cardHeight,
                minWidth: 450,
                overflow: 'auto',
              }}
            >
              <CardContent
                sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
              >
                <Typography variant="h6" sx={{ mb: 4, fontWeight: 'bold', color: 'primary.main' }}>
                  {t('user_information')}:
                </Typography>
                <Grid container spacing={5} alignItems="center">
                  <Grid item>
                    {user && user?.photo_url ? (
                      <Avatar
                        src={user.photo_url}
                        alt={`${user?.name}'s profile`}
                        sx={{
                          width: 80,
                          height: 80,
                          border: '2px solid #1976d2',
                          marginLeft: 2,
                          marginRight: 5,
                        }}
                      />
                    ) : (
                      <Avatar
                        sx={{
                          width: 80,
                          height: 80,
                          bgcolor: 'grey.500',
                          marginLeft: 2,
                          marginRight: 5,
                        }}
                      />
                    )}
                  </Grid>

                  <Grid item>
                    <Box sx={{ display: 'flex', width: '100%', mb: 1 }}>
                      <Box component="span" sx={{ minWidth: '170px', fontWeight: 'bold' }}>
                        {t('name')}
                      </Box>
                      <Box component="span" sx={{ minWidth: '10px', fontWeight: 'bold' }}>
                        :
                      </Box>
                      <Box component="span" sx={{ flex: 1 }}>
                        {user && user?.name ? user?.name : t('n_a')}
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', width: '100%', mb: 1 }}>
                      <Box component="span" sx={{ minWidth: '170px', fontWeight: 'bold' }}>
                        <Email fontSize="small" sx={{ verticalAlign: 'middle' }} /> {t('email')}
                      </Box>
                      <Box component="span" sx={{ minWidth: '10px', fontWeight: 'bold' }}>
                        :
                      </Box>
                      <Box component="span" sx={{ flex: 1 }}>
                        {user && user?.email ? user?.email : t('n_a')}
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', width: '100%', mb: 1 }}>
                      <Box component="span" sx={{ minWidth: '170px', fontWeight: 'bold' }}>
                        <Phone fontSize="small" sx={{ verticalAlign: 'middle' }} /> {t('phone')}
                      </Box>
                      <Box component="span" sx={{ minWidth: '10px', fontWeight: 'bold' }}>
                        :
                      </Box>
                      <Box component="span" sx={{ flex: 1 }}>
                        {user && user?.phone ? user?.phone : t('n_a')}
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', width: '100%', mb: 1 }}>
                      <Box component="span" sx={{ minWidth: '170px', fontWeight: 'bold' }}>
                        {t('country_code')}
                      </Box>
                      <Box component="span" sx={{ minWidth: '10px', fontWeight: 'bold' }}>
                        :
                      </Box>
                      <Box component="span" sx={{ flex: 1 }}>
                        {user && user?.country_code ? user?.country_code : t('n_a')}
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', width: '100%', mb: 1 }}>
                      <Box component="span" sx={{ minWidth: '170px', fontWeight: 'bold' }}>
                        {t('gear_type')}
                      </Box>
                      <Box component="span" sx={{ minWidth: '10px', fontWeight: 'bold' }}>
                        :
                      </Box>
                      <Box component="span" sx={{ flex: 1 }}>
                        {bookingDetails && bookingDetails?.gear_type
                          ? bookingDetails?.gear_type
                          : t('n_a')}
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', width: '100%', mb: 1 }}>
                      <Box component="span" sx={{ minWidth: '170px', fontWeight: 'bold' }}>
                        {t('dob')}
                      </Box>
                      <Box component="span" sx={{ minWidth: '10px', fontWeight: 'bold' }}>
                        :
                      </Box>
                      <Box component="span" sx={{ flex: 1 }}>
                        {user && user.dob ? new Date(user.dob).toLocaleDateString() : t('n_a')}
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', width: '100%', mb: 1 }}>
                      <Box component="span" sx={{ minWidth: '170px', fontWeight: 'bold' }}>
                        {t('locale')}
                      </Box>
                      <Box component="span" sx={{ minWidth: '10px', fontWeight: 'bold' }}>
                        :
                      </Box>
                      <Box component="span" sx={{ flex: 1 }}>
                        {user && user?.locale ? user?.locale : t('n_a')}
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', width: '100%', mb: 1, alignItems: 'center' }}>
                      <Box component="span" sx={{ minWidth: '170px', fontWeight: 'bold' }}>
                        {t('active')}
                      </Box>
                      <Box component="span" sx={{ minWidth: '10px', fontWeight: 'bold' }}>
                        :
                      </Box>
                      <Box component="span" sx={{ flex: 1 }}>
                        {user && user?.is_active ? (
                          <Switch
                            checked={user.is_active}
                            color={user.is_active ? 'success' : 'error'}
                            disabled
                          />
                        ) : (
                          t('n_a')
                        )}
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Driver Information */}
        {value === 0 && (
          <Grid
            item
            xs={12}
            md={6}
            onClick={() => handleClickDetails(driver.id)}
            sx={{ cursor: 'pointer' }}
          >
            <Card
              sx={{
                boxShadow: 3,
                borderRadius: 2,
                height: cardHeight,
                minWidth: 400,
                overflow: 'auto',
              }}
            >
              <CardContent
                sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
              >
                <Typography variant="h6" sx={{ mb: 4, fontWeight: 'bold', color: 'primary.main' }}>
                  {t('driver_information')}:
                </Typography>

                <Grid container spacing={5} alignItems="center">
                  <Grid item>
                    {driver && driver?.photo_url ? (
                      <Avatar
                        src={driver.photo_url}
                        alt={`${driver?.name}'s profile`}
                        sx={{
                          width: 80,
                          height: 80,
                          border: '2px solid #1976d2',
                          marginLeft: 2,
                          marginRight: 5,
                        }}
                      />
                    ) : (
                      <Avatar
                        sx={{
                          width: 80,
                          height: 80,
                          bgcolor: 'grey.500',
                          marginLeft: 2,
                          marginRight: 5,
                        }}
                      />
                    )}
                  </Grid>

                  <Grid item>
                    <Box sx={{ display: 'flex', width: '100%', mb: 1 }}>
                      <Box component="span" sx={{ minWidth: '170px', fontWeight: 'bold' }}>
                        {t('name')}
                      </Box>
                      <Box component="span" sx={{ minWidth: '10px', fontWeight: 'bold' }}>
                        :
                      </Box>
                      <Box component="span" sx={{ flex: 1 }}>
                        {driver && driver?.locale ? driver?.name : t('n_a')}
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', width: '100%', mb: 1 }}>
                      <Box component="span" sx={{ minWidth: '170px', fontWeight: 'bold' }}>
                        <Email fontSize="small" sx={{ verticalAlign: 'middle' }} /> {t('email')}
                      </Box>
                      <Box component="span" sx={{ minWidth: '10px', fontWeight: 'bold' }}>
                        :
                      </Box>
                      <Box component="span" sx={{ flex: 1 }}>
                        {driver && driver?.email ? driver?.email : t('n_a')}
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', width: '100%', mb: 1 }}>
                      <Box component="span" sx={{ minWidth: '170px', fontWeight: 'bold' }}>
                        <Phone fontSize="small" sx={{ verticalAlign: 'middle' }} /> {t('phone')}
                      </Box>
                      <Box component="span" sx={{ minWidth: '10px', fontWeight: 'bold' }}>
                        :
                      </Box>
                      <Box component="span" sx={{ flex: 1 }}>
                        {driver && driver?.phone ? driver?.phone : t('n_a')}
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', width: '100%', mb: 1 }}>
                      <Box component="span" sx={{ minWidth: '170px', fontWeight: 'bold' }}>
                        {t('country_code')}
                      </Box>
                      <Box component="span" sx={{ minWidth: '10px', fontWeight: 'bold' }}>
                        :
                      </Box>
                      <Box component="span" sx={{ flex: 1 }}>
                        {driver && driver?.country_code ? driver?.country_code : t('n_a')}
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', width: '100%', mb: 1 }}>
                      <Box component="span" sx={{ minWidth: '170px', fontWeight: 'bold' }}>
                        {t('locale')}
                      </Box>
                      <Box component="span" sx={{ minWidth: '10px', fontWeight: 'bold' }}>
                        :
                      </Box>
                      <Box component="span" sx={{ flex: 1 }}>
                        {driver && driver?.locale ? driver?.locale : t('n_a')}
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', width: '100%', mb: 1 }}>
                      <Box component="span" sx={{ minWidth: '170px', fontWeight: 'bold' }}>
                        {t('dob')}
                      </Box>
                      <Box component="span" sx={{ minWidth: '10px', fontWeight: 'bold' }}>
                        :
                      </Box>
                      <Box component="span" sx={{ flex: 1 }}>
                        {driver && driver.dob
                          ? new Date(driver.dob).toLocaleDateString()
                          : t('n_a')}
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', width: '100%', mb: 1, alignItems: 'center' }}>
                      <Box component="span" sx={{ minWidth: '170px', fontWeight: 'bold' }}>
                        {t('active')}
                      </Box>
                      <Box component="span" sx={{ minWidth: '10px', fontWeight: 'bold' }}>
                        :
                      </Box>
                      <Box component="span" sx={{ flex: 1 }}>
                        {driver && driver?.is_active ? (
                          <Switch
                            checked={driver.is_active}
                            color={driver.is_active ? 'success' : 'error'}
                            disabled
                          />
                        ) : (
                          t('n_a')
                        )}
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Package Details */}
        {value === 0 && (
          <Grid item xs={12} md={6}>
            <Card
              sx={{
                boxShadow: 3,
                borderRadius: 2,
                minHeight: cardHeight,
                minWidth: 400,
                overflow: 'auto',
              }}
            >
              <CardContent
                sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
              >
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: 'primary.main' }}>
                  {t('package_details')}:
                </Typography>

                <Box sx={{ display: 'flex', width: '100%', mb: 1, mt: 7, ml: 5 }}>
                  <Box component="span" sx={{ minWidth: '170px', fontWeight: 'bold' }}>
                    {t('package_name')}
                  </Box>
                  <Box component="span" sx={{ minWidth: '10px', fontWeight: 'bold' }}>
                    :
                  </Box>
                  <Box component="span" sx={{ flex: 1 }}>
                    {pkg?.package_translations[0]?.name || t('n_a')}
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', width: '100%', mb: 1, ml: 5 }}>
                  <Box component="span" sx={{ minWidth: '170px', fontWeight: 'bold' }}>
                    {t('number_of_sessions')}
                  </Box>
                  <Box component="span" sx={{ minWidth: '10px', fontWeight: 'bold' }}>
                    :
                  </Box>
                  <Box component="span" sx={{ flex: 1 }}>
                    {pkg?.number_of_sessions || t('n_a')}
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', width: '100%', mb: 1, ml: 5 }}>
                  <Box component="span" sx={{ minWidth: '170px', fontWeight: 'bold' }}>
                    {t('school')}
                  </Box>
                  <Box component="span" sx={{ minWidth: '10px', fontWeight: 'bold' }}>
                    :
                  </Box>
                  <Box component="span" sx={{ flex: 1 }}>
                    {pkg?.vendor?.vendor_translations[0]?.name || t('n_a')}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Pickup Location */}
        {value === 0 && (
          <Grid item xs={12} md={6}>
            <Card
              sx={{
                boxShadow: 3,
                borderRadius: 2,
                minHeight: cardHeight,
                minWidth: 400,
                overflow: 'auto',
              }}
            >
              <CardContent
                sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
              >
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: 'primary.main' }}>
                  {t('pickup_location')}:
                </Typography>

                <Box sx={{ display: 'flex', width: '100%', mb: 1, mt: 7, ml: 5 }}>
                  <Box component="span" sx={{ minWidth: '170px', fontWeight: 'bold' }}>
                    {t('label')}
                  </Box>
                  <Box component="span" sx={{ minWidth: '10px', fontWeight: 'bold' }}>
                    :
                  </Box>
                  <Box component="span" sx={{ flex: 1 }}>
                    {pickup_location?.label || t('n_a')}
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', width: '100%', mb: 1, ml: 5 }}>
                  <Box component="span" sx={{ minWidth: '170px', fontWeight: 'bold' }}>
                    {t('address')}
                  </Box>
                  <Box component="span" sx={{ minWidth: '10px', fontWeight: 'bold' }}>
                    :
                  </Box>
                  <Box component="span" sx={{ flex: 1 }}>
                    {pickup_location?.address || t('n_a')},{' '}
                    {pickup_location?.building_name || t('n_a')},{' '}
                    {pickup_location?.plot_number || t('n_a')}
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', width: '100%', mb: 1, ml: 5 }}>
                  <Box component="span" sx={{ minWidth: '170px', fontWeight: 'bold' }}>
                    {t('city')}
                  </Box>
                  <Box component="span" sx={{ minWidth: '10px', fontWeight: 'bold' }}>
                    :
                  </Box>
                  <Box component="span" sx={{ flex: 1 }}>
                    {pickup_location?.city || t('n_a')}
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', width: '100%', mb: 1, ml: 5 }}>
                  <Box component="span" sx={{ minWidth: '170px', fontWeight: 'bold' }}>
                    {t('phone')}
                  </Box>
                  <Box component="span" sx={{ minWidth: '10px', fontWeight: 'bold' }}>
                    :
                  </Box>
                  <Box component="span" sx={{ flex: 1 }}>
                    <Phone fontSize="small" /> {pickup_location?.phone_number || t('n_a')}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}

        {value === 1 && (
          <Grid item xs={12} md={6}>
            <Card
              sx={{
                boxShadow: 3,
                borderRadius: 2,
                minHeight: cardHeight,
                minWidth: 400,
                overflow: 'auto',
                position: 'relative',
              }}
            >
              <CardContent
                sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}
              >
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: 'primary.main' }}>
                  {t('payment_information')}
                </Typography>

                <Box sx={{ display: 'flex', ml: 5 }}>
                  <Button
                    color={
                      (bookingDetails.payment_status === 'PENDING' && 'info') ||
                      (bookingDetails.payment_status === 'PAID' && 'success') ||
                      (bookingDetails.payment_status === 'REFUNDED' && 'warning') ||
                      (bookingDetails.payment_status === 'PARTIALLY PAID' && 'primary') ||
                      (bookingDetails.payment_status === 'FAILED' && 'error') ||
                      'inherit'
                    }
                    variant="soft"
                    endIcon={<Iconify icon="eva:arrow-ios-downward-fill" />}
                    onClick={popover.onOpen}
                    sx={{ textTransform: 'capitalize', width: '100%' }}
                  >
                    {bookingDetails.payment_status}
                  </Button>
                </Box>

                <Box sx={{ display: 'flex', width: '100%', mb: 1, mt: 7, ml: 5 }}>
                  <Box component="span" sx={{ minWidth: '170px', fontWeight: 'bold' }}>
                    {t('booking_method')}
                  </Box>
                  <Box component="span" sx={{ minWidth: '10px', fontWeight: 'bold' }}>
                    :
                  </Box>
                  <Box component="span" sx={{ flex: 1 }}>
                    {bookingDetails?.booking_method || t('n/a')}
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', width: '100%', mb: 1, ml: 5 }}>
                  <Box component="span" sx={{ minWidth: '170px', fontWeight: 'bold' }}>
                    {t('amount_due')}
                  </Box>
                  <Box component="span" sx={{ minWidth: '10px', fontWeight: 'bold' }}>
                    :
                  </Box>
                  <Box component="span" sx={{ flex: 1 }}>
                    {`$${bookingDetails?.amount_due || t('n/a')}`}
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', width: '100%', mb: 1, ml: 5 }}>
                  <Box component="span" sx={{ minWidth: '170px', fontWeight: 'bold' }}>
                    {t('discount')}
                  </Box>
                  <Box component="span" sx={{ minWidth: '10px', fontWeight: 'bold' }}>
                    :
                  </Box>
                  <Box component="span" sx={{ flex: 1 }}>
                    {`$${bookingDetails?.discount || t('n/a')}`}
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', width: '100%', mb: 1, ml: 5 }}>
                  <Box component="span" sx={{ minWidth: '170px', fontWeight: 'bold' }}>
                    {t('amount_paid')}
                  </Box>
                  <Box component="span" sx={{ minWidth: '10px', fontWeight: 'bold' }}>
                    :
                  </Box>
                  <Box component="span" sx={{ flex: 1 }}>
                    {`$${bookingDetails?.amount_paid || t('n/a')}`}
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', width: '100%', mb: 1, ml: 5 }}>
                  <Box component="span" sx={{ minWidth: '170px', fontWeight: 'bold' }}>
                    {t('amount_refunded')}
                  </Box>
                  <Box component="span" sx={{ minWidth: '10px', fontWeight: 'bold' }}>
                    :
                  </Box>
                  <Box component="span" sx={{ flex: 1 }}>
                    {`$${bookingDetails?.amount_refunded || t('n/a')}`}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Booking Summary */}
        {value === 1 && (
          <Grid item xs={12}>
            <Card
              sx={{
                boxShadow: 3,
                borderRadius: 2,
                minHeight: cardHeight,
                minWidth: 400,
                overflow: 'auto',
              }}
            >
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: 'primary.main' }}>
                  {t('booking_summary')}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {t('total_amount')}
                </Typography>
                <Typography sx={{ fontWeight: '500' }}>
                  {bookingDetails.sub_total ? `$${bookingDetails.sub_total}` : t('n/a')}
                </Typography>
                <TableContainer component={Paper} sx={{ mt: 2 }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>{t('booking_id')}</TableCell>
                        <TableCell>{t('session_no')}</TableCell>
                        <TableCell>{t('session_status')}</TableCell>
                        <TableCell>{t('rating')}</TableCell>
                        <TableCell>{t('start_time')}</TableCell>
                        <TableCell>{t('end_time')}</TableCell>
                        <TableCell>{t('session_type')}</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {sessions.map((session) => (
                        <TableRow key={session?.id || t('n/a')}>
                          <TableCell>{session?.booking_id || t('n/a')}</TableCell>
                          <TableCell>{session?.session_no || t('n/a')}</TableCell>
                          <TableCell>{session?.session_status || t('n/a')}</TableCell>
                          <TableCell>
                            {session.user_rating ? (
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                {Array.from({ length: 5 }, (_, index) => (
                                  <Star
                                    key={index}
                                    sx={{
                                      color:
                                        index < session.user_rating
                                          ? theme.palette.primary.main
                                          : 'lightgrey',
                                    }}
                                  />
                                ))}
                              </Box>
                            ) : (
                              t('n/a')
                            )}
                          </TableCell>
                          <TableCell>
                            {session?.start_time
                              ? moment(session?.start_time)
                                  .local()
                                  .format('DD/MM/YY h:mm A')
                              : t('n/a')}
                          </TableCell>
                          <TableCell>
                            {session?.end_time
                              ? moment(session?.end_time)
                                  .local()
                                  .format('DD/MM/YY h:mm A')
                              : t('n/a')}
                          </TableCell>
                          <TableCell>{session?.session_type || t('n/a')}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="top-right"
        sx={{ width: 140 }}
      >
        {paymentStatusEnum.map((option) => (
          <MenuItem
            key={option.value}
            selected={parseInt(option.value, 10) === statusId}
            onClick={() => {
              popover.onClose();
              handlePaymentStatusChange(parseInt(option.value, 10));
            }}
          >
            {option.name}
          </MenuItem>
        ))}
      </CustomPopover>
    </Container>
  );
};

export default RefundDetailsComponent;
