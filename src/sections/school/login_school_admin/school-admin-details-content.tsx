// @mui
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
// types
// components
import Iconify from 'src/components/iconify';
import Markdown from 'src/components/markdown';
import {
  Box,
  Button,
  CircularProgress,
  Grid,
  IconButton,
  MenuItem,
  Select,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { GoogleMap, useJsApiLoader, Marker, LoadScript } from '@react-google-maps/api';
import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { createSchool, createUpdateSchoolAddress, useGetSchoolAdmin } from 'src/api/school';
import { enqueueSnackbar, useSnackbar } from 'src/components/snackbar';
import marker from 'react-map-gl/dist/esm/components/marker';
import Scrollbar from 'src/components/scrollbar';
import { useBoolean } from 'src/hooks/use-boolean';
import { useGetAllLanguage } from 'src/api/language';
import { RHFTextField } from 'src/components/hook-form';
import { useGoogleMaps } from 'src/sections/overview/e-commerce/GoogleMapsProvider';
import { useTranslation } from 'react-i18next';
// ----------------------------------------------------------------------

type Props = {
  details: any;
  loading?: any;
  reload: VoidFunction;
};

export default function SchoolAdminDetailsContent({ details, loading, reload }: Props) {
  // const [selectedLanguage, setSelectedLanguage] = useState(
  //   details?.vendor_translations?.length > 0 ? details?.vendor_translations[0]?.locale : ''
  // );
  const [editMode, setEditMode] = useState(false);
  const { t, i18n } = useTranslation();

  const renderContent = (
    <Stack component={Card} spacing={3} sx={{ p: 3 }}>
      <Scrollbar>
        <Stack spacing={1} alignItems="flex-start" sx={{ typography: 'body2' }}>
          {[
            ...(details?.vendor_translations?.flatMap((itm: any) => [
              {
                label: `${t('name')} (${itm?.locale})`,
                value: itm?.name ?? t('n/a'),
              },
            ]) || []),
            { label: t('email'), value: details?.email ?? t('n/a') },
            { label: t('phone_number'), value: details?.phone_number ?? t('n/a') },
            {
              label: t('certificate_commission_percentage'),
              value: `${details?.certificate_commission_in_percentage ?? t('n/a')}%`,
            },
            { label: t('license_expiry'), value: details?.license_expiry ?? t('n/a') },
            {
              label: t('license_file'),
              value: details?.license_file ? (
                <a
                  href={details?.license_file}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ wordBreak: 'break-all', overflowWrap: 'break-word' }}
                >
                  {details?.license_file}
                </a>
              ) : (
                t('n/a')
              ),
            },
            {
              label: t('website'),
              value: details?.website ? (
                <a
                  href={details?.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ wordBreak: 'break-all', overflowWrap: 'break-word' }}
                >
                  {details?.website}
                  {details?.website && (
                    <img src="/assets/icons/navbar/ic_link.svg" alt="" width={22} height={22} />
                  )}
                </a>
              ) : (
                t('n/a')
              ),
            },
            { label: t('status'), value: details?.status ?? t('n/a') },
            {
              label: t('is_active'),
              value: !!details?.is_active ? (
                <Iconify color="green" icon="bi:check-square-fill" />
              ) : (
                <Iconify color="red" icon="bi:x-square-fill" />
              ),
            },
          ].map((item, index) => (
            <Box key={index} sx={{ display: 'flex', width: '100%' }}>
              <Box component="span" sx={{ minWidth: '330px', fontWeight: 'bold' }}>
                {item.label}
              </Box>
              <Box component="span" sx={{ minWidth: '100px', fontWeight: 'bold' }}>
                :
              </Box>
              <Box component="span" sx={{ flex: 1 }}>
                {item.value ?? t('n/a')}
              </Box>
            </Box>
          ))}
        </Stack>
      </Scrollbar>
    </Stack>
  );
  // Address ///////////////////////////////
  const { isLoaded } = useGoogleMaps();
  const mapContainerStyle = useMemo(() => ({ height: '300px', width: '100%' }), []);
  const defaultCenter = {
    lat: parseFloat(details?.latitude) || 0,
    lng: parseFloat(details?.longitude) || 0,
  };
  const [load, setLoad] = useState(false);

  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [addresses, setAddresses] = useState(details?.vendor_addresses || []);
  const [newAddress, setNewAddress] = useState(null);
  const { enqueueSnackbar } = useSnackbar();
  const [markerPosition, setMarkerPosition] = useState({
    lat: parseFloat(details?.latitude) || 24.4539,
    lng: parseFloat(details?.longitude) || 54.3773,
  });
  const quickCreate = useBoolean();

  const NewUserSchema = Yup.object().shape({
    street_address: Yup.string(),
    city: Yup.mixed().nullable(),
    state: Yup.mixed().nullable(),
    country: Yup.mixed().nullable(),
    latitude: Yup.string().nullable(),
    longitude: Yup.string().nullable(),
  });
  const defaultValues = useMemo(
    () => ({
      street_address:
        editingIndex !== null ? details?.vendor_addresses[editingIndex]?.street_address : '',
      city: editingIndex !== null ? details?.vendor_addresses[editingIndex]?.city : '',
      country: editingIndex !== null ? details?.vendor_addresses[editingIndex]?.country : '',
      state: editingIndex !== null ? details?.vendor_addresses[editingIndex]?.state : '',
      latitude: editingIndex !== null ? details?.vendor_addresses[editingIndex]?.latitude : '',
      longitude: editingIndex !== null ? details?.vendor_addresses[editingIndex]?.longitude : '',
    }),
    [details?.vendor_addresses, editingIndex]
  );

  const methods = useForm({
    resolver: yupResolver(NewUserSchema) as any,
    defaultValues,
  });

  const { reset, watch, control, setValue, handleSubmit } = methods;

  useEffect(() => {
    if (defaultValues.latitude && defaultValues.longitude) {
      setMarkerPosition({
        lat: parseFloat(defaultValues.latitude) || 24.4539,
        lng: parseFloat(defaultValues.longitude) || 54.3773,
      });
    }
    reset(defaultValues);
    setLoad(true);
  }, [defaultValues, reset]);
  // Function to update address state after form submission
  const onSubmit = handleSubmit(async (data) => {
    try {
      let payload = {
        street_address: data?.street_address,
        city: data?.city,
        state: data?.state,
        country: data?.country,
        latitude: data?.latitude,
        longitude: data?.longitude,
        create_new_user: 0,
        vendor_id: details?.id,
      };
      if (editingIndex !== null) {
        payload.id = details?.vendor_addresses[editingIndex]?.id; // Add id if editingIndex is not null
      }
      const response = await createUpdateSchoolAddress(payload);
      if (response) {
        enqueueSnackbar(response.message, {
          variant: 'success',
        });
        setEditingIndex(null);
        setNewAddress(null);
        reset();
        reload();
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
    }
  });
  // Function to handle map click and update lat/lng values
  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    if (!e.latLng) return;
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    setMarkerPosition({ lat, lng });
    setValue('latitude', lat.toString());
    setValue('longitude', lng.toString());
  };
  const maxVisibleAddresses = 2;
  const [showAllAddresses, setShowAllAddresses] = useState(false);
  const renderAddress = (
    <Stack component={Card} spacing={3} sx={{ p: 3, mt: 2, width: '100%' }}>
      <Scrollbar>
        <Box>
          <Button
            variant="contained"
            onClick={() => {
              setNewAddress({});
              setEditingIndex(null);
              reset();
            }}
            sx={{ mb: 2 }}
          >
            {t('add_new_address')}
          </Button>
        </Box>

        {/* Form for Adding or Editing an Address */}
        {!newAddress && editingIndex === null && (
          <Stack spacing={4} alignItems="flex-start" sx={{ typography: 'body2', mt: 2 }}>
            {details?.vendor_addresses
              ?.slice(0, showAllAddresses ? details.vendor_addresses.length : maxVisibleAddresses)
              ?.map((details, index) => {
                // Map center position for each address
                const defaultCenter = {
                  lat: parseFloat(details?.latitude) || 0,
                  lng: parseFloat(details?.longitude) || 0,
                };

                return (
                  <Box key={details.id} sx={{ width: '100%' }}>
                    {/* Address Section Title */}
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      {t('branch')} {index + 1}
                    </Typography>

                    {/* Address Details and Map */}
                    <Box
                      component={Card}
                      sx={{
                        p: 3,
                        mb: 2,
                        mt: 2,
                        boxShadow: 3,
                        borderRadius: 2,
                        border: '1px solid #ddd',

                        display: 'grid',
                        gridTemplateColumns: {
                          sm: '1fr',
                          md: '1fr 3fr',
                        },
                        gap: 2,
                      }}
                    >
                      {/* Address Details */}
                      <Box>
                        {[
                          {
                            label: t('street_address'),
                            value: details?.street_address ?? t('n/a'),
                          },
                          {
                            label: t('city'),
                            value:
                              details?.city?.city_translations?.find(
                                (ct) => ct?.locale?.toLowerCase() === i18n.language.toLowerCase()
                              )?.name ?? t('n/a'),
                          },
                          {
                            label: t('state'),
                            value:
                              details?.state?.translations?.find(
                                (st) => st?.locale?.toLowerCase() === i18n.language.toLowerCase()
                              )?.name ?? t('n/a'),
                          },
                          { label: t('country'), value: details?.country ?? t('n/a') },
                        ].map((item, idx) => (
                          <Box key={idx} sx={{ display: 'flex', mb: 1 }}>
                            <Box sx={{ minWidth: '150px', fontWeight: 'bold' }}>{item.label}</Box>
                            <Box>{item.value || t('n/a')}</Box>
                          </Box>
                        ))}
                      </Box>

                      {/* Map on the right */}
                      <Box>
                        {isLoaded && load ? (
                          <GoogleMap
                            mapContainerStyle={mapContainerStyle}
                            center={defaultCenter}
                            zoom={12}
                          >
                            <Marker position={defaultCenter} />
                          </GoogleMap>
                        ) : (
                          <div>{t('loading_map')}</div>
                        )}
                      </Box>
                      <Button
                        variant="contained"
                        onClick={() => {
                          setEditingIndex(index);
                          reset(defaultValues); // Load address into form fields
                        }}
                        sx={{ mt: 2, display: editingIndex !== null ? 'none' : '' }}
                      >
                        {t('edit')}
                      </Button>
                    </Box>
                  </Box>
                );
              })}
          </Stack>
        )}

        {(newAddress || editingIndex !== null) && (
          <Box component="form" onSubmit={onSubmit} sx={{ mb: 2, p: 2, border: '1px solid #ddd' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
              {newAddress ? t('add_new_address') : `${t('edit_address')} ${editingIndex + 1}`}
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                {[
                  { label: t('street_address'), name: 'street_address' },
                  { label: t('city'), name: 'city' },
                  { label: t('state'), name: 'state' },
                  { label: t('country'), name: 'country' },
                  { label: t('latitude'), name: 'latitude' },
                  { label: t('longitude'), name: 'longitude' },
                ].map((item, idx) => (
                  <Controller
                    key={idx}
                    name={item.name}
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label={item.label}
                        variant="outlined"
                        sx={{ my: 1, width: '100%' }}
                      />
                    )}
                  />
                ))}

                <Box sx={{ mt: 2 }}>
                  <Button variant="contained" type="submit" sx={{ mr: 1 }}>
                    {t('save')}
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setEditingIndex(null);
                      setNewAddress(null);
                      reset(defaultValues);
                    }}
                  >
                    {t('cancel')}
                  </Button>
                </Box>
              </Grid>

              {/* Map Section */}
              <Grid item xs={12} md={6}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                  {t('select_location_on_map')}
                </Typography>
                <Box sx={{ height: 300 }}>
                  {isLoaded && load ? (
                    <GoogleMap
                      mapContainerStyle={mapContainerStyle}
                      center={markerPosition}
                      zoom={12}
                      onClick={handleMapClick}
                    >
                      {markerPosition && (
                        <Marker
                          position={markerPosition}
                          icon={{
                            url:
                              marker && typeof marker === 'string'
                                ? marker
                                : 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
                            scaledSize: new window.google.maps.Size(50, 50),
                          }}
                        />
                      )}
                      {(defaultValues?.latitude || defaultValues?.longitude) && (
                        <Marker
                          position={{
                            lat: Number.isNaN(Number(defaultValues?.latitude))
                              ? 0
                              : Number(defaultValues?.latitude),
                            lng: Number.isNaN(Number(defaultValues?.longitude))
                              ? 0
                              : Number(defaultValues?.longitude),
                          }}
                          icon={{
                            url:
                              marker && typeof marker === 'string'
                                ? marker
                                : 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
                            scaledSize: new window.google.maps.Size(50, 50),
                          }}
                        />
                      )}
                    </GoogleMap>
                  ) : (
                    <div>{t('loading_map')}</div>
                  )}
                </Box>
              </Grid>
            </Grid>
          </Box>
        )}

        {details?.vendor_addresses?.length > maxVisibleAddresses && (
          <Box sx={{ mt: 3 }}>
            <Button variant="outlined" onClick={() => setShowAllAddresses(!showAllAddresses)}>
              {showAllAddresses ? 'Show Less' : 'Show More'}
            </Button>
          </Box>
        )}
      </Scrollbar>
    </Stack>
  );
  return (
    <>
      {loading ? (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            margin: '10px',
            alignSelf: 'center',
          }}
        >
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={1} rowGap={1}>
          <Grid xs={12} md={8}>
            {renderContent}
          </Grid>
          <Grid item xs={12}>
            {renderAddress}
          </Grid>
        </Grid>
      )}
    </>
  );
}
