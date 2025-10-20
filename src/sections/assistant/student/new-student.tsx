import React, { useState, useRef } from 'react';
import {
  TextField,
  Button,
  Grid,
  Typography,
  Box,
  MenuItem,
  Autocomplete,
  InputAdornment,
  IconButton,
} from '@mui/material';
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  Autocomplete as GoogleAutocomplete,
} from '@react-google-maps/api';
import { Visibility, VisibilityOff, CalendarToday, Search } from '@mui/icons-material';
import { useGetGearEnum, useGetGenderEnum } from 'src/api/users';
import { useSnackbar } from 'src/components/snackbar';
import { useGetLanguages, useGetCategories, useGetCities, useGetAreas } from 'src/api/enum';
import { useTranslation } from 'react-i18next';
import { addStudent } from 'src/api/assistant';
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

interface StudentFormData {
  name: string;
  password: string;
  email: string;
  phone: string;
  dob: string;
  gear: string | number;
  vehicle_type_id: string;
  gender: string;
  locale: string;
  traffic_file_number: string;
  building_name: string;
  plot_number: string;
  street: string;
  address: string;
  landmark: string;
  longitude: string;
  latitude: string;
  label: string;
  postal_code: string;
  neighbourhood: string;
}

const initialFormState: StudentFormData = {
  name: '',
  password: '',
  email: '',
  phone: '',
  dob: '',
  gear: '',
  vehicle_type_id: '',
  gender: '',
  locale: '',
  traffic_file_number: '',
  building_name: '',
  plot_number: '',
  street: '',
  address: '',
  landmark: '',
  longitude: '',
  latitude: '',
  label: '',
  postal_code: '',
  neighbourhood: '',
};

