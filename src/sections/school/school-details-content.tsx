// @mui
import Chip from '@mui/material/Chip';
import Card from '@mui/material/Card';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import ListItemText from '@mui/material/ListItemText';
// utils
import { fDate } from 'src/utils/format-time';
import { fCurrency } from 'src/utils/format-number';
// types
import { IJobItem } from 'src/types/job';
// components
import Iconify from 'src/components/iconify';
import Markdown from 'src/components/markdown';
import { Box, Button, CircularProgress, TextField } from '@mui/material';
import { GoogleMap, useJsApiLoader, Marker, LoadScript } from '@react-google-maps/api';
import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { createSchool, createUpdateSchoolAddress } from 'src/api/school';
import { enqueueSnackbar, useSnackbar } from 'src/components/snackbar';
import marker from 'react-map-gl/dist/esm/components/marker';

// ----------------------------------------------------------------------

type Props = {
  details: any;
  loading?: any;
  reload: VoidFunction;
};

export default function SchoolDetailsContent({ details, loading, reload }: Props) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_APP_GOOGLE_API_KEY,
  });
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
  // const { control, handleSubmit, setValue, reset } = useForm();

  const {
    reset,
    watch,
    control,
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

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
    console.log(data, 'data');
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
      }
    } catch (error) {
      if (error?.errors) {
        Object.values(error?.errors).forEach((errorMessage: any) => {
          enqueueSnackbar(errorMessage[0], { variant: 'error' });
        });
      } else {
        enqueueSnackbar(error.message, { variant: 'error' });
      }
    } finally {
      setEditingIndex(null);
      setNewAddress(null);
      reset();
      reload();
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
  const renderContent = (
    <Stack component={Card} spacing={3} sx={{ p: 3 }}>
      <Stack spacing={1} alignItems="flex-start" sx={{ typography: 'body2' }}>
        {[
          ...(details?.vendor_translations?.flatMap((itm: any) => [
            { label: `Name (${itm?.locale})`, value: itm?.name ?? 'N/A' },
          ]) || []),
          // { label: 'Name', value: items?.name ?? 'N/A' },
          { label: 'Email', value: details?.email ?? 'NA' },
          { label: 'Phone Number', value: details?.phone_number ?? 'NA' },
          { label: 'Commission in (%)', value: details?.commission_in_percentage ?? 'NA' },

          { label: 'License Expiry', value: details?.license_expiry ?? 'NA' },
          {
            label: 'License File',
            value: details?.license_file ? (
              <a href={`http://${details?.license_file}`} target="_blank" rel="noopener noreferrer">
                {details?.license_file}
                {details?.license_file && (
                  <img src="/assets/icons/navbar/ic_link.svg" alt="" width={22} height={22} />
                )}
              </a>
            ) : (
              'N/A'
            ),
          },
          {
            label: 'Website',
            value: details?.website ? (
              <a href={`http://${details?.website}`} target="_blank" rel="noopener noreferrer">
                {details?.website}
                {details?.website && (
                  <img src="/assets/icons/app/ic_link.svg" alt="" width={22} height={22} />
                )}
              </a>
            ) : (
              'N/A'
            ),
          },
          { label: 'Status', value: details?.status ?? 'NA' },
          {
            label: 'Is Active',
            value: details?.is_active ? (
              <Iconify color="green" icon="bi:check-square-fill" />
            ) : (
              <Iconify color="red" icon="bi:x-square-fill" />
            ),
          },
        ].map((item, index) => (
          <Box key={index} sx={{ display: 'flex', width: '100%' }}>
            <Box component="span" sx={{ minWidth: '200px', fontWeight: 'bold' }}>
              {item.label}
            </Box>
            <Box component="span" sx={{ minWidth: '100px', fontWeight: 'bold' }}>
              :
            </Box>
            <Box component="span">{loading ? 'Loading...' : item.value}</Box>
          </Box>
        ))}
      </Stack>

      {/* <Markdown children={content} /> */}

      {/* <Stack spacing={2}>
        <Typography variant="h6">Benefits</Typography>
        <Stack direction="row" alignItems="center" spacing={1}>
          {benefits.map((benefit) => (
            <Chip key={benefit} label={benefit} variant="soft" />
          ))}
        </Stack>
      </Stack> */}
    </Stack>
  );
  const renderAddress = (
    <Stack component={Card} spacing={3} sx={{ p: 3, mt: 2 }}>
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
          Add New Address
        </Button>
      </Box>

      {/* Form for Adding or Editing an Address */}
      {(newAddress || editingIndex !== null) && (
        <Box component="form" onSubmit={onSubmit} sx={{ mb: 2, p: 2, border: '1px solid #ddd' }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            {newAddress ? 'Add New Address' : `Edit Address ${editingIndex + 1}`}
          </Typography>
          {[
            { label: 'Street Address', name: 'street_address' },
            { label: 'City', name: 'city' },
            { label: 'State', name: 'state' },
            { label: 'Country', name: 'country' },
            { label: 'Latitude', name: 'latitude' },
            { label: 'Longitude', name: 'longitude' },
          ].map((item, idx) => (
            <Controller
              key={idx}
              name={item?.name}
              control={control}
              // defaultValue={addresses[editingIndex]?.[item.name] ?? ''}
              render={({ field }) => (
                <TextField
                  {...field}
                  label={item?.label}
                  variant="outlined"
                  sx={{ my: 1, width: '100%' }}
                  // onChange={(e) => field.onChange(e.target.value)}
                />
              )}
            />
          ))}

          {/* Map Component for Selecting Location */}
          <Typography variant="h6" sx={{ fontWeight: 'bold', mt: 2 }}>
            Select Location on Map
          </Typography>
          <Box sx={{ pt: 2, pb: 2 }}>
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
                      url: marker, // Specify the URL of your custom marker image
                      scaledSize: new window.google.maps.Size(50, 50), // Adjust the size of the marker image as needed
                    }}
                  />
                )}
                {(defaultValues?.latitude || defaultValues?.longitude) && (
                  <Marker
                    position={{
                      lat: defaultValues?.latitude,
                      lng: defaultValues?.longitude,
                    }}
                    icon={{
                      url: marker, // Specify the URL of your custom marker image
                      scaledSize: new window.google.maps.Size(50, 50), // Adjust the size of the marker image as needed
                    }}
                  />
                )}
              </GoogleMap>
            ) : (
              <div>Loading Map...</div>
            )}
          </Box>

          {/* Save and Cancel Buttons */}
          <Box>
            <Button variant="contained" type="submit" sx={{ mr: 1 }}>
              Save
            </Button>
            <Button
              variant="outlined"
              onClick={() => {
                setEditingIndex(null);
                setNewAddress(null);
                reset(defaultValues); // Reset form to default values
                reset();
              }}
            >
              Cancel
            </Button>
          </Box>
        </Box>
      )}

      <Stack spacing={4} alignItems="flex-start" sx={{ typography: 'body2', mt: 2 }}>
        {details?.vendor_addresses?.map((details: any, index: any) => {
          // Map center position for each address
          const defaultCenter = {
            lat: parseFloat(details?.latitude) || 0,
            lng: parseFloat(details?.longitude) || 0,
          };

          return (
            <Box key={details.id} sx={{ width: '100%' }}>
              {/* Address Section Title */}
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Address Details {index + 1}
              </Typography>

              {/* Address Details */}
              {[
                { label: 'Street Address', value: details?.street_address ?? 'N/A' },
                { label: 'City', value: details?.city ?? 'N/A' },
                { label: 'State', value: details?.state ?? 'N/A' },
                { label: 'Country', value: details?.country ?? 'N/A' },
              ].map((item, idx) => (
                <Box key={idx} sx={{ display: 'flex', width: '100%' }}>
                  <Box component="span" sx={{ minWidth: '200px', fontWeight: 'bold' }}>
                    {item.label}
                  </Box>
                  <Box component="span" sx={{ minWidth: '100px', fontWeight: 'bold' }}>
                    :
                  </Box>
                  <Box component="span">{loading ? 'Loading...' : item.value}</Box>
                </Box>
              ))}

              {/* Map Section */}
              {details?.latitude && details?.longitude ? (
                <>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mt: 2 }}>
                    Map Location
                  </Typography>
                  <Box sx={{ pt: 2, pb: 2 }}>
                    {isLoaded && load ? (
                      <GoogleMap
                        mapContainerStyle={mapContainerStyle}
                        center={defaultCenter}
                        zoom={12}
                      >
                        <Marker position={defaultCenter} />
                      </GoogleMap>
                    ) : (
                      <div>Loading Map...</div>
                    )}
                  </Box>
                </>
              ) : (
                <Typography>No location data available</Typography>
              )}
              <Button
                variant="contained"
                onClick={() => {
                  setEditingIndex(index);
                  reset(defaultValues); // Load address into form fields
                }}
                sx={{ mt: 2, display: editingIndex !== null ? 'none' : '' }}
              >
                Edit
              </Button>
            </Box>
          );
        })}
      </Stack>
    </Stack>
  );

  const renderCompany = (
    <Stack
      component={Paper}
      variant="outlined"
      spacing={2}
      sx={{ p: 3, borderRadius: 2 }}
      height={350}
    >
      <Avatar
        alt={details?.vendor_user?.user?.name}
        src={details?.vendor_user?.name?.user?.photo_url}
        variant="rounded"
        sx={{ width: 64, height: 64 }}
      />

      <Stack spacing={1}>
        {details?.vendor_user?.user?.name && (
          <Typography variant="subtitle1">
            {details?.vendor_user?.user?.name ?? 'Name Not Availbale'}
          </Typography>
        )}
        {details?.vendor_user?.user?.email && (
          <Typography variant="body2">
            {details?.vendor_user?.user?.email ?? 'Email Not Availbale'}
          </Typography>
        )}
        {details?.vendor_user?.user?.phone && (
          <Typography variant="body2">
            {details?.vendor_user?.user?.country_code
              ? details?.vendor_user?.user?.country_code - details?.vendor_user?.user?.phone
              : details?.vendor_user?.user?.phone || 'Phone_Not_Available'}
          </Typography>
        )}
        {details?.vendor_user?.user?.user_type && (
          <Typography variant="body2">{details?.vendor_user?.user?.user_type ?? 'NA'}</Typography>
        )}
        {details?.vendor_user?.user?.dob && (
          <Typography variant="body2">{details?.vendor_user?.user?.dob ?? 'NA'}</Typography>
        )}
        {details?.vendor_user?.user?.wallet_balance !== 0 && (
          <Typography variant="body2">
            WAllet Balance-{details?.vendor_user?.user?.dob ?? 'NA'}
          </Typography>
        )}
        {details?.vendor_user?.user?.wallet_points !== 0 && (
          <Typography variant="body2">{details?.vendor_user?.user?.dob ?? 'NA'}</Typography>
        )}
      </Stack>
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
        <Grid container spacing={3}>
          <Grid xs={12} md={8}>
            {renderContent}
          </Grid>

          <Grid xs={12} md={4}>
            {renderCompany}
          </Grid>
          <Grid md={12}>{renderAddress}</Grid>
        </Grid>
      )}
    </>
  );
}
