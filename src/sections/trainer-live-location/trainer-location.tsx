import React, { useEffect, useRef, useState } from 'react';
import {
  GoogleMap,
  useJsApiLoader,
  HeatmapLayer,
  Marker,
  OverlayView,
} from '@react-google-maps/api';
import Container from '@mui/material/Container';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import axios from 'axios';
import {
  Avatar,
  Box,
  Card,
  CardHeader,
  FormControlLabel,
  Radio,
  RadioGroup,
  Typography,
} from '@mui/material';
import profile from '../../../public/logo/avatar.png';
import { useGoogleMaps } from '../overview/e-commerce/GoogleMapsProvider';
import { paths } from 'src/routes/paths';

const containerStyle = {
  width: '100%',
  height: '70vh',
};

// Default map center coordinates
const defaultLatitude = 24.4798521;
const defaultLongitude = 54.4562213;

interface Person {
  id: string;
  location: { lat: number; lng: number };
  photoUrl: string;
  name: string;
}

const TrainerLiveLocation: React.FC = () => {
  const { isLoaded } = useGoogleMaps();
  const settings = useSettingsContext();
  const [trainers, setTrainers] = useState<Person[]>([]);

  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number }>({
    lat: defaultLatitude,
    lng: defaultLongitude,
  });

  // Fetch trainers data
  const fetchTrainers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${import.meta.env.VITE_HOST_API}admin/trainers/get-live-location-trainers-list`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { latitude: defaultLatitude, longitude: defaultLongitude, radius: 500 },
        }
      );
      if (response?.data?.data) {
        setTrainers(
          response.data.data.map((trainer: any) => ({
            id: trainer.user_id,
            location: {
              lat: trainer.current_latitude,
              lng: trainer.current_longitude,
            },
            name: trainer.user.name,
            photoUrl: trainer.user.photo_url,
          }))
        );
      }
    } catch (error) {
      console.error('Error fetching trainers:', error);
    }
  };

  useEffect(() => {
    fetchTrainers(); // Initial fetch
    const intervalId = setInterval(fetchTrainers, 3000); // Fetch every second

    return () => clearInterval(intervalId);
  }, []);
  const mapRef = useRef<google.maps.Map | null>(null);
  const [zoomLevel, setZoomLevel] = useState(11);
  const updateZoomLevel = () => {
    if (mapRef.current) {
      const zoom = mapRef.current.getZoom();
      if (zoom !== null) setZoomLevel(zoom);
    }
  };
  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  const mapOptions = {
    styles: [
      {
        featureType: 'water',
        stylers: [{ color: '#D3D3D3' }],
      },
      {
        featureType: 'landscape',
        stylers: [{ color: '#f2f2f2' }],
      },
    ],
  };
  return (
    <>
      <CustomBreadcrumbs
        heading="Live Location"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          {
            name: 'Trainers Live Location',
            href: paths.dashboard.root,
          },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />{' '}
      <Card>
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={selectedLocation}
          zoom={zoomLevel}
          options={mapOptions}
          onLoad={(map) => {
            mapRef.current = map;
          }}
          onZoomChanged={updateZoomLevel}
        >
          <>
            {trainers.map((trainer) => (
              <Marker
                key={trainer.id}
                position={trainer.location}
                icon={{
                  url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
                  scaledSize: new google.maps.Size(0, 0),
                }}
              >
                <OverlayView
                  position={trainer.location}
                  mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                >
                  <div
                    style={{
                      borderRadius: '8px',
                      textAlign: 'center',
                      width: '80px',
                      fontSize: '14px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {trainer.photoUrl ? (
                      <img
                        src={trainer?.photoUrl}
                        alt={trainer?.name}
                        style={{ width: '50px', height: '50px', borderRadius: '50%' }}
                      />
                    ) : (
                      <Avatar
                        style={{ width: 50, height: 50, backgroundColor: '#3f51b5' }}
                        src={profile}
                      />
                    )}
                    <h4 style={{ margin: 0, color: 'black', fontSize: '14px' }}>{trainer.name}</h4>
                  </div>
                </OverlayView>
              </Marker>
            ))}
          </>
        </GoogleMap>
      </Card>
    </>
  );
};

export default TrainerLiveLocation;
