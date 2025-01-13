import React, { useEffect, useRef, useState } from 'react';
import {
  GoogleMap,
  useJsApiLoader,
  HeatmapLayer,
  Marker,
  OverlayView,
} from '@react-google-maps/api';
import axios from 'axios';
import { useGoogleMaps } from './GoogleMapsProvider';
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
import TrainerMap from './ecommerce-school-admin-map';
import profile from '../../../../public/logo/avatar.png';

const containerStyle = {
  width: '100%',
  height: '500px',
};
const circleStyle = (color: string) => ({
  width: '12px',
  height: '12px',
  borderRadius: '50%',
  backgroundColor: color,
  display: 'inline-block',
  marginRight: '8px',
});
// Default map center coordinates
const defaultLatitude = 24.2765;
const defaultLongitude = 54.346;

interface Person {
  id: string;
  location: { lat: number; lng: number };
  photoUrl: string;
  name: string;
}

const HeatMap: React.FC = () => {
  const { isLoaded } = useGoogleMaps();

  const [trainers, setTrainers] = useState<Person[]>([]);
  const [students, setStudents] = useState<Person[]>([]);
  const [selectedHeatmap, setSelectedHeatmap] = useState<'trainers' | 'students'>('trainers'); // State to toggle heatmap

  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number }>({
    lat: defaultLatitude,
    lng: defaultLongitude,
  });

  // Fetch trainers data
  const fetchTrainers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${import.meta.env.VITE_HOST_API}admin/trainers/get-nearest-trainers-list`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { latitude: defaultLatitude, longitude: defaultLongitude, radius: 500 },
        }
      );
      if (response?.data?.data) {
        setTrainers(
          response.data.data.map((trainer: any) => ({
            id: trainer.id,
            location: { lat: trainer.address.latitude, lng: trainer.address.longitude },
            name: trainer.name,
            photoUrl: trainer.photo_url,
          }))
        );
      }
    } catch (error) {
      console.error('Error fetching trainers:', error);
    }
  };

  // Fetch students data
  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${import.meta.env.VITE_HOST_API}admin/studentMap/get-student-under-radius`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { latitude: defaultLatitude, longitude: defaultLongitude, radius: 500 },
        }
      );
      if (response?.data?.data) {
        setStudents(
          response.data.data.map((student: any) => ({
            id: student.id,
            location: { lat: student.address.latitude, lng: student.address.longitude },
            name: student?.name,
            photoUrl: student?.photo_url,
          }))
        );
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchTrainers();
    fetchStudents();
  }, []);
  const mapRef = useRef<google.maps.Map | null>(null);
  const [zoomLevel, setZoomLevel] = useState(6);
  const updateZoomLevel = () => {
    if (mapRef.current) {
      const zoom = mapRef.current.getZoom();
      if (zoom !== null) setZoomLevel(zoom);
    }
  };
  if (!isLoaded) {
    return <div>Loading...</div>;
  }
  // Convert locations to LatLng for Heatmap
  const trainerHeatmapData = trainers.map(
    (trainer) => new google.maps.LatLng(trainer.location.lat, trainer.location.lng)
  );

  const studentHeatmapData = students.map(
    (student) => new google.maps.LatLng(student.location.lat, student.location.lng)
  );
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
    <Card>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 2, px: 2, pt: 2 }}
      >
        <CardHeader title="Heat Map" />

        {/* Legend */}
        {/* <Box display="flex" alignItems="center" gap={2}>
          <Box display="flex" alignItems="center">
            <Box sx={circleStyle('#0000FF')} /> 
            <Typography variant="body2">Trainers</Typography>
          </Box>

          <Box display="flex" alignItems="center">
            <Box sx={circleStyle('#FF0000')} /> 
            <Typography variant="body2">Students</Typography>
          </Box>
        </Box> */}
        <RadioGroup
          row
          value={selectedHeatmap}
          onChange={(e) => setSelectedHeatmap(e.target.value as 'trainers' | 'students')}
        >
          <FormControlLabel value="trainers" control={<Radio />} label="Trainers" />
          <FormControlLabel value="students" control={<Radio />} label="Students" />
        </RadioGroup>
      </Box>

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
        {/* Trainer Heatmap */}
        {
          zoomLevel > 9 ? (
            // <TrainerMap setZoomLevel={setZoomLevel} />
            <>
              {selectedHeatmap === 'trainers'
                ? trainers.map((trainer) => (
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
                          <h4 style={{ margin: 0, color: 'black', fontSize: '12px' }}>
                            {trainer.name}
                          </h4>
                        </div>
                      </OverlayView>
                    </Marker>
                  ))
                : students.map((trainer) => (
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
                          <h4 style={{ margin: 0, color: 'black', fontSize: '12px' }}>
                            {trainer.name}
                          </h4>
                        </div>
                      </OverlayView>
                    </Marker>
                  ))}
            </>
          ) : selectedHeatmap === 'trainers' ? (
            // <>
            <HeatmapLayer
              data={trainerHeatmapData}
              options={{
                radius: 20,
                opacity: 0.7,
                gradient: [
                  'rgba(0, 255, 255, 0)',
                  'rgba(0, 255, 255, 1)',
                  'rgba(0, 191, 255, 1)',
                  'rgba(0, 127, 255, 1)',
                  'rgba(0, 63, 255, 1)',
                  'rgba(0, 0, 255, 1)',
                ],
              }}
            />
          ) : (
            <HeatmapLayer
              data={studentHeatmapData}
              options={{
                radius: 20,
                opacity: 0.7,
                gradient: [
                  'rgba(255, 0, 0, 0)',
                  'rgba(255, 0, 0, 1)',
                  'rgba(191, 0, 0, 1)',
                  'rgba(127, 0, 0, 1)',
                  'rgba(63, 0, 0, 1)',
                  'rgba(255, 0, 0, 1)',
                ],
              }}
            />
          )
          // </>
        }
      </GoogleMap>
    </Card>
  );
};

export default HeatMap;
