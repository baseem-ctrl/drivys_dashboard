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
import {
  ASSISTANT_DETAILS_TABS,
  COLLECTOR_DETAILS_TABS,
  TRAINER_DETAILS_TABS,
} from 'src/_mock/_trainer';
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
import { useTranslation } from 'react-i18next';
import BankDetailsCard from './bank-details-card';
import { SolarPower } from '@mui/icons-material';
// ----------------------------------------------------------------------

type Props = {
  addresses: any;
  addressesLoading: any;
  details: any;
  loading?: any;
  user: any;
  reload?: VoidFunction;
};

export default function AssistantUserDetailsContent({
  addresses,
  addressesLoading,
  details,
  loading,
  reload,
  user,
}: Props) {
  const { reset, control } = useForm();
  console.log('details', details);
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

  const toggleShowAll = () => setShowAll((prev) => !prev);
  const displayedAddresses = showAll ? addresses : addresses.slice(0, 2);
  const currentTrainer = details;
  const { language, languageLoading, totalpages, revalidateLanguage, languageError } =
    useGetAllLanguage(0, 1000);

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
      const matchingTranslation = details.vendor_translations.find(
        (t: any) => t?.locale?.toLowerCase() === i18n.language.toLowerCase()
      );
      setSelectedLanguage(matchingTranslation?.locale || details.vendor_translations[0]?.locale);
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
  const { i18n } = useTranslation();

  useEffect(() => {
    if (details?.license_file) {
      setUploadedFileUrl(details.license_file); // Set the initial file URL from the response
    }
  }, [details]);

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
  const router = useRouter();
  const filteredTrainerTabs =
    user === 'ASSISTANT'
      ? TRAINER_DETAILS_TABS.filter(
          (tab) => tab.value === 'details' || tab.value === 'bank-details'
        )
      : TRAINER_DETAILS_TABS;

  const handleClickTrainer = (id) => {
    router.push(paths.dashboard.school.details(id));
  };
  const handleChangeTab = useCallback((event: React.SyntheticEvent, newValue: string) => {
    setCurrentTab(newValue);
  }, []);
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
          {/* <Iconify icon="solar:pen-bold" onClick={handleEditRow} sx={{ cursor: 'pointer' }} /> */}
        </Stack>
      )}
      <Stack
        spacing={1}
        alignItems={{ xs: 'center', md: 'center' }}
        sx={{ width: '100%', flexWrap: 'wrap', p: 2.5 }}
        direction={{
          xs: 'column',
          md: 'row',
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
                // {
                //   label: t('document_expiry'),
                //   value:
                //     Array.isArray(details?.user_docs) && details.user_docs[0]?.expiry
                //       ? details.user_docs[0].expiry.split('T')[0]
                //       : t('n/a'),
                // },

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
                              : t('n/a'),
                          }))
                        : []),
                    ]
                  : []),

                // ...(details?.user_type === 'COLLECTOR' && details?.city_assigned?.length
                //   ? details?.city_assigned.map((city, index) => ({
                //       label: `${t('city')} ${index + 1}
                //       `,
                //       value: ` ${city?.city?.city_translations?.[0]?.name ?? t('Unknown')}`,
                //     }))
                //   : []),
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
                        value: details.city_assigned.map((city) => {
                          const translation = city?.city?.city_translations?.find(
                            (t: any) => t?.locale?.toLowerCase() === i18n.language.toLowerCase()
                          );
                          return translation?.name ?? t('Unknown');
                        }),
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
          width: '100%',
          // pr: { xs: 2.5, md: 1 },
        }}
      >
        <Grid
          item
          xs={12}
          sm={12}
          md={12}
          sx={{
            p: 2.5,
            width: '100%',
            // pr: { xs: 2.5, md: 1 },
          }}
        >
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
      </Stack>
    </Stack>
  );

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
      <Grid
        item
        xs={12}
        sm={12}
        md={12}
        sx={{
          p: 2.5,
          width: '100%',
          // pr: { xs: 2.5, md: 1 },
        }}
      >
        <Typography sx={{ fontWeight: '800' }}>{t('user_preferences')}</Typography>

        <Scrollbar>
          <Stack spacing={1} alignItems="flex-start" sx={{ typography: 'body2', pb: 1 }}>
            {[
              {
                label: t('city'),
                value: (() => {
                  const translations = details?.user_preference?.city?.city_translations;
                  if (Array.isArray(translations) && translations.length > 0) {
                    const matched = translations.find(
                      (tr) => tr?.locale?.toLowerCase() === i18n.language.toLowerCase()
                    );
                    return matched?.name || translations[0]?.name || t('unknown');
                  }
                  return t('unknown');
                })(),
              },
              {
                label: t('area'),
                value: (() => {
                  const translations = details?.user_preference?.state_province?.translations;
                  if (Array.isArray(translations) && translations.length > 0) {
                    const matched = translations.find(
                      (tr) => tr?.locale?.toLowerCase() === i18n.language.toLowerCase()
                    );
                    return matched?.name || translations[0]?.name || t('unknown');
                  }
                  return t('unknown');
                })(),
              },

              { label: t('gear'), value: details?.user_preference?.gear ?? t('n/a') },
              { label: t('gender'), value: details?.user_preference?.gender ?? t('n/a') },

              {
                label: t('vehicle_type'),
                value:
                  details?.user_preference?.vehicle_type?.category_translations?.find(
                    (tr) => tr?.locale?.toLowerCase() === i18n.language?.toLowerCase()
                  )?.name ||
                  details?.user_preference?.vehicle_type?.category_translations?.[0]?.name ||
                  t('unknown'),
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
          <Grid xs={12} md={12}>
            {details && currentTab === 'details' && renderContent}
          </Grid>

          {details.user_type !== 'TRAINER' && currentTab === 'details' && renderUserPreferences}
          {details?.user_type === 'TRAINER' && currentTab === 'bank-details' && (
            <BankDetailsCard details={details} t={t} reload={reload} />
          )}
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
