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
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

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
  Tooltip,
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
import { TRAINER_DETAILS_SCHOOL_ADMIN_TABS, TRAINER_DETAILS_TABS } from 'src/_mock/_trainer';
import TrainerDetailsContent from './school-admin-trainer-details-content';
import SchoolAdminTrainerDetailsContent from './school-admin-trainer-details-content';
import StudentDetailsContent from 'src/sections/user/student-details-content';
import moment from 'moment';
import { updateUserVerification } from 'src/api/school-admin';
import { useGetAllCity } from 'src/api/city';
import { useGetUserDocumentList } from 'src/api/user-document';
import { useGoogleMaps } from 'src/sections/overview/e-commerce/GoogleMapsProvider';
import TrainerWorkingHour from 'src/sections/user/trainer-working-hour';
import UserDocumentDetails from 'src/sections/user/user-document/user-document-details';
import BookingTrainerTable from 'src/sections/user/booking-details/trainer-booking-details';
import TrainerReviewsTable from 'src/sections/user/trainer-review-table';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import { useGetTrainerReview } from 'src/api/review-school-admin';
import { useAuthContext } from 'src/auth/hooks';
import { useTranslation } from 'react-i18next';
// ----------------------------------------------------------------------

type Props = {
  addresses: any;
  addressesLoading: any;
  details: any;
  loading?: any;
  reload?: any;
};

