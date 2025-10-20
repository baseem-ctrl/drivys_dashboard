import React from 'react';
import { GoogleMap, useJsApiLoader, Marker, Circle } from '@react-google-maps/api';
import { Box, Chip, Typography } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { useTranslation } from 'react-i18next';

const containerStyle = {
  width: '100%',
  height: '300px',
  borderRadius: '10px',
  overflow: 'hidden',
};

const TrainerAddressMap = ({ addresses = [], max_radius }) => {
  const { t } = useTranslation();

  const center = {
    lat: addresses[0]?.latitude || 24.4869136,
    lng: addresses[0]?.longitude || 54.3670333,
  };

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_APP_GOOGLE_API_KEY,
    libraries: ['visualization', 'places'],
  });

  if (!isLoaded) {
    return <Typography>{t('loading_map')}</Typography>;
  }

  // Get the primary address
  const primaryAddress = addresses[0];
  const locationName = primaryAddress?.address ||
                       primaryAddress?.city ||
                       primaryAddress?.address_line_1 ||
                       t('trainer_location');

  // Circle options for the radius
  const circleOptions = {
    strokeColor: '#FF5722',
    strokeOpacity: 0.8,
    strokeWeight: 2,
    fillColor: '#FF5722',
    fillOpacity: 0.15,
    clickable: false,
    draggable: false,
    editable: false,
    visible: true,
    radius: (max_radius || 60) * 1000, // Convert km to meters
    zIndex: 1
  };

  return (
    <Box mt={3} p={2} sx={{ paddingBottom: 3, borderBottom: '1px solid #CF5A0D' }}>




      <Box display="flex" justifyContent="flex-end" mb={2}>
        <Chip
          label={`${t('max_radius')}: ${max_radius || 60} km`}
          sx={{
            backgroundColor: '#fff7f0',
            color: '#CF5A0D',
            fontWeight: 600,
            border: '1px solid #CF5A0D',
          }}
        />
      </Box>

      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={10}
        options={{
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
        }}
      >
        {/* Markers for each address */}
        {addresses.map((addr, index) => (
          <Marker
            key={index}
            position={{ lat: addr.latitude, lng: addr.longitude }}
            title={addr.address || addr.city || 'Trainer Location'}
          />
        ))}

        {/* Circle showing the radius range */}
        {addresses[0] && (
          <Circle
            center={center}
            options={circleOptions}
          />
        )}
      </GoogleMap>
    </Box>
  );
};

export default TrainerAddressMap;