const AddNewStudent: React.FC = () => {
  const [formData, setFormData] = useState<StudentFormData>(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { gearData, gearLoading } = useGetGearEnum();
  const { genderData, genderLoading } = useGetGenderEnum();
  const { languages } = useGetLanguages(0, 1000);
  const { categories } = useGetCategories(0, 1000);
  const { cities } = useGetCities(0, 1000);
  const { areas } = useGetAreas(0, 1000, formData.city_id);
  const { i18n, t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();

  // Refs for Google Places Autocomplete
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_APP_GOOGLE_API_KEY,
    libraries: ['visualization', 'places'],
  });

  const mapContainerStyle = {
    width: '100%',
    height: '400px',
    borderRadius: '8px',
  };

  const [center, setCenter] = useState({
    lat: 25.276987,
    lng: 55.296249,
  });

  const [markerPosition, setMarkerPosition] = useState<{ lat: number; lng: number } | null>(null);

  // Get current location on component mount
  React.useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const currentLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setCenter(currentLocation);
          setMarkerPosition(currentLocation);
          getGeocodeDetails(currentLocation.lat, currentLocation.lng);
        },
        (error) => {
          console.error('Error getting location:', error);
          enqueueSnackbar('Unable to get current location', { variant: 'warning' });
        }
      );
    }
  }, []);

  const getGeocodeDetails = async (lat: number, lng: number) => {
    const geocoder = new window.google.maps.Geocoder();
    const latlng = { lat, lng };

    geocoder.geocode({ location: latlng }, (results, status) => {
      if (status === 'OK' && results[0]) {
        const addressComponents = results[0].address_components;
        const getComponent = (type: string) =>
          addressComponents.find((comp) => comp.types.includes(type))?.long_name || '';

        setFormData((prev) => ({
          ...prev,
          latitude: lat.toString(),
          longitude: lng.toString(),
          address: results[0].formatted_address,
          building_name: getComponent('premise'),
          plot_number: getComponent('street_number'),
          street: getComponent('route'),
          landmark: getComponent('point_of_interest'),
          postal_code: getComponent('postal_code'),
          neighbourhood: getComponent('neighborhood') || getComponent('sublocality'),
        }));
      }
    });
  };

  const handlePlaceSelect = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();

      if (place.geometry && place.geometry.location) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();

        const newLocation = { lat, lng };
        setCenter(newLocation);
        setMarkerPosition(newLocation);
        getGeocodeDetails(lat, lng);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCancel = () => {
    router.push(paths.dashboard.assistant.student.list);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    try {
      e.preventDefault();
      setIsSubmitting(true);
      const updatedFormData = { ...formData, user_type: 'STUDENT', country_code: '971' };
      const response = await addStudent(updatedFormData);
      if (response.status === 'success') {
        router.push(paths.dashboard.assistant.student.list);
        enqueueSnackbar(response?.message, { variant: 'success' });
      }
    } catch (error) {
      if (error?.errors && typeof error?.errors === 'object' && !Array.isArray(error?.errors)) {
        Object.values(error?.errors).forEach((errorMessage) => {
          if (typeof errorMessage === 'object') {
            enqueueSnackbar(errorMessage[0], { variant: 'error' });
          } else {
            enqueueSnackbar(errorMessage, { variant: 'error' });
          }
        });
      } else {
        enqueueSnackbar(error.message, { variant: 'error' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Prepare options for dropdowns
  const genderOptions = Array.isArray(genderData) ? genderData : [];
  const gearOptions = Array.isArray(gearData) ? gearData : [];

  const vehicleOptions = Array.isArray(categories)
    ? categories.map((category) => {
        const localizedName =
          category.category_translations.find(
            (t) => t.locale.toLowerCase() === i18n.language.toLowerCase()
          )?.name || t('unknown_category');
        return {
          value: category.id.toString(),
          name: localizedName,
        };
      })
    : [];

  const languageOptions = Array.isArray(languages)
    ? languages.map((lang) => ({
        value: lang.language_culture,
        name: lang.name,
      }))
    : [];

  const selectedVehicle = vehicleOptions.find(
    (option) => option.value === formData.vehicle_type_id
  );
  const selectedLanguage = languageOptions.find((option) => option.value === formData.locale);

  return (
    <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100vh', p: 5, borderRadius: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 600, mb: 0.5 }}>
            Students
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Home / Students / <span style={{ color: '#000' }}>Add New Student</span>
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            onClick={handleCancel}
            sx={{
              borderColor: '#ff6b35',
              color: '#ff6b35',
              px: 4,
              '&:hover': {
                borderColor: '#ff6b35',
                bgcolor: 'rgba(255, 107, 53, 0.04)',
              },
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={isSubmitting}
            sx={{
              bgcolor: '#ff6b35',
              px: 4,
              '&:hover': {
                bgcolor: '#e55a2b',
              },
            }}
          >
            {isSubmitting ? 'Saving...' : 'Save'}
          </Button>
        </Box>
      </Box>

      {/* Form Content */}
      <Box sx={{ bgcolor: 'white', borderRadius: 2, p: 4 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
          Add New Student
        </Typography>

        <form onSubmit={handleSubmit}>
          {/* First Row: Name, Phone, Email, Password */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Student Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                variant="outlined"
                size="medium"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Phone Number"
                name="phone"
                value={formData.phone}
                onChange={(e) => {
                  let onlyDigits = e.target.value.replace(/\D/g, '');

                  // Remove leading 0 if present
                  if (onlyDigits.startsWith('0')) {
                    onlyDigits = onlyDigits.substring(1);
                  }

                  setFormData((prev) => ({
                    ...prev,
                    phone: onlyDigits,
                  }));
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Typography sx={{ color: 'text.secondary', whiteSpace: 'nowrap' }}>
                        +971 |
                      </Typography>
                    </InputAdornment>
                  ),
                }}
                variant="outlined"
                size="medium"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                variant="outlined"
                size="medium"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                variant="outlined"
                size="medium"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>

          {/* Second Row: DOB, Gender, Vehicle Type, Gear */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Date of Birth"
                name="dob"
                type="date"
                value={formData.dob}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                variant="outlined"
                size="medium"
                placeholder="DD/MM/YYYY"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <CalendarToday sx={{ color: 'text.secondary', fontSize: 20 }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                select
                fullWidth
                label="Gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                variant="outlined"
                size="medium"
                placeholder="Select gender"
              >
                {genderOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Autocomplete
                options={vehicleOptions}
                getOptionLabel={(option) => option.name ?? ''}
                isOptionEqualToValue={(option, val) => option.value === val.value}
                value={selectedVehicle || null}
                onChange={(_, newValue) => {
                  setFormData((prev) => ({
                    ...prev,
                    vehicle_type_id: newValue?.value || '',
                  }));
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Vehicle Type"
                    variant="outlined"
                    size="medium"
                    placeholder="Select vehicle type"
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                select
                fullWidth
                label="Gear"
                name="gear"
                value={formData.gear}
                onChange={handleChange}
                variant="outlined"
                size="medium"
                placeholder="Select gear type"
              >
                {gearOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>

          {/* Third Row: Preferred Language and Traffic File Number */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Autocomplete
                options={languageOptions}
                getOptionLabel={(option) => option.name ?? ''}
                isOptionEqualToValue={(option, val) => option.value === val.value}
                value={selectedLanguage || null}
                onChange={(_, newValue) => {
                  setFormData((prev) => ({
                    ...prev,
                    locale: newValue?.value || '',
                  }));
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Preferred Language"
                    variant="outlined"
                    size="medium"
                    placeholder="Select preferred language"
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Traffic File Number (optional)"
                name="traffic_file_number"
                value={formData.traffic_file_number}
                onChange={handleChange}
                variant="outlined"
                size="medium"
                placeholder="Enter traffic file number"
              />
            </Grid>
          </Grid>

          {/* Address Details Section */}
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, mt: 4 }}>
            Address Details
          </Typography>

          <Grid container spacing={3}>
            {/* Map Section with Search */}
            <Grid item xs={12} md={6}>
              {/* Search Box */}
              {isLoaded && (
                <Box sx={{ mb: 2 }}>
                  <GoogleAutocomplete
                    onLoad={(autocomplete) => {
                      autocompleteRef.current = autocomplete;
                    }}
                    onPlaceChanged={handlePlaceSelect}
                  >
                    <TextField
                      fullWidth
                      placeholder="Search for a location..."
                      variant="outlined"
                      size="medium"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Search sx={{ color: 'text.secondary' }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          bgcolor: 'white',
                        },
                      }}
                    />
                  </GoogleAutocomplete>
                </Box>
              )}

              {/* Map */}
              {isLoaded && (
                <GoogleMap
                  mapContainerStyle={mapContainerStyle}
                  center={center}
                  zoom={15}
                  onClick={(e) => {
                    const lat = e.latLng?.lat();
                    const lng = e.latLng?.lng();
                    if (lat && lng) {
                      setMarkerPosition({ lat, lng });
                      getGeocodeDetails(lat, lng);
                    }
                  }}
                >
                  {markerPosition && (
                    <Marker
                      position={markerPosition}
                      draggable={true}
                      onDragEnd={(e) => {
                        const lat = e.latLng?.lat();
                        const lng = e.latLng?.lng();
                        if (lat && lng) {
                          setMarkerPosition({ lat, lng });
                          getGeocodeDetails(lat, lng);
                        }
                      }}
                    />
                  )}
                </GoogleMap>
              )}
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Search, click on the map, or drag the marker to select your location
              </Typography>
            </Grid>

            {/* Address Fields */}
            <Grid item xs={12} md={6}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Billing Name"
                    name="building_name"
                    value={formData.building_name}
                    onChange={handleChange}
                    variant="outlined"
                    size="medium"
                    placeholder="Enter billing name"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Apartment / Build Number"
                    name="plot_number"
                    value={formData.plot_number}
                    onChange={handleChange}
                    variant="outlined"
                    size="medium"
                    placeholder="Enter plot number"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Street"
                    name="street"
                    value={formData.street}
                    onChange={handleChange}
                    variant="outlined"
                    size="medium"
                    placeholder="Enter street"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    variant="outlined"
                    size="medium"
                    disabled
                    placeholder="Enter address"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Land Mark"
                    name="landmark"
                    value={formData.landmark}
                    onChange={handleChange}
                    variant="outlined"
                    size="medium"
                    placeholder="Enter land mark"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Postal Code"
                    name="postal_code"
                    value={formData.postal_code}
                    onChange={handleChange}
                    variant="outlined"
                    size="medium"
                    placeholder="Enter postal code"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Neighborhood"
                    name="neighbourhood"
                    value={formData.neighbourhood}
                    onChange={handleChange}
                    variant="outlined"
                    size="medium"
                    placeholder="Enter neighborhood"
                  />
                </Grid>
                <Grid item xs={12} sm={6} sx={{ display: 'none' }}>
                  <TextField
                    fullWidth
                    label="Latitude"
                    name="latitude"
                    value={formData.latitude}
                    onChange={handleChange}
                    variant="outlined"
                    size="medium"
                    disabled
                    placeholder="Latitude"
                  />
                </Grid>

                <Grid item xs={12} sm={6} sx={{ display: 'none' }}>
                  <TextField
                    fullWidth
                    label="Longitude"
                    name="longitude"
                    value={formData.longitude}
                    onChange={handleChange}
                    variant="outlined"
                    size="medium"
                    disabled
                    placeholder="Longitude"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    fullWidth
                    label="Label"
                    name="label"
                    value={formData.label}
                    onChange={handleChange}
                    variant="outlined"
                    size="medium"
                    placeholder="Select Label"
                  >
                    {['home', 'office', 'other'].map((option) => (
                      <MenuItem key={option} value={option}>
                        {t(option)}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </form>
      </Box>
    </Box>
  );
};

export default AddNewStudent;
