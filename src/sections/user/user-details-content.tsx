// @mui
import Chip from '@mui/material/Chip';
import Card from '@mui/material/Card';
import { differenceInDays, parseISO } from 'date-fns';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

// import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

// import ListItemText from '@mui/material/ListItemText';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  InputAdornment,
  Tooltip,
  Popover,
} from '@mui/material';
// utils
// import { fDate } from 'src/utils/format-time';
// import { fCurrency } from 'src/utils/format-number';
// types
// import { IJobItem } from 'src/types/job';
// components
import Iconify from 'src/components/iconify';
// import Markdown from 'src/components/markdown';
import {
  Box,
  Button,
  CardContent,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  MenuItem,
  Select,
  Switch,
  TextField,
} from '@mui/material';
import { GoogleMap, useJsApiLoader, Marker, LoadScript } from '@react-google-maps/api';
import { useLocales } from 'src/locales';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import * as Yup from 'yup';
import {
  createSchool,
  createUpdateSchoolAddress,
  useGetBookingByStudentId,
  useGetSchoolAdmin,
} from 'src/api/school';
import {
  createNewAddressForUser,
  deleteUserAddress,
  updateExistingUserAddress,
  updateUser,
} from 'src/api/users';
import { enqueueSnackbar, useSnackbar } from 'src/components/snackbar';
import marker from 'react-map-gl/dist/esm/components/marker';
import Scrollbar from 'src/components/scrollbar';
// import { useBoolean } from 'src/hooks/use-boolean';
import { useGetAllLanguage } from 'src/api/language';
// import { RHFTextField } from 'src/components/hook-form';
import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
import { TRAINER_DETAILS_TABS } from 'src/_mock/_trainer';
import TrainerDetailsContent from './trainer-details-content';
import StudentDetailsContent from './student-details-content';
import UserDocumentDetails from './user-document/user-document-details';
import { useGetUserDocumentList } from 'src/api/user-document';
import TrainerWorkingHour from './trainer-working-hour';
import { STUDENT_DETAILS_TABS } from 'src/_mock/student';
import { useGetBookingByTrainerId } from 'src/api/booking';
import BookingTrainerTable from './booking-details/trainer-booking-details';
import BookingStudentTable from './booking-details/student-booking-details';
import { Link } from '@mui/material';
import moment from 'moment';
import { useGetAllCity } from 'src/api/city';
import { useGetStateList } from 'src/api/state';
import { useGoogleMaps } from '../overview/e-commerce/GoogleMapsProvider';
import { useGetStudentReview, useGetTrainerReview } from 'src/api/review';
import TrainerSessionsTable from './student-review-table';
import TrainerReviewsTable from './trainer-review-table';
import StudentReviewRow from '../student-review/review-table-row';
import StudentReviewsTable from './student-review-table';
import { DatePicker } from '@mui/x-date-pickers';
// ----------------------------------------------------------------------

type Props = {
  addresses: any;
  addressesLoading: any;
  details: any;
  loading?: any;
  user: any;
  reload?: VoidFunction;
};

