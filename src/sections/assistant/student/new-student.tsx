import React, { useState } from 'react';
import {
  TextField,
  Button,
  Grid,
  Typography,
  Box,
  MenuItem,
  Card,
  Autocomplete,
} from '@mui/material';
import { GoogleMap, useJsApiLoader, Marker, LoadScript } from '@react-google-maps/api';
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
  // city_id: string;
  locale: string;
  // area_id: string;
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
  // country_code: string;
}

const initialFormState: StudentFormData = {
  name: '',
  password: '',
  email: '',
  phone: '',
  // country_code: '+971',
  dob: '',
  gear: '',
  vehicle_type_id: '',
  gender: '',
  // city_id: '',
  locale: '',
  // area_id: '',
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
  const { gearData, gearLoading } = useGetGearEnum();
  const { genderData, genderLoading } = useGetGenderEnum();
  const { languages } = useGetLanguages(0, 1000);
  const { categories } = useGetCategories(0, 1000);
  const { cities } = useGetCities(0, 1000);
  const { areas } = useGetAreas(0, 1000, formData.city_id);
  const { i18n, t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_APP_GOOGLE_API_KEY,
    libraries: ['visualization', 'places'],
  });
  const mapContainerStyle = {
    width: '100%',
    height: '300px',
  };

  const center = {
    lat: 25.276987,
    lng: 55.296249,
  };
  const [markerPosition, setMarkerPosition] = useState<{ lat: number; lng: number } | null>(null);

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
          label: '',
        }));
      }
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
      // Reset area_id if city changes
      ...(name === 'city_id' ? { area_id: '' } : {}),
    }));
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
  return (
    <Card sx={{ maxWidth: 800, p: 3 }}>
      <Typography variant="h6" gutterBottom color="primary">
        {t('add_new_student')}
      </Typography>

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          {Object.entries(formData)
            .filter(
              ([key]) =>
                ![
                  'building_name',
                  'plot_number',
                  'street',
                  'address',
                  'landmark',
                  'longitude',
                  'latitude',
                  'label',
                  'postal_code',
                  'neighbourhood',
                ].includes(key)
            )
            .map(([key, value]) => {
              const label = t(key);

              let options: any[] = [];

              if (
                ['gear', 'vehicle_type_id', 'gender', 'city_id', 'locale', 'area_id'].includes(key)
              ) {
                if (key === 'gear' && Array.isArray(gearData)) {
                  options = gearData;
                } else if (key === 'gender' && Array.isArray(genderData)) {
                  options = genderData;
                } else if (key === 'vehicle_type_id' && Array.isArray(categories)) {
                  options = categories.map((category) => {
                    const localizedName =
                      category.category_translations.find(
                        (t) => t.locale.toLowerCase() === i18n.language.toLowerCase()
                      )?.name || t('unknown_category');
                    return {
                      value: category.id.toString(),
                      name: localizedName,
                    };
                  });
                } else if (key === 'city_id' && Array.isArray(cities)) {
                  options = cities.map((city) => {
                    const englishName =
                      city.city_translations.find(
                        (t) => t.locale.toLowerCase() === i18n.language.toLowerCase()
                      )?.name || t('unknown_city');

                    return {
                      value: city.id.toString(),
                      name: englishName,
                    };
                  });
                } else if (key === 'locale' && Array.isArray(languages)) {
                  options = languages.map((lang) => ({
                    value: lang.language_culture,
                    name: lang.name,
                  }));
                } else if (key === 'area_id') {
                  const areaList = areas ?? [];
                  options = areaList.map((area) => {
                    const englishName =
                      area.translations.find(
                        (t) => t.locale.toLowerCase() === i18n.language.toLowerCase()
                      )?.name || t('unknown_area');

                    return {
                      value: area.id.toString(),
                      name: englishName,
                    };
                  });
                }
              }

              if (['gear', 'gender'].includes(key)) {
                return (
                  <Grid item xs={12} sm={6} key={key}>
                    <TextField
                      select
                      fullWidth
                      label={label}
                      name={key}
                      value={value}
                      onChange={handleChange}
                      variant="outlined"
                    >
                      {options.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                );
              }

              if (['vehicle_type_id', 'city_id', 'locale', 'area_id'].includes(key)) {
                const selectedOption = options.find((option) => option.value === value);
                return (
                  <Grid item xs={12} sm={6} key={key}>
                    <Autocomplete
                      options={options}
                      getOptionLabel={(option) => option.name ?? ''}
                      isOptionEqualToValue={(option, val) => option.value === val.value}
                      value={selectedOption || null}
                      onChange={(_, newValue) => {
                        setFormData((prev) => ({
                          ...prev,
                          [key]: newValue?.value || '',
                          ...(key === 'city_id' ? { area_id: '' } : {}),
                        }));
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label={label}
                          variant="outlined"
                          fullWidth
                          disabled={options.length === 0}
                        />
                      )}
                    />
                  </Grid>
                );
              }

              if (key === 'dob') {
                return (
                  <Grid item xs={12} sm={6} key={key}>
                    <TextField
                      fullWidth
                      label={label}
                      type="date"
                      name={key}
                      value={value}
                      onChange={handleChange}
                      InputLabelProps={{ shrink: true }}
                      variant="outlined"
                    />
                  </Grid>
                );
              }
              if (key === 'phone') {
                return (
                  <Grid item xs={12} sm={6} key={key}>
                    <TextField
                      fullWidth
                      type="tel"
                      label={label}
                      name={key}
                      value={formData[key]}
                      onChange={(e) => {
                        const onlyDigits = e.target.value.replace(/\D/g, '');
                        setFormData((prev) => ({
                          ...prev,
                          [key]: onlyDigits,
                        }));
                      }}
                      InputProps={{
                        startAdornment: (
                          <Typography sx={{ mr: 1, color: 'text.secondary', fontWeight: 500 }}>
                            +971
                          </Typography>
                        ),
                      }}
                      variant="outlined"
                    />
                  </Grid>
                );
              }

              return (
                <Grid item xs={12} sm={6} key={key}>
                  <TextField
                    fullWidth
                    type={key === 'password' ? 'password' : 'text'}
                    label={label}
                    name={key}
                    value={value}
                    onChange={handleChange}
                    variant="outlined"
                  />
                </Grid>
              );
            })}
        </Grid>

        {/* ---------- Address Section ---------- */}
        <Box mt={4}>
          <Typography variant="h6" gutterBottom color="primary">
            {t('address_details')}
          </Typography>
          <Box mt={4}>
            <Typography variant="h6" gutterBottom>
              {t('select_location_on_map')}
            </Typography>

            {isLoaded && (
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={center}
                zoom={12}
                onClick={(e) => {
                  const lat = e.latLng?.lat();
                  const lng = e.latLng?.lng();
                  if (lat && lng) {
                    setMarkerPosition({ lat, lng });
                    getGeocodeDetails(lat, lng);
                  }
                }}
              >
                {markerPosition && <Marker position={markerPosition} />}
              </GoogleMap>
            )}
          </Box>
          <Grid container spacing={3} mt="10px">
            {[
              'building_name',
              'plot_number',
              'street',
              'address',
              'landmark',
              'postal_code',
              'neighbourhood',
              'latitude',
              'longitude',
              'label',
            ].map((key) => {
              const labelText = t(key);

              if (key === 'label') {
                return (
                  <Grid item xs={12} sm={6} key={key}>
                    <TextField
                      fullWidth
                      select
                      label={t(key)}
                      name={key}
                      value={formData[key]}
                      onChange={handleChange}
                      variant="outlined"
                    >
                      {['home', 'office', 'other'].map((option) => (
                        <MenuItem key={option} value={option}>
                          {t(option)}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                );
              }

              return (
                <Grid item xs={12} sm={6} key={key}>
                  <TextField
                    fullWidth
                    label={labelText}
                    name={key}
                    value={formData[key]}
                    onChange={handleChange}
                    variant="outlined"
                    disabled={['latitude', 'longitude', 'address'].includes(key)}
                  />
                </Grid>
              );
            })}
          </Grid>
        </Box>

        <Box mt={4}>
          <Button type="submit" variant="contained" color="primary" fullWidth sx={{ py: 1.5 }}>
            {isSubmitting ? t('submitting') : t('submit')}
          </Button>
        </Box>
      </form>
    </Card>
  );
};

export default AddNewStudent;
