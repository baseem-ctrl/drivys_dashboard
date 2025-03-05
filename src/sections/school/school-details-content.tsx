// @mui
import Chip from '@mui/material/Chip';
import Card from '@mui/material/Card';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
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
import {
  Box,
  Button,
  CircularProgress,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Select,
  Switch,
  TextField,
  Tooltip,
} from '@mui/material';
import { useGetAllCities, useGetAllCity, useGetCityById } from 'src/api/city';
import { useGetStateList } from 'src/api/state';
import { GoogleMap, useJsApiLoader, Marker, LoadScript } from '@react-google-maps/api';
import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import {
  createSchool,
  createUpdateSchoolAddress,
  useGetAllSchoolAdmin,
  useGetSchoolAdmin,
} from 'src/api/school';
import { enqueueSnackbar, useSnackbar } from 'src/components/snackbar';
import marker from 'react-map-gl/dist/esm/components/marker';
import Scrollbar from 'src/components/scrollbar';
import { useBoolean } from 'src/hooks/use-boolean';
import SchoolCreateForm from './view/school-create-form';
import { useGetAllLanguage } from 'src/api/language';
import { RHFTextField } from 'src/components/hook-form';
import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
import { InfoOutlined } from '@mui/icons-material';
import { useGoogleMaps } from '../overview/e-commerce/GoogleMapsProvider';

// ----------------------------------------------------------------------

