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
  ListItem,
  ListItemText,
  Divider,
  Tooltip,
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
import BookingDetailsToolbar from '../booking-details-toolbar';
import { useSettingsContext } from 'src/components/settings';
import Iconify from 'src/components/iconify';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import moment from 'moment';
import { useTranslation } from 'react-i18next';

const BookingDetailsComponent = () => {
  const settings = useSettingsContext();
  const { t, i18n } = useTranslation();

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
    formData.append('booking_id', id);

    try {
      const response = await updatePaymentBookingStatus(formData);
      enqueueSnackbar(response.message ?? 'Status Updated successfully', {
        variant: 'success',
      });

      revalidateBooking();
    } catch (error) {
      if (error?.errors && typeof error?.errors === 'object' && !Array.isArray(error?.errors)) {
        Object.values(error?.errors).forEach((errorMessage) => {
          if (typeof errorMessage === 'object') {
            enqueueSnackbar(errorMessage[0], { variant: 'error' });
          } else {
            enqueueSnackbar(errorMessage, { variant: 'error' });
          }
        });
      } else {
        enqueueSnackbar(error.message, { variant: 'error' });
      }
      console.error('Failed to update payment status:', error);
      revalidateBooking();
    }
  };
  const handlePaymentStatusChange = async (event: any) => {
    const selectedStatus = event;
    const formData = new FormData();
    formData.append('payment_status', selectedStatus);
    formData.append('booking_id', id);
    try {
      const response = await updatePaymentBookingStatus(formData);
      enqueueSnackbar(response.message ?? t('Status Updated successfully'), {
        variant: 'success',
      });

      revalidateBooking();
    } catch (error) {
      if (error?.errors && typeof error?.errors === 'object' && !Array.isArray(error?.errors)) {
        Object.values(error?.errors).forEach((errorMessage) => {
          if (typeof errorMessage === 'object') {
            enqueueSnackbar(errorMessage[0], { variant: 'error' });
          } else {
            enqueueSnackbar(errorMessage, { variant: 'error' });
          }
        });
      } else {
        enqueueSnackbar(error.message, { variant: 'error' });
      }
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
      <Grid container spacing={4}>
        <Grid item xs={12}>
          <Tabs value={value} onChange={(event, newValue) => setValue(newValue)}>
            <Tab label={t('Booking Details')} />
            <Tab label={t('Payment & Summary')} />
          </Tabs>
        </Grid>
        {value === 0 && (
          <Grid item xs={12} md={12}>
            <Card sx={{ p: 3 }}>
              <Typography variant="subtitle1" color="primary" sx={{ mb: 1 }}>
                <strong>{t('impression')}</strong>
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {sessions[0]?.user_comments || 'N/A'}
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle1" sx={{ mb: 1 }} color="primary">
                <strong> {t('reason')}</strong>
              </Typography>
              <Typography variant="body2">{sessions[0]?.user_impression || 'N/A'}</Typography>
            </Card>
          </Grid>
        )}
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
                  {t('User Information')}:
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
                        {t('Name')}
                      </Box>
                      <Box component="span" sx={{ minWidth: '10px', fontWeight: 'bold' }}>
                        :
                      </Box>
                      <Box component="span" sx={{ flex: 1 }}>
                        {user && user?.name ? user?.name : t('n/a')}
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', width: '100%', mb: 1 }}>
                      <Box component="span" sx={{ minWidth: '170px', fontWeight: 'bold' }}>
                        <Email fontSize="small" sx={{ verticalAlign: 'middle' }} /> {t('Email')}
                      </Box>
                      <Box component="span" sx={{ minWidth: '10px', fontWeight: 'bold' }}>
                        :
                      </Box>
                      <Box component="span" sx={{ flex: 1 }}>
                        {user && user?.email ? user?.email : t('n/a')}
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', width: '100%', mb: 1 }}>
                      <Box component="span" sx={{ minWidth: '170px', fontWeight: 'bold' }}>
                        <Phone fontSize="small" sx={{ verticalAlign: 'middle' }} /> {t('Phone')}
                      </Box>
                      <Box component="span" sx={{ minWidth: '10px', fontWeight: 'bold' }}>
                        :
                      </Box>
                      <Box component="span" sx={{ flex: 1 }}>
                        {user && user?.phone ? user?.phone : t('n/a')}
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', width: '100%', mb: 1 }}>
                      <Box component="span" sx={{ minWidth: '170px', fontWeight: 'bold' }}>
                        {t('Country Code')}
                      </Box>
                      <Box component="span" sx={{ minWidth: '10px', fontWeight: 'bold' }}>
                        :
                      </Box>
                      <Box component="span" sx={{ flex: 1 }}>
                        {user && user?.country_code ? user?.country_code : t('n/a')}
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', width: '100%', mb: 1 }}>
                      <Box component="span" sx={{ minWidth: '170px', fontWeight: 'bold' }}>
                        {t('Gear Type')}
                      </Box>
                      <Box component="span" sx={{ minWidth: '10px', fontWeight: 'bold' }}>
                        :
                      </Box>
                      <Box component="span" sx={{ flex: 1 }}>
                        {bookingDetails && bookingDetails?.gear_type
                          ? bookingDetails?.gear_type
                          : t('n/a')}
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', width: '100%', mb: 1 }}>
                      <Box component="span" sx={{ minWidth: '170px', fontWeight: 'bold' }}>
                        {t('DOB')}
                      </Box>
                      <Box component="span" sx={{ minWidth: '10px', fontWeight: 'bold' }}>
                        :
                      </Box>
                      <Box component="span" sx={{ flex: 1 }}>
                        {user && user.dob ? new Date(user.dob).toLocaleDateString() : t('n/a')}
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', width: '100%', mb: 1 }}>
                      <Box component="span" sx={{ minWidth: '170px', fontWeight: 'bold' }}>
                        {t('Locale')}
                      </Box>
                      <Box component="span" sx={{ minWidth: '10px', fontWeight: 'bold' }}>
                        :
                      </Box>
                      <Box component="span" sx={{ flex: 1 }}>
                        {user && user?.locale ? user?.locale : t('n/a')}
                      </Box>
                    </Box>
                    {/* <Box sx={{ display: 'flex', width: '100%', mb: 1 }}>
                    <Box component="span" sx={{ minWidth: '170px', fontWeight: 'bold' }}>
                      Active
                    </Box>
                    <Box component="span" sx={{ minWidth: '10px', fontWeight: 'bold' }}>
                      :
                    </Box>
                    <Box component="span" sx={{ flex: 1 }}>
                      <Typography
                        variant="body1"
                        sx={{
                          color: user.is_active ? 'green' : 'red',
                          fontWeight: 'bold',
                        }}
                      >
                        {user.is_active ? 'Yes' : 'No'}
                      </Typography>
                    </Box>
                  </Box> */}
                    <Box sx={{ display: 'flex', width: '100%', mb: 1, alignItems: 'center' }}>
                      <Box component="span" sx={{ minWidth: '170px', fontWeight: 'bold' }}>
                        {t('Active')}
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
                          t('n/a')
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
                  {t('Driver Information')} :
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
                        {t('Name')}
                      </Box>
                      <Box component="span" sx={{ minWidth: '10px', fontWeight: 'bold' }}>
                        :
                      </Box>
                      <Box component="span" sx={{ flex: 1 }}>
                        {driver && driver?.locale ? driver?.name : t('n/a')}
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', width: '100%', mb: 1 }}>
                      <Box component="span" sx={{ minWidth: '170px', fontWeight: 'bold' }}>
                        <Email fontSize="small" sx={{ verticalAlign: 'middle' }} />
                        {t('Email')}
                      </Box>
                      <Box component="span" sx={{ minWidth: '10px', fontWeight: 'bold' }}>
                        :
                      </Box>
                      <Box component="span" sx={{ flex: 1 }}>
                        {driver && driver?.email ? driver?.email : t('n/a')}
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', width: '100%', mb: 1 }}>
                      <Box component="span" sx={{ minWidth: '170px', fontWeight: 'bold' }}>
                        <Phone fontSize="small" sx={{ verticalAlign: 'middle' }} />
                        {t('Phone')}
                      </Box>
                      <Box component="span" sx={{ minWidth: '10px', fontWeight: 'bold' }}>
                        :
                      </Box>
                      <Box component="span" sx={{ flex: 1 }}>
                        {driver && driver?.phone ? driver?.phone : t('n/a')}
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', width: '100%', mb: 1 }}>
                      <Box component="span" sx={{ minWidth: '170px', fontWeight: 'bold' }}>
                        {t('Country Code')}
                      </Box>
                      <Box component="span" sx={{ minWidth: '10px', fontWeight: 'bold' }}>
                        :
                      </Box>
                      <Box component="span" sx={{ flex: 1 }}>
                        {driver && driver?.country_code ? driver?.country_code : t('n/a')}
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', width: '100%', mb: 1 }}>
                      <Box component="span" sx={{ minWidth: '170px', fontWeight: 'bold' }}>
                        {t('Locale')}
                      </Box>
                      <Box component="span" sx={{ minWidth: '10px', fontWeight: 'bold' }}>
                        :
                      </Box>
                      <Box component="span" sx={{ flex: 1 }}>
                        {driver && driver?.locale ? driver?.locale : t('n/a')}
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', width: '100%', mb: 1 }}>
                      <Box component="span" sx={{ minWidth: '170px', fontWeight: 'bold' }}>
                        {t('DOB')}
                      </Box>
                      <Box component="span" sx={{ minWidth: '10px', fontWeight: 'bold' }}>
                        :
                      </Box>
                      <Box component="span" sx={{ flex: 1 }}>
                        {driver && driver.dob
                          ? new Date(driver.dob).toLocaleDateString()
                          : t('n/a')}
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', width: '100%', mb: 1, alignItems: 'center' }}>
                      <Box component="span" sx={{ minWidth: '170px', fontWeight: 'bold' }}>
                        {t('Active')}
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
                          t('n/a')
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
                  {t('Package Details')} :
                </Typography>

                <Box sx={{ display: 'flex', width: '100%', mb: 1, mt: 7, ml: 5 }}>
                  <Box component="span" sx={{ minWidth: '170px', fontWeight: 'bold' }}>
                    {t('Package Name')}
                  </Box>
                  <Box component="span" sx={{ minWidth: '10px', fontWeight: 'bold' }}>
                    :
                  </Box>
                  <Box component="span" sx={{ flex: 1 }}>
                    {pkg?.package_translations?.find(
                      (item) => item?.locale?.toLowerCase() === i18n.language.toLowerCase()
                    )?.name ||
                      pkg?.package_translations?.[0]?.name ||
                      t('n/a')}
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', width: '100%', mb: 1, ml: 5 }}>
                  <Box component="span" sx={{ minWidth: '170px', fontWeight: 'bold' }}>
                    {t('Number of Sessions')}
                  </Box>
                  <Box component="span" sx={{ minWidth: '10px', fontWeight: 'bold' }}>
                    :
                  </Box>
                  <Box component="span" sx={{ flex: 1 }}>
                    {pkg?.number_of_sessions || t('n/a')}
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', width: '100%', mb: 1, ml: 5 }}>
                  <Box component="span" sx={{ minWidth: '170px', fontWeight: 'bold' }}>
                    {t('School')}
                  </Box>
                  <Box component="span" sx={{ minWidth: '10px', fontWeight: 'bold' }}>
                    :
                  </Box>
                  <Box component="span" sx={{ flex: 1 }}>
                    {pkg?.vendor?.vendor_translations?.find(
                      (item) => item?.locale?.toLowerCase() === i18n.language.toLowerCase()
                    )?.name ||
                      pkg?.vendor?.vendor_translations?.[0]?.name ||
                      t('n/a')}
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
                  {t('Pickup Location')} :
                </Typography>

                <Box sx={{ display: 'flex', width: '100%', mb: 1, mt: 7, ml: 5 }}>
                  <Box component="span" sx={{ minWidth: '170px', fontWeight: 'bold' }}>
                    {t('Label')}
                  </Box>
                  <Box component="span" sx={{ minWidth: '10px', fontWeight: 'bold' }}>
                    :
                  </Box>
                  <Box component="span" sx={{ flex: 1 }}>
                    {pickup_location?.label || t('n/a')}
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', width: '100%', mb: 1, ml: 5 }}>
                  <Box component="span" sx={{ minWidth: '170px', fontWeight: 'bold' }}>
                    {t('Address')}
                  </Box>
                  <Box component="span" sx={{ minWidth: '10px', fontWeight: 'bold' }}>
                    :
                  </Box>
                  <Box component="span" sx={{ flex: 1 }}>
                    {pickup_location?.address || t('n/a')},{' '}
                    {pickup_location?.building_name || t('n/a')},{' '}
                    {pickup_location?.plot_number || t('n/a')}
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', width: '100%', mb: 1, ml: 5 }}>
                  <Box component="span" sx={{ minWidth: '170px', fontWeight: 'bold' }}>
                    {t('City')}
                  </Box>
                  <Box component="span" sx={{ minWidth: '10px', fontWeight: 'bold' }}>
                    :
                  </Box>
                  <Box component="span" sx={{ flex: 1 }}>
                    {pickup_location?.city || t('n/a')}
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', width: '100%', mb: 1, ml: 5 }}>
                  <Box component="span" sx={{ minWidth: '170px', fontWeight: 'bold' }}>
                    {t('Phone')}
                  </Box>
                  <Box component="span" sx={{ minWidth: '10px', fontWeight: 'bold' }}>
                    :
                  </Box>
                  <Box component="span" sx={{ flex: 1 }}>
                    <Phone fontSize="small" /> {pickup_location?.phone_number || t('n/a')}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}
        {value === 1 && (
          <Grid item xs={12} md={12}>
            <Card
              sx={{
                boxShadow: 3,
                borderRadius: 2,
                overflow: 'auto',
              }}
            >
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: 'primary.main' }}>
                  {t('Payment Information')} :
                </Typography>

                <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    color={
                      (bookingDetails.payment_status === 'PENDING' && 'info') ||
                      (bookingDetails.payment_status === 'PAID' && 'success') ||
                      (bookingDetails.payment_status === 'REFUNDED' && 'warning') ||
                      (bookingDetails.payment_status === 'PARTIALLY PAID' && 'default') ||
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

                <Grid container spacing={2}>
                  {/* Left Column */}
                  <Grid item xs={12} md={6}>
                    {[
                      {
                        label: t('payment_method'),
                        value: bookingDetails?.payment_method || t('n_a'),
                        tip: t('tooltip_payment_method'),
                      },
                      {
                        label: t('package_price'),
                        value: bookingDetails?.sub_total,
                        tip: t('tooltip_package_price'),
                      },
                      {
                        label: t('tax_amount'),
                        value: bookingDetails?.tax_amount,
                        tip: t('tooltip_tax_amount'),
                      },
                      {
                        label: t('transport_fee'),
                        value: bookingDetails?.transport_fee,
                        tip: t('tooltip_transport_fee'),
                      },
                    ].map((item, idx) => (
                      <Box
                        key={idx}
                        sx={{
                          mb: 1,
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: '14px',
                        }}
                      >
                        <Tooltip title={item.tip}>
                          <Typography
                            sx={{ fontWeight: 'bold', minWidth: '150px', fontSize: '14px' }}
                          >
                            {item.label}:
                          </Typography>
                        </Tooltip>
                        <Typography sx={{ fontSize: '14px' }}>
                          {item.value !== undefined && item.value !== null ? (
                            <>
                              {item.label !== t('payment_method') && (
                                <span className="dirham-symbol">&#x00EA;</span>
                              )}
                              {item.value}
                            </>
                          ) : (
                            t('n_a')
                          )}
                        </Typography>
                      </Box>
                    ))}
                  </Grid>

                  {/* Right Column */}
                  <Grid item xs={12} md={6}>
                    {[
                      {
                        label: t('amount_due'),
                        value: bookingDetails?.amount_due,
                        tip: t('tooltip_amount_due'),
                      },
                      {
                        label: t('amount_paid'),
                        value: bookingDetails?.amount_paid,
                        tip: t('tooltip_amount_paid'),
                      },
                      {
                        label: t('amount_refunded'),
                        value: bookingDetails?.amount_refunded,
                        tip: t('tooltip_amount_refunded'),
                      },

                      {
                        label: t('cash_service_fee'),
                        value: bookingDetails?.cash_service_fee,
                        tip: t('tooltip_cash_service_fee'),
                      },
                    ]
                      .filter(Boolean)
                      .map((item, idx) => (
                        <Box
                          key={idx}
                          sx={{
                            mb: 1,
                            display: 'flex',
                            justifyContent: 'space-between',
                            fontSize: '14px',
                          }}
                        >
                          <Tooltip title={item.tip}>
                            <Typography
                              sx={{ fontWeight: 'bold', minWidth: '150px', fontSize: '14px' }}
                            >
                              {item.label}:
                            </Typography>
                          </Tooltip>
                          <Typography sx={{ fontSize: '14px' }}>
                            {item.value !== undefined && item.value !== null ? (
                              <>
                                <span className="dirham-symbol">&#x00EA;</span>
                                {item.value}
                              </>
                            ) : (
                              t('n_a')
                            )}
                          </Typography>
                        </Box>
                      ))}
                  </Grid>

                  {/* Bottom Summary */}
                  <Grid item xs={12}>
                    <Divider sx={{ my: 1 }} />
                    {[
                      {
                        label: t('discount'),
                        value: bookingDetails?.discount,
                        tip: t('tooltip_discount'),
                      },
                      bookingDetails?.coupon_code
                        ? {
                            label: t('coupon_used'),
                            value: bookingDetails?.coupon_code,
                            tip: t('tooltip_coupon_used'),
                          }
                        : {
                            label: t('coupon_used'),
                            value: 'N/A',
                            tip: t('tooltip_coupon_used'),
                          },
                      {
                        label: t('total_amount'),
                        value: bookingDetails?.total,
                        tip: t('tooltip_total_amount'), // example: 'The total includes the package price, pickup fee, taxes, and cash service fee, along with the paid amount.'
                      },
                      bookingDetails?.wallet_amount_used !== '0.00' && {
                        label: t('wallet_amount_used'),
                        value: bookingDetails?.wallet_amount_used,
                        tip: t('tooltip_wallet_amount_used'),
                      },
                      {
                        label: t('amount_paid_net'),
                        value: bookingDetails?.amount_paid,
                        tip: t('tooltip_amount_paid_net'),
                      },
                    ]
                      .filter(Boolean)
                      .map((item, idx) => (
                        <Box
                          key={idx}
                          sx={{
                            mb: 0.5,
                            display: 'flex',
                            justifyContent: 'space-between',
                            fontSize: '14px',
                          }}
                        >
                          <Tooltip title={item.tip}>
                            <Typography
                              sx={{ fontWeight: 'bold', minWidth: '150px', fontSize: '14px' }}
                            >
                              {item.label}:
                            </Typography>
                          </Tooltip>
                          <Typography sx={{ fontSize: '14px' }}>
                            {item.value !== undefined && item.value !== null ? (
                              <>
                                {item.label !== t('coupon_used') && (
                                  <span className="dirham-symbol">&#x00EA;</span>
                                )}
                                {item.value}
                              </>
                            ) : (
                              t('n_a')
                            )}
                          </Typography>
                        </Box>
                      ))}
                  </Grid>
                </Grid>
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
                  {t('Booking Summary')} :
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {t('Total Amount')} :
                </Typography>
                <Typography sx={{ fontWeight: '500' }}>
                  <span className="dirham-symbol">&#x00EA;</span>

                  {bookingDetails.total ? `${bookingDetails.total}` : '0'}
                </Typography>

                <TableContainer component={Paper} sx={{ mt: 2 }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>{t('Booking ID')}</TableCell>
                        <TableCell>{t('Sessions')}</TableCell>
                        <TableCell>{t('Session Status')}</TableCell>
                        <TableCell>{t('Rating')}</TableCell>
                        <TableCell>{t('Start Time')}</TableCell>
                        <TableCell>{t('End Time')}</TableCell>
                        <TableCell>{t('Session Type')}</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {sessions.map((session) => (
                        <TableRow key={session?.id || t('n/a')}>
                          <TableCell>{session?.booking_id || t('n/a')}</TableCell>
                          <TableCell>
                            <ListItemText
                              primary={`${t('Total Sessions Booked')} : ${session?.no_of_sessions}`}
                              secondary={
                                <div>
                                  <p>
                                    {t('Session No.')}:{session?.session_no}
                                  </p>
                                  <p>
                                    {t('Completed Sessions')} :
                                    {bookingDetails.no_of_sessions_completed}
                                  </p>
                                </div>
                              }
                              secondaryTypographyProps={{
                                mt: 0.5,
                                component: 'span',
                                typography: 'caption',
                                color: 'text.disabled',
                              }}
                            />
                          </TableCell>

                          {/* <TableCell>{session?.session_no ||  t('n/a')}</TableCell> */}

                          <TableCell>
                            <Chip
                              label={session?.session_status}
                              color={
                                session?.session_status === 'PENDING'
                                  ? 'info'
                                  : session?.session_status === 'CANCELLED'
                                  ? 'error'
                                  : session?.session_status === 'CONFIRMED'
                                  ? 'default'
                                  : 'success'
                              }
                              variant="soft"
                            />
                          </TableCell>
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
                            {session.start_time
                              ? moment(session.start_time).local().format('DD/MM/YY h:mm A')
                              : t('n/a')}
                          </TableCell>

                          <TableCell>
                            {session.end_time
                              ? moment(session.end_time).local().format('DD/MM/YY h:mm A')
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
        {value === 0 && bookingDetails?.sessions?.[0]?.reschedules?.length > 0 && (
          <Box sx={{ mt: 4 }}>
            <Typography
              variant="h6"
              sx={{ mb: 2, fontWeight: 'bold', color: 'primary.main', ml: 4 }}
            >
              {t('Reschedule Details')} :
            </Typography>

            <TableContainer component={Paper} sx={{ ml: 2 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>{t('Original Start')}</TableCell>
                    <TableCell>{t('Original End')}</TableCell>
                    <TableCell>{t('New Start')}</TableCell>
                    <TableCell>{t('New End')}</TableCell>
                    <TableCell>{t('Requested By')}</TableCell>
                    <TableCell>{t('Status')}</TableCell>
                    <TableCell>{t('driver_comments')}</TableCell>
                    <TableCell>{t('Reason')}</TableCell>
                    <TableCell>{t('Reschedule Fee')}</TableCell>
                    <TableCell>{t('Payment Method')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {bookingDetails.sessions[0].reschedules.map((reschedule) => (
                    <TableRow key={reschedule.id}>
                      <TableCell>
                        {moment(reschedule.original_start)
                          .utcOffset('+04:00')
                          .format('DD/MM/YY h:mm A')}
                      </TableCell>
                      <TableCell>
                        {moment(reschedule.original_end)
                          .utcOffset('+04:00')
                          .format('DD/MM/YY h:mm A')}
                      </TableCell>
                      <TableCell>
                        {moment(reschedule.new_start).utc().format('DD/MM/YY h:mm A')}
                      </TableCell>
                      <TableCell>
                        {moment(reschedule.new_end).utc().format('DD/MM/YY h:mm A')}
                      </TableCell>
                      <TableCell>{reschedule.requested_by || t('n/a')}</TableCell>
                      <TableCell>
                        <Chip
                          label={reschedule.status}
                          color={
                            reschedule.status === 'Approved'
                              ? 'success'
                              : reschedule.status === 'Rejected'
                              ? 'error'
                              : 'warning'
                          }
                          variant="soft"
                        />
                      </TableCell>
                      <TableCell>
                        {reschedule.requested_by === 'Trainer'
                          ? sessions[0]?.driver_comments
                          : t('n/a')}
                      </TableCell>

                      <TableCell>{reschedule.reason || t('n/a')}</TableCell>
                      <TableCell>
                        <span className="dirham-symbol">&#x00EA;</span>
                        {reschedule.reschedule_fee ?? 0}
                      </TableCell>
                      <TableCell>{reschedule.payment_method || t('n/a')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
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

export default BookingDetailsComponent;
