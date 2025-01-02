import React, { useState } from 'react';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import { Box, Table, TableBody, TableHead, Typography } from '@mui/material';
import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';

// ----------------------------------------------------------------------

export default function CertificateRow({ row }) {
  const { city, comments, gear, request_date, status, trainer, txn, user, vehicle_type = [] } = row;
  const router = useRouter();

  // Handle click on user, trainer, city, and vehicle type
  const handleUserDetails = (user_id) => {
    router.push(paths.dashboard.user.details(user_id));
  };

  const handleTrainerDetails = (trainer_id) => {
    router.push(paths.dashboard.user.details(trainer_id));
  };

  const handleCityDetails = (city_name) => {
    router.push(paths.dashboard.city.details(city_name));
  };

  const handleVehicleTypeDetails = (vehicle_type_name) => {
    router.push(paths.dashboard.category.details(vehicle_type_name));
  };

  return (
    <TableRow hover>
      <TableCell>
        <Typography
          variant="body2"
          sx={{
            textDecoration: 'none',
            cursor: 'pointer',
            '&:hover': {
              textDecoration: 'underline',
            },
          }}
          onClick={() => handleCityDetails(city?.city_translations[0]?.name)}
        >
          {city?.city_translations[0]?.name || 'N/A'}
        </Typography>
      </TableCell>

      <TableCell>{gear || 'N/A'}</TableCell>

      <TableCell>{request_date || 'N/A'}</TableCell>

      <TableCell>{status || 'N/A'}</TableCell>

      <TableCell>
        <Typography
          variant="body2"
          sx={{
            textDecoration: 'none',
            cursor: 'pointer',
            '&:hover': {
              textDecoration: 'underline',
            },
          }}
          onClick={() => handleTrainerDetails(trainer?.id)}
        >
          {trainer?.name || 'N/A'}
        </Typography>
      </TableCell>

      <TableCell>{txn?.id || 'N/A'}</TableCell>

      <TableCell>
        <Typography
          variant="body2"
          sx={{
            textDecoration: 'none',
            cursor: 'pointer',
            '&:hover': {
              textDecoration: 'underline',
            },
          }}
          onClick={() => handleUserDetails(user?.id)}
        >
          {user?.name || 'N/A'}
        </Typography>
      </TableCell>

      <TableCell>
        <Typography
          variant="body2"
          sx={{
            textDecoration: 'none',
            cursor: 'pointer',
            '&:hover': {
              textDecoration: 'underline',
            },
          }}
          onClick={() => handleVehicleTypeDetails(vehicle_type?.id)}
        >
          {vehicle_type?.category_translations[0]?.name || 'N/A'}
        </Typography>
      </TableCell>

      <TableCell>{comments || 'No Comments'}</TableCell>
    </TableRow>
  );
}
