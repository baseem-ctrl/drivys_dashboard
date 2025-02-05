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

const BookingDetailsComponent = () => {
  const settings = useSettingsContext();

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
            <Tab label="Booking Details" />
            <Tab label="Payment & Summary" />
          </Tabs>
        </Grid>
        {/* User Information */}
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
                  User Information:
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
                        Name
                      </Box>
                      <Box component="span" sx={{ minWidth: '10px', fontWeight: 'bold' }}>
                        :
                      </Box>
                      <Box component="span" sx={{ flex: 1 }}>
                        {user && user?.name ? user?.name : 'N/A'}
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', width: '100%', mb: 1 }}>
                      <Box component="span" sx={{ minWidth: '170px', fontWeight: 'bold' }}>
                        <Email fontSize="small" sx={{ verticalAlign: 'middle' }} /> Email
                      </Box>
                      <Box component="span" sx={{ minWidth: '10px', fontWeight: 'bold' }}>
                        :
                      </Box>
                      <Box component="span" sx={{ flex: 1 }}>
                        {user && user?.email ? user?.email : 'N/A'}
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', width: '100%', mb: 1 }}>
                      <Box component="span" sx={{ minWidth: '170px', fontWeight: 'bold' }}>
                        <Phone fontSize="small" sx={{ verticalAlign: 'middle' }} /> Phone
                      </Box>
                      <Box component="span" sx={{ minWidth: '10px', fontWeight: 'bold' }}>
                        :
                      </Box>
                      <Box component="span" sx={{ flex: 1 }}>
                        {user && user?.phone ? user?.phone : 'N/A'}
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', width: '100%', mb: 1 }}>
                      <Box component="span" sx={{ minWidth: '170px', fontWeight: 'bold' }}>
                        Country Code
                      </Box>
                      <Box component="span" sx={{ minWidth: '10px', fontWeight: 'bold' }}>
                        :
                      </Box>
                      <Box component="span" sx={{ flex: 1 }}>
                        {user && user?.country_code ? user?.country_code : 'N/A'}
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', width: '100%', mb: 1 }}>
                      <Box component="span" sx={{ minWidth: '170px', fontWeight: 'bold' }}>
                        Gear Type
                      </Box>
                      <Box component="span" sx={{ minWidth: '10px', fontWeight: 'bold' }}>
                        :
                      </Box>
                      <Box component="span" sx={{ flex: 1 }}>
                        {bookingDetails && bookingDetails?.gear_type
                          ? bookingDetails?.gear_type
                          : 'N/A'}
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', width: '100%', mb: 1 }}>
                      <Box component="span" sx={{ minWidth: '170px', fontWeight: 'bold' }}>
                        DOB
                      </Box>
                      <Box component="span" sx={{ minWidth: '10px', fontWeight: 'bold' }}>
                        :
                      </Box>
                      <Box component="span" sx={{ flex: 1 }}>
                        {user && user.dob ? new Date(user.dob).toLocaleDateString() : 'N/A'}
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', width: '100%', mb: 1 }}>
                      <Box component="span" sx={{ minWidth: '170px', fontWeight: 'bold' }}>
                        Locale
                      </Box>
                      <Box component="span" sx={{ minWidth: '10px', fontWeight: 'bold' }}>
                        :
                      </Box>
                      <Box component="span" sx={{ flex: 1 }}>
                        {user && user?.locale ? user?.locale : 'N/A'}
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
                        Active
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
                          'N/A'
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
                  Driver Information:
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
                        Name
                      </Box>
                      <Box component="span" sx={{ minWidth: '10px', fontWeight: 'bold' }}>
                        :
                      </Box>
                      <Box component="span" sx={{ flex: 1 }}>
                        {driver && driver?.locale ? driver?.name : 'N/A'}
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', width: '100%', mb: 1 }}>
                      <Box component="span" sx={{ minWidth: '170px', fontWeight: 'bold' }}>
                        <Email fontSize="small" sx={{ verticalAlign: 'middle' }} /> Email
                      </Box>
                      <Box component="span" sx={{ minWidth: '10px', fontWeight: 'bold' }}>
                        :
                      </Box>
                      <Box component="span" sx={{ flex: 1 }}>
                        {driver && driver?.email ? driver?.email : 'N/A'}
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', width: '100%', mb: 1 }}>
                      <Box component="span" sx={{ minWidth: '170px', fontWeight: 'bold' }}>
                        <Phone fontSize="small" sx={{ verticalAlign: 'middle' }} /> Phone
                      </Box>
                      <Box component="span" sx={{ minWidth: '10px', fontWeight: 'bold' }}>
                        :
                      </Box>
                      <Box component="span" sx={{ flex: 1 }}>
                        {driver && driver?.phone ? driver?.phone : 'N/A'}
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', width: '100%', mb: 1 }}>
                      <Box component="span" sx={{ minWidth: '170px', fontWeight: 'bold' }}>
                        Country Code
                      </Box>
                      <Box component="span" sx={{ minWidth: '10px', fontWeight: 'bold' }}>
                        :
                      </Box>
                      <Box component="span" sx={{ flex: 1 }}>
                        {driver && driver?.country_code ? driver?.country_code : 'N/A'}
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', width: '100%', mb: 1 }}>
                      <Box component="span" sx={{ minWidth: '170px', fontWeight: 'bold' }}>
                        Locale
                      </Box>
                      <Box component="span" sx={{ minWidth: '10px', fontWeight: 'bold' }}>
                        :
                      </Box>
                      <Box component="span" sx={{ flex: 1 }}>
                        {driver && driver?.locale ? driver?.locale : 'N/A'}
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', width: '100%', mb: 1 }}>
                      <Box component="span" sx={{ minWidth: '170px', fontWeight: 'bold' }}>
                        DOB
                      </Box>
                      <Box component="span" sx={{ minWidth: '10px', fontWeight: 'bold' }}>
                        :
                      </Box>
                      <Box component="span" sx={{ flex: 1 }}>
                        {driver && driver.dob ? new Date(driver.dob).toLocaleDateString() : 'N/A'}
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', width: '100%', mb: 1, alignItems: 'center' }}>
                      <Box component="span" sx={{ minWidth: '170px', fontWeight: 'bold' }}>
                        Active
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
                          'N/A'
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
                  Package Details:
                </Typography>

                <Box sx={{ display: 'flex', width: '100%', mb: 1, mt: 7, ml: 5 }}>
                  <Box component="span" sx={{ minWidth: '170px', fontWeight: 'bold' }}>
                    Package Name
                  </Box>
                  <Box component="span" sx={{ minWidth: '10px', fontWeight: 'bold' }}>
                    :
                  </Box>
                  <Box component="span" sx={{ flex: 1 }}>
                    {pkg?.package_translations[0]?.name || 'N/A'}
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', width: '100%', mb: 1, ml: 5 }}>
                  <Box component="span" sx={{ minWidth: '170px', fontWeight: 'bold' }}>
                    Number of Sessions
                  </Box>
                  <Box component="span" sx={{ minWidth: '10px', fontWeight: 'bold' }}>
                    :
                  </Box>
                  <Box component="span" sx={{ flex: 1 }}>
                    {pkg?.number_of_sessions || 'N/A'}
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', width: '100%', mb: 1, ml: 5 }}>
                  <Box component="span" sx={{ minWidth: '170px', fontWeight: 'bold' }}>
                    School
                  </Box>
                  <Box component="span" sx={{ minWidth: '10px', fontWeight: 'bold' }}>
                    :
                  </Box>
                  <Box component="span" sx={{ flex: 1 }}>
                    {pkg?.vendor?.vendor_translations[0]?.name || 'N/A'}
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
                  Pickup Location:
                </Typography>

                <Box sx={{ display: 'flex', width: '100%', mb: 1, mt: 7, ml: 5 }}>
                  <Box component="span" sx={{ minWidth: '170px', fontWeight: 'bold' }}>
                    Label
                  </Box>
                  <Box component="span" sx={{ minWidth: '10px', fontWeight: 'bold' }}>
                    :
                  </Box>
                  <Box component="span" sx={{ flex: 1 }}>
                    {pickup_location?.label || 'N/A'}
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', width: '100%', mb: 1, ml: 5 }}>
                  <Box component="span" sx={{ minWidth: '170px', fontWeight: 'bold' }}>
                    Address
                  </Box>
                  <Box component="span" sx={{ minWidth: '10px', fontWeight: 'bold' }}>
                    :
                  </Box>
                  <Box component="span" sx={{ flex: 1 }}>
                    {pickup_location?.address || 'N/A'}, {pickup_location?.building_name || 'N/A'},{' '}
                    {pickup_location?.plot_number || 'N/A'}
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', width: '100%', mb: 1, ml: 5 }}>
                  <Box component="span" sx={{ minWidth: '170px', fontWeight: 'bold' }}>
                    City
                  </Box>
                  <Box component="span" sx={{ minWidth: '10px', fontWeight: 'bold' }}>
                    :
                  </Box>
                  <Box component="span" sx={{ flex: 1 }}>
                    {pickup_location?.city || 'N/A'}
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', width: '100%', mb: 1, ml: 5 }}>
                  <Box component="span" sx={{ minWidth: '170px', fontWeight: 'bold' }}>
                    Phone
                  </Box>
                  <Box component="span" sx={{ minWidth: '10px', fontWeight: 'bold' }}>
                    :
                  </Box>
                  <Box component="span" sx={{ flex: 1 }}>
                    <Phone fontSize="small" /> {pickup_location?.phone_number || 'N/A'}
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
                  Payment Information:
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
                    // endIcon={<Iconify icon="eva:arrow-ios-downward-fill" />}
                    // onClick={popover.onOpen}
                    sx={{ textTransform: 'capitalize', width: '40%' }}
                  >
                    {bookingDetails.payment_status}
                  </Button>
                </Box>

                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}>
                      <Typography sx={{ fontWeight: 'bold', minWidth: '170px' }}>
                        Payment Method :
                      </Typography>
                      <Typography>{bookingDetails?.booking_method || 'N/A'}</Typography>
                    </Box>

                    <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}>
                      <Typography sx={{ fontWeight: 'bold', minWidth: '170px' }}>
                        Payment Amount:
                      </Typography>
                      <Typography>{`${bookingDetails?.sub_total || 'N/A'} AED`}</Typography>
                    </Box>

                    <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}>
                      <Typography sx={{ fontWeight: 'bold', minWidth: '170px' }}>
                        Tax Amount:
                      </Typography>
                      <Typography>{`${bookingDetails?.tax_amount || 'N/A'} AED`}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}>
                      <Typography sx={{ fontWeight: 'bold', minWidth: '170px' }}>
                        Amount Due:
                      </Typography>
                      <Typography>{`${bookingDetails?.amount_due || 'N/A'} AED`}</Typography>
                    </Box>
                    <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}>
                      <Typography sx={{ fontWeight: 'bold', minWidth: '170px' }}>
                        Amount Paid:
                      </Typography>
                      <Typography>{`${bookingDetails?.amount_paid || 'N/A'} AED`}</Typography>
                    </Box>

                    <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}>
                      <Typography sx={{ fontWeight: 'bold', minWidth: '170px' }}>
                        Amount Refunded:
                      </Typography>
                      <Typography>{`${bookingDetails?.amount_refunded || 'N/A'} AED`}</Typography>
                    </Box>
                    {bookingDetails?.coupon_code && (
                      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}>
                        <Typography sx={{ fontWeight: 'bold', minWidth: '170px' }}>
                          Coupon Used:
                        </Typography>
                        <Typography>{`${bookingDetails?.coupon_code || 'N/A'} AED`}</Typography>
                      </Box>
                    )}
                    {bookingDetails?.wallet_amount_used !== '0.00' && (
                      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}>
                        <Typography sx={{ fontWeight: 'bold', minWidth: '170px' }}>
                          Wallet Amount Used:
                        </Typography>
                        <Typography>{`${
                          bookingDetails?.wallet_amount_used || 'N/A'
                        } AED`}</Typography>
                      </Box>
                    )}
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}>
                      <Typography sx={{ fontWeight: 'bold', minWidth: '170px' }}>
                        Discount:
                      </Typography>
                      <Typography>{`${bookingDetails?.discount || 'N/A'} AED`}</Typography>
                    </Box>

                    <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}>
                      <Typography sx={{ fontWeight: 'bold', minWidth: '170px' }}>
                        Total Amount:
                      </Typography>
                      <Typography>{`${bookingDetails?.total || 'N/A'} AED`}</Typography>
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
                  Booking Summary:
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Total Amount:
                </Typography>
                <Typography sx={{ fontWeight: '500' }}>
                  {bookingDetails.sub_total ? `$${bookingDetails.sub_total}` : 'N/A'}
                </Typography>
                <TableContainer component={Paper} sx={{ mt: 2 }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Booking ID</TableCell>
                        <TableCell>Session No</TableCell>
                        <TableCell>Session Status</TableCell>
                        <TableCell>Rating</TableCell>
                        <TableCell>Start Time</TableCell>
                        <TableCell>End Time</TableCell>
                        <TableCell>Session Type</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {sessions.map((session) => (
                        <TableRow key={session?.id || 'N/A'}>
                          <TableCell>{session?.booking_id || 'N/A'}</TableCell>
                          <TableCell>
                            <ListItemText
                              primary={`Total Sessions Booked:${session?.no_of_sessions}`}
                              secondary={
                                <div>
                                  <p>Session No:{session?.session_no}</p>
                                  <p>
                                    Completed Sessions:
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
                          {/* <TableCell>{session?.session_status || 'N/A'}</TableCell> */}
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
                              'N/A'
                            )}
                          </TableCell>

                          <TableCell>
                            {session.start_time
                              ? moment(session.start_time)
                                  .utcOffset('+04:00')
                                  .format('DD/MM/YY h:mm A')
                              : 'N/A'}
                          </TableCell>

                          <TableCell>
                            {session.end_time
                              ? moment(session.end_time)
                                  .utcOffset('+04:00')
                                  .format('DD/MM/YY h:mm A')
                              : 'N/A'}
                          </TableCell>
                          <TableCell>{session?.session_type || 'N/A'}</TableCell>
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

export default BookingDetailsComponent;
