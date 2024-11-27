import React, { useEffect, useState } from 'react';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import { useGetUsers } from 'src/api/users';
import axios from 'axios';
import marker from 'react-map-gl/dist/esm/components/marker';

import { HOST_API } from 'src/config-global';

interface Trainer {
  id: string;
  name: string;
  photoUrl: string;
  location: { lat: number; lng: number };
}

const containerStyle = {
  width: '100%',
  height: '500px',
};

const center = {
  lat: 25.276987,
  lng: 55.296249,
};

const TrainerMap: React.FC = () => {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_APP_GOOGLE_API_KEY,
  });

  // Fetching users of type TRAINER
  const { users, usersLoading } = useGetUsers({
    page: 0,
    limit: 1000,
    user_types: 'TRAINER',
  });

  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const fetchNearestTrainers = async (latitude: number, longitude: number) => {
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

      if (response?.data?.trainersList) {
        setTrainers(
          response.data.trainersList.map((trainer) => ({
            ...trainer,
            location: { lat: trainer.lat, lng: trainer.lng },
          }))
        );
      }
    } catch (error) {
      console.error('Error fetching nearest trainers:', error);
    }
  };

  useEffect(() => {
    if (usersLoading || !users) return;

    const trainersWithLocation: Trainer[] = users.map((user) => {
      const city = user.user_preference?.city;
      const cityName = city?.city_translations?.[0]?.name || '';
      return {
        id: user.id,
        name: user.name,
        photoUrl: user.photo_url,
        location: cityName === 'Dubai' ? { lat: 25.276987, lng: 55.296249 } : { lat: 20, lng: 20 },
      };
    });

    setTrainers(trainersWithLocation);
  }, [users, usersLoading]);

  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    const lat = e.latLng?.lat() ?? 0;
    const lng = e.latLng?.lng() ?? 0;
    setSelectedLocation({ lat, lng });
  };

  useEffect(() => {
    if (!selectedLocation) return;
    const { lat, lng } = selectedLocation;

    fetchNearestTrainers(lat, lng);
  }, [selectedLocation]);

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  if (usersLoading || !trainers.length) {
    return <div>Loading trainers...</div>;
  }

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={15}
      onClick={handleMapClick} // Handle map click
    >
      {trainers.map((trainer) => (
        <Marker
          key={trainer.id}
          position={trainer.location}
          icon={{
            url:
              marker && typeof marker === 'string'
                ? marker
                : 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
            scaledSize: new window.google.maps.Size(50, 50), // Adjust the size of the marker image as needed
          }}
        />
      ))}
    </GoogleMap>
  );
};

export default TrainerMap;