export default function UserDetailsContent({
  addresses,
  addressesLoading,
  details,
  loading,
  reload,
  user,
}: Props) {
  const { reset, control } = useForm();
  const { t, currentLang } = useLocales();
  const matchedLocale = details?.vendor_translations?.find(
    (t) => t?.locale?.toLowerCase() === currentLang.toLowerCase()
  )?.locale;
  const [selectedLanguage, setSelectedLanguage] = useState(
    details?.vendor_translations
      ?.find((t) => t?.locale?.toLowerCase() === currentLang.toLowerCase())
      ?.locale?.toLowerCase() ??
      details?.vendor_translations?.[0]?.locale?.toLowerCase() ??
      ''
  );

  const [load, setLoad] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [newAddress, setNewAddress] = useState(null); // state to store new stundet address
  const [editingIndex, setEditingIndex] = useState<number | null>(null); // state to track the editing index of student address
  const [currentTab, setCurrentTab] = useState('details');
  const [studentTab, setStudentTab] = useState('details');
  const [showAll, setShowAll] = useState(false);
  const { trainerReviews, trainerReviewsLoading, revalidateTrainerReviews } = useGetTrainerReview({
    trainer_id: details?.user_type === 'TRAINER' ? details?.id : undefined,
    student_id: details?.user_type === 'STUDENT' ? details?.id : undefined,
  });

  const { studentReviews, studentReviewsLoading, revalidateStudentReviews } = useGetStudentReview({
    trainer_id: details?.user_type === 'TRAINER' ? details?.id : undefined,
    student_id: details?.user_type === 'STUDENT' ? details?.id : undefined,
  });
  const toggleShowAll = () => setShowAll((prev) => !prev);
  const displayedAddresses = showAll ? addresses : addresses.slice(0, 2);
  const currentTrainer = details;
  const { language, languageLoading, totalpages, revalidateLanguage, languageError } =
    useGetAllLanguage(0, 1000);
  const { schoolAdminList, schoolAdminLoading } = useGetSchoolAdmin(1000, 1, '');
  const { city, cityLoading, cityError } = useGetAllCity({
    limit: 100,
  });

  const {
    userDocuments,
    userDocumentLoading,
    userDocumentError,
    totalPages,
    revalidateUserDocuments,
  } = useGetUserDocumentList({ userId: details.id });
  const [markerPosition, setMarkerPosition] = useState({
    lat: parseFloat(addresses?.latitude) || 24.4539,
    lng: parseFloat(addresses?.longitude) || 54.3773,
  });
  const [anchorEl, setAnchorEl] = useState(null);
  const [expiryDate, setExpiryDate] = useState(null);
  const handleVerifyClick = (event) => {
    if (details?.certificate_expiry_date) {
      handleVerify();
    } else {
      setAnchorEl(event.currentTarget);
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'expiry-popover' : undefined;
  // Function to handle map click and update lat/lng values
  const [addressForm, setAddressForm] = useState({
    // State for form fields
    id: '', //
    plot_number: '', //
    building_name: '', //
    street: '', //
    city_id: '', //
    label: '', //
    address: '', //
    landmark: '', //
    country_code: '971', //
    phone_number: '', //
    longitude: '', //
    latitude: '', //
    state_province_id: '',
  });
  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    // setAddressForm({ longitude: lng, latitude: lat });
    setMarkerPosition({ lat, lng });
    setAddressForm((prev) => ({
      ...prev,
      latitude: lat.toString(),
      longitude: lng.toString(),
    }));
    // setValue('latitude', lat.toString());
    // setValue('longitude', lng.toString());
  };
  const defaultValues = useMemo(
    () => ({
      street_address: addresses[0]?.street_address || '',
      city_id: addresses[0]?.city_id || '',
      country: addresses[0]?.country || '',
      state_province_id: addresses[0]?.state_province_id || '',
      latitude: addresses[0]?.latitude || '',
      longitude: addresses[0]?.longitude || '',
    }),
    [addresses]
  );
  // This useEffect sets the initial selectedLanguage value once details are available
  useEffect(() => {
    if (details?.vendor_translations?.length > 0) {
      setSelectedLanguage(details?.vendor_translations[0]?.locale);
    }
  }, [details]);
  useEffect(() => {
    if (defaultValues.latitude && defaultValues.longitude) {
      setMarkerPosition({
        lat: parseFloat(defaultValues.latitude) || 24.4539,
        lng: parseFloat(defaultValues.longitude) || 54.3773,
      });
    }
    // reset(defaultValues);
    setLoad(true);
  }, [defaultValues, reset]);
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
  const selectedLocaleObject = details?.vendor_translations?.find(
    (item: { locale: string }) => item.locale === selectedLanguage
  );

  const VendorSchema = Yup.object().shape({
    locale: Yup.mixed(),
    name: Yup.string().required(t('name_required')),
    contact_email: Yup.string().email(t('invalid_email')),
    phone_number: Yup.string().matches(/^\d{1,15}$/, t('invalid_phone_number')),
    commission_in_percentage: Yup.string(),
    license_expiry: Yup.string(),
    website: Yup.string().url(t('invalid_url')),
    status: Yup.string(),
    license_file: Yup.mixed().nullable(),
    is_active: Yup.boolean(),
    user_id: Yup.string(),
  });

  const defaultVendorValues = useMemo(
    () => ({
      locale: selectedLocaleObject?.locale || '',
      name: selectedLocaleObject?.name || '',
      contact_email: details?.email || '',
      phone_number: details?.phone_number || '',
      commission_in_percentage: details?.commission_in_percentage || '',
      license_expiry: details?.license_expiry || '',
      license_file: null,
      website: details?.website || '',
      status: details?.status || '',
      is_active: true,
      user_id: details?.vendor_user?.user_id,
    }),
    [selectedLocaleObject, details, editMode]
  );
  const Schoolethods = useForm({
    resolver: yupResolver(VendorSchema) as any,
    defaultVendorValues,
  });
  const {
    reset: schoolReset,
    watch: schoolWatch,
    control: schoolControl,
    setValue: schoolSetValue,
    handleSubmit: schoolSubmit,
    formState: schoolFormState,
  } = Schoolethods;
  const { isSubmitting, errors } = schoolFormState;
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
        name: selectedLocaleObject?.name || '',
        contact_email: details?.email || '',
        phone_number: details?.phone_number || '',
        commission_in_percentage: details?.commission_in_percentage || '',
        license_expiry: details?.license_expiry || '',
        license_file: null,
        website: details?.website || '',
        status: details?.status || '',
        is_active: details?.is_active === '0' ? false : true,
        user_id: details?.vendor_user?.user_id,
      };
      schoolReset(defaultVendorValues);
    }
  }, [details, schoolReset, selectedLocaleObject]);
  const handleChangeTab = useCallback((event: React.SyntheticEvent, newValue: string) => {
    setCurrentTab(newValue);
  }, []);
  const handleStudentChangeTab = useCallback((event: React.SyntheticEvent, newValue: string) => {
    setStudentTab(newValue);
  }, []);
  const handleVerify = async () => {
    try {
      const body = {
        user_id: details?.id,
        is_verified: details?.verified_at === null ? 1 : 0,
        certificate_expiry_date:
          details?.certificate_expiry_date || moment(expiryDate).format('YYYY-MM-DD'),
      };
      const response = await updateUser(body);
      if (response) {
        enqueueSnackbar(t('trainer_verified_successfully'));
        reload();
      }
    } catch (error) {
      if (error?.errors) {
        Object.values(error?.errors).forEach((errorMessage: any) => {
          enqueueSnackbar(errorMessage[0], { variant: 'error' });
        });
      } else {
        enqueueSnackbar(error.message, { variant: 'error' });
      }
    }
  };
  const handleSuspend = async () => {
    try {
      const body = {
        user_id: details?.id,
        is_suspended: details?.is_suspended ? 0 : 1,
      };
      const response = await updateUser(body);
      if (response) {
        enqueueSnackbar(t('trainer_updated_successfully'));
        reload();
      }
    } catch (error) {
      if (error?.errors) {
        Object.values(error?.errors).forEach((errorMessage: any) => {
          enqueueSnackbar(errorMessage[0], { variant: 'error' });
        });
      } else {
        enqueueSnackbar(error.message, { variant: 'error' });
      }
    }
  };
  const givenExpiryDate = details?.certificate_expiry_date
    ? parseISO(details.certificate_expiry_date)
    : null;

  const today = new Date();
  const daysRemaining = givenExpiryDate ? differenceInDays(givenExpiryDate, today) : null;

  const statusColor = daysRemaining <= 0 ? 'error' : daysRemaining <= 30 ? 'warning' : 'success';

  const statusLabel =
    daysRemaining > 0
      ? `${daysRemaining} day${daysRemaining > 1 ? 's' : ''} remaining`
      : daysRemaining === 0
      ? 'Expires today'
      : `Expired ${Math.abs(daysRemaining)} day${Math.abs(daysRemaining) > 1 ? 's' : ''} ago`;
  const router = useRouter();
  const handleEditRow = useCallback(() => {
    router.push(paths.dashboard.user.edit(details?.id));
  }, [details?.id]);
  const handleClickTrainer = (id) => {
    router.push(paths.dashboard.school.details(id));
  };
  const handleClickSchool = (id) => {
    router.push(paths.dashboard.school.details(id));
  };
  const renderSchool = (
    <Stack
      component={Paper}
      variant="outlined"
      spacing={3}
      sx={{
        p: 4,
        borderRadius: 3,
        cursor: 'pointer',
        maxWidth: 400,
        boxShadow: '0px 6px 15px rgba(0, 0, 0, 0.15)',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        '&:hover': {
          transform: 'scale(1.05)',
          boxShadow: '0px 10px 20px rgba(0, 0, 0, 0.2)',
        },
        backgroundColor: 'background.paper',
        position: 'relative',
      }}
      onClick={() => handleClickSchool(details?.school?.id)}
    >
      <Box
        sx={{
          position: 'absolute',
          top: 16,
          right: 16,
          borderRadius: '50%',
          width: 10,
          height: 10,
          bgcolor: details?.school?.status === 'active' ? 'success.main' : 'grey.400',
        }}
      />

      <Typography
        variant="h6"
        sx={{
          color: 'primary.main',
          fontWeight: 700,
          textAlign: 'center',
          borderBottom: '2px solid',
          borderColor: 'primary.light',
          pb: 1,
          mb: 2,
        }}
      >
        {t('school_details')}
      </Typography>

      {details?.school && (
        <Stack spacing={2}>
          {details.school?.vendor_translations?.[0]?.name && (
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              <strong>{t('school')}:</strong>{' '}
              {details.school.vendor_translations[0].name ?? t('name_not_available')}
            </Typography>
          )}
          {details.school?.commission_in_percentage && (
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              <strong>{t('commission')}:</strong> {details.school.commission_in_percentage}%
            </Typography>
          )}
          {details.school?.status && (
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              <strong>{t('status')}:</strong> {details.school.status}
            </Typography>
          )}
          {details.school?.phone_number && (
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              <strong>{t('contact')}:</strong> {details.school.phone_number}
            </Typography>
          )}
          {details.school?.email && (
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              <strong>{t('email')}:</strong> {details.school.email}
            </Typography>
          )}
        </Stack>
      )}
    </Stack>
  );

  const renderContent = (
    <Stack component={Card} spacing={3} sx={{ p: 3 }}>
      {user !== 'COLLECTOR' && (
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
      )}
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
        <Grid item xs={12} sm={8} md={8}>
          <Card
            elevation={3}
            sx={{
              p: 4,
              borderRadius: 3,
              backgroundColor: '#fff',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 3,
            }}
          >
            <Avatar
              alt={details?.name}
              src={details?.photo_url}
              sx={{ width: 220, height: 220, borderRadius: 2 }}
              variant="square"
            />

            {details?.user_preference?.bio && currentLang.value === 'en' && (
              <Box sx={{ width: '100%', textAlign: 'center' }}>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  Bio
                </Typography>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                  {details.user_preference.bio}
                </Typography>
              </Box>
            )}

            {details?.user_preference?.bio_ar && currentLang.value === 'ar' && (
              <Box sx={{ width: '100%', textAlign: 'center' }}>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  Bio
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    fontFamily: 'Tahoma, sans-serif',
                    color: '#333',
                    whiteSpace: 'pre-line',
                  }}
                >
                  {details.user_preference.bio_ar}
                </Typography>
              </Box>
            )}
          </Card>
        </Grid>

        <Grid item xs={12} sm={8} md={8}>
          <Scrollbar>
            <Stack spacing={1} alignItems="flex-start" sx={{ typography: 'body2', pb: 2 }}>
              {[
                {
                  label:
                    currentLang.value === 'ar'
                      ? t('name_as_per_profile_card_ar')
                      : t('name_as_per_profile_card'),
                  value:
                    currentLang.value === 'ar'
                      ? details?.name_ar ?? t('n/a')
                      : details?.name ?? t('n/a'),
                },
                ...(details?.user_type === 'TRAINER'
                  ? [
                      {
                        label: t('certificate_expiry_date'),
                        value: details?.certificate_expiry_date ?? t('n/a'),
                      },
                    ]
                  : []),

                { label: t('email'), value: details?.email ?? t('n/a') },

                {
                  label: t('phone_number'),
                  value:
                    details?.country_code && details?.phone
                      ? `${details.country_code}-${details.phone.trim().replace(/["\n]/g, '')}`
                      : details?.phone?.trim().replace(/["\n]/g, '') || t('n/a'),
                },

                { label: t('user_type'), value: details?.user_type ?? t('n/a') },
                ...(details?.user_type === 'ASSISTANT'
                  ? [{ label: t('gender'), value: details?.gender ?? t('n/a') }]
                  : []),

                { label: t('date_of_birth'), value: details?.dob?.split('T')[0] ?? t('n/a') },
                {
                  label: t('document_expiry'),
                  value:
                    Array.isArray(details?.user_docs) && details.user_docs[0]?.expiry
                      ? details.user_docs[0].expiry.split('T')[0]
                      : t('n/a'),
                },

                ...(details?.user_type !== 'ASSISTANT'
                  ? [
                      {
                        label: t('preferred_language'),
                        value: details?.locale !== 'undefined' ? details.locale : t('n/a'),
                      },
                    ]
                  : []),
                ...(details?.user_type !== 'ASSISTANT'
                  ? [
                      { label: t('wallet_balance'), value: details?.wallet_balance ?? t('n/a') },
                      { label: t('wallet_points'), value: details?.wallet_points ?? t('n/a') },
                      ...(details?.user_type === 'TRAINER' && details?.languages?.length
                        ? details?.languages.map((lang, index) => ({
                            label: `${t('language')} ${index + 1}`,
                            value: lang?.dialect?.id
                              ? `${lang?.dialect?.language_name} (${lang?.dialect?.dialect_name}) - ${lang?.fluency_level}`
                              : 'NA',
                          }))
                        : []),
                    ]
                  : []),

                ...(details?.user_type !== 'ASSISTANT'
                  ? [
                      {
                        label: t('roles'),
                        value:
                          details?.roles?.length > 0 ? (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                              {details.roles.map((r) => (
                                <Chip
                                  key={r.role?.id}
                                  label={r.role?.name}
                                  color="success"
                                  variant="soft"
                                  size="small"
                                />
                              ))}
                            </Box>
                          ) : (
                            t('n/a')
                          ),
                      },
                    ]
                  : []),

                // ...(details?.user_type === 'COLLECTOR' && details?.city_assigned?.length
                //   ? details?.city_assigned.map((city, index) => ({
                //       label: `${t('city')} ${index + 1}
                //       `,
                //       value: ` ${city?.city?.city_translations?.[0]?.name ?? t('Unknown')}`,
                //     }))
                //   : []),

                ...(details?.user_type === 'TRAINER'
                  ? [
                      {
                        label: t('school_name'),
                        value: details?.vendor?.vendor_translations?.[0]?.name ? (
                          <Link
                            onClick={() => handleClickTrainer(details?.vendor?.id)}
                            style={{
                              textDecoration: 'underline',
                              color: 'inherit',
                              cursor: 'pointer',
                            }}
                            onMouseOver={(e) => (e.target.style.color = '#CF5A0D')}
                            onMouseOut={(e) => (e.target.style.color = 'inherit')}
                          >
                            {details?.vendor?.vendor_translations?.[0]?.name}
                          </Link>
                        ) : (
                          details?.school_name ?? t('n/a')
                        ),
                      },
                      {
                        label: t('school_commission'),
                        value:
                          details?.vendor_commission_in_percentage != null
                            ? `${details.vendor_commission_in_percentage} %`
                            : t('n/a'),
                      },

                      {
                        label: t('certificate_commission'),
                        value:
                          details?.user_preference?.certificate_commission_in_percentage != null
                            ? `${details.user_preference.certificate_commission_in_percentage} %`
                            : t('n/a'),
                      },
                      {
                        label: t('min_price'),
                        value:
                          details?.user_preference?.min_price != null ? (
                            <>
                              <span className="dirham-symbol">&#x00EA;</span>
                              {details.user_preference?.min_price}
                            </>
                          ) : (
                            t('n/a')
                          ),
                      },
                      {
                        label: t('price_per_km'),
                        value:
                          details?.user_preference?.price_per_km != null ? (
                            <>
                              <span className="dirham-symbol">&#x00EA;</span>
                              {details.user_preference?.price_per_km}
                            </>
                          ) : (
                            t('n/a')
                          ),
                      },
                    ]
                  : []),
              ].map((item, index) => (
                <Box key={index} sx={{ display: 'flex', width: '100%' }}>
                  <Box component="span" sx={{ minWidth: '250px', fontWeight: 'bold' }}>
                    {item.label}
                  </Box>
                  <Box component="span" sx={{ minWidth: '40px', fontWeight: 'bold' }}>
                    :
                  </Box>
                  <Box component="span" sx={{ flex: 1 }}>
                    {item.value ?? t('n/a')}
                  </Box>
                </Box>
              ))}
              {[
                ...((details?.user_type === 'COLLECTOR' || details?.user_type === 'ASSISTANT') &&
                details?.city_assigned?.length
                  ? [
                      {
                        label: t('max_cash_allowed'),
                        value: (
                          <>
                            <span className="dirham-symbol">&#x00EA;</span>

                            {details.collected_max_cash_in_hand_allowed ?? t('n/a')}
                          </>
                        ),
                      },

                      {
                        label: 'City Assigned',
                        value: details.city_assigned.map(
                          (city) => city?.city?.city_translations?.[0]?.name ?? t('Unknown')
                        ),
                      },
                    ]
                  : []),
              ].map((item, index) => (
                <Box key={index} sx={{ display: 'flex', width: '100%' }}>
                  <Box component="span" sx={{ minWidth: '250px', fontWeight: 'bold' }}>
                    {item.label}
                  </Box>
                  <Box component="span" sx={{ minWidth: '40px', fontWeight: 'bold' }}>
                    :
                  </Box>
                  <Box component="span" sx={{ flex: 1 }}>
                    {Array.isArray(item.value)
                      ? item.value.length > 0
                        ? item.value.map((city, cityIndex) => (
                            <Chip
                              key={cityIndex}
                              label={city}
                              variant="soft"
                              color="primary"
                              sx={{ marginRight: 1, marginBottom: 1 }}
                            />
                          ))
                        : t(t('n/a'))
                      : item.value ?? t(t('n/a'))}
                  </Box>
                </Box>
              ))}
              {[
                ...(details?.user_type === 'ASSISTANT' && details?.mapped_schools?.length
                  ? [
                      {
                        label: 'School Assigned',
                        value: details.mapped_schools.map(
                          (city) => city?.vendor_name_en ?? t('Unknown')
                        ),
                      },
                    ]
                  : []),
              ].map((item, index) => (
                <Box key={index} sx={{ display: 'flex', width: '100%' }}>
                  <Box component="span" sx={{ minWidth: '250px', fontWeight: 'bold' }}>
                    {item.label}
                  </Box>
                  <Box component="span" sx={{ minWidth: '40px', fontWeight: 'bold' }}>
                    :
                  </Box>
                  <Box component="span" sx={{ flex: 1 }}>
                    {Array.isArray(item.value)
                      ? item.value.length > 0
                        ? item.value.map((city, cityIndex) => (
                            <Chip
                              key={cityIndex}
                              label={city}
                              variant="soft"
                              color="secondary"
                              sx={{ marginRight: 1, marginBottom: 1 }}
                            />
                          ))
                        : t(t('n/a'))
                      : item.value ?? t(t('n/a'))}
                  </Box>
                </Box>
              ))}
              {details?.user_type === 'TRAINER' &&
                trainerReviews &&
                trainerReviews[0]?.avg_rating && (
                  <Grid item xs={12} sm={12} md={6}>
                    <Box sx={{ display: 'flex', width: '100%' }}>
                      <Box component="span" sx={{ minWidth: '200px', fontWeight: 'bold' }}>
                        {t('average_review')}
                      </Box>
                      <Box component="span" sx={{ minWidth: '40px', fontWeight: 'bold' }}>
                        :
                      </Box>
                      <Box component="span" sx={{ flex: 1 }}>
                        {/* Display stars based on avg_rating */}
                        <Box display="flex" alignItems="center">
                          {Array.from({ length: 5 }).map((_, index) =>
                            index < trainerReviews[0].avg_rating ? (
                              <StarIcon
                                key={index}
                                style={{ color: '#CF5A0D', marginRight: '4px' }}
                              />
                            ) : (
                              <StarBorderIcon
                                key={index}
                                style={{ color: '#CF5A0D', marginRight: '4px' }}
                              />
                            )
                          )}
                        </Box>
                      </Box>
                    </Box>
                  </Grid>
                )}
            </Stack>
          </Scrollbar>
        </Grid>
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
        <Grid item xs={12} sm={12} md={6}>
          <Typography sx={{ fontWeight: '800', marginBottom: '10px' }}>
            {t('account_status')}
          </Typography>
          <Scrollbar>
            <Stack spacing={1} alignItems="flex-start" sx={{ typography: 'body2', pb: 2 }}>
              {[
                {
                  label: t('active'),
                  tooltip: t('active_tooltip'),
                  value: (
                    <Chip
                      label={details?.is_active ? t('yes') : t('no')}
                      color={details?.is_active ? 'success' : 'error'}
                      variant="soft"
                    />
                  ),
                },
                ...(details?.user_type === 'TRAINER'
                  ? [
                      {
                        label: t('admin_suspended'),
                        tooltip: t('admin_suspended_tooltip'),
                        value: (
                          <Switch
                            checked={!!details?.is_suspended}
                            onChange={() => handleSuspend()}
                            color="error"
                          />
                        ),
                      },
                      {
                        label: t('auto_suspended'),
                        tooltip: t('auto_suspended_tooltip'),
                        value: (
                          <Chip
                            label={
                              details?.max_cash_in_hand_allowed
                                ? details?.cash_in_hand >= details?.max_cash_in_hand_allowed
                                  ? t('yes')
                                  : t('no')
                                : t('no')
                            }
                            color={
                              details?.max_cash_in_hand_allowed
                                ? details?.cash_in_hand >= details?.max_cash_in_hand_allowed
                                  ? 'error'
                                  : 'default'
                                : 'default'
                            }
                            variant="soft"
                          />
                        ),
                      },
                      {
                        label: t('verification'),
                        tooltip: t('verification_tooltip'),
                        value: !details?.verified_at ? (
                          <Box display="flex" alignItems="center" gap={2}>
                            <Chip
                              label={t('not_verified')}
                              color="error"
                              icon={<ErrorOutlineIcon />}
                              variant="outlined"
                              sx={{ fontWeight: 'bold' }}
                            />
                            <>
                              <Button
                                variant="contained"
                                color="primary"
                                startIcon={<CheckCircleIcon />}
                                sx={{ padding: '6px 16px', minWidth: '100px' }}
                                onClick={handleVerifyClick}
                              >
                                {t('verify')}
                              </Button>

                              <Popover
                                id={id}
                                open={open}
                                anchorEl={anchorEl}
                                onClose={handleClose}
                                anchorOrigin={{
                                  vertical: 'bottom',
                                  horizontal: 'left',
                                }}
                              >
                                <Box
                                  sx={{
                                    p: 2,
                                    width: 250,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 2,
                                  }}
                                >
                                  <DatePicker
                                    label="Certificate Expiry Date"
                                    value={expiryDate}
                                    onChange={(newValue) => setExpiryDate(newValue)}
                                    slotProps={{ textField: { fullWidth: true } }}
                                  />

                                  <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={() => {
                                      handleVerify();
                                    }}
                                  >
                                    Submit
                                  </Button>
                                </Box>
                              </Popover>
                            </>
                          </Box>
                        ) : (
                          <Chip
                            label={`${t('verified_on')} ${moment
                              .utc(details?.verified_at)
                              .format('ll')}`}
                            color="success"
                            icon={<CheckCircleIcon />}
                            variant="outlined"
                            sx={{ fontWeight: 'bold' }}
                          />
                        ),
                      },
                    ]
                  : []),
              ].map((item, index) => (
                <Box key={index} sx={{ display: 'flex', width: '100%' }}>
                  <Box
                    component="span"
                    sx={{ minWidth: '200px', fontWeight: 'bold', marginTop: '15px' }}
                  >
                    <Tooltip title={item.tooltip || ''} arrow>
                      <span>{item.label}</span>
                    </Tooltip>
                  </Box>
                  <Box
                    component="span"
                    sx={{ minWidth: '30px', fontWeight: 'bold', marginTop: '15px' }}
                  >
                    :
                  </Box>
                  <Box component="span" sx={{ flex: 1, marginTop: '10px' }}>
                    {item.value ?? t('n/a')}
                  </Box>
                </Box>
              ))}
            </Stack>
          </Scrollbar>
        </Grid>

        {details?.user_type === 'TRAINER' && (
          <Grid item xs={12} sm={12} md={6}>
            <Typography sx={{ fontWeight: '800', marginBottom: '10px' }}>
              {t('school_financial_summary')}
            </Typography>
            <Scrollbar>
              <Stack spacing={1} alignItems="flex-start" sx={{ typography: 'body2', pb: 2 }}>
                {[
                  {
                    label: t('max_cash_allowed_in_hand'),
                    value: details?.max_cash_in_hand_allowed ?? t('n/a'),
                  },
                  { label: t('cash_in_hand'), value: details?.cash_in_hand ?? t('n/a') },
                  {
                    label: t('cash_clearance_date'),

                    value: moment.utc(details?.cash_clearance_date).format('lll') ?? t('n/a'),
                  },

                  {
                    label: t('last_booking_at'),
                    value: details?.last_booking_was
                      ? moment.utc(details?.last_booking_was).format('lll')
                      : t('n/a'),
                  },
                ].map((item, index) => (
                  <Box key={index} sx={{ display: 'flex', width: '100%' }}>
                    <Box
                      component="span"
                      sx={{ minWidth: '200px', fontWeight: 'bold', marginTop: '15px' }}
                    >
                      {item.label}
                    </Box>
                    <Box
                      component="span"
                      sx={{ minWidth: '30px', fontWeight: 'bold', marginTop: '15px' }}
                    >
                      :
                    </Box>
                    <Box component="span" sx={{ flex: 1, marginTop: '15px' }}>
                      {item.value ?? t('n/a')}
                    </Box>
                  </Box>
                ))}
              </Stack>
            </Scrollbar>
          </Grid>
        )}
      </Stack>
    </Stack>
  );
  const handleBookingClick = (booking) => {
    router.push(paths.dashboard.booking.details(booking));
  };
  const renderUserPreferences = (
    <Stack
      component={Card}
      spacing={4}
      sx={{ p: 4 }}
      direction={{
        xs: 'column',
        md: 'row',
      }}
    >
      <Grid item xs={12} sm={12} md={6}>
        <Typography sx={{ fontWeight: '800' }}>{t('user_preferences')}</Typography>

        <Scrollbar>
          <Stack spacing={1} alignItems="flex-start" sx={{ typography: 'body2', pb: 1 }}>
            {[
              {
                label: t('city'),
                value: details?.user_preference?.city?.city_translations[0]?.name ?? t('n/a'),
              },
              {
                label: t('area'),
                value: details?.user_preference?.state_province?.translations[0]?.name ?? t('n/a'),
              },
              { label: t('gear'), value: details?.user_preference?.gear ?? t('n/a') },
              { label: t('gender'), value: details?.user_preference?.gender ?? t('n/a') },

              {
                label: t('vehicle_type'),
                value:
                  details?.user_preference?.vehicle_type?.category_translations[0]?.name ??
                  t('n/a'),
              },
              ...(details?.user_type === 'STUDENT'
                ? [
                    {
                      label: t('trainer_language'),
                      value: details?.preferred_trainer_lang?.language_name ?? t('n/a'),
                    },
                  ]
                : []),
            ].map((item, index) => (
              <Box key={index} sx={{ display: 'flex', width: '100%' }}>
                <Box
                  component="span"
                  sx={{ minWidth: '330px', fontWeight: 'bold', marginTop: '10px' }}
                >
                  {item.label}
                </Box>
                <Box
                  component="span"
                  sx={{ minWidth: '30px', fontWeight: 'bold', marginTop: '10px' }}
                >
                  :
                </Box>
                <Box component="span" sx={{ flex: 1, marginTop: '10px' }}>
                  {item.value ?? t('n/a')}
                </Box>
              </Box>
            ))}
          </Stack>
        </Scrollbar>
      </Grid>

      {currentTab === 'details' &&
        details?.bank_detail?.length > 0 &&
        details?.user_type === 'TRAINER' && (
          <Grid item xs={12} sm={12} md={6}>
            <Typography sx={{ fontWeight: '800' }}>{t('bank_details')}</Typography>

            <Scrollbar>
              <Stack spacing={1} alignItems="flex-start" sx={{ typography: 'body2', pb: 1 }}>
                {[
                  {
                    label: t('account_holder_name'),
                    value: details?.bank_detail[0]?.account_holder_name ?? t('n/a'),
                  },
                  {
                    label: t('account_number'),
                    value: details?.bank_detail[0]?.account_number ?? t('n/a'),
                  },
                  { label: t('bank_name'), value: details?.bank_detail[0]?.bank_name ?? t('n/a') },
                  { label: t('iban'), value: details?.bank_detail[0]?.iban_number ?? t('n/a') },
                  {
                    label: t('active'),
                    value: (
                      <Chip
                        label={details?.bank_detail[0]?.is_active ? t('yes') : t('no')}
                        color={details?.bank_detail[0]?.is_active ? 'success' : 'error'}
                        variant="soft"
                      />
                    ),
                  },
                  ...(details?.user_type === 'STUDENT'
                    ? [
                        {
                          label: t('trainer_language'),
                          value: details?.preferred_trainer_lang?.language_name ?? t('n/a'),
                        },
                      ]
                    : []),
                ].map((item, index) => (
                  <Box key={index} sx={{ display: 'flex', width: '100%' }}>
                    <Box
                      component="span"
                      sx={{ minWidth: '200px', fontWeight: 'bold', marginTop: '10px' }}
                    >
                      {item.label}
                    </Box>
                    <Box
                      component="span"
                      sx={{ minWidth: '30px', fontWeight: 'bold', marginTop: '10px' }}
                    >
                      :
                    </Box>
                    <Box component="span" sx={{ flex: 1, marginTop: '10px' }}>
                      {item.value ?? t('n/a')}
                    </Box>
                  </Box>
                ))}
              </Stack>
            </Scrollbar>
          </Grid>
        )}
    </Stack>
  );
  const filteredTrainerTabs =
    user === 'COLLECTOR'
      ? TRAINER_DETAILS_TABS.filter((tab) => tab.value === 'details')
      : TRAINER_DETAILS_TABS;

  const renderStudentTabs = (
    <Tabs
      value={studentTab}
      onChange={handleStudentChangeTab}
      sx={{
        mb: { xs: 3, md: 5 },
      }}
    >
      {STUDENT_DETAILS_TABS.map((tab) => (
        <Tab key={tab.value} iconPosition="end" value={tab.value} label={t(tab.label)} />
      ))}
    </Tabs>
  );
  const renderTabs = (
    <Tabs
      value={currentTab}
      onChange={handleChangeTab}
      sx={{
        mb: { xs: 3, md: 5 },
      }}
    >
      {filteredTrainerTabs.map((tab) => (
        <Tab key={tab.value} iconPosition="end" value={tab.value} label={t(tab.label)} />
      ))}
    </Tabs>
  );
  const { isLoaded } = useGoogleMaps();
  const mapContainerStyle = useMemo(() => ({ height: '300px', width: '100%' }), []);

  const { states, stateLoading, stateError } = useGetStateList({
    limit: 1000,
    city_id: addressForm?.city_id ?? '',
  });

  const handleUpdateExistingUserAddress = async (
    body: Address,
    markerPosition: { lat: number; lng: number },
    id: string,
    user_id: string
  ) => {
    try {
      const updatedAddress = {
        ...body,
        latitude: markerPosition.lat || addressForm.latitude,
        longitude: markerPosition.lng || addressForm.longitude,
      };

      // Call the update API with the updated address data
      const response = await updateExistingUserAddress(updatedAddress, id, user_id);

      // Display success message if the update is successful
      if (response && response.status === 'success') {
        setNewAddress(null);
        setEditingIndex(null);
        reload();
        enqueueSnackbar(t('user_address_updated'), { variant: 'success' });
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
  };

  const handleCreateNewUserAddress = async (body: Address) => {
    try {
      const response = await createNewAddressForUser(body);

      if (response && response.status === 'success') {
        setNewAddress(null);
        setEditingIndex(null);
        reload();
        enqueueSnackbar(t('user_address_created'), { variant: 'success' });
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
  };

  const handleChangeStoreAddress = (e) => {
    const { name, value } = e.target;
    setAddressForm((prev) => ({ ...prev, [name]: value }));

    if (name === 'latitude') {
      setMarkerPosition((prev) => ({
        ...prev,
        lat: parseFloat(value) || 0,
      }));
    } else if (name === 'longitude') {
      setMarkerPosition((prev) => ({
        ...prev,
        lng: parseFloat(value) || 0,
      }));
    }
  };

  // State to manage the visibility of the map for each address
  const [showMapIndex, setShowMapIndex] = useState(null);
  // Function to handle user deletion
  const handleDeleteUserAddress = async (addressId: string, reloadData: () => void) => {
    try {
      const response = await deleteUserAddress(addressId);

      if (response) {
        enqueueSnackbar(t('user_address_deleted'), { variant: 'success' });
        if (reloadData) reloadData();
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
  };
  // Add a method to handle the selected location from the map
  const handleLocationSelect = (selectedLocation) => {
    setAddressForm((prev) => ({
      ...prev,
      longitude: selectedLocation.lng,
      latitude: selectedLocation.lat,
    }));
  };
  const handleEditAddress = useCallback(
    (index, address) => {
      if (editingIndex === index) {
        setEditingIndex(null);
      } else {
        setEditingIndex(index);
        setAddressForm(address);
      }
    },
    [addressForm, editingIndex] // Include editingIndex in the dependency array
  );
  const handleSetDeafult = async (addressId: any) => {
    try {
      const body = {
        id: addressId,
        is_default: 1,
      };
      const response = await createNewAddressForUser(body);
      if (response) {
        enqueueSnackbar(t('address_set_to_default'));
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
  };
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
            {t('add_new_address')}
          </Button>
        </Box>

        {/* Form for Adding or Editing an Address */}
        {newAddress && !editingIndex && (
          <Box
            component="form"
            onSubmit={(e) => {
              const pathSegments = window.location.pathname.split('/');
              const user_id = parseInt(pathSegments[pathSegments.length - 1], 10);
              e.preventDefault(); // Prevent default form submission
              const addressFormData = {
                id: parseInt(addressForm.id, 10),
                user_id,
                plot_number: addressForm?.plot_number,
                building_name: addressForm?.building_name,
                street: addressForm?.street,
                city_id: addressForm?.city_id,
                label: addressForm?.label,
                address: addressForm?.address,
                landmark: addressForm?.landmark,
                country_code: parseInt(addressForm?.country_code, 10),
                phone_number: addressForm?.phone_number,
                longitude: parseFloat(addressForm?.longitude) || markerPosition?.lng,
                latitude: parseFloat(addressForm?.latitude) || markerPosition?.lat,
                state_province_id: addressForm?.state_province_id,
              };

              handleCreateNewUserAddress(addressFormData); // Call to create a new user address
            }}
            sx={{ mb: 2, p: 2, border: '1px solid #ddd' }}
          >
            {newAddress && !editingIndex && (
              <Box sx={{ pt: 2, pb: 2 }}>
                {isLoaded && load ? (
                  <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    center={markerPosition}
                    zoom={12}
                    onClick={handleMapClick}
                  >
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
                          scaledSize: new window.google.maps.Size(50, 50), // Adjust the size of the marker as needed
                        }}
                      />
                    )}
                  </GoogleMap>
                ) : (
                  <div>{t('loading_map')}</div>
                )}
              </Box>
            )}
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
              {newAddress
                ? t('add_new_address')
                : t('edit_address', { index: (editingIndex ?? 0) + 1 })}
            </Typography>

            {/* Form Fields in Rows */}
            {/* Row 1 */}

            {/* Row 2 */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, mb: 2 }}>
              <TextField
                label={t('street_address')}
                variant="outlined"
                name="street"
                value={addressForm.street}
                onChange={handleChangeStoreAddress}
                sx={{ flex: 1, mt: 0.5, mb: 0.5 }}
              />
              <TextField
                label={t('building_name')}
                variant="outlined"
                name="building_name"
                value={addressForm.building_name}
                onChange={handleChangeStoreAddress}
                sx={{ flex: 1, mt: 0.5, mb: 0.5 }}
              />
              <Controller
                name="city_id"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label={t('city')}
                    variant="outlined"
                    value={field.value || addressForm.city_id || ''}
                    onChange={(e) => {
                      const selectedCityId = e.target.value;

                      const selectedCity = city.find((cityItem) => cityItem.id === selectedCityId);
                      const selectedCityName = selectedCity
                        ? selectedCity.city_translations
                            .map((translation) => translation.name)
                            .join(', ')
                        : '';

                      field.onChange(e);

                      handleChangeStoreAddress({
                        ...e,
                        target: { name: 'city_id', value: selectedCityId },
                      });
                    }}
                    sx={{ flex: 1, mt: 0.5, mb: 0.5 }}
                    select
                    fullWidth
                    InputProps={{
                      startAdornment: cityLoading ? (
                        <InputAdornment position="start">
                          <CircularProgress size={20} />
                        </InputAdornment>
                      ) : null,
                    }}
                  >
                    {cityLoading ? (
                      <MenuItem disabled>{t('loading_cities')}</MenuItem>
                    ) : city?.length === 0 ? (
                      <MenuItem disabled>{t('no_cities_found')}</MenuItem>
                    ) : (
                      city.map((cityItem) => {
                        const cityNames = cityItem.city_translations.map(
                          (translation) => translation.name
                        );

                        return (
                          <MenuItem key={cityItem.id} value={cityItem.id}>
                            {cityNames.join(', ') || t('unknown_city')}
                          </MenuItem>
                        );
                      })
                    )}
                  </TextField>
                )}
              />
            </Box>

            {/* Row 3 */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, mb: 2 }}>
              <Controller
                name="state_province_id"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label={t('area')}
                    variant="outlined"
                    value={field.value || addressForm.state_province_id || ''}
                    onChange={(e) => {
                      const selectedAreaId = e.target.value;

                      const selectedArea = states.find(
                        (cityItem) => cityItem.id === selectedAreaId
                      );
                      const selectedAreaName = selectedArea
                        ? selectedArea?.translations
                            ?.map((translation) => translation?.name ?? t('unknown'))
                            .join(', ')
                        : '';

                      field.onChange(e);

                      handleChangeStoreAddress({
                        ...e,
                        target: { name: 'state_province_id', value: selectedAreaId },
                      });
                    }}
                    sx={{ flex: 1, mt: 0.5, mb: 0.5 }}
                    select
                    fullWidth
                    InputProps={{
                      startAdornment: stateLoading ? (
                        <InputAdornment position="start">
                          <CircularProgress size={20} />
                        </InputAdornment>
                      ) : null,
                    }}
                  >
                    {stateLoading ? (
                      <MenuItem disabled>{t('loading_cities')}</MenuItem>
                    ) : states?.length === 0 ? (
                      <MenuItem disabled>{t('no_cities_found')}</MenuItem>
                    ) : (
                      states?.map((cityItem) => {
                        const cityNames = cityItem?.translations?.map(
                          (translation) => translation?.name ?? t('unknown')
                        );

                        return (
                          <MenuItem key={cityItem.id} value={cityItem.id}>
                            {cityNames.join(', ') || t('unknown_city')}
                          </MenuItem>
                        );
                      })
                    )}
                  </TextField>
                )}
              />
              <TextField
                label={t('phone_number')}
                variant="outlined"
                name="phone_number"
                value={addressForm.phone_number}
                onChange={(e) => handleChangeStoreAddress(e, true)}
                sx={{ flex: 1, mt: 0.5, mb: 0.5 }}
                InputProps={{
                  startAdornment: <InputAdornment position="start">+971</InputAdornment>,
                }}
              />

              <TextField
                label={t('plot_number')}
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
                label={t('address')}
                variant="outlined"
                name="address"
                value={addressForm.address}
                onChange={handleChangeStoreAddress}
                sx={{ flex: 1, mt: 0.5, mb: 0.5 }}
              />
              <TextField
                label={t('label')}
                variant="outlined"
                fullWidth
                name="label"
                select
                value={addressForm.label}
                onChange={handleChangeStoreAddress}
                sx={{ flex: 1, mt: 0.5, mb: 0.5 }}
              >
                <MenuItem value="home">{t('home')}</MenuItem>
                <MenuItem value="office">{t('office')}</MenuItem>
              </TextField>
              <TextField
                label={t('landmark')}
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
                label={t('longitude')}
                variant="outlined"
                type="number"
                name="longitude"
                value={markerPosition.lng}
                onChange={(e) => handleChangeStoreAddress(e, true)}
                sx={{ flex: 1, mt: 0.5, mb: 0.5 }}
              />
              <TextField
                label={t('latitude')}
                variant="outlined"
                type="number"
                name="latitude"
                value={markerPosition.lat}
                onChange={(e) => handleChangeStoreAddress(e, true)}
                sx={{ flex: 1, mt: 0.5, mb: 0.5 }}
              />
            </Box>

            <Box sx={{ display: 'flex', gap: 2, mt: 2, mb: 4 }}>
              <Button variant="contained" type="submit" sx={{ flex: 1, mr: 1 }}>
                {t('save')}
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
                {t('cancel')}
              </Button>
            </Box>
          </Box>
        )}

        <Stack spacing={4} alignItems="flex-start" sx={{ typography: 'body2', mt: 2 }}>
          {displayedAddresses.map((address, index) => (
            <Box key={index} sx={{ width: '100%' }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                {t('address_details')} {index + 1}
              </Typography>

              {/* Address Details */}
              {[
                { label: t('address'), value: address?.address ?? t('n/a') },
                { label: t('street'), value: address?.street ?? t('n/a') },
                { label: t('building_name'), value: address?.building_name ?? t('n/a') },
                {
                  label: t('city'),
                  value:
                    address?.city ??
                    address?.city_id_city?.city_translations?.[0]?.name ??
                    t('n/a'),
                },
                {
                  label: t('area'),
                  value: address?.state_province
                    ? address?.state_province?.translations?.[0]?.name
                    : t('n/a'),
                },
                // { label: t('country_code'), value: address?.country_code ?? 'UAE' },
                { label: t('label'), value: address?.label ?? t('n/a') },
                { label: t('phone_number'), value: address?.phone_number ?? t('n/a') },
                { label: t('plot_number'), value: address?.plot_number ?? t('n/a') },
                { label: t('country'), value: address?.country ?? 'UAE' },
                { label: t('landmark'), value: address?.landmark ?? t('n/a') },
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
                  onClick={() => {
                    setShowMapIndex(showMapIndex === index ? null : index);
                    setAddressForm({
                      ...addressForm,
                      longitude: address?.longitude, // Ensure these properties exist on the address object
                      latitude: address?.latitude,
                    });
                    setMarkerPosition({
                      lat: address?.latitude, // Ensure these properties exist on the address object
                      lng: address?.longitude,
                    });
                    // handleEditAddress(index, address);
                  }}
                  // sx={{ mt: 1 }}
                >
                  {showMapIndex === index ? t('hide_map') : t('show_map')}
                </Button>
                <Button
                  variant="contained"
                  onClick={() => {
                    handleEditAddress(index, address);
                  }}
                >
                  {t('edit')}
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => handleDeleteUserAddress(address.id, reload)}
                >
                  {t('delete')}
                </Button>

                {!address?.is_default && (
                  <Button variant="outlined" onClick={() => handleSetDeafult(address.id)}>
                    {t('set_default')}
                  </Button>
                )}
              </Box>
              {showMapIndex === index && (
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
                            url:
                              marker && typeof marker === 'string'
                                ? marker
                                : 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
                            scaledSize: new window.google.maps.Size(50, 50), // Adjust the size of the marker image as needed
                          }}
                        />
                      )}
                    </GoogleMap>
                  ) : (
                    <div>{t('loading_map')}</div>
                  )}
                </Box>
              )}
              {editingIndex === index && !newAddress && (
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
                      label={t('phone_number')}
                      variant="outlined"
                      fullWidth
                      name="phone_number"
                      value={addressForm.phone_number}
                      onChange={handleChangeStoreAddress}
                      sx={{ flex: 1, mt: 0.5, mb: 0.5 }}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">+971</InputAdornment>,
                      }}
                    />
                    <Controller
                      name="city_id"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label={t('city')}
                          variant="outlined"
                          value={field.value || addressForm?.city_id || ''}
                          onChange={(e) => {
                            const selectedCityId = e.target.value;

                            const selectedCity = city?.find(
                              (cityItem) => cityItem?.id === selectedCityId
                            );
                            const selectedCityName = selectedCity
                              ? selectedCity?.city_translations
                                  ?.map((translation) => translation?.name ?? t('unknown'))
                                  .join(', ')
                              : '';

                            field.onChange(e);

                            handleChangeStoreAddress({
                              ...e,
                              target: { name: 'city_id', value: selectedCityId },
                            });
                          }}
                          sx={{ flex: 1, mt: 0.5, mb: 0.5 }}
                          select
                          fullWidth
                          InputProps={{
                            startAdornment: cityLoading ? (
                              <InputAdornment position="start">
                                <CircularProgress size={20} />
                              </InputAdornment>
                            ) : null,
                          }}
                        >
                          {cityLoading ? (
                            <MenuItem disabled>{t('loading_cities')}</MenuItem>
                          ) : city?.length === 0 ? (
                            <MenuItem disabled>{t('no_cities_found')}</MenuItem>
                          ) : (
                            city.map((cityItem) => {
                              const cityNames = cityItem?.city_translations?.map(
                                (translation) => translation?.name ?? t('unknown')
                              );

                              return (
                                <MenuItem key={cityItem?.id} value={cityItem.id}>
                                  {cityNames.join(', ') || t('unknown_city')}
                                </MenuItem>
                              );
                            })
                          )}
                        </TextField>
                      )}
                    />
                    <Controller
                      name="state_province_id"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label={t('area')}
                          variant="outlined"
                          value={field.value || addressForm.state_province_id || ''}
                          onChange={(e) => {
                            const selectedAreaId = e.target.value;

                            const selectedArea = states.find(
                              (cityItem) => cityItem.id === selectedAreaId
                            );
                            const selectedAreaName = selectedArea
                              ? selectedArea?.translations
                                  ?.map((translation) => translation?.name ?? t('unknown'))
                                  .join(', ')
                              : '';

                            field.onChange(e);

                            handleChangeStoreAddress({
                              ...e,
                              target: { name: 'state_province_id', value: selectedAreaId },
                            });
                          }}
                          sx={{ flex: 1, mt: 0.5, mb: 0.5 }}
                          select
                          fullWidth
                          InputProps={{
                            startAdornment: stateLoading ? (
                              <InputAdornment position="start">
                                <CircularProgress size={20} />
                              </InputAdornment>
                            ) : null,
                          }}
                        >
                          {stateLoading ? (
                            <MenuItem disabled>{t('loading_areas')}</MenuItem>
                          ) : states?.length === 0 ? (
                            <MenuItem disabled>{t('no_areas_found')}</MenuItem>
                          ) : (
                            states?.map((cityItem) => {
                              const areaNames = cityItem?.translations?.map(
                                (translation) => translation?.name ?? t('unknown')
                              );

                              return (
                                <MenuItem key={cityItem.id} value={cityItem.id}>
                                  {areaNames.join(', ') || t('unknown_area')}
                                </MenuItem>
                              );
                            })
                          )}
                        </TextField>
                      )}
                    />
                  </Box>

                  {/* Row 3 */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, mb: 2 }}>
                    <TextField
                      label={t('label')}
                      variant="outlined"
                      fullWidth
                      name="label"
                      select
                      value={addressForm.label}
                      onChange={handleChangeStoreAddress}
                      sx={{ flex: 1, mt: 0.5, mb: 0.5 }}
                    >
                      <MenuItem value="home">{t('home')}</MenuItem>
                      <MenuItem value="office">{t('office')}</MenuItem>
                    </TextField>
                    <TextField
                      label={t('address')}
                      variant="outlined"
                      fullWidth
                      name="address"
                      value={addressForm.address}
                      onChange={handleChangeStoreAddress}
                      sx={{ flex: 1, mt: 0.5, mb: 0.5 }}
                    />
                    <TextField
                      label={t('landmark')}
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
                      label={t('longitude')}
                      variant="outlined"
                      fullWidth
                      name="longitude"
                      type="number"
                      value={markerPosition.lng}
                      onChange={handleChangeStoreAddress}
                      sx={{ flex: 1, mt: 0.5, mb: 0.5 }}
                    />
                    <TextField
                      label={t('latitude')}
                      variant="outlined"
                      fullWidth
                      name="latitude"
                      type="number"
                      value={markerPosition.lat}
                      onChange={handleChangeStoreAddress}
                      sx={{ flex: 1, mt: 0.5, mb: 0.5 }}
                    />
                  </Box>

                  {/* Submit and Cancel Buttons */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                    <Button
                      variant="contained"
                      onClick={() =>
                        handleUpdateExistingUserAddress(
                          addressForm,
                          markerPosition,
                          address.id,
                          address.user_id
                        )
                      }
                      sx={{ flex: 1, mr: 1 }}
                    >
                      {t('submit')}
                    </Button>
                    <Button
                      variant="contained"
                      onClick={() => setEditingIndex('')}
                      sx={{ flex: 1 }}
                    >
                      {t('cancel')}
                    </Button>
                  </Box>
                </>
              )}
            </Box>
          ))}
        </Stack>
        {addresses.length > 2 && (
          <Button variant="outlined" onClick={toggleShowAll}>
            {showAll ? t('show_less') : t('show_more')}
          </Button>
        )}
      </Scrollbar>
    </Stack>
  );
  return (
    <>
      {loading || !details.id ? (
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
          {details?.user_type === 'TRAINER' && renderTabs}
          {details?.user_type === 'TRAINER' && givenExpiryDate && (
            <Card
              sx={{
                mt: 3,
                px: 3,
                py: 2.5,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #e3f2fd 0%, #ffffff 100%)',
                boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                mb: 4,
              }}
            >
              <Stack direction="row" alignItems="center" spacing={2}>
                <Box
                  sx={{
                    backgroundColor: '#e3f2fd',
                    borderRadius: '50%',
                    p: 1.2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <CalendarMonthIcon sx={{ color: '#1976d2', fontSize: 28 }} />
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Trainer Certificate Expiry
                  </Typography>
                  <Typography variant="h6" fontWeight={600}>
                    {details.certificate_expiry_date}
                  </Typography>
                </Box>
              </Stack>

              <Chip
                label={statusLabel}
                color={statusColor as 'error' | 'warning' | 'success'}
                variant="outlined"
                sx={{ mt: { xs: 2, md: 0 }, fontWeight: 500 }}
              />
            </Card>
          )}

          {details?.user_type === 'STUDENT' && renderStudentTabs}

          <Grid container spacing={1} rowGap={1}>
            <Grid xs={12} md={12}>
              {/* For all other user types */}
              {details?.user_type !== 'TRAINER' && studentTab === 'details' && renderContent}

              {/* <----- For trainer user type with 3 tabs ----> */}
              {currentTab === 'details' && details?.user_type === 'TRAINER' && renderContent}
              {currentTab === 'packages' && details?.user_type === 'TRAINER' && (
                <TrainerDetailsContent Trainerdetails={details} />
              )}
              {/* {studentTab === 'details' && details?.user_type === 'STUDENT' && renderContent}
              {studentTab === 'booking' && details?.user_type === 'STUDENT' && renderContent} */}

              {currentTab === 'students' && details?.user_type === 'TRAINER' && (
                <StudentDetailsContent id={details?.id} />
              )}
              {currentTab === 'working-hours' && details?.user_type === 'TRAINER' && (
                <TrainerWorkingHour userId={details?.id} details={details} />
              )}

              {/*<----- For trainer user type with 3 tabs ----> */}
            </Grid>
            <Grid xs={12}>
              {currentTab === 'details' &&
                studentTab === 'details' &&
                details?.user_preference?.id &&
                (details?.user_type === 'TRAINER' || details?.user_type === 'STUDENT') &&
                renderUserPreferences}
            </Grid>

            <Grid xs={12} md={12}>
              {details?.user_type === 'TRAINER' &&
                currentTab === 'details' &&
                user !== 'COLLECTOR' &&
                renderAddress}
            </Grid>

            <Grid xs={12} md={12}>
              {details?.user_type === 'STUDENT' && studentTab === 'review' && (
                <StudentReviewsTable students={studentReviews} />
              )}
            </Grid>
            <Grid xs={12} md={12}>
              {details?.user_type === 'TRAINER' && currentTab === 'review' && (
                <TrainerReviewsTable trainers={trainerReviews} />
              )}
            </Grid>
            <Grid xs={12} md={12}>
              {details?.user_type === 'STUDENT' && studentTab === 'details' && renderAddress}
            </Grid>
            <Grid xs={12} md={12}>
              {details?.user_type === 'STUDENT' && studentTab === 'user-document' && (
                <UserDocumentDetails
                  id={details?.id}
                  documents={userDocuments}
                  reload={revalidateUserDocuments}
                />
              )}
            </Grid>
            <Grid xs={12} md={12}>
              {details?.user_type === 'TRAINER' && currentTab === 'user-document' && (
                <UserDocumentDetails
                  id={details?.id}
                  documents={userDocuments}
                  reload={revalidateUserDocuments}
                />
              )}
            </Grid>
            <Grid xs={12} md={12}>
              {details?.user_type === 'STUDENT' && studentTab === 'booking' && (
                <BookingStudentTable id={details?.id} handleBookingClick={handleBookingClick} />
              )}
            </Grid>
            <Grid xs={12} md={12}>
              {details?.user_type === 'TRAINER' && currentTab === 'booking' && (
                <BookingTrainerTable id={details?.id} handleBookingClick={handleBookingClick} />
              )}
            </Grid>
            {/* For trainer user type with 3 tabs, in the first tab only user preferences should be shown */}

            <Grid xs={12}>
              {details?.user_type === 'SCHOOL_ADMIN' && details?.school && renderSchool}
            </Grid>
            {/* User preferences For all other user types */}
          </Grid>
        </>
        // <Grid container spacing={1} rowGap={1}>
        //   <Grid xs={12} md={12}>
        //     {renderContent}
        //   </Grid>

        //   {/* <Grid xs={12} md={4}>
        //     {renderCompany}
        //   </Grid> */}
        // </Grid>
      )}
    </>
  );
}
