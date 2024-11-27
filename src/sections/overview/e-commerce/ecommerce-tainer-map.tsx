import React from 'react';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import { useGetUsers } from 'src/api/users';

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

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  // If users are still loading or no trainers found
  if (usersLoading || !users) {
    return <div>Loading trainers...</div>;
  }

  // Map the API response into a trainers array
  const trainers: Trainer[] = users.map((user: any) => {
    // Safely access the city information
    const city = user.user_preference?.city;
    const cityName = city?.city_translations?.[0]?.name || ''; // Safely access the city name
    console.log('users', user);
    return {
      id: user.id,
      name: user.name,
      photoUrl: user.photo_url,
      location: {
        lat: cityName === 'Dubai' ? 25.276987 : 0,
        lng: 55.296249,
      },
    };
  });
  console.log('trainers', trainers);
  return (
    <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={15}>
      {trainers.map((trainer) => (
        <Marker
          key={trainer.id}
          position={trainer.location}
          icon={{
            url: trainer.photoUrl,
            scaledSize: new window.google.maps.Size(40, 40),
            // origin: new window.google.maps.Point(0, 0),
            // anchor: new window.google.maps.Point(20, 40),
          }}
        />
      ))}
    </GoogleMap>
  );
};

export default TrainerMap;
