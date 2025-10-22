/* eslint-disable no-nested-ternary */
import React, { useCallback, useEffect, useState } from 'react';
import moment from 'moment';
import isEqual from 'lodash/isEqual';
import { useLocation } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Grid,
  Button,
  Stepper,
  Step,
  StepLabel,
  IconButton,
  InputAdornment,
  TextField,
  MenuItem,
  Select,
  FormControl,
  useMediaQuery,
  Avatar,
  Divider,
  Stack,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import {
  createBooking,
  useGetStudentList,
  useGetTrainerList,
  useGetTrainerPackageList,
} from 'src/api/assistant';
import StudentStep from './select-student';
import SessionStep from './select-session';
import TrainerSelectStep from './select-trainer';
import PackageCard from './select-package';
import { useGetPackages, useGetTrainers } from 'src/api/enum';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
import AddressSelector from './select-pick-up-location';
import TrainerFilters from './trainer-filters';
import { useBoolean } from 'src/hooks/use-boolean';
import { IUserTableFilterValue } from 'src/types/user';
import { useTable } from 'src/components/table';
import { useGetGearEnum } from 'src/api/users';
import TrainerPaymentDetails from './payment-details';
import { useSnackbar } from 'src/components/snackbar';

const ACCENT = '#ff6b00';
const SIDEBAR_BG = '#0d0d0d';
const CARD_RADIUS = 2;

const defaultFilters = {
  city_id: '',
  vehicle_type_id: { label: '', value: '' },
  gear: '',
  vendor_id: { label: '', value: '' },
};

