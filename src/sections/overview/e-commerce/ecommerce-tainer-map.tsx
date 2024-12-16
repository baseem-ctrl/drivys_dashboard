import React, { useEffect, useState } from 'react';
import {
  GoogleMap,
  Marker,
  useJsApiLoader,
  OverlayView,
  HeatmapLayer,
} from '@react-google-maps/api';
import axios from 'axios';
import Avatar from '@mui/material/Avatar';
import profile from '../../../../public/logo/avatar.png';
import { useGoogleMaps } from './GoogleMapsProvider';
const containerStyle = {
  width: '100%',
  height: '500px',
};

// Default coordinates for the map center and markers
const defaultLatitude = 24.453884;
const defaultLongitude = 54.3773438;

interface Trainer {
  id: string;
  name: string;
  photoUrl: string;
  location: { lat: number; lng: number };
}

const TrainerMap: React.FC = () => {
  const { isLoaded } = useGoogleMaps();

  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>({
    lat: defaultLatitude,
    lng: defaultLongitude,
  });

  const fetchTrainersForLocation = async (latitude: number, longitude: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${import.meta.env.VITE_HOST_API}admin/trainers/get-nearest-trainers-list`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            latitude,
            longitude,
            radius: 10,
          },
        }
      );

      if (response?.data?.data) {
        setTrainers(
          response.data.data.map((trainer: any) => ({
            id: trainer.id,
            name: trainer.name,
            photoUrl: trainer.photo_url,
            location: {
              lat: trainer.address.latitude,
              lng: trainer.address.longitude,
            },
          }))
        );
      }
    } catch (error) {
      console.error('Error fetching nearest trainers:', error);
    }
  };

  // Fetch trainers for the default location on mount
  useEffect(() => {
    fetchTrainersForLocation(defaultLatitude, defaultLongitude);
  }, []);

  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    const lat = e.latLng?.lat() ?? defaultLatitude;
    const lng = e.latLng?.lng() ?? defaultLongitude;
    setSelectedLocation({ lat, lng });
    fetchTrainersForLocation(lat, lng);
  };

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  // Convert trainer locations to heatmap data
  const heatmapData = trainers.map((trainer) => {
    return new google.maps.LatLng(trainer.location.lat, trainer.location.lng);
  });

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={selectedLocation}
      zoom={12}
      // onClick={handleMapClick}
    >
      {trainers.map((trainer) => (
        <Marker
          key={trainer.id}
          position={trainer.location}
          icon={{
            url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
            // scaledSize: new window.google.maps.Size(50, 50),
          }}
        >
          <OverlayView position={trainer.location} mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}>
            <div
              style={{
                borderRadius: '8px',
                textAlign: 'center',
                width: '80px',

                fontSize: '12px',
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
              <h4 style={{ margin: 0, color: 'black', fontSize: '12px' }}>{trainer.name}</h4>
            </div>
          </OverlayView>
        </Marker>
      ))}
    </GoogleMap>
  );
};

export default TrainerMap;
