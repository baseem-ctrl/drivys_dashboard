import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
} from '@mui/material';
import { Phone, Email } from '@mui/icons-material';

const BookingDetailsComponent = ({ booking }) => {
  const { user, package: pkg, driver, pickup_location, total, sessions } = booking;

  const cardHeight = 300;

  return (
    <Grid container spacing={4} justifyContent="center" sx={{ maxWidth: 1200, mx: 'auto', mt: 4 }}>
      {/* User Information */}
      <Grid item xs={12} md={6}>
        <Card sx={{ boxShadow: 3, borderRadius: 2, minHeight: cardHeight }}>
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
                    Active
                  </Box>
                  <Box component="span" sx={{ minWidth: '10px', fontWeight: 'bold' }}>
                    :
                  </Box>
                  <Box component="span" sx={{ flex: 1 }}>
                    {user.is_active ? 'Yes' : 'No'}
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      {/* Driver Information */}
      <Grid item xs={12} md={6}>
        <Card sx={{ boxShadow: 3, borderRadius: 2, minHeight: cardHeight }}>
          <CardContent
            sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
          >
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: 'primary.main' }}>
              Driver Information:
            </Typography>
            <Grid container spacing={2} alignItems="center">
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
                    marginTop: '71.6px',
                  }}
                />
              </Grid>
              <Grid item marginTop={5}>
                <Box sx={{ display: 'flex', width: '100%', mb: 1, mt: 4 }}>
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
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      {/* Package Details */}
      <Grid item xs={12} md={6}>
        <Card sx={{ boxShadow: 3, borderRadius: 2, minHeight: cardHeight }}>
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

      {/* Pickup Location */}
      <Grid item xs={12} md={6}>
        <Card sx={{ boxShadow: 3, borderRadius: 2, minHeight: cardHeight }}>
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

      {/* Booking Summary */}
      <Grid item xs={12}>
        <Card sx={{ boxShadow: 3, borderRadius: 2 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: 'primary.main' }}>
              Booking Summary:
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Total Amount:
            </Typography>
            <Typography sx={{ fontWeight: '500' }}>
              {typeof total === 'number' ? `$${total.toFixed(2)}` : 'N/A'}
            </Typography>
            <TableContainer component={Paper} sx={{ mt: 2 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Session No</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Start Time</TableCell>
                    <TableCell>End Time</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sessions.map((session) => (
                    <TableRow key={session.id}>
                      <TableCell>{session.session_no}</TableCell>
                      <TableCell>{session.session_status}</TableCell>
                      <TableCell>{new Date(session.start_time).toLocaleString()}</TableCell>
                      <TableCell>{new Date(session.end_time).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default BookingDetailsComponent;