export default function CreateBookingLayout() {
  // ----- state (same as original) -----
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedTrainer, setSelectedTrainer] = useState(null);
  const [txnId, setTxnId] = useState('');
  const [remarks, setRemarks] = useState('');
  const [paymentProof, setPaymentProof] = useState(null);
  const [searchTermStudent, setSearchTermStudent] = useState('');
  const [isPickUpEnabled, setIsPickupEnabled] = useState('');

  const [searchTermTrainer, setSearchTermTrainer] = useState('');
  const [sessions, setSessions] = useState([{ start_time: '', end_time: '', session_no: [1, 2] }]);
  const [pickupLocation, setPickupLocation] = useState(null);
  const [pickupLocationSelected, setPickupLocationSelected] = useState(null);
  const [loadingBooking, setLoadingBooking] = useState(false);
  const table = useTable({ defaultRowsPerPage: 3 });
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const openFilters = useBoolean();
  const [filters, setFilters] = useState(defaultFilters);
  const initialStep = parseInt(searchParams.get('step') || '0', 10);
  const preselectedTrainerId = parseInt(searchParams.get('trainerId') || '', 10);
  const preselectedPackageId = parseInt(searchParams.get('packageId') || '', 10);
  const [activeStep, setActiveStep] = useState(initialStep);
  const [selectedTrainerId, setSelectedTrainerId] = useState(
    Number.isNaN(preselectedTrainerId) ? null : preselectedTrainerId
  );
  const [paymentMode, setPaymentMode] = useState('ONLINE');
  const [couponCode, setCouponCode] = useState(false);
  const [selectedPackageId, setSelectedPackageId] = useState(
    Number.isNaN(preselectedPackageId) ? null : preselectedPackageId
  );

  const { i18n, t } = useTranslation();
  const steps = [
    t('select_trainer'),
    t('select_package'),
    t('select_student'),
    t('schedule_sessions'),
    t('select_location'),
    t('payment'),
  ];
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();

  // ----- external data hooks -----
  const { students, studentListLoading } = useGetStudentList({
    page: 0,
    limit: 1000,
    search: searchTermStudent,
  });
  const { gearData, gearLoading } = useGetGearEnum();

  const { trainers, trainerListLoading } = useGetTrainerList({
    page: 0,
    limit: 1000,
    search: searchTermTrainer,
    has_package: 1,
    ...(filters.vendor_id?.value ? { vendor_id: filters.vendor_id.value } : {}),
    ...(filters.vehicle_type_id?.value ? { vehicle_type_id: filters.vehicle_type_id.value } : {}),
    ...(filters.gear !== '' && gearData?.length
      ? { gear: gearData.find((g) => g.name === filters.gear)?.value }
      : {}),
    ...(filters.city_id ? { city_id: filters.city_id } : {}),
  });

  const { trainerPackages, trainerPackageLoading } = useGetTrainerPackageList({
    page: 0,
    limit: 10,
    trainer_id: selectedTrainerId,
  });

  // ----- effects kept from original -----
  useEffect(() => {
    if (initialStep >= 2 && preselectedTrainerId && preselectedPackageId) {
      setActiveStep(initialStep);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialStep, preselectedTrainerId, preselectedPackageId]);

  useEffect(() => {
    if (trainerPackages.length > 0 && preselectedPackageId && !selectedPackageId) {
      const foundPkg = trainerPackages.find((pkg) => pkg.id === preselectedPackageId);
      if (foundPkg) {
        setSelectedPackageId(foundPkg);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trainerPackages, preselectedPackageId]);

  useEffect(() => {
    if (selectedStudent && selectedStudent.user_addresses) {
      setPickupLocation(selectedStudent.user_addresses);
    }
  }, [selectedStudent]);

  // ----- session helpers -----
  const addSession = () => {
    const totalSessions = sessions.length;
    const lastSessionNo = totalSessions * 2;
    const newSession = {
      start_time: '',
      end_time: '',
      session_no: [lastSessionNo + 1, lastSessionNo + 2],
    };
    setSessions([...sessions, newSession]);
  };
  const removeSession = (index) => {
    const updated = sessions
      .filter((_, i) => i !== index)
      .map((session, idx) => ({
        ...session,
        session_no: [idx * 2 + 1, idx * 2 + 2],
      }));
    setSessions(updated);
  };

  // ----- navigation -----
  const handleNext = () => {
    switch (activeStep) {
      case 0:
        if (!selectedTrainerId) {
          enqueueSnackbar(t('select_trainer_error'), { variant: 'error' });
          return;
        }
        break;
      case 1:
        if (!selectedPackageId) {
          enqueueSnackbar(t('select_package_error'), { variant: 'error' });
          return;
        }
        break;
      case 2:
        if (!selectedStudentId) {
          enqueueSnackbar(t('select_student_error'), { variant: 'error' });
          return;
        }
        break;
      case 3:
        {
          const allSessionsValid = sessions.every((session) => session.start_time && session.end_time);
          if (!allSessionsValid) {
            enqueueSnackbar(t('select_sessions_error'), { variant: 'error' });
            return;
          }
        }
        break;
      default:
        break;
    }
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
    setPickupLocationSelected(null);
  };

  const handleSelectStudent = (id) => {
    setSelectedStudentId(id);
    setActiveStep((prev) => prev + 1);
  };
  const handleSelecTrainer = (id) => {
    setSelectedTrainerId(id);
    setActiveStep((prev) => prev + 1);
  };

  const packages = [
    { value: 'trial', label: 'Trial', gradient: 'linear-gradient(to right, #1E1E1E, #292929)' },
    { value: 'bronze', label: 'Bronze', gradient: 'linear-gradient(to right, #CD7F32, #000000)' },
    { value: 'silver', label: 'Silver', gradient: 'linear-gradient(to right, #8E8E8E, #000000)' },
    { value: 'gold', label: 'Gold', gradient: 'linear-gradient(to right, #FFB000, #000000)' },
    { value: 'unlimited', label: 'Unlimited', gradient: 'linear-gradient(to right, #7B156D, #3B0033)' },
  ];

  const getCardBackground = (index) => packages[index]?.gradient || '#111';

  const handlePackageSelect = (pkg) => {
    setSelectedPackageId(pkg);
    setActiveStep((prev) => prev + 1);
  };

  const handleFilters = useCallback(
    (name, value) => {
      table.onResetPage();
      setFilters((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    },
    [table]
  );

  // ----- create booking (same as original) -----
  const createBookingStudent = async (event) => {
    setLoadingBooking(true);

    try {
      const formData = new FormData();
      formData.append('student_id', selectedStudentId?.toString());
      formData.append('trainer_id', selectedTrainerId?.toString());
      formData.append('mode_of_payment', paymentMode);
      if (couponCode) formData.append('coupon_code', couponCode);

      formData.append(
        'package_id',
        (initialStep >= 2 ? selectedPackageId : selectedPackageId?.package_id).toString()
      );
      if (pickupLocationSelected) {
        formData.append('pickup_location', pickupLocationSelected);
      }

      sessions.forEach(({ start_time, end_time, session_no }, index) => {
        const formattedStart = moment(start_time).format('YYYY-MM-DD HH:mm');
        const datePart = moment(start_time).format('YYYY-MM-DD');
        const formattedEnd = moment(`${datePart} ${end_time}`, 'YYYY-MM-DD HH:mm').format('HH:mm');

        formData.append(`sessions[${index}][start_time]`, formattedStart);
        formData.append(`sessions[${index}][end_time]`, formattedEnd);
        if (Array.isArray(session_no)) {
          session_no.forEach((no) => {
            formData.append(`sessions[${index}][session_no][]`, no.toString());
          });
        } else {
          formData.append(`sessions[${index}][session_no][]`, session_no.toString());
        }
      });

      if (remarks) formData.append('remarks', remarks);
      if (txnId) formData.append('txn_id', txnId);

      const response = await createBooking(formData);

      if (response.status === 'success') {
        enqueueSnackbar(t('booking_created_success'), { variant: 'success' });
        router.push(paths.dashboard.assistant.booking.list);
      }
    } catch (error) {
      const errorDetails = error?.message?.errors;

      if (errorDetails && typeof errorDetails === 'object' && !Array.isArray(errorDetails)) {
        Object.values(errorDetails).forEach((errorMessage) => {
          if (Array.isArray(errorMessage)) {
            enqueueSnackbar(errorMessage[0], { variant: 'error' });
          } else {
            enqueueSnackbar(errorMessage, { variant: 'error' });
          }
        });
      } else {
        enqueueSnackbar(error.message || t('server_error'), { variant: 'error' });
      }
    } finally {
      setLoadingBooking(false);
    }
  };

  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);
  const canReset = !isEqual(defaultFilters, filters);

  // ----- Updated filters UI with TrainerFilters button from previous code -----
  const renderFilters = (
    <Stack
      spacing={2}
      direction="row"
      alignItems="center"
      justifyContent="flex-end"
      sx={{ width: '100%' }}
    >
      <TrainerFilters
        open={openFilters.value}
        onOpen={openFilters.onTrue}
        onClose={openFilters.onFalse}
        filters={filters}
        onFilters={handleFilters}
        canReset={canReset}
        onResetFilters={handleResetFilters}
      />
    </Stack>
  );

  // ----- step content renderer (keeps your children) -----
  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box>
            <TrainerSelectStep
              trainers={trainers}
              selectedTrainerId={selectedTrainerId}
              setSelectedTrainerId={handleSelecTrainer}
              isLoading={trainerListLoading}
              setSearchTerm={setSearchTermTrainer}
              searchTerm={searchTermTrainer}
              renderFilters={renderFilters}
              setSelectedTrainer={setSelectedTrainer}
            />
          </Box>
        );
      case 1:
        return trainerPackageLoading ? (
          <Box textAlign="center" py={6}>
            <CircularProgress />
            <Typography mt={2}>{t('loading_packages')}</Typography>
          </Box>
        ) : trainerPackages.length > 0 ? (
          <Grid container spacing={2}>
            {trainerPackages.map((pkg, index) => {
              const translation = pkg?.package?.package_translations?.find(
                (tr) => tr.locale.toLowerCase() === i18n.language.toLowerCase()
              );
              const sessionFeature =
                pkg.package?.number_of_sessions === -1
                  ? t('unlimited_driving_sessions')
                  : `${pkg.package?.number_of_sessions} ${t('driving_sessions')}`;

              return (
                <Grid item xs={12} sm={6} md={4} key={pkg.id}>
                  <PackageCard
                    title={translation?.name || t('n/a')}
                    sessions={pkg.package?.number_of_sessions}
                    price={pkg.price}
                    offerDetails={pkg.package_offer_detail}
                    features={translation?.session_inclusions}
                    flagUrl={pkg.flag?.virtual_path}
                    onSelect={() => handlePackageSelect(pkg)}
                    background={getCardBackground(index)}
                    selected={pkg.package_id === selectedPackageId}
                  />
                </Grid>
              );
            })}
          </Grid>
        ) : (
          <Box textAlign="center" py={6} border="1px dashed #999" borderRadius={2} color="gray">
            <Typography variant="h6">{t('no_packages_available_for_trainer')}</Typography>
          </Box>
        );

      case 2:
        return (
          <StudentStep
            students={students}
            selectedStudentId={selectedStudentId}
            isLoading={studentListLoading}
            setSearchTerm={setSearchTermStudent}
            searchTerm={searchTermStudent}
            setSelectedStudentId={handleSelectStudent}
            setSelectedStudent={setSelectedStudent}
          />
        );

      case 3:
        return (
          <SessionStep
            sessions={sessions}
            handleSessionChange={(i, k, v) => {
              const updated = [...sessions];
              updated[i][k] = v;
              setSessions(updated);
            }}
            addSession={addSession}
            removeSession={removeSession}
            driverId={selectedTrainerId}
            handleNext={handleNext}
            setIsPickupEnabled={setIsPickupEnabled}
          />
        );

      case 4:
        return (
          <AddressSelector
            locations={Array.isArray(pickupLocation) ? pickupLocation : []}
            setPickupLocation={setPickupLocation}
            setPickupLocationSelected={setPickupLocationSelected}
            pickupLocationSelected={pickupLocationSelected}
            selectedTrainer={selectedTrainer}
            isPickUpEnabled={isPickUpEnabled}
            paymentMode={paymentMode}
            setPaymentMode={setPaymentMode}
          />
        );

      case 5:
        return (
          <TrainerPaymentDetails
            paymentMode={paymentMode}
            txnId={txnId}
            setTxnId={setTxnId}
            remarks={remarks}
            setRemarks={setRemarks}
            paymentProof={paymentProof}
            setPaymentProof={setPaymentProof}
            trainerId={selectedTrainerId}
            studentId={selectedStudentId}
            packageId={selectedPackageId?.package_id || selectedPackageId}
            couponCode={couponCode}
            setCouponCode={setCouponCode}
            pickupLocationSelected={pickupLocationSelected}
            setActiveStep={setActiveStep}
          />
        );

      default:
        return null;
    }
  };

  // ----- responsive layout decisions -----
  const isSmall = useMediaQuery((theme) => theme.breakpoints.down('md'));

  // ----- UPDATED profile block for sidebar -----
  const ProfileBlock = () => {
    const getInitials = (name) => {
      if (!name) return 'CB';
      return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    };

    // Check if trainer is selected
    if (selectedTrainer && selectedTrainer.user) {
      const trainerName =
        i18n.language === 'ar'
          ? selectedTrainer.user.name_ar || selectedTrainer.user.name
          : selectedTrainer.user.name;
      const photoUrl = selectedTrainer.user.photo_url || selectedTrainer.avatarUrl;

      return (
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
          <Avatar
            src={photoUrl}
            sx={{
              width: 64,
              height: 64,
              bgcolor: '#ff6b35',
              fontSize: 20,
              fontWeight: 700,
              border: '3px solid rgba(255, 107, 53, 0.2)',
            }}
          >
            {getInitials(trainerName)}
          </Avatar>
          <Box>
            <Typography sx={{ color: '#fff', fontWeight: 600, fontSize: 15 }}>
              {trainerName || 'N/A'}
            </Typography>
            <Typography sx={{ color: '#bbb', fontSize: 11, mb: 0.5 }}>
              {t('Selected Trainer') || 'Selected Trainer'}
            </Typography>
            <Typography sx={{ color: '#ff6b35', fontSize: 10, fontWeight: 600 }}>
              ✓ {t('confirmed') || 'CONFIRMED'}
            </Typography>
          </Box>
        </Box>
      );
    }

    // Default state - no trainer selected
    return (
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
        <Avatar sx={{ width: 64, height: 64, bgcolor: '#222' }}>
          <Typography sx={{ fontSize: 24, fontWeight: 700 }}>CB</Typography>
        </Avatar>
        <Box>
          <Typography sx={{ color: '#fff', fontWeight: 600 }}>Create Booking</Typography>
          <Typography sx={{ color: '#bbb', fontSize: 12 }}>Assistant panel</Typography>
        </Box>
      </Box>
    );
  };

return (
  <Box sx={{ display: 'flex', minHeight: '100vh', position: 'relative' }}>
    {/* SIDEBAR - Fixed with all content visible */}
    <Box
      sx={{
        width: { xs: '100%', md: '400px', lg: '360px' }, // Fixed width for better control
        position: { xs: 'relative', md: 'fixed' },


        height: { xs: 'auto', md: 'calc(100vh - 40px)' }, // Full height minus padding
        p: { xs: 2, md: 2 },
        display: 'flex',
        flexDirection: 'column',
        zIndex: 100,
        overflowY: { md: 'auto' }, // Allow sidebar to scroll if needed
        overflowX: 'hidden',
        '&::-webkit-scrollbar': {
          width: '6px',
        },
        '&::-webkit-scrollbar-track': {
          background: 'rgba(255,255,255,0.1)',
        },
        '&::-webkit-scrollbar-thumb': {
          background: 'rgba(255,255,255,0.3)',
          borderRadius: '3px',
        },
      }}
    >
      <Card
        sx={{
          bgcolor: SIDEBAR_BG,
          color: '#fff',
          borderRadius: CARD_RADIUS,
          p: 3,
          width: '100%',
          flex: '0 0 auto', // Don't grow or shrink
        }}
        elevation={6}
      >
        <CardContent sx={{ p: 0 }}>
          <ProfileBlock />
          <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)', mb: 2 }} />

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mb: 3,
              py: 1.5,
              px: 2,
              bgcolor: 'rgba(255,255,255,0.03)',
              borderRadius: 1.5,
            }}
          >
            <Typography sx={{ color: '#ccc', fontSize: 12, fontWeight: 500 }}>
              Progress
            </Typography>
            <Typography sx={{ color: ACCENT, fontWeight: 700, fontSize: 14 }}>
              {activeStep + 1}/{steps.length}
            </Typography>
          </Box>

          {/* vertical stepper - all visible */}
          <Stepper
            activeStep={activeStep}
            orientation="vertical"
            sx={{
              '.MuiStep-root': {
                padding: '16px 0',
                minHeight: '72px',
              },
              '.MuiStepLabel-root': {
                color: '#999',
                '& .Mui-active, & .Mui-completed': {
                  color: '#fff',
                },
              },
              '.MuiStepLabel-label': {
                fontSize: 13,
                fontWeight: 500,
              },
              '.MuiStepIcon-root': {
                width: 28,
                height: 28,
              },
              '.MuiStepConnector-root': {
                marginLeft: '14px',
              },
              '.MuiStepConnector-line': {
                borderColor: ACCENT,
                borderLeftStyle: 'dashed',
                borderLeftWidth: '2px',
                minHeight: '80px',
                borderImage: `repeating-linear-gradient(to bottom, ${ACCENT} 0, ${ACCENT} 8px, transparent 8px, transparent 16px) 1`,
              },
            }}
          >
            {steps.map((label, idx) => {
              const isCompleted = idx < activeStep;
              const isActive = idx === activeStep;
              const isClickable = isCompleted;

              return (
                <Step key={label}>
                  <StepLabel
                    onClick={() => isClickable && setActiveStep(idx)}
                    sx={{
                      cursor: isClickable ? 'pointer' : 'default',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      '& .MuiStepLabel-label': {
                        color: isActive ? '#fff' : isCompleted ? '#fff' : '#bbb',
                        fontWeight: isActive ? 600 : 400,
                      },
                      '.MuiStepIcon-root': {
                        color: isCompleted ? ACCENT : isActive ? ACCENT : 'rgba(255,255,255,0.12)',
                        border: isCompleted ? `2px solid ${ACCENT}` : 'none',
                        borderRadius: '50%',
                      },
                    }}
                  >
                    {label}
                  </StepLabel>
                </Step>
              );
            })}
          </Stepper>

          <Box sx={{ mt: 3 }}>
            <Typography sx={{ color: '#bbb', fontSize: 12, mb: 1 }}>Quick actions</Typography>
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                size="small"
                disabled={activeStep === 0}
                sx={{
                  color: '#fff',
                  borderColor: 'rgba(255,255,255,0.12)',
                  textTransform: 'none',
                  borderRadius: 2,
                  '&:disabled': {
                    color: 'rgba(255,255,255,0.3)',
                    borderColor: 'rgba(255,255,255,0.05)',
                  },
                }}
                onClick={handleBack}
              >
                Previous
              </Button>
              <Button
                variant="contained"
                size="small"
                disabled={activeStep === steps.length - 1}
                sx={{
                  bgcolor: ACCENT,
                  '&:hover': { bgcolor: ACCENT },
                  textTransform: 'none',
                  borderRadius: 2,
                  '&:disabled': {
                    bgcolor: 'rgba(255, 107, 0, 0.3)',
                  },
                }}
                onClick={handleNext}
              >
                Next
              </Button>
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </Box>

    {/* MAIN CONTENT - With single scrollbar */}
    <Box
      sx={{
        flex: 1,
        ml: { xs: 0, md: '440px', lg: '400px' }, // Leave space for fixed sidebar
        minHeight: '100vh',
        p: { xs: 2, md: 4 },
      }}
    >
      <Card sx={{ borderRadius: CARD_RADIUS, p: { xs: 2, md: 3 }, minHeight: 520 }} elevation={2}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {steps[activeStep]}
            </Typography>
            <Typography sx={{ color: 'text.secondary', fontSize: 13 }}>
              {'Follow the steps to create a booking'}
            </Typography>
          </Box>

          {/* Filter button shown only on trainer step */}
          {activeStep === 0 && (
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              {renderFilters}
            </Box>
          )}
        </Box>

        <Divider sx={{ mb: 2 }} />

        <Box sx={{ minHeight: 300 }}>{renderStepContent()}</Box>

        {/* bottom actions */}
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button
            variant="text"
            startIcon={<ArrowBackIosNewIcon sx={{ fontSize: 14 }} />}
            onClick={handleBack}
            disabled={activeStep === 0}
            sx={{
              color: activeStep === 0 ? 'grey.400' : 'text.primary',
              textTransform: 'none',
            }}
          >
            {t('back')}
          </Button>

          <Box sx={{ display: 'flex', gap: 1 }}>
            {activeStep < steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleNext}
                endIcon={<ArrowForwardIosIcon sx={{ fontSize: 14 }} />}
                sx={{
                  bgcolor: ACCENT,
                  '&:hover': { bgcolor: ACCENT },
                  textTransform: 'none',
                  borderRadius: 2,
                  px: 3,
                }}
              >
                {t('next')}
              </Button>
            ) : (
              <Button
                variant="contained"
                color="primary"
                onClick={createBookingStudent}
                sx={{
                  bgcolor: ACCENT,
                  '&:hover': { bgcolor: ACCENT },
                  textTransform: 'none',
                  borderRadius: 2,
                  px: 4,
                }}
              >
                {t('submit')}
              </Button>
            )}
          </Box>
        </Box>
      </Card>
    </Box>

    {/* Loader Dialog */}
    {loadingBooking && (
      <Box
        sx={{
          position: 'fixed',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: (theme) => theme.zIndex.modal + 10,
        }}
      >
        <Card sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
          <CircularProgress />
          <Typography sx={{ mt: 2 }}>{t('booking_in_progress')}</Typography>
        </Card>
      </Box>
    )}
  </Box>
);
}
