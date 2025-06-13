import React from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { Box, Chip, Typography } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';

const containerStyle = {
  width: '100%',
  height: '300px',
  borderRadius: '10px',
  overflow: 'hidden',
};

const TrainerAddressMap = ({ addresses = [], max_radius }) => {
  const center = {
    lat: addresses[0]?.latitude || 24.4869136,
    lng: addresses[0]?.longitude || 54.3670333,
  };
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_APP_GOOGLE_API_KEY,
    libraries: ['visualization', 'places'],
  });

  if (!isLoaded) {
    return <Typography>Loading map...</Typography>;
  }

  return (
    <Box mt={3} p={2} sx={{ paddingBottom: 3, borderBottom: '1px solid #CF5A0D' }}>
      <Box display="flex" alignItems="center" gap={1} mb={1}>
        <LocationOnIcon sx={{ fontSize: 32, color: 'grey' }} />
        <Typography fontWeight={600} variant="h6" color="grey" sx={{ fontSize: 18 }}>
          Trainer Address
        </Typography>
      </Box>
      <Box display="flex" justifyContent="flex-end" mb={2}>
        <Chip
          label={`Max Radius: ${max_radius} km`}
          sx={{
            backgroundColor: '#fff7f0',
            color: '#CF5A0D',
            fontWeight: 600,
            border: '1px solid #CF5A0D',
          }}
        />
      </Box>

      <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={15}>
        {addresses.map((addr, index) => (
          <Marker
            key={index}
            position={{ lat: addr.latitude, lng: addr.longitude }}
            title={addr.address || 'Trainer Location'}
          />
        ))}
      </GoogleMap>
    </Box>
  );
};

export default TrainerAddressMap;