export default function UserDetailsContentAdmin({
  details,
  loading,
  reload,
  addresses,
  addressesLoading,
}: Props) {
  const [currentTab, setCurrentTab] = useState('details');
  const [load, setLoad] = useState(true);
  const { reset, control } = useForm();
  const [newAddress, setNewAddress] = useState(null); // state to store new stundet address
  const [showAll, setShowAll] = useState(false);
  const { user } = useAuthContext();
  const { t, i18n } = useTranslation();

  const handleChangeTab = useCallback((event: React.SyntheticEvent, newValue: string) => {
    setCurrentTab(newValue);
  }, []);
  const toggleShowAll = () => setShowAll((prev) => !prev);
  const displayedAddresses = showAll ? addresses : addresses.slice(0, 2);
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

  const handleVerify = async (e: any, user_id: string) => {
    // e.stopPropagation();
    try {
      const body = {
        trainer_id: details?.id,
        verify: 1,
      };
      const response = await updateUserVerification(body);
      if (response) {
        enqueueSnackbar(response?.message ?? 'Trainer Verified Successfully');
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
  const { trainerReviews, trainerReviewsLoading, revalidateTrainerReviews } = useGetTrainerReview({
    trainer_id: details?.user_type === 'TRAINER' ? details?.id : undefined,
    student_id: details?.user_type === 'STUDENT' ? details?.id : undefined,
  });
  const renderContent = (
    <Stack component={Card} spacing={3} sx={{ p: 3 }}>
      <Stack
        alignItems="end"
        sx={{
          width: '-webkit-fill-available',
          cursor: 'pointer',
          position: 'absolute',
          right: '1rem',
        }}
      ></Stack>

      <Stack
        spacing={1}
        alignItems={{ xs: 'center', md: 'center' }}
        direction={{ xs: 'column', md: 'row' }}
        sx={{ p: 2.5 }}
      >
        <Avatar
          alt={details?.name}
          src={details?.photo_url}
          sx={{ width: 300, height: 300, borderRadius: 2, mb: 2 }}
          variant="square"
        />

        <Grid item xs={12} sm={8} md={8}>
          <Scrollbar>
            <Stack spacing={1} alignItems="flex-start" sx={{ typography: 'body2', pb: 2 }}>
              {[
                {
                  label: t('name_as_per_profile_card'),
                  value: details?.name ?? t('n/a'),
                },
                {
                  label: t('name_as_per_profile_card_ar'),
                  value: details?.name_ar ?? t('n/a'),
                },
                {
                  label: t('name_as_per_profile_card_ur'),
                  value: details?.name_ur ?? t('n/a'),
                },
                { label: t('email'), value: details?.email ?? t('n/a') },
                {
                  label: t('phone_number'),
                  value: details?.country_code
                    ? `${details?.country_code}-${details?.phone}`
                    : details?.phone ?? t('n/a'),
                },
                { label: t('user_type'), value: details?.user_type ?? t('n/a') },
                { label: t('preferred_language'), value: details?.locale ?? t('n/a') },
                { label: t('wallet_balance'), value: details?.wallet_balance ?? t('n/a') },
                { label: t('wallet_points'), value: details?.wallet_points ?? t('n/a') },
                ...(details?.languages?.length
                  ? details.languages.map((lang, index) => ({
                      label: `${t('language')} ${index + 1}`,
                      value: lang?.dialect?.id
                        ? `${lang?.dialect?.language_name} (${lang?.dialect?.dialect_name}) - ${lang?.fluency_level}`
                        : t('n/a'),
                    }))
                  : [{ label: t('languages'), value: t('n/a') }]),
                ...(details?.user_type === 'TRAINER'
                  ? [
                      {
                        label: t('school_commission'),
                        value:
                          details?.vendor_commission_in_percentage !== undefined
                            ? `${details.vendor_commission_in_percentage} %`
                            : t('n/a'),
                      },
                      {
                        label: t('certificate_commission'),
                        value:
                          details?.user_preference?.certificate_commission_in_percentage !==
                          undefined
                            ? `${details.user_preference.certificate_commission_in_percentage} %`
                            : t('n/a'),
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
                    {item.value}
                  </Box>
                </Box>
              ))}

              {details?.user_type === 'TRAINER' && trainerReviews?.[0]?.avg_rating && (
                <Box sx={{ display: 'flex', width: '100%' }}>
                  <Box component="span" sx={{ minWidth: '200px', fontWeight: 'bold' }}>
                    {t('average_review')}
                  </Box>
                  <Box component="span" sx={{ minWidth: '40px', fontWeight: 'bold' }}>
                    :
                  </Box>
                  <Box component="span" sx={{ flex: 1 }}>
                    <Box display="flex" alignItems="center">
                      {Array.from({ length: 5 }).map((_, index) =>
                        index < trainerReviews[0].avg_rating ? (
                          <StarIcon key={index} style={{ color: '#CF5A0D', marginRight: '4px' }} />
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
              )}
            </Stack>
          </Scrollbar>
        </Grid>
      </Stack>

      {/* Account Status */}
      <Stack
        spacing={1}
        alignItems={{ xs: 'center', md: 'center' }}
        direction={{ xs: 'column', md: 'row' }}
        sx={{ p: 2.5 }}
      >
        <Typography sx={{ fontWeight: '800', mb: '10px' }}>{t('account_status')}</Typography>

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
                        <Chip
                          label={details?.is_suspended ? t('yes') : t('no')}
                          color={details?.is_suspended ? 'error' : 'default'}
                          variant="soft"
                        />
                      ),
                    },
                    {
                      label: t('auto_suspended'),
                      tooltip: t('auto_suspended_tooltip'),
                      value: (
                        <Chip
                          label={
                            details?.max_cash_in_hand_allowed &&
                            details?.cash_in_hand >= details?.max_cash_in_hand_allowed
                              ? t('yes')
                              : t('no')
                          }
                          color={
                            details?.max_cash_in_hand_allowed &&
                            details?.cash_in_hand >= details?.max_cash_in_hand_allowed
                              ? 'error'
                              : 'default'
                          }
                          variant="soft"
                        />
                      ),
                    },
                    {
                      label: t('school_verification'),
                      tooltip: t('school_verification_tooltip'),
                      value: !details?.school_verified_at ? (
                        <Box display="flex" alignItems="center" gap={2}>
                          <Chip
                            label={t('not_verified')}
                            color="error"
                            icon={<ErrorOutlineIcon />}
                            variant="outlined"
                            sx={{ fontWeight: 'bold' }}
                          />
                          <Button
                            variant="contained"
                            color="primary"
                            startIcon={<CheckCircleIcon />}
                            onClick={handleVerify}
                          >
                            {t('verify')}
                          </Button>
                        </Box>
                      ) : (
                        <Chip
                          label={`${t('verified_on')} ${moment
                            .utc(details?.school_verified_at)
                            .format('ll')}`}
                          color="success"
                          icon={<CheckCircleIcon />}
                          variant="outlined"
                          sx={{ fontWeight: 'bold' }}
                        />
                      ),
                    },
                    {
                      label: t('admin_verification'),
                      tooltip: t('admin_verification_tooltip'),
                      value: !details?.verified_at ? (
                        <Box display="flex" alignItems="center" gap={2}>
                          <Chip
                            label={t('not_verified')}
                            color="error"
                            icon={<ErrorOutlineIcon />}
                            variant="outlined"
                            sx={{ fontWeight: 'bold' }}
                          />
                          <Button
                            variant="contained"
                            color="primary"
                            startIcon={<CheckCircleIcon />}
                            onClick={handleVerify}
                          >
                            {t('verify')}
                          </Button>
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
              ...(details?.is_active === false
                ? [
                    {
                      label: t('inActivereason'),
                      value: details?.status_text || t('n/a'),
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

        {/* Trainer's Financial Summary */}
        {details?.user_type === 'TRAINER' && (
          <Grid item xs={12} sm={12} md={6}>
            <Typography sx={{ fontWeight: '800', mb: '10px' }}>
              {t('school_financial_summary')}
            </Typography>
            <Scrollbar>
              <Stack spacing={1} alignItems="flex-start" sx={{ typography: 'body2', pb: 2 }}>
                {[
                  {
                    label: t('max_cash_allowed_in_hand'),
                    value: (
                      <>
                        <span className="dirham-symbol">&#x00EA;</span>{' '}
                        {details?.max_cash_in_hand_allowed ?? t('n/a')}
                      </>
                    ),
                  },
                  {
                    label: t('cash_in_hand'),
                    value: details?.cash_in_hand ? (
                      <>
                        <span className="dirham-symbol">&#x00EA;</span> {details.cash_in_hand}
                      </>
                    ) : (
                      t('n/a')
                    ),
                  },
                  {
                    label: t('cash_clearance_date'),
                    value: details?.cash_clearance_date ?? t('n/a'),
                  },
                  {
                    label: t('last_booking_at'),
                    value: details?.last_booking_was
                      ? new Intl.DateTimeFormat(i18n.language, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: 'numeric',
                        }).format(new Date(details.last_booking_was))
                      : t('n/a'),
                  },
                ].map((item, index) => (
                  <Box key={index} sx={{ display: 'flex', width: '100%' }}>
                    <Box component="span" sx={{ minWidth: '200px', fontWeight: 'bold', mt: 2 }}>
                      {item.label}
                    </Box>
                    <Box component="span" sx={{ minWidth: '30px', fontWeight: 'bold', mt: 2 }}>
                      :
                    </Box>
                    <Box component="span" sx={{ flex: 1, mt: 2 }}>
                      {item.value}
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

  const renderTabs = (
    <Tabs
      value={currentTab}
      onChange={handleChangeTab}
      sx={{
        mb: { xs: 3, md: 5 },
      }}
    >
      {TRAINER_DETAILS_SCHOOL_ADMIN_TABS.map((tab) => (
        <Tab key={tab.value} iconPosition="end" value={tab.value} label={t(tab.label)} />
      ))}
    </Tabs>
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
      <Grid item xs={12} sm={12} md={6}>
        <Typography sx={{ fontWeight: '800' }}>{t('user_preferences')}</Typography>

        <Scrollbar>
          <Stack spacing={1} alignItems="flex-start" sx={{ typography: 'body2', pb: 1 }}>
            {[
              {
                label: t('city'),
                value:
                  details?.user_preference?.city?.city_translations?.find(
                    (ct) => ct?.locale?.toLowerCase() === i18n.language.toLowerCase()
                  )?.name ?? t('n/a'),
              },
              {
                label: t('area'),
                value:
                  details?.user_preference?.state_province?.translations?.find(
                    (tr) => tr?.locale?.toLowerCase() === i18n.language.toLowerCase()
                  )?.name ?? t('n/a'),
              },
              {
                label: t('gear'),
                value: details?.user_preference?.gear ? t(details.user_preference.gear) : t('n/a'),
              },
              {
                label: t('gender'),
                value: details?.user_preference?.gender
                  ? t(details.user_preference.gender)
                  : t('n/a'),
              },

              {
                label: t('vehicle_type'),
                value:
                  details?.user_preference?.vehicle_type?.category_translations?.[0]?.name ??
                  t('n/a'),
              },
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
                  sx={{ minWidth: '100px', fontWeight: 'bold', marginTop: '10px' }}
                >
                  :
                </Box>
                <Box component="span" sx={{ flex: 1, marginTop: '10px' }}>
                  {item.value}
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
                  {
                    label: t('bank_name'),
                    value: details?.bank_detail[0]?.bank_name ?? t('n/a'),
                  },
                  {
                    label: t('iban'),
                    value: details?.bank_detail[0]?.iban_number ?? t('n/a'),
                  },
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
  const [showMapIndex, setShowMapIndex] = useState(null);
  const router = useRouter();
  const { isLoaded } = useGoogleMaps();
  const mapContainerStyle = useMemo(() => ({ height: '300px', width: '100%' }), []);
  const handleBookingClick = (booking) => {
    router.push(paths.dashboard.booking.details(booking));
  };
  const renderAddress = (
    <Stack component={Card} spacing={3} sx={{ p: 3, mt: 2 }}>
      <Scrollbar>
        {/* Form for Adding or Editing an Address */}
        <Stack spacing={4} alignItems="flex-start" sx={{ typography: 'body2', mt: 2 }}>
          {displayedAddresses.map((address, index) => (
            <Grid container spacing={3} key={index}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                  {t('address_details')} {index + 1}
                </Typography>

                {[
                  { label: t('address'), value: address?.address ?? t('n/a') },
                  { label: t('street'), value: address?.street ?? t('n/a') },
                  { label: t('building_name'), value: address?.building_name ?? t('n/a') },
                  {
                    label: t('city'),
                    value:
                      address?.city ??
                      address?.city_id_city?.city_translations?.find(
                        (ct) => ct?.locale?.toLowerCase() === i18n.language.toLowerCase()
                      )?.name ??
                      t('n/a'),
                  },
                  {
                    label: t('area'),
                    value:
                      address?.state_province?.translations?.find(
                        (tr) => tr?.locale?.toLowerCase() === i18n.language.toLowerCase()
                      )?.name ?? t('n/a'),
                  },
                  { label: t('country_code'), value: address?.country_code ?? t('n/a') },
                  { label: t('label'), value: address?.label ?? t('n/a') },
                  { label: t('phone_number'), value: address?.phone_number ?? t('n/a') },
                  { label: t('plot_number'), value: address?.plot_number ?? t('n/a') },
                  { label: t('country'), value: address?.country ?? t('n/a') },
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
              </Grid>

              <Grid item xs={12} md={6}>
                <Box sx={{ pt: 2, pb: 2 }}>
                  {isLoaded && load ? (
                    <GoogleMap
                      mapContainerStyle={mapContainerStyle}
                      center={{
                        lat: address?.latitude,
                        lng: address?.longitude,
                      }}
                      zoom={12}
                    >
                      {address?.latitude && address?.longitude && (
                        <Marker
                          position={{
                            lat: address?.latitude,
                            lng: address?.longitude,
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
          {details?.user_type === 'TRAINER' && renderTabs}
          <Grid container spacing={1} rowGap={1}>
            <Grid xs={12} md={12}>
              {/* For all other user types */}
              {details?.user_type !== 'TRAINER' && renderContent}

              {/* For trainer user type with 3 tabs */}
              {currentTab === 'details' && details?.user_type === 'TRAINER' && renderContent}
              {currentTab === 'packages' && details?.user_type === 'TRAINER' && (
                <SchoolAdminTrainerDetailsContent trainerDetails={details} />
              )}
              <Grid xs={12} md={12}>
                {details?.user_type === 'TRAINER' && currentTab === 'review' && (
                  <TrainerReviewsTable trainers={trainerReviews} user={user} />
                )}
              </Grid>
              {currentTab === 'students' && details?.user_type === 'TRAINER' && (
                <StudentDetailsContent id={details?.id} />
              )}
              {currentTab === 'working-hours' && details?.user_type === 'TRAINER' && (
                <TrainerWorkingHour userId={details?.id} details={details} />
              )}
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
                {details?.user_type === 'TRAINER' && currentTab === 'booking' && (
                  <BookingTrainerTable id={details?.id} handleBookingClick={handleBookingClick} />
                )}
              </Grid>
            </Grid>
            <Grid xs={12} md={12}>
              {details?.user_type === 'TRAINER' &&
                currentTab === 'details' &&
                renderUserPreferences}
            </Grid>
            <Grid xs={12} md={12}>
              {addresses?.length > 0 &&
                details?.user_type === 'TRAINER' &&
                currentTab === 'details' &&
                renderAddress}
            </Grid>
          </Grid>
        </>
      )}
    </>
  );
}
