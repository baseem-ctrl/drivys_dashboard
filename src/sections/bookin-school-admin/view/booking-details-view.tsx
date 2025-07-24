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
  ListItemText,
  Divider,
} from '@mui/material';
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
import BookingDetailsToolbar from '../bookin-school-admin-table-tool-bar';
import { useSettingsContext } from 'src/components/settings';
import Iconify from 'src/components/iconify';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import { useGetBookingSchoolAdminById } from 'src/api/booking-school-admin';
import BookingAdminDetailsToolbar from '../booking-admin-details-tool-bar';
import moment from 'moment';
import { useTranslation } from 'react-i18next';

const BookingDetailsComponent = () => {
  const settings = useSettingsContext();
  const { t, i18n } = useTranslation();

  const { id } = useParams();
  const { enqueueSnackbar } = useSnackbar();

  const theme = useTheme();
  const router = useRouter();

  const { bookingDetails, bookingError, bookingLoading, revalidateBooking } =
    useGetBookingSchoolAdminById(id);
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
      revalidateBooking();
    }
  };
  const { bookingStatusEnum, bookingStatusError, bookingStatusLoading } = useGetBookingStatusEnum();
  const { paymentStatusEnum, paymentStatusError, paymentStatusLoading } = useGetPaymentStatusEnum();

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
      <BookingAdminDetailsToolbar
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
          <Grid item xs={12} md={12}>
            <Card sx={{ p: 3 }}>
              <Typography variant="subtitle1" color="primary" sx={{ mb: 1 }}>
                <strong>{t('impression')}</strong>
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {sessions[0]?.user_comments || t('n/a')}
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle1" sx={{ mb: 1 }} color="primary">
                <strong>{t('reason')}</strong>
              </Typography>
              <Typography variant="body2">{sessions[0]?.user_impression || t('n/a')}</Typography>
            </Card>
          </Grid>
        )}

        {value === 0 && (
          <Grid item xs={12} md={6}>
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
                  {t('user_information')}
                </Typography>
                <Grid container spacing={5} alignItems="center">
                  <Grid item>
                    {user?.photo_url ? (
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
                    {[
                      { label: t('name'), value: user?.name },
                      {
                        label: (
                          <>
                            <Email fontSize="small" sx={{ verticalAlign: 'middle' }} /> {t('email')}
                          </>
                        ),
                        value: user?.email,
                      },
                      {
                        label: (
                          <>
                            <Phone fontSize="small" sx={{ verticalAlign: 'middle' }} /> {t('phone')}
                          </>
                        ),
                        value: user?.phone,
                      },
                      { label: t('country_code'), value: user?.country_code },
                      { label: t('gear_type'), value: bookingDetails?.gear_type },
                      {
                        label: t('dob'),
                        value: user?.dob ? new Date(user.dob).toLocaleDateString() : null,
                      },
                      { label: t('locale'), value: user?.locale },
                    ].map(({ label, value }, idx) => (
                      <Box key={idx} sx={{ display: 'flex', width: '100%', mb: 1 }}>
                        <Box component="span" sx={{ minWidth: '170px', fontWeight: 'bold' }}>
                          {label}
                        </Box>
                        <Box component="span" sx={{ minWidth: '10px', fontWeight: 'bold' }}>
                          :
                        </Box>
                        <Box component="span" sx={{ flex: 1 }}>
                          {value || t('n/a')}
                        </Box>
                      </Box>
                    ))}

                    <Box sx={{ display: 'flex', width: '100%', mb: 1, alignItems: 'center' }}>
                      <Box component="span" sx={{ minWidth: '170px', fontWeight: 'bold' }}>
                        {t('active')}
                      </Box>
                      <Box component="span" sx={{ minWidth: '10px', fontWeight: 'bold' }}>
                        :
                      </Box>
                      <Box component="span" sx={{ flex: 1 }}>
                        {user?.is_active !== undefined ? (
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
          <Grid item xs={12} md={6}>
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
                  {t('driver_information')}
                </Typography>
                <Grid container spacing={5} alignItems="center">
                  <Grid item>
                    {driver?.photo_url ? (
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
                    {[
                      { label: t('name'), value: driver?.name },
                      {
                        label: (
                          <>
                            <Email fontSize="small" sx={{ verticalAlign: 'middle' }} /> {t('email')}
                          </>
                        ),
                        value: driver?.email,
                      },
                      {
                        label: (
                          <>
                            <Phone fontSize="small" sx={{ verticalAlign: 'middle' }} /> {t('phone')}
                          </>
                        ),
                        value: driver?.phone,
                      },
                      { label: t('country_code'), value: driver?.country_code },
                      { label: t('locale'), value: driver?.locale },
                      {
                        label: t('dob'),
                        value: driver?.dob ? new Date(driver.dob).toLocaleDateString() : null,
                      },
                    ].map(({ label, value }, idx) => (
                      <Box key={idx} sx={{ display: 'flex', width: '100%', mb: 1 }}>
                        <Box component="span" sx={{ minWidth: '170px', fontWeight: 'bold' }}>
                          {label}
                        </Box>
                        <Box component="span" sx={{ minWidth: '10px', fontWeight: 'bold' }}>
                          :
                        </Box>
                        <Box component="span" sx={{ flex: 1 }}>
                          {value || t('n/a')}
                        </Box>
                      </Box>
                    ))}

                    <Box sx={{ display: 'flex', width: '100%', mb: 1, alignItems: 'center' }}>
                      <Box component="span" sx={{ minWidth: '170px', fontWeight: 'bold' }}>
                        {t('active')}
                      </Box>
                      <Box component="span" sx={{ minWidth: '10px', fontWeight: 'bold' }}>
                        :
                      </Box>
                      <Box component="span" sx={{ flex: 1 }}>
                        {driver?.is_active !== undefined ? (
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
                  {t('package_details')}
                </Typography>

                <Box sx={{ display: 'flex', width: '100%', mb: 1, mt: 7, ml: 5 }}>
                  <Box component="span" sx={{ minWidth: '170px', fontWeight: 'bold' }}>
                    {t('package_name')}
                  </Box>
                  <Box component="span" sx={{ minWidth: '10px', fontWeight: 'bold' }}>
                    :
                  </Box>
                  <Box component="span" sx={{ flex: 1 }}>
                    {pkg?.package_translations?.find((item) => item?.locale === i18n.language)
                      ?.name || t('n/a')}
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
                    {pkg?.number_of_sessions || t('n/a')}
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
                  {t('pickup_location')}
                </Typography>

                <Box sx={{ display: 'flex', width: '100%', mb: 1, mt: 7, ml: 5 }}>
                  <Box component="span" sx={{ minWidth: '170px', fontWeight: 'bold' }}>
                    {t('label')}
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
                    {t('address')}
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
                    {t('city')}
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
                    {t('phone')}
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
                  {t('payment_information')}
                </Typography>

                <Box sx={{ mb: 3 }}>
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
                    sx={{ textTransform: 'capitalize', width: '40%' }}
                  >
                    {bookingDetails.payment_status}
                  </Button>
                </Box>

                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}>
                      <Typography sx={{ fontWeight: 'bold', minWidth: '170px' }}>
                        {t('payment_method')}
                      </Typography>
                      <Typography>{bookingDetails?.booking_method || t('n/a')}</Typography>
                    </Box>

                    <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}>
                      <Typography sx={{ fontWeight: 'bold', minWidth: '170px' }}>
                        {t('payment_amount')}
                      </Typography>
                      <Typography>
                        {`${bookingDetails?.sub_total || '0'} `}
                        <span className="dirham-symbol">&#x00EA;</span>
                      </Typography>
                    </Box>

                    <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}>
                      <Typography sx={{ fontWeight: 'bold', minWidth: '170px' }}>
                        {t('tax_amount')}
                      </Typography>
                      <Typography>
                        <span className="dirham-symbol">&#x00EA;</span>
                        {`${bookingDetails?.tax_amount || '0'}`}
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}>
                      <Typography sx={{ fontWeight: 'bold', minWidth: '170px' }}>
                        {t('amount_due')}
                      </Typography>
                      <Typography>
                        <span className="dirham-symbol">&#x00EA;</span>
                        {`${bookingDetails?.amount_due || '0'}`}
                      </Typography>
                    </Box>

                    <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}>
                      <Typography sx={{ fontWeight: 'bold', minWidth: '170px' }}>
                        {t('amount_paid')}
                      </Typography>
                      <Typography>
                        <span className="dirham-symbol">&#x00EA;</span>
                        {`${bookingDetails?.amount_paid || '0'}`}
                      </Typography>
                    </Box>

                    <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}>
                      <Typography sx={{ fontWeight: 'bold', minWidth: '170px' }}>
                        {t('amount_refunded')}
                      </Typography>
                      <Typography>
                        <span className="dirham-symbol">&#x00EA;</span>
                        {`${bookingDetails?.amount_refunded || '0'}`}
                      </Typography>
                    </Box>

                    {bookingDetails?.coupon_code && (
                      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}>
                        <Typography sx={{ fontWeight: 'bold', minWidth: '170px' }}>
                          {t('coupon_used')}
                        </Typography>
                        <Typography>
                          <span className="dirham-symbol">&#x00EA;</span>
                          {`${bookingDetails?.coupon_code || '0'}`}
                        </Typography>
                      </Box>
                    )}

                    {bookingDetails?.wallet_amount_used !== '0.00' && (
                      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}>
                        <Typography sx={{ fontWeight: 'bold', minWidth: '170px' }}>
                          {t('wallet_amount_used')}
                        </Typography>
                        <Typography>
                          <span className="dirham-symbol">&#x00EA;</span>
                          {`${bookingDetails?.wallet_amount_used || '0'} `}
                        </Typography>
                      </Box>
                    )}
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}>
                      <Typography sx={{ fontWeight: 'bold', minWidth: '170px' }}>
                        {t('discount')}
                      </Typography>
                      <Typography>
                        <span className="dirham-symbol">&#x00EA;</span>
                        {`${bookingDetails?.discount || '0'}`}
                      </Typography>
                    </Box>

                    <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}>
                      <Typography sx={{ fontWeight: 'bold', minWidth: '170px' }}>
                        {t('total_amount')}
                      </Typography>
                      <Typography>
                        <span className="dirham-symbol">&#x00EA;</span>
                        {`${bookingDetails?.total || '0'}`}
                      </Typography>
                    </Box>
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
                          <TableCell>
                            <ListItemText
                              primary={`${t('total_sessions_booked')}:${session?.no_of_sessions}`}
                              secondary={
                                <div>
                                  <p>
                                    {t('session_no')}: {session?.session_no}
                                  </p>
                                  <p>
                                    {t('completed_sessions')}:
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
                              ? moment(session.start_time)
                                  .utcOffset('+04:00')
                                  .format('DD/MM/YY h:mm A')
                              : t('n/a')}
                          </TableCell>
                          <TableCell>
                            {session.end_time
                              ? moment(session.end_time)
                                  .utcOffset('+04:00')
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
                        {moment(reschedule.new_start).utcOffset('+04:00').format('DD/MM/YY h:mm A')}
                      </TableCell>
                      <TableCell>
                        {moment(reschedule.new_end).utcOffset('+04:00').format('DD/MM/YY h:mm A')}
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