type Props = {
  details: any;
  loading?: any;
  t: any;
  reload: VoidFunction;
};
export default function SchoolDetailsContent({ details, loading, reload, t }: Props) {
  const [selectedLanguage, setSelectedLanguage] = useState(
    details?.vendor_translations ? details?.vendor_translations[0]?.locale : ''
  );
  const [editMode, setEditMode] = useState(false);
  const [showAllAddresses, setShowAllAddresses] = useState(false);
  const maxVisibleAddresses = 2;
  const [selectedState, setSelectedState] = useState('');
  const { language, languageLoading, totalpages, revalidateLanguage, languageError } =
    useGetAllLanguage(0, 1000);
  const { schoolAdminLoading } = useGetSchoolAdmin(1000, 1, '');
  const { schoolAdminList } = useGetAllSchoolAdmin(1000, 1);

  const currentVendorName = details?.user?.name;

  const schoolAdmins = {
    currentAdmin: currentVendorName,
    admins: [
      {
        id: details?.vendor_user?.user?.id,
        name: details?.vendor_user?.user?.name,
        email: details?.vendor_user?.user?.email,
        user_type: 'SCHOOL_ADMIN',
      },
      ...schoolAdminList,
    ],
  };
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

      setLocaleOptions([...initialLocaleOptions]);
    }
  }, [language, details]);

  // Find the selectedLocaleObject whenever selectedLanguage or details change
  const selectedLocaleObject = details?.vendor_translations?.find(
    (item: { locale: string }) => item.locale === selectedLanguage
  );

  const VendorSchema = Yup.object().shape({
    locale: Yup.mixed(),
    name: Yup.string().required(t('validation.name_required')),
    about: Yup.string(),

    contact_email: Yup.string().test(
      'valid-email-format',
      t('validation.invalid_email'),
      function (value) {
        // Only check format if value is present
        if (value) {
          const emailRegex = /^[^@]+@[^@]+\.[^@]+$/;
          return emailRegex.test(value);
        }
        return true; // Skip format check if value is empty
      }
    ),
    phone_number: Yup.string()
      .nullable() // Allow null values
      .test('valid-phone', t('validation.phone_number_limit'), function (value) {
        // Apply regex validation only if phone_number has a value
        if (value) {
          return /^\d{1,15}$/.test(value);
        }
        return true; // No validation if the phone number is empty or null
      }),
    license_expiry: Yup.string(),
    website: Yup.string().url(t('validation.invalid_url')),
    status: Yup.string(),
    license_file: Yup.mixed().nullable(),
    is_active: Yup.boolean(),
    user_id: Yup.string(),
  });
  const defaultVendorValues = useMemo(
    () => ({
      locale: selectedLocaleObject?.locale || 'En',
      name: selectedLocaleObject?.name || '',
      contact_email: details?.email || '',
      phone_number: details?.phone_number || '',
      certificate_commission_in_percentage: details?.certificate_commission_in_percentage || '0',
      min_commision: details?.min_commision || '0',
      max_commision: details?.max_commision || '0',
      license_expiry: details?.license_expiry || '',
      license_file: null,
      website: details?.website || '',
      status: details?.status || '',
      is_active: true,
      user_id: details?.vendor_user?.user_id || '',
    }),
    [selectedLocaleObject, details, editMode]
  );
  const Schoolethods = useForm({
    resolver: yupResolver(VendorSchema) as any,
    defaultVendorValues,
  });
  const [selectedCity, setSelectedCity] = useState(''); // Initial state from defaultValues

  const {
    reset: schoolReset,
    watch: schoolWatch,
    control: schoolControl,
    setValue: schoolSetValue,
    handleSubmit: schoolSubmit,
    formState: schoolFormState,
  } = Schoolethods;
  const { isSubmitting, errors } = schoolFormState;
  const { city, isLoading: cityLoading } = useGetAllCity({
    limit: 1000,
    page: 0,
  });

  const { states, isLoading: stateLoading } = useGetStateList({
    city_id: selectedCity,
    limit: 1000,
    page: 0,
  });
  const { states: stateList } = useGetStateList({
    limit: 1000,
    page: 0,
  });

  const cityOptions =
    city?.map((cityItem) => ({
      value: cityItem.id,
      label: cityItem.city_translations?.[0]?.name || t('unnamed_city'),
    })) || [];
  const stateOptions =
    states?.map((stateItem) => ({
      value: stateItem.id,
      label: stateItem.translations?.[0]?.name || t('unknown_state'),
      cityName: stateItem.city?.city_translations?.[0]?.name || t('unknown_city'),
    })) || [];

  const [uploadedFileUrl, setUploadedFileUrl] = useState('');
  useEffect(() => {
    if (details?.license_file) {
      setUploadedFileUrl(details.license_file); // Set the initial file URL from the response
    }
  }, [details]);
  const handleChange = (event: { target: { value: any } }) => {
    setSelectedLanguage(event.target.value);
    const selectedLocaleObject = details?.vendor_translations.find(
      (item: { locale: string }) => item.locale === event.target.value
    );

    // Update the form values to reflect the selected locale
    if (selectedLocaleObject) {
      schoolSetValue('name', selectedLocaleObject.name); // Update name to match the locale
    } else {
      schoolSetValue('name', '');
    }
  };

  useEffect(() => {
    if (details) {
      const defaultVendorValues = {
        locale: selectedLocaleObject?.locale || '',
        about: selectedLocaleObject?.about || '',

        name: selectedLocaleObject?.name || '',
        contact_email: details?.email || '',
        phone_number: details?.phone_number || '',
        certificate_commission_in_percentage: details?.certificate_commission_in_percentage || '0',
        min_commision: details?.min_commision || '0',
        max_commision: details?.max_commision || '0',
        license_expiry: details?.license_expiry || '',
        license_file: null,
        website: details?.website || '',
        status: details?.status || '',
        is_active: !!details?.is_active,
        user_id: details?.vendor_user?.user_id || '',
      };
      schoolReset(defaultVendorValues);
    }
  }, [details, schoolReset, selectedLocaleObject]);

  const onSubmitBasicInfo = schoolSubmit(async (data) => {
    try {
      let payload = {
        vendor_translations: [
          {
            name: data?.name || selectedLocaleObject?.name,
            locale: selectedLanguage || selectedLocaleObject?.locale,
            about: data?.about || selectedLocaleObject?.about,
          },
        ],
        contact_email: data?.contact_email,
        contact_phone_number: data?.phone_number,
        status: data?.status,
        is_active: data?.is_active ? '1' : '0',
        certificate_commission_in_percentage: data?.certificate_commission_in_percentage || 0,
        min_commision: data?.min_commision || 0,
        max_commision: data?.max_commision || 0,
        create_new_user: 0,
        license_expiry: data?.license_expiry,
        license_file: data?.license_file,
        user_id: data?.user_id,
        vendor_id: details?.id,
        website: data?.website,
      };
      let formData = new FormData();

      // Append fields to FormData
      formData.append('contact_email', payload.contact_email || '');
      formData.append('contact_phone_number', payload.contact_phone_number || '');
      formData.append('status', payload.status || '');
      formData.append('is_active', payload.is_active);
      formData.append(
        'certificate_commission_in_percentage',
        payload.certificate_commission_in_percentage || '0'
      );
      formData.append('min_commision', payload.min_commision || '0');
      formData.append('max_commision', payload.max_commision || '0');
      formData.append('create_new_user', payload.create_new_user.toString());
      formData.append('license_expiry', payload.license_expiry || '');
      formData.append('user_id', payload.user_id || '');
      formData.append('vendor_id', payload.vendor_id || '');
      formData.append('website', payload.website || '');

      // Handle `vendor_translations` (assumes only one translation)
      if (payload.vendor_translations && payload.vendor_translations.length > 0) {
        formData.append('vendor_translations[0][name]', payload.vendor_translations[0].name || '');
        formData.append(
          'vendor_translations[0][about]',
          payload.vendor_translations[0].about || ''
        );

        formData.append(
          'vendor_translations[0][locale]',
          payload.vendor_translations[0].locale || ''
        );
      }

      // Append file field if it exists and is a File object
      if (payload.license_file) {
        formData.append('license_file', payload.license_file); // Assumes `license_file` is a File object
      }

      const response = await createSchool(formData);
      if (response) {
        enqueueSnackbar(response.message, {
          variant: 'success',
        });
        setEditMode(false);
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
      reload();
    }
  });

  const handleCancel = () => {
    schoolReset(); // Reset to the original values
    setEditMode(false);
  };

  const renderContent = (
    <Stack spacing={3} sx={{ p: 3 }}>
      {!editMode && (
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
          <Iconify
            icon="solar:pen-bold"
            onClick={() => setEditMode(true)}
            sx={{ cursor: 'pointer' }}
          />
        </Stack>
      )}
      <Scrollbar>
        {!editMode ? (
          <Stack spacing={1} alignItems="flex-start" sx={{ typography: 'body2' }}>
            {[
              ...(details?.vendor_translations?.flatMap((itm: any) => [
                {
                  label: t(`name_locale`, { locale: itm?.locale ?? t('unknown') }),
                  value: itm?.name?.trim() || t('n/a'),
                },
                {
                  label: t(`about_locale`, { locale: itm?.locale ?? t('unknown') }),
                  value: itm?.about?.trim() || t('n/a'),
                },
              ]) ?? []),

              // { label: 'Name', value: items?.name ?? 'N/A' },
              { label: t('email'), value: details?.email ?? t('n/a') },
              { label: t('phone_number'), value: details?.phone_number ?? t('n/a') },

              {
                label: t('certificate_commission_percentage'),
                value: `${details?.certificate_commission_in_percentage ?? t('n/a')}%`,
              },
              {
                label: t('license_expiry'),
                value: details?.license_expiry ?? t('n/a'),
              },

              {
                label: t('min_school_commission'),
                value: `${details?.min_commision ?? t('na')}%`,
              },
              {
                label: t('max_school_commission'),
                value: `${details?.max_commision ?? t('na')}%`,
              },

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

              {
                label: t('status'),
                value: details?.status ?? t('n/a'),
              },
              {
                label: t('is_active'),
                value:
                  details?.is_active === 1 || details?.is_active === true ? (
                    <Iconify color="green" icon="bi:check-square-fill" />
                  ) : (
                    <Iconify color="red" icon="bi:x-square-fill" />
                  ),
              },
            ].map((item, index) => (
              <Box key={index} sx={{ display: 'flex', width: '100%' }}>
                <Box component="span" sx={{ minWidth: '250px', fontWeight: 'bold' }}>
                  {item.label}
                </Box>
                <Box component="span" sx={{ minWidth: '100px', fontWeight: 'bold' }}>
                  :
                </Box>
                <Box component="span" sx={{ flex: 1 }}>
                  {item.value ?? 'n/a'}
                </Box>
                {/* <Box component="span">{loading ? 'Loading...' : item.value}</Box> */}
              </Box>
            ))}
          </Stack>
        ) : (
          <Box
            component="form"
            rowGap={2}
            columnGap={2}
            display="grid"
            onSubmit={onSubmitBasicInfo}
            pb={1}
          >
            <Box
              mt={2}
              rowGap={3}
              columnGap={2}
              display="grid"
              gridTemplateColumns="repeat(1, 1fr)"
              // sx={{ mb: 2, p: 2, border: '1px solid #ddd' }}
            >
              <Box
                display="grid"
                gap={1}
                gridTemplateColumns={{
                  xs: 'repeat(1, 1fr)',
                  sm: '25% 70% ',
                  // md: 'repeat(2, 1fr)',
                }}
              >
                <Controller
                  name="locale"
                  control={schoolControl}
                  render={({ field }) => (
                    <Select {...field} value={selectedLanguage || ''} onChange={handleChange}>
                      {localeOptions?.map((option: any) => (
                        <MenuItem key={option?.value} value={option?.value}>
                          {option?.label}
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                />
                <Controller
                  name="name"
                  control={schoolControl}
                  render={({ field }) => (
                    <TextField
                      label={t('name')}
                      {...field}
                      error={errors?.name?.message}
                      helperText={errors?.name ? errors?.name?.message : ''}
                    />
                  )}
                />
              </Box>
            </Box>

            <Box
              mt={2}
              rowGap={3}
              columnGap={2}
              display="grid"
              gridTemplateColumns="repeat(1, 1fr)"
              // sx={{ mb: 2, p: 2, border: '1px solid #ddd' }}
            >
              <Box
                display="grid"
                gap={1}
                gridTemplateColumns={{
                  // xs: 'repeat(1, 1fr)',
                  sm: '48% 47% ',
                  // md: 'repeat(2, 1fr)',
                }}
                pt={1}
              >
                <Controller
                  name="contact_email"
                  control={schoolControl}
                  render={({ field }) => (
                    <TextField label={t('email')} {...field} error={!!errors.contact_email} />
                  )}
                />{' '}
                <Controller
                  name="phone_number"
                  control={schoolControl}
                  render={({ field }) => (
                    <TextField
                      label={t('phone_number')}
                      type="number"
                      {...field}
                      error={!!errors.phone_number?.message}
                      helperText={errors?.phone_number ? errors?.phone_number?.message : ''}
                    />
                  )}
                />
                <Controller
                  name="certificate_commission_in_percentage"
                  control={schoolControl}
                  render={({ field }) => (
                    <TextField
                      label={t('certificate_commission')}
                      {...field}
                      error={!!errors.certificate_commission_in_percentage}
                      type="number"
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <Tooltip
                              title={t('commission_for_drivers_from_certificate')}
                              placement="top"
                            >
                              <InfoOutlined sx={{ color: 'gray', cursor: 'pointer' }} />
                            </Tooltip>
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
                <Controller
                  name="license_expiry"
                  control={schoolControl}
                  render={({ field }) => (
                    <TextField
                      label={t('license_expiry')}
                      {...field}
                      error={!!errors.license_expiry}
                      type="date"
                      InputLabelProps={{ shrink: true }}
                    />
                  )}
                />
                <Controller
                  name="min_commision"
                  control={schoolControl}
                  render={({ field }) => (
                    <TextField
                      label={t('min_vendor_commission')}
                      {...field}
                      InputLabelProps={{ shrink: true }}
                      error={!!errors.min_commision}
                      type="number"
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <Tooltip title={t('min_vendor_commission_tooltip')} placement="top">
                              <InfoOutlined sx={{ color: 'gray', cursor: 'pointer' }} />
                            </Tooltip>
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
                <Controller
                  name="max_commision"
                  control={schoolControl}
                  render={({ field }) => (
                    <TextField
                      label={t('max_vendor_commission')}
                      {...field}
                      error={!!errors.max_commision}
                      type="number"
                      InputLabelProps={{ shrink: true }}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <Tooltip title={t('max_vendor_commission_tooltip')} placement="top">
                              <InfoOutlined sx={{ color: 'gray', cursor: 'pointer' }} />
                            </Tooltip>
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
                <Controller
                  name="license_file"
                  control={schoolControl}
                  defaultValue={null}
                  render={({ field }) => (
                    <>
                      <TextField
                        label={t('license_file')}
                        error={!!errors.license_file}
                        type="file"
                        InputLabelProps={{ shrink: true }}
                        inputRef={field.ref} // Use React Hook Form's ref to handle file input correctly
                        inputProps={{
                          accept: '.pdf,.doc,.jpg,.png', // Optional: specify allowed file types
                        }}
                        onChange={(e) => {
                          // Update the field value when a file is selected
                          field.onChange(e.target.files[0]);
                        }}
                      />
                      {uploadedFileUrl && (
                        <Box>
                          <TextField
                            label={t('uploaded_file_url')}
                            value={uploadedFileUrl}
                            InputProps={{
                              readOnly: true,
                            }}
                            disabled
                            fullWidth
                          />
                        </Box>
                      )}
                    </>
                  )}
                />
                <Controller
                  name="website"
                  control={schoolControl}
                  render={({ field }) => (
                    <TextField label={t('website')} {...field} error={!!errors.website} />
                  )}
                />
                <Controller
                  name="status"
                  control={schoolControl}
                  render={({ field, fieldState: { error } }) => (
                    <TextField {...field} select SelectProps={{ native: true }} error={!!error}>
                      <option value="">{t('select_status')}</option>
                      <option value="active">{t('active')}</option>
                      <option value="suspended">{t('suspended')}</option>
                      <option value="pending_for_verification">
                        {t('pending_for_verification')}
                      </option>
                      <option value="expired">{t('expired')}</option>
                      <option value="cancelled">{t('cancelled')}</option>
                    </TextField>
                  )}
                />
                {/*  */}
                {/* <Grid item xs={6} mt={2} mb={2}> */}
                {/* <Typography variant="body1" sx={{ fontWeight: '600' }}>
                  Choose a School Admin: Create New or Select Existing
                </Typography>
                <Controller
                  name="create_new_user"
                  control={schoolControl}
                  render={({ field }) => (
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="body1">Create New School Admin</Typography>
                      <Switch {...field} error={!!errors.create_new_user} checked={field.value} />
                    </Box>
                  )}
                /> */}
                {/* </Grid> */}
                {/* {!values?.create_new_user ? ( */}
                <Controller
                  className="editor"
                  control={schoolControl}
                  name="user_id"
                  render={({ field }) => {
                    const selectedValue = schoolAdmins.admins.some(
                      (admin) => admin.id === field.value
                    )
                      ? field.value
                      : '';

                    return (
                      <Select {...field} value={selectedValue} displayEmpty>
                        <MenuItem value="" disabled>
                          {t('select_school_owner')}
                        </MenuItem>

                        {schoolAdmins.admins.length === 0 ? (
                          <MenuItem disabled>{t('no_users_available')}</MenuItem>
                        ) : (
                          schoolAdmins.admins.map((option: any) => (
                            <MenuItem
                              key={option.id}
                              value={option.id}
                              disabled={
                                details?.vendor_user?.user?.id === option.id // Ensure safe access
                              }
                            >
                              {option.name}
                            </MenuItem>
                          ))
                        )}
                      </Select>
                    );
                  }}
                />
                <Controller
                  name="is_active"
                  control={schoolControl}
                  render={({ field }) => (
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="body1">{t('is_active')}</Typography>
                      <Switch {...field} error={!!errors.is_active} checked={field.value} />
                    </Box>
                  )}
                />
              </Box>
              <Controller
                name="about"
                control={schoolControl}
                render={({ field }) => (
                  <TextField
                    label={t('about')}
                    multiline
                    rows={3}
                    {...field}
                    error={!!errors?.about}
                    helperText={errors?.about ? errors?.about?.message : ''}
                  />
                )}
              />
            </Box>
            <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 3 }}>
              <Button variant="outlined" color="error" onClick={handleCancel}>
                {t('cancel')}
              </Button>
              <Button type="submit" variant="contained">
                {t('save')}
              </Button>
            </Stack>
          </Box>
        )}
      </Scrollbar>
    </Stack>
  );

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
      city:
        editingIndex !== null
          ? details?.vendor_addresses[editingIndex]?.city?.city_translations[0]?.id || ''
          : '',
      country: editingIndex !== null ? details?.vendor_addresses[editingIndex]?.country : '',
      state:
        editingIndex !== null
          ? details?.vendor_addresses[editingIndex]?.state?.translations[0]?.id
          : '',
      latitude: editingIndex !== null ? details?.vendor_addresses[editingIndex]?.latitude : '',
      longitude: editingIndex !== null ? details?.vendor_addresses[editingIndex]?.longitude : '',
    }),
    [details?.vendor_addresses, editingIndex]
  );
  // useEffect(() => {
  //   if (editingIndex !== null && details?.vendor_addresses) {
  //     const address = details.vendor_addresses[editingIndex];
  //     setSelectedCity(address.city);
  //     setSelectedState(address.state?.translations[0]?.id || '');
  //   }
  // }, [editingIndex, details?.vendor_addresses]);

  const methods = useForm({
    resolver: yupResolver(NewUserSchema) as any,
    defaultValues,
  });
  // const { control, handleSubmit, setValue, reset } = useForm();
  useEffect(() => {
    if (defaultValues.city) {
      setSelectedCity(defaultValues.city);
    }
  }, [defaultValues]);
  const {
    reset,
    watch,
    control,
    setValue,
    handleSubmit,
    // formState: { isSubmitting },
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
    try {
      let payload = {
        street_address: data?.street_address,
        city: selectedCity.toString(),
        state: selectedState.toString(),
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

                const translatedCityName =
                  city?.find((cityItem) => {
                    const cityId = cityItem?.city_translations?.[0]?.city_id?.toString();
                    const detailsCity = details?.city?.id.toString();
                    return cityId === detailsCity;
                  })?.city_translations?.[0]?.name || t('n/a');

                const translatedStateName =
                  stateList?.find((stateItem) => {
                    const stateProvinceId =
                      stateItem?.translations?.[0]?.state_province_id?.toString();
                    const detailsState = details?.state?.id.toString();
                    return stateProvinceId === detailsState;
                  })?.translations?.[0]?.name || t('n/a');

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
                          { label: t('city'), value: translatedCityName },
                          { label: t('area'), value: translatedStateName ?? t('n/a') },
                          { label: t('country'), value: details?.country ?? t('n/a') },
                        ].map((item, idx) => (
                          <Box key={idx} sx={{ display: 'flex', mb: 1 }}>
                            <Box sx={{ minWidth: '150px', fontWeight: 'bold' }}>{item.label}</Box>
                            <Box>{item.value}</Box>
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
              {newAddress ? t('add_new_address') : t('edit_address', { index: editingIndex + 1 })}
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                {[
                  { label: t('street_address'), name: 'street_address' },
                  { label: t('city'), name: 'city', isDropdown: true, options: cityOptions },
                  { label: t('area'), name: 'state', isDropdown: true, options: stateOptions },
                  { label: t('country'), name: 'country' },
                  { label: t('latitude'), name: 'latitude' },
                  { label: t('longitude'), name: 'longitude' },
                ].map((item, idx) => (
                  <Controller
                    key={idx}
                    name={item.name}
                    control={control}
                    render={({ field }) =>
                      item.isDropdown ? (
                        <TextField
                          {...field}
                          select
                          label={item.label}
                          variant="outlined"
                          sx={{ my: 1, width: '100%' }}
                          onChange={(e) => {
                            field.onChange(e);
                            if (item.name === 'city') {
                              setSelectedCity(e.target.value);
                            } else if (item.name === 'state') {
                              setSelectedState(e.target.value);
                            }
                          }}
                          value={item.name === 'city' ? selectedCity : selectedState}
                        >
                          {item.name === 'city' && cityLoading ? (
                            <MenuItem value="" disabled>
                              <Box display="flex" alignItems="center" gap={1}>
                                <CircularProgress size={20} />
                                {t('loading_cities')}
                              </Box>
                            </MenuItem>
                          ) : item.name === 'state' && stateLoading ? (
                            <MenuItem value="">
                              <CircularProgress size={24} />
                              {t('loading_areas')}
                            </MenuItem>
                          ) : (
                            (item.name === 'city' ? cityOptions : stateOptions).map(
                              (option, idx) => (
                                <MenuItem key={idx} value={option.value}>
                                  {option.label}
                                </MenuItem>
                              )
                            )
                          )}
                        </TextField>
                      ) : (
                        <TextField
                          {...field}
                          label={item.label}
                          variant="outlined"
                          sx={{ my: 1, width: '100%' }}
                        />
                      )
                    }
                  />
                ))}
                <Box sx={{ mt: 2 }}>
                  <Button variant="contained" type="submit" sx={{ mr: 1 }}>
                    {t('save')}
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      reset(defaultValues);
                      setSelectedCity('');
                      setEditingIndex(null);
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
              {showAllAddresses ? t('show_less') : t('show_more')}
            </Button>
          </Box>
        )}
      </Scrollbar>
    </Stack>
  );

  const router = useRouter();
  const renderCompany = (
    <Stack
      component={Paper}
      variant="outlined"
      spacing={2}
      sx={{
        p: 3,
        borderRadius: 2,
        cursor: 'pointer',
        display: 'flex',
        width: '100%',
        position: 'relative',
      }}
      height={350}
      onClick={() =>
        details?.vendor_user?.user?.id
          ? router.push(paths.dashboard.user.details(details?.vendor_user?.user?.id))
          : ''
      }
    >
      <Box
        sx={{
          position: 'absolute',
          top: 16, // Adjust spacing from top
          right: 16, // Adjust spacing from right
          width: 12, // Small round indicator
          height: 12,
          borderRadius: '50%',
          backgroundColor: details?.vendor_user?.user?.is_active ? '#22C55E' : '#B71D18',
          border: '1px solid #fff', // Optional: Add a border for better visibility
          boxShadow: '0 0 2px rgba(0, 0, 0, 0.2)', // Optional: Add a shadow for better emphasis
        }}
      />

      <Avatar
        alt={details?.vendor_user?.user?.name}
        src={details?.vendor_user?.name?.user?.photo_url}
        variant="rounded"
        sx={{ width: 64, height: 64, alignSelf: 'center', marginBottom: 3 }}
      />

      <Stack spacing={1}>
        {details?.vendor_user?.user?.name && (
          <Typography variant="subtitle1">
            {details?.vendor_user?.user?.name ?? t('name_not_available')}
          </Typography>
        )}
        {details?.vendor_user?.user?.email && (
          <Typography variant="body2">
            {details?.vendor_user?.user?.email ?? t('email_not_available')}
          </Typography>
        )}
        {details?.vendor_user?.user?.phone && (
          <Typography variant="body2">
            {details?.vendor_user?.user?.country_code
              ? `${details?.vendor_user?.user?.country_code}-${details?.vendor_user?.user?.phone}`
              : details?.vendor_user?.user?.phone || t('phone_not_available')}
          </Typography>
        )}
        {details?.vendor_user?.user?.user_type && (
          <Typography variant="body2">
            {details?.vendor_user?.user?.user_type ?? t('n/a')}
          </Typography>
        )}
        {details?.vendor_user?.user?.dob && (
          <Typography variant="body2">
            {details?.vendor_user?.user?.dob?.split('T')[0] ?? t('n/a')}
          </Typography>
        )}
        {details?.vendor_user?.user?.wallet_balance !== 0 && (
          <Typography variant="body2">
            {t('wallet_balance')}: {details?.vendor_user?.user?.dob ?? t('n/a')}
          </Typography>
        )}
        {details?.vendor_user?.user?.wallet_points !== 0 && (
          <Typography variant="body2">{details?.vendor_user?.user?.dob ?? t('n/a')}</Typography>
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
        <Grid container spacing={1} rowGap={1}>
          <Grid item xs={12} md={8}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              {renderContent}
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              {renderCompany}
            </Card>
          </Grid>

          <Grid item xs={12}>
            {renderAddress}
          </Grid>
        </Grid>
      )}
    </>
  );
}
