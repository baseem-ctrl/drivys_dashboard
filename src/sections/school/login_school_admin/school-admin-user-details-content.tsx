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
import { useGetTrainerReview } from 'src/api/review';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
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
          // top: '1.5rem',
          right: '1rem',
        }}
      ></Stack>
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
                ...(details?.languages?.length
                  ? details?.languages.map((lang, index) => ({
                      label: `Language ${index + 1}`,
                      value: lang?.dialect?.id
                        ? `${lang?.dialect?.language_name} (${lang?.dialect?.dialect_name}) - ${lang?.fluency_level}`
                        : 'NA',
                    }))
                  : [{ label: 'Languages', value: 'N/A' }]),
                ...(details?.user_type === 'TRAINER'
                  ? [
                      {
                        label: 'School Commission',
                        value:
                          details?.vendor_commission_in_percentage !== undefined &&
                          details?.vendor_commission_in_percentage !== null
                            ? `${details.vendor_commission_in_percentage} %`
                            : 'N/A',
                      },
                      {
                        label: 'Certificate Commission',
                        value:
                          details?.user_preference?.certificate_commission_in_percentage !==
                            undefined &&
                          details?.user_preference?.certificate_commission_in_percentage !== null
                            ? `${details.user_preference.certificate_commission_in_percentage} %`
                            : 'N/A',
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
              {details?.user_type === 'TRAINER' &&
                trainerReviews &&
                trainerReviews[0]?.avg_rating && (
                  <Grid item xs={12} sm={12} md={6}>
                    <Box sx={{ display: 'flex', width: '100%' }}>
                      <Box component="span" sx={{ minWidth: '200px', fontWeight: 'bold' }}>
                        Average Review
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
          <Typography sx={{ fontWeight: '800', marginBottom: '10px' }}>Account Status</Typography>

          <Scrollbar>
            <Stack spacing={1} alignItems="flex-start" sx={{ typography: 'body2', pb: 2 }}>
              {[
                {
                  label: 'Active',
                  tooltip: 'Indicates if the user is currently active.',
                  value: (
                    <Chip
                      label={details?.is_active ? 'Yes' : 'No'}
                      color={details?.is_active ? 'success' : 'error'}
                      variant="soft"
                    />
                  ),
                },
                ...(details?.user_type === 'TRAINER'
                  ? [
                      {
                        label: 'Admin Suspended',
                        tooltip: 'Indicates if the trainer is suspended by an admin.',
                        value: (
                          <>
                            <Chip
                              label={details?.is_suspended ? 'Yes' : 'No'}
                              color={details?.is_suspended ? 'error' : 'default'}
                              variant="soft"
                            />
                          </>
                        ),
                      },
                      {
                        label: 'Auto Suspended',
                        tooltip:
                          'Indicates if the trainer is automatically suspended due to exceeding cash limits.',
                        value: (
                          <>
                            <Chip
                              label={
                                details?.max_cash_in_hand_allowed
                                  ? details?.cash_in_hand >= details?.max_cash_in_hand_allowed
                                    ? 'Yes'
                                    : 'No'
                                  : 'No'
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
                          </>
                        ),
                      },
                      {
                        label: 'School Verification',
                        tooltip:
                          'Indicates if the school has verified the user. Click "Verify" to verify.',
                        value: !details?.school_verified_at ? (
                          <Box display="flex" alignItems="center" gap={2}>
                            <Chip
                              label="Not Verified"
                              color="error"
                              icon={<ErrorOutlineIcon />}
                              variant="outlined"
                              sx={{ fontWeight: 'bold' }}
                            />
                            <Button
                              variant="contained"
                              color="primary"
                              startIcon={<CheckCircleIcon />}
                              sx={{ padding: '6px 16px', minWidth: '100px' }}
                              onClick={handleVerify}
                            >
                              Verify
                            </Button>
                          </Box>
                        ) : (
                          <Chip
                            label={`Verified on ${moment
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
                        label: 'Admin Verification',
                        tooltip:
                          'Indicates if the admin has verified the user. Displays the verification date if verified.',
                        value: !details?.verified_at ? (
                          <Box display="flex" alignItems="center" gap={2}>
                            <Chip
                              label="Not Verified"
                              color="error"
                              icon={<ErrorOutlineIcon />}
                              variant="outlined"
                              sx={{ fontWeight: 'bold' }}
                            />
                            <Button
                              variant="contained"
                              color="primary"
                              startIcon={<CheckCircleIcon />}
                              sx={{ padding: '6px 16px', minWidth: '100px' }}
                              onClick={handleVerify}
                            >
                              Verify
                            </Button>
                          </Box>
                        ) : (
                          <Chip
                            label={`Verified on ${moment.utc(details?.verified_at).format('ll')}`}
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
                    <Tooltip title={item?.tooltip || ''} arrow>
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
                    {item.value ?? 'N/A'}
                  </Box>
                </Box>
              ))}
            </Stack>
          </Scrollbar>
        </Grid>
        {details?.user_type === 'TRAINER' && (
          <Grid item xs={12} sm={12} md={6}>
            <Typography sx={{ fontWeight: '800', marginBottom: '10px' }}>
              School Financial Summary
            </Typography>
            <Scrollbar>
              <Stack spacing={1} alignItems="flex-start" sx={{ typography: 'body2', pb: 2 }}>
                {[
                  {
                    label: 'Max Cash Allowed in Hand',
                    value: details?.max_cash_in_hand_allowed ?? 'N/A',
                  },
                  { label: 'Cash in Hand', value: details?.cash_in_hand ?? 'N/A' },
                  {
                    label: 'Cash Clearance Date',
                    value: details?.cash_clearance_date ?? 'N/A',
                  },
                  {
                    label: 'Last Booking At',
                    value: details?.last_booking_was
                      ? moment.utc(details?.last_booking_was).format('lll')
                      : 'N/A',
                  },
                  ,
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
                      {item.value ?? 'N/A'}
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
  console.log('currentTab', currentTab);
  const renderTabs = (
    <Tabs
      value={currentTab}
      onChange={handleChangeTab}
      sx={{
        mb: { xs: 3, md: 5 },
      }}
    >
      {TRAINER_DETAILS_SCHOOL_ADMIN_TABS.map((tab) => (
        <Tab key={tab.value} iconPosition="end" value={tab.value} label={tab.label} />
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
        <Typography sx={{ fontWeight: '800' }}>User Preferences:</Typography>

        <Scrollbar>
          <Stack spacing={1} alignItems="flex-start" sx={{ typography: 'body2', pb: 1 }}>
            {[
              {
                label: 'City',
                value: details?.user_preference?.city?.city_translations[0]?.name ?? 'N/A',
              },
              {
                label: 'Area',
                value: details?.user_preference?.state_province?.translations[0]?.name ?? 'N/A',
              },
              { label: 'Gear', value: details?.user_preference?.gear ?? 'NA' },

              { label: 'Gender', value: details?.user_preference?.gender ?? 'NA' },

              {
                label: 'Vehicle type',
                value:
                  details?.user_preference?.vehicle_type?.category_translations[0]?.name ?? 'NA',
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
                  {item.value ?? 'N/A'}
                </Box>
                {/* <Box component="span">{loading ? 'Loading...' : item.value}</Box> */}
              </Box>
            ))}
          </Stack>
        </Scrollbar>
      </Grid>
      {currentTab === 'details' &&
        details?.bank_detail?.length > 0 &&
        details?.user_type === 'TRAINER' && (
          <Grid item xs={12} sm={12} md={6}>
            <Typography sx={{ fontWeight: '800' }}>Bank Details:</Typography>

            <Scrollbar>
              <Stack spacing={1} alignItems="flex-start" sx={{ typography: 'body2', pb: 1 }}>
                {[
                  {
                    label: 'Account Holder Name',
                    value: details?.bank_detail[0]?.account_holder_name ?? 'N/A',
                  },
                  {
                    label: 'Account Number',
                    value: details?.bank_detail[0]?.account_number ?? 'N/A',
                  },
                  { label: 'Bank Name', value: details?.bank_detail[0]?.bank_name ?? 'NA' },

                  { label: 'IBAN', value: details?.bank_detail[0]?.iban_number ?? 'NA' },

                  {
                    label: 'Active',
                    value: (
                      <Chip
                        label={details?.bank_detail[0]?.is_active ? 'Yes' : 'No'}
                        color={details?.bank_detail[0]?.is_active ? 'success' : 'error'}
                        variant="soft"
                      />
                    ),
                  },
                  ...(details?.user_type === 'STUDENT'
                    ? [
                        {
                          label: 'Trainer Language',
                          value: details?.preferred_trainer_lang?.language_name ?? 'NA',
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
                      {item.value ?? 'N/A'}
                    </Box>
                    {/* <Box component="span">{loading ? 'Loading...' : item.value}</Box> */}
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
                  Address Details {index + 1}
                </Typography>
                {/* Address Details */}
                {[
                  { label: 'Address', value: address?.address ?? 'N/A' },
                  { label: 'Street', value: address?.street ?? 'N/A' },
                  { label: 'Building Name', value: address?.building_name ?? 'N/A' },
                  {
                    label: 'City',
                    value:
                      address?.city ?? address?.city_id_city?.city_translations?.[0]?.name ?? 'N/A',
                  },
                  {
                    label: 'Area',
                    value: address?.state_province
                      ? address?.state_province?.translations?.[0]?.name
                      : 'N/A',
                  },
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
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ pt: 2, pb: 2 }}>
                  {isLoaded && load ? (
                    <GoogleMap
                      mapContainerStyle={mapContainerStyle}
                      center={{
                        lat: address?.latitude, // Ensure these properties exist on the address object
                        lng: address?.longitude,
                      }}
                      zoom={12}
                      // onClick={handleMapClick}
                    >
                      {address?.latitude && address?.longitude && (
                        <Marker
                          position={{
                            lat: address?.latitude, // Ensure these properties exist on the address object
                            lng: address?.longitude,
                          }}
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
                    <div>Loading Map...</div>
                  )}
                </Box>
              </Grid>
            </Grid>
          ))}
        </Stack>
        {addresses.length > 2 && (
          <Button variant="outlined" onClick={toggleShowAll}>
            {showAll ? 'Show Less' : 'Show More'}
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
                  <TrainerReviewsTable trainers={trainerReviews} />
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
