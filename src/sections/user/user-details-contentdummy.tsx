// @mui
import Chip from '@mui/material/Chip';
import Card from '@mui/material/Card';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Label from 'src/components/label';

import ListItemText from '@mui/material/ListItemText';
// utils
import { fDate } from 'src/utils/format-time';
import { fCurrency } from 'src/utils/format-number';
// types
import { IJobItem } from 'src/types/job';
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
} from '@mui/material';
import { GoogleMap, useJsApiLoader, Marker, LoadScript } from '@react-google-maps/api';
import { useCallback, useEffect, useMemo, useState } from 'react';
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
import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
<<<<<<< HEAD
import { TRAINER_DETAILS_TABS } from 'src/_mock/_trainer';
import TrainerDetailsContent from './trainer-details-content';
=======
import {
  createNewAddressForUser,
  deleteUserAddress,
  updateExistingUserAddress,
} from 'src/api/users';
>>>>>>> ba11629 (Implemented functionality for students to add, edit, and delete their addresses on the user details page. Added a dropdown for label options like home and office)

// ----------------------------------------------------------------------

type Props = {
  addresses: any;
  addressesLoading: any;
  details: any;
  loading?: any;
  reload?: VoidFunction;
};

export default function UserDetailsContent({
  addresses,
  addressesLoading,
  details,
  loading,
  reload,
}: Props) {
  const { reset } = useForm();

  const [selectedLanguage, setSelectedLanguage] = useState(
    details?.vendor_translations?.length > 0 ? details?.vendor_translations[0]?.locale : ''
  );
  console.log(details?.user_type, "details");

  const [editMode, setEditMode] = useState(false);
  const [newAddress, setNewAddress] = useState(null); // state to store new stundet address
  const [editingIndex, setEditingIndex] = useState<number | null>(null); // state to track the editing index of student address

  const [currentTab, setCurrentTab] = useState('details');

  const currentTrainer = details;


  const handleChangeTab = useCallback((event: React.SyntheticEvent, newValue: string) => {
    setCurrentTab(newValue);
  }, []);

  const { language, languageLoading, totalpages, revalidateLanguage, languageError } =
    useGetAllLanguage(0, 1000);
  const { schoolAdminList, schoolAdminLoading } = useGetSchoolAdmin(1000, 1, '');

  // This useEffect sets the initial selectedLanguage value once details are available
  useEffect(() => {
    if (details?.vendor_translations?.length > 0) {
      setSelectedLanguage(details?.vendor_translations[0]?.locale);
    }
  }, [details]);

  const [localeOptions, setLocaleOptions] = useState([]);

  useEffect(() => {
    if ((language && language?.length > 0) || details?.vendor_translations?.length > 0) {
      let initialLocaleOptions = [];
      if (Array.isArray(language)) {
        initialLocaleOptions = language?.map((item: any) => ({
          label: item?.language_culture,
          value: item?.language_culture,
        }));
      }
      // const newLocales = details?.vendor_translations
      //   ?.map((category: any) => category?.locale)
      //   ?.filter(
      //     (locale: any) => !initialLocaleOptions?.some((option: any) => option?.value === locale)
      //   )
      //   .map((locale: any) => ({ label: locale, value: locale }));
      // if (newLocales) {
      //   setLocaleOptions([...initialLocaleOptions, ...newLocales]);
      // } else {
      setLocaleOptions([...initialLocaleOptions]);
      // }
    }
  }, [language, details]);

  // Find the selectedLocaleObject whenever selectedLanguage or details change
  const router = useRouter();
  const handleEditRow = useCallback(() => {
    router.push(paths.dashboard.user.edit(details?.id));
  }, [router]);
  const renderContent = (
    <Stack component={Card} spacing={3} sx={{ p: 3 }}>
      <Stack
        alignItems="end"
        sx={{
          width: '-webkit-fill-available',
          cursor: 'pointer',
          position: 'absolute',
          // top: '1.5rem',
          right: '1rem',
        }}
      >
        <Iconify icon="solar:pen-bold" onClick={handleEditRow} sx={{ cursor: 'pointer' }} />
      </Stack>
      <Stack
        spacing={1}
        alignItems={{ xs: 'center', md: 'center' }}
        direction={{
          xs: 'column',
          md: 'row',
        }}
        sx={{
          p: 2.5,
          // pr: { xs: 2.5, md: 1 },
        }}
      >
        {/* <Grid item xs={12} sm={8} md={8}> */}
        <Avatar
          alt={details?.name}
          src={details?.photo_url}
          sx={{ width: 300, height: 300, borderRadius: 2, mb: 2 }}
          variant="square"
        />
        {/* </Grid> */}
        <Grid item xs={12} sm={8} md={8}>
          <Scrollbar>
            <Stack spacing={1} alignItems="flex-start" sx={{ typography: 'body2', pb: 2 }}>
              {[
                { label: 'Name', value: details?.name ?? 'N/A' },
                { label: 'Email', value: details?.email ?? 'NA' },
                {
                  label: 'Phone Number',
                  value: details?.country_code
                    ? `${details?.country_code}-${details?.phone}`
                    : details?.phone ?? 'NA',
                },
                { label: 'User Type', value: details?.user_type ?? 'NA' },

                { label: 'Preffered Language', value: details?.locale ?? 'NA' },
                { label: 'Wallet Balance', value: details?.wallet_balance ?? 'NA' },
                { label: 'Wallet Points', value: details?.wallet_points ?? 'NA' },

                {
                  label: 'Is Active',
                  value:
                    details?.is_active === '1' ? (
                      <Chip label="Active" color="success" variant="soft" />
                    ) : (
                      <Chip label="In Active" color="error" variant="soft" />
                    ),
                },
                ...(details?.user_type === 'TRAINER'
                  ? [
                    {
                      label: 'Max Cash Allowded in Hand',
                      value: details?.max_cash_in_hand_allowed ?? 'N/A',
                    },
                    { label: 'Cash in Hand', value: details?.cash_in_hand ?? 'N/A' },
                    {
                      label: 'Cash Clearance Date',
                      value: details?.cash_clearance_date ?? 'N/A',
                    },
                    {
                      label: 'Last Booking At',
                      value: details?.last_booking_was ?? 'N/A',
                    },
                    {
                      label: 'Vendor Commission',
                      value: details?.vendor_commission_in_percentage ?? 'N/A',
                    },
                  ]
                  : []),
              ].map((item, index) => (
                <Box key={index} sx={{ display: 'flex', width: '100%' }}>
                  <Box component="span" sx={{ minWidth: '200px', fontWeight: 'bold' }}>
                    {item.label}
                  </Box>
                  <Box component="span" sx={{ minWidth: '100px', fontWeight: 'bold' }}>
                    :
                  </Box>
                  <Box component="span" sx={{ flex: 1 }}>
                    {item.value ?? 'N/A'}
                  </Box>
                  {/* <Box component="span">{loading ? 'Loading...' : item.value}</Box> */}
                </Box>
              ))}
            </Stack>
          </Scrollbar>
        </Grid>
      </Stack>
    </Stack>
  );
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_APP_GOOGLE_API_KEY,
  });
  const mapContainerStyle = useMemo(() => ({ height: '300px', width: '100%' }), []);
  // const [markerPosition, setMarkerPosition] = useState({
  //   lat: parseFloat(addresses[0]?.latitude) || 24.4539,
  //   lng: parseFloat(addresses[0]?.longitude) || 54.3773,
  // });
  // const defaultValues = useMemo(
  //   () => ({
  //     street_address:
  //       editingIndex !== null ? details?.vendor_addresses[editingIndex]?.street_address : '',
  //     city: editingIndex !== null ? details?.vendor_addresses[editingIndex]?.city : '',
  //     country: editingIndex !== null ? details?.vendor_addresses[editingIndex]?.country : '',
  //     state: editingIndex !== null ? details?.vendor_addresses[editingIndex]?.state : '',
  //     latitude: editingIndex !== null ? details?.vendor_addresses[editingIndex]?.latitude : '',
  //     longitude: editingIndex !== null ? details?.vendor_addresses[editingIndex]?.longitude : '',
  //   }),
  //   [details?.vendor_addresses, editingIndex]
  // );
  const handleUpdateExistingUserAddress = async (body: Address, id, user_id) => {
    try {
      console.log('Updating address with body:', body);

  const renderTabs = (
    <Tabs
      value={currentTab}
      onChange={handleChangeTab}
      sx={{
        mb: { xs: 3, md: 5 },
      }}
    >
      {TRAINER_DETAILS_TABS.map((tab) => (
        <Tab
          key={tab.value}
          iconPosition="end"
          value={tab.value}
          label={tab.label}
        />
      ))}
    </Tabs>
  );

  const renderCompany = (
    <Stack
      component={Paper}
      variant="outlined"
      spacing={2}
      sx={{ p: 3, borderRadius: 2 }}
      height={350}
    // onClick={route}
    >
      <Avatar
        alt={details?.vendor_user?.user?.name}
        src={details?.vendor_user?.name?.user?.photo_url}
        variant="rounded"
        sx={{ width: 64, height: 64 }}
      />

      // Display success message if update is successful
      if (response && response.status === 'success') {
        setNewAddress(null);
        setEditingIndex(null);
        reload();
        enqueueSnackbar('User address updated successfully!', { variant: 'success' });
      }
    } catch (error) {
      console.log('Error updating user address:', error);
      enqueueSnackbar('Failed to update user address. Please try again.', { variant: 'error' });
    }
  };

  const handleCreateNewUserAddress = async (body: Address) => {
    try {
      console.log('body', body);
      const response = await createNewAddressForUser(body);

      if (response && response.status === 'success') {
        setNewAddress(null);
        setEditingIndex(null);
        reload();
        enqueueSnackbar('User address created successfully!', { variant: 'success' });
      }
    } catch (error) {
      console.log('error', error);
    }
  };
  const [addressForm, setAddressForm] = useState({
    // State for form fields
    id: '',
    plot_number: '',
    building_name: '',
    street: '',
    city: '',
    label: '',
    address: '',
    landmark: '',
    country_code: '',
    phone_number: '',
    longitude: '',
    latitude: '',
    postalCode: '',
  });

  const handleChangeStoreAddress = (e) => {
    console.log('e.target', e.target);
    const { name, value } = e.target;
    setAddressForm((prev) => ({ ...prev, [name]: value }));
  };

  // useEffect(() => {
  //   if (defaultValues.latitude && defaultValues.longitude) {
  //     setMarkerPosition({
  //       lat: parseFloat(defaultValues.latitude) || 24.4539,
  //       lng: parseFloat(defaultValues.longitude) || 54.3773,
  //     });
  //   }
  //   reset(defaultValues);
  //   setLoad(true);
  // }, [defaultValues, reset]);
  // const onSubmit = () => {};
  // const handleMapClick = (e: google.maps.MapMouseEvent) => {
  //   if (!e.latLng) return;
  //   const lat = e.latLng.lat();
  //   const lng = e.latLng.lng();
  //   setMarkerPosition({ lat, lng });
  //   // setValue('latitude', lat.toString());
  //   // setValue('longitude', lng.toString());
  // };
  // State to manage the visibility of the map for each address
  const [showMapIndex, setShowMapIndex] = useState(null);
  console.log('addresses', addresses);
  // Function to handle user deletion
  const handleDeleteUserAddress = async (addressId: string, reloadData: () => void) => {
    try {
      console.log('addressId', addressId);
      const response = await deleteUserAddress(addressId);

      if (response) {
        enqueueSnackbar('User address deleted successfully!', { variant: 'success' });
        if (reloadData) reloadData();
      }
    } catch (error) {
      enqueueSnackbar('Failed to delete user address!', { variant: 'error' });
    }
  };
  // Add a method to handle the selected location from the map
  const handleLocationSelect = (selectedLocation) => {
    setAddressForm((prev) => ({
      ...prev,
      longitude: selectedLocation.lng,
      latitude: selectedLocation.lat,
    }));
  };
  useEffect(() => {
    console.log('Editing index changed to:', editingIndex);
    console.log('showMapIndex', showMapIndex);
  }, [editingIndex, showMapIndex]);
  const handleEditAddress = useCallback(
    (index, adddress) => {
      console.log('index', index);
      console.log('address', adddress);
      // Open map and set longitude and latitude
      setShowMapIndex(index);
      setEditMode(!editMode);
      setEditingIndex(index);
      setAddressForm({
        ...addressForm,
        longitude: address.longitude,
        latitude: address.latitude,
      });
      setEditMode(!editMode);
    },
    [addressForm]
  );
  const renderAddress = (
    <Stack component={Card} spacing={3} sx={{ p: 3, mt: 2 }}>
      <Scrollbar>
        <Box>
          <Button
            variant="contained"
            onClick={() => {
              setNewAddress({});
              setShowMapIndex(null); // Reset map visibility
              reset();
            }}
            sx={{ mb: 2 }}
          >
            Add New Address
          </Button>
        </Box>

        {/* Form for Adding or Editing an Address */}
        {newAddress && (
          <Box
            component="form"
            onSubmit={(e) => {
              const pathSegments = window.location.pathname.split('/');
              const user_id = parseInt(pathSegments[pathSegments.length - 1], 10);
              e.preventDefault(); // Prevent default form submission
              const addressFormData = {
                id: parseInt(addressForm.id, 10),
                user_id,
                plot_number: addressForm.plot_number,
                building_name: addressForm.building_name,
                street: addressForm.street,
                city: addressForm.city,
                label: addressForm.label,
                address: addressForm.address,
                landmark: addressForm.landmark,
                country_code: parseInt(addressForm.country_code, 10),
                phone_number: addressForm.phone_number,
                longitude: parseFloat(addressForm.longitude) || 0.0,
                latitude: parseFloat(addressForm.latitude) || 0.0,
              };

              handleCreateNewUserAddress(addressFormData); // Call to create a new user address
            }}
            sx={{ mb: 2, p: 2, border: '1px solid #ddd' }}
          >
            {newAddress && (
              <Box sx={{ pt: 2, pb: 2 }}>
                {/* {console.log(
                    `isLoaded: ${isLoaded}, load: ${load}, latitude: ${address.latitude}, longitude: ${address.longitude}`
                  )} */}
                {isLoaded ? (
                  <GoogleMap
                    onClick={(e) => handleLocationSelect(e.latLng.toJSON())}
                    mapContainerStyle={mapContainerStyle}
                    center={{
                      lat: parseFloat(addressForm?.latitude) || 24.4539,
                      lng: parseFloat(addressForm?.latitude) || 24.4539,
                    }}
                    zoom={12}
                  >
                    <Marker
                      position={{
                        lat: parseFloat(addressForm.latitude),
                        lng: parseFloat(addressForm.longitude),
                      }}
                    />
                  </GoogleMap>
                ) : (
                  <div>Loading Map...</div>
                )}
              </Box>
            )}
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
              {newAddress ? 'Add New Address' : `Edit Address ${(editingIndex ?? 0) + 1}`}
            </Typography>

            {/* Form Fields in Rows */}
            {/* Row 1 */}

            {/* Row 2 */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, mb: 2 }}>
              <TextField
                label="Street Address"
                variant="outlined"
                name="street"
                value={addressForm.street}
                onChange={handleChangeStoreAddress}
                sx={{ flex: 1, mt: 0.5, mb: 0.5 }}
              />
              <TextField
                label="Building Name"
                variant="outlined"
                name="building_name"
                value={addressForm.building_name}
                onChange={handleChangeStoreAddress}
                sx={{ flex: 1, mt: 0.5, mb: 0.5 }}
              />
              <TextField
                label="City"
                variant="outlined"
                name="city"
                value={addressForm.city}
                onChange={handleChangeStoreAddress}
                sx={{ flex: 1, mt: 0.5, mb: 0.5 }}
              />
            </Box>

            {/* Row 3 */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, mb: 2 }}>
              <TextField
                label="State"
                variant="outlined"
                name="state"
                value={addressForm.state}
                onChange={handleChangeStoreAddress}
                sx={{ flex: 1, mt: 0.5, mb: 0.5 }}
              />
              <TextField
                label="Country Code"
                variant="outlined"
                name="country_code"
                value={addressForm.country_code}
                onChange={(e) => handleChangeStoreAddress(e, true)}
                sx={{ flex: 1, mt: 0.5, mb: 0.5 }}
              />
              <TextField
                label="Postal Code"
                variant="outlined"
                name="postalCode"
                value={addressForm.postalCode}
                onChange={(e) => handleChangeStoreAddress(e, true)}
                sx={{ flex: 1, mt: 0.5, mb: 0.5 }}
              />
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, mb: 2 }}>
              <TextField
                label="Phone Number"
                variant="outlined"
                name="phone_number"
                value={addressForm.phone_number}
                onChange={(e) => handleChangeStoreAddress(e, true)}
                sx={{ flex: 1, mt: 0.5, mb: 0.5 }}
              />
              <TextField
                label="Plot Number"
                variant="outlined"
                name="plot_number"
                value={addressForm.plot_number}
                onChange={handleChangeStoreAddress}
                sx={{ flex: 1, mt: 0.5, mb: 0.5 }}
              />
            </Box>
            {/* Row 4 */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, mb: 2 }}>
              <TextField
                label="Label"
                variant="outlined"
                fullWidth
                name="label"
                select
                value={addressForm.label}
                onChange={handleChangeStoreAddress}
                sx={{ flex: 1, mt: 0.5, mb: 0.5 }}
              >
                <MenuItem value="home">Home</MenuItem>
                <MenuItem value="office">Office</MenuItem>
              </TextField>
              <TextField
                label="Address"
                variant="outlined"
                name="address"
                value={addressForm.address}
                onChange={handleChangeStoreAddress}
                sx={{ flex: 1, mt: 0.5, mb: 0.5 }}
              />
              <TextField
                label="Landmark"
                variant="outlined"
                name="landmark"
                value={addressForm.landmark}
                onChange={handleChangeStoreAddress}
                sx={{ flex: 1, mt: 0.5, mb: 0.5 }}
              />
            </Box>

            {/* Row 5 */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, mb: 2 }}>
              <TextField
                label="Longitude"
                variant="outlined"
                name="longitude"
                value={addressForm.longitude}
                onChange={(e) => handleChangeStoreAddress(e, true)}
                sx={{ flex: 1, mt: 0.5, mb: 0.5 }}
              />
              <TextField
                label="Latitude"
                variant="outlined"
                name="latitude"
                value={addressForm.latitude}
                onChange={(e) => handleChangeStoreAddress(e, true)}
                sx={{ flex: 1, mt: 0.5, mb: 0.5 }}
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 2, mt: 2, mb: 4 }}>
              <Button variant="contained" type="submit" sx={{ flex: 1, mr: 1 }}>
                Save
              </Button>
              <Button
                variant="outlined"
                onClick={() => {
                  setEditingIndex(null);
                  setNewAddress(null);
                  reset();
                }}
                sx={{ flex: 1 }}
              >
                Cancel
              </Button>
            </Box>
          </Box>
        )}

        <Stack spacing={4} alignItems="flex-start" sx={{ typography: 'body2', mt: 2 }}>
          {addresses.map((address, index) => (
            <Box key={index} sx={{ width: '100%' }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                Address Details {index + 1}
              </Typography>
              {/* Address Details */}
              {[
                { label: 'Address', value: address?.address ?? 'N/A' },
                { label: 'Street', value: address?.street ?? 'N/A' },
                { label: 'Building Name', value: address?.building_name ?? 'N/A' },
                { label: 'City', value: address?.city ?? 'N/A' },
                { label: 'Country Code', value: address?.country_code ?? 'N/A' },
                { label: 'Label', value: address?.label ?? 'N/A' },
                { label: 'Phone Number', value: address?.phone_number ?? 'N/A' },
                { label: 'Plot Number', value: address?.plot_number ?? 'N/A' },
                { label: 'Country', value: address?.country ?? 'N/A' },
                { label: 'Landmark', value: address?.landmark ?? 'N/A' },
              ].map((item, idx) => (
                <Box key={idx} sx={{ display: 'flex', width: '100%' }}>
                  <Box component="span" sx={{ minWidth: '200px', fontWeight: 'bold' }}>
                    {item.label}
                  </Box>
                  <Box component="span" sx={{ minWidth: '100px', fontWeight: 'bold' }}>
                    :
                  </Box>
                  <Box component="span">{item.value}</Box>
                </Box>
              ))}

              {/* Edit and Delete Buttons */}
              <Box sx={{ display: 'flex', gap: 2, mt: 2, mb: 4 }}>
                <Button
                  variant="outlined"
                  onClick={() => setShowMapIndex(showMapIndex === index ? null : index)} // Toggle map visibility
                  // sx={{ mt: 1 }}
                >
                  {showMapIndex === index ? 'Hide Map' : 'Show Map'}
                </Button>
                <Button
                  variant="contained"
                  onClick={() => {
                    handleEditAddress(index, address);
                  }}
                >
                  Edit
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => handleDeleteUserAddress(address.id, reload)}
                >
                  Delete
                </Button>
              </Box>
              {showMapIndex === index && address.latitude && address.longitude && (
                <Box sx={{ pt: 2, pb: 2 }}>
                  {isLoaded ? (
                    <GoogleMap
                      onClick={(e) => handleLocationSelect(e.latLng.toJSON())}
                      mapContainerStyle={mapContainerStyle}
                      center={{
                        lat: parseFloat(address.latitude),
                        lng: parseFloat(address.longitude),
                      }}
                      zoom={12}
                    >
                      <Marker
                        position={{
                          lat: parseFloat(address.latitude),
                          lng: parseFloat(address.longitude),
                        }}
                      />
                    </GoogleMap>
                  ) : (
                    <div>Loading Map...</div>
                  )}
                </Box>
              )}
              {editingIndex === index && (
                <>
                  {/* Form Fields in Rows */}
                  {/* Row 1 */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, mb: 2 }}>
                    <TextField
                      label="Plot Number"
                      variant="outlined"
                      fullWidth
                      name="plot_number"
                      value={addressForm.plot_number}
                      onChange={handleChangeStoreAddress}
                      sx={{ flex: 1, mt: 0.5, mb: 0.5 }}
                    />
                    <TextField
                      label="Street Address"
                      variant="outlined"
                      fullWidth
                      name="street"
                      value={addressForm.street}
                      onChange={handleChangeStoreAddress}
                      sx={{ flex: 1, mt: 0.5, mb: 0.5 }}
                    />
                    <TextField
                      label="Building Name"
                      variant="outlined"
                      fullWidth
                      name="building_name"
                      value={addressForm.building_name}
                      onChange={handleChangeStoreAddress}
                      sx={{ flex: 1, mt: 0.5, mb: 0.5 }}
                    />
                  </Box>

                  {/* Row 2 */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, mb: 2 }}>
                    <TextField
                      label="Phone Number"
                      variant="outlined"
                      fullWidth
                      name="phone_number"
                      value={addressForm.phone_number}
                      onChange={handleChangeStoreAddress}
                      sx={{ flex: 1, mt: 0.5, mb: 0.5 }}
                    />
                    <TextField
                      label="City"
                      variant="outlined"
                      fullWidth
                      name="city"
                      value={addressForm.city}
                      onChange={handleChangeStoreAddress}
                      sx={{ flex: 1, mt: 0.5, mb: 0.5 }}
                    />
                    <TextField
                      label="Country Code"
                      variant="outlined"
                      fullWidth
                      name="country_code"
                      value={addressForm.country_code}
                      onChange={handleChangeStoreAddress}
                      sx={{ flex: 1, mt: 0.5, mb: 0.5 }}
                    />
                  </Box>

                  {/* Row 3 */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, mb: 2 }}>
                    <TextField
                      label="Label"
                      variant="outlined"
                      fullWidth
                      name="label"
                      select
                      value={addressForm.label}
                      onChange={handleChangeStoreAddress}
                      sx={{ flex: 1, mt: 0.5, mb: 0.5 }}
                    >
                      <MenuItem value="home">Home</MenuItem>
                      <MenuItem value="office">Office</MenuItem>
                    </TextField>
                    <TextField
                      label="Address"
                      variant="outlined"
                      fullWidth
                      name="address"
                      value={addressForm.address}
                      onChange={handleChangeStoreAddress}
                      sx={{ flex: 1, mt: 0.5, mb: 0.5 }}
                    />
                    <TextField
                      label="Landmark"
                      variant="outlined"
                      fullWidth
                      name="landmark"
                      value={addressForm.landmark}
                      onChange={handleChangeStoreAddress}
                      sx={{ flex: 1, mt: 0.5, mb: 0.5 }}
                    />
                  </Box>

                  {/* Row 4 */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, mb: 2 }}>
                    <TextField
                      label="Longitude"
                      variant="outlined"
                      fullWidth
                      name="longitude"
                      value={addressForm.longitude}
                      onChange={handleChangeStoreAddress}
                      sx={{ flex: 1, mt: 0.5, mb: 0.5 }}
                    />
                    <TextField
                      label="Latitude"
                      variant="outlined"
                      fullWidth
                      name="latitude"
                      value={addressForm.latitude}
                      onChange={handleChangeStoreAddress}
                      sx={{ flex: 1, mt: 0.5, mb: 0.5 }}
                    />
                  </Box>

                  {/* Submit and Cancel Buttons */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                    <Button
                      variant="contained"
                      onClick={() =>
                        handleUpdateExistingUserAddress(addressForm, address.id, address.user_id)
                      }
                      sx={{ flex: 1, mr: 1 }}
                    >
                      Submit
                    </Button>
                    <Button
                      variant="contained"
                      onClick={() => setEditingIndex('')}
                      sx={{ flex: 1 }}
                    >
                      Cancel
                    </Button>
                  </Box>
                </>
              )}
            </Box>
          ))}
        </Stack>
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
        <>
          {details?.user_type === "TRAINER" && renderTabs}
          <Grid container spacing={1} rowGap={1}>
            <Grid xs={12} md={12}>
              {/* For all other user types */}
              {details?.user_type !== "TRAINER" && renderContent}

              {/* For trainer user type with 3 tabs */}
              {currentTab === 'details' && details?.user_type === "TRAINER" && renderContent}
              {currentTab === 'packages' && details?.user_type === "TRAINER" &&
                <TrainerDetailsContent id={details?.id} />}
              {/* {currentTab === 'students' && details?.user_type === "TRAINER" && renderContent} */}



              {/* For trainer user type with 3 tabs */}
            </Grid>


            {/* <Grid xs={12} md={4}>
            {renderCompany}
          </Grid> */}
          </Grid>
        </>
      )}
    </>
  );
}
