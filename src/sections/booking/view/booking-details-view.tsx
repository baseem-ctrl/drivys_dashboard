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
} from '@mui/material';

import { Star } from '@mui/icons-material';

import { Phone, Email } from '@mui/icons-material';
import { useGetBookingById } from 'src/api/booking';
import EditIcon from '@mui/icons-material/Edit';
import { useParams } from 'src/routes/hooks';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs/custom-breadcrumbs';
import { paths } from 'src/routes/paths';

const BookingDetailsComponent = () => {
  const { id } = useParams();
  const theme = useTheme();
  const { bookingDetails, bookingError, bookingLoading, revalidateBooking } = useGetBookingById(id);
  const { user, package: pkg, driver, pickup_location, total, sessions } = bookingDetails;
  const [value, setValue] = useState(0);
  const [paymentStatus, setPaymentStatus] = useState('');

  const handlePaymentStatusChange = (event) => {
    setPaymentStatus(event.target.value);
  };
  const paymentStatusOptions = [
    { value: 'paid', label: 'Paid' },
    { value: 'pending', label: 'Pending' },
    { value: 'failed', label: 'Failed' },
  ];

  console.log('bookingDetails', bookingDetails);
  const cardHeight = 370;
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
    <Grid container spacing={4} sx={{ maxWidth: 1200, mx: 'auto', mt: 4 }}>
      <CustomBreadcrumbs
        heading="Booking Orders List"
        links={[
          { name: 'Dashboard', href: paths.dashboard.booking.root },
          { name: 'Order', href: paths.dashboard.booking.root },
          { name: 'List' },
        ]}
        sx={{ mb: 3 }}
      />

      <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <FormControl variant="outlined" size="small" sx={{ minWidth: 190 }}>
          {' '}
          <InputLabel id="payment-status-label">Payment Status</InputLabel>
          <Select
            labelId="payment-status-label"
            value={paymentStatus}
            onChange={handlePaymentStatusChange}
            label="Payment Status"
          >
            {paymentStatusOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

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
                  <Avatar
                    src={user.photo_url}
                    alt={`${user.name}'s profile`}
                    sx={{
                      width: 80,
                      height: 80,
                      border: '2px solid #1976d2',
                      marginLeft: 2,
                      marginRight: 5,
                    }}
                  />
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
                      {user.name}
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
                      {user.email}
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
                      {user.phone}
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
                      {user.country_code}
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
                      {bookingDetails.gear_type}
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
                      {new Date(user.dob).toLocaleDateString()}
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
                      {user.locale}
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
                      <Switch
                        checked={user.is_active}
                        color={user.is_active ? 'success' : 'error'}
                        disabled
                      />
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
                  <Avatar
                    src={driver.photo_url}
                    alt={`${driver.name}'s profile`}
                    sx={{
                      width: 80,
                      height: 80,
                      border: '2px solid #1976d2',
                      marginLeft: 2,
                      marginRight: 5,
                    }}
                  />
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
                      {driver.name}
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
                      {driver.email}
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
                      {driver.phone}
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
                      {driver.country_code}
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
                      {driver.locale}
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
                      {new Date(driver.dob).toLocaleDateString()}
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
                      <Switch
                        checked={driver.is_active}
                        color={driver.is_active ? 'success' : 'error'}
                        disabled
                      />
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
                  {pkg.package_translations[0].name}
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
                  {pkg.number_of_sessions}
                </Box>
              </Box>

              <Box sx={{ display: 'flex', width: '100%', mb: 1, ml: 5 }}>
                <Box component="span" sx={{ minWidth: '170px', fontWeight: 'bold' }}>
                  Vendor
                </Box>
                <Box component="span" sx={{ minWidth: '10px', fontWeight: 'bold' }}>
                  :
                </Box>
                <Box component="span" sx={{ flex: 1 }}>
                  {pkg.vendor.vendor_translations[0].name}
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
                  {pickup_location.label}
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
                  {pickup_location.address}, {pickup_location.building_name},{' '}
                  {pickup_location.plot_number}
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
                  {pickup_location.city}
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
                  <Phone fontSize="small" /> {pickup_location.phone_number}
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
              position: 'relative', // Added for positioning the icon
            }}
          >
            <IconButton
              sx={{
                position: 'absolute',
                top: 16,
                right: 16,
                color: 'primary.secondary', // Change color as needed
              }}
            >
              <EditIcon /> {/* Ensure you import EditIcon from Material-UI icons */}
            </IconButton>

            <CardContent
              sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}
            >
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: 'primary.main' }}>
                Payment Information:
              </Typography>

              <Box sx={{ display: 'flex', width: '100%', mb: 1, mt: 7, ml: 5 }}>
                <Box component="span" sx={{ minWidth: '170px', fontWeight: 'bold' }}>
                  Booking Method
                </Box>
                <Box component="span" sx={{ minWidth: '10px', fontWeight: 'bold' }}>
                  :
                </Box>
                <Box component="span" sx={{ flex: 1 }}>
                  {bookingDetails?.booking_method}
                </Box>
              </Box>

              <Box sx={{ display: 'flex', width: '100%', mb: 1, ml: 5 }}>
                <Box component="span" sx={{ minWidth: '170px', fontWeight: 'bold' }}>
                  Amount Due
                </Box>
                <Box component="span" sx={{ minWidth: '10px', fontWeight: 'bold' }}>
                  :
                </Box>
                <Box component="span" sx={{ flex: 1 }}>
                  {`$${bookingDetails?.amount_due}`} {/* Format to currency */}
                </Box>
              </Box>
              <Box sx={{ display: 'flex', width: '100%', mb: 1, ml: 5 }}>
                <Box component="span" sx={{ minWidth: '170px', fontWeight: 'bold' }}>
                  Discount
                </Box>
                <Box component="span" sx={{ minWidth: '10px', fontWeight: 'bold' }}>
                  :
                </Box>
                <Box component="span" sx={{ flex: 1 }}>
                  {`$${bookingDetails?.discount}`} {/* Format to currency */}
                </Box>
              </Box>
              <Box sx={{ display: 'flex', width: '100%', mb: 1, ml: 5 }}>
                <Box component="span" sx={{ minWidth: '170px', fontWeight: 'bold' }}>
                  Amount Paid
                </Box>
                <Box component="span" sx={{ minWidth: '10px', fontWeight: 'bold' }}>
                  :
                </Box>
                <Box component="span" sx={{ flex: 1 }}>
                  {`$${bookingDetails?.amount_paid}`}
                </Box>
              </Box>

              <Box sx={{ display: 'flex', width: '100%', mb: 1, ml: 5 }}>
                <Box component="span" sx={{ minWidth: '170px', fontWeight: 'bold' }}>
                  Amount Refunded
                </Box>
                <Box component="span" sx={{ minWidth: '10px', fontWeight: 'bold' }}>
                  :
                </Box>
                <Box component="span" sx={{ flex: 1 }}>
                  {`$${bookingDetails?.amount_refunded}`}
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
                      <TableCell>Status</TableCell>
                      <TableCell>Rating</TableCell>
                      <TableCell>Start Time</TableCell>
                      <TableCell>End Time</TableCell>
                      <TableCell>Session Type</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sessions.map((session) => (
                      <TableRow key={session.id}>
                        <TableCell>{session.booking_id}</TableCell>
                        <TableCell>{session.session_no}</TableCell>

                        <TableCell>{session.session_status}</TableCell>
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

                        <TableCell>{new Date(session.start_time).toLocaleString()}</TableCell>
                        <TableCell>{new Date(session.end_time).toLocaleString()}</TableCell>
                        <TableCell>{session.session_type}</TableCell>
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
  );
};

export default BookingDetailsComponent;
