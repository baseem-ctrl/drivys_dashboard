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
  MenuItem,
  Dialog,
  DialogContent,
  Select,
  InputLabel,
  FormControl,
  TextField,
  Popover,
  Stack,
} from '@mui/material';
import {
  createBooking,
  useGetStudentList,
  useGetTrainerList,
  useGetTrainerPackageList,
} from 'src/api/assistant';
import StudentStep from './select-student';
import { useSnackbar } from 'src/components/snackbar';

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
import PaymentDetails from './payment-details';
import TrainerPaymentDetails from './payment-details';

const defaultFilters: any = {
  city_id: '',
  vehicle_type_id: { label: '', value: '' },
  gear: '',
  vendor_id: { label: '', value: '' },
};

export default function CreateBooking() {
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);
  const [selectedTrainer, setSelectedTrainer] = useState<number | null>(null);
  const [txnId, setTxnId] = useState('');
  const [remarks, setRemarks] = useState('');
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [searchTermStudent, setSearchTermStudent] = useState('');
  const [isPickUpEnabled, setIsPickupEnabled] = useState('');

  const [searchTermTrainer, setSearchTermTrainer] = useState('');
  const [sessions, setSessions] = useState([{ start_time: '', end_time: '', session_no: [1, 2] }]);
  const [pickupLocation, setPickupLocation] = useState<number | null>(null);
  const [pickupLocationSelected, setPickupLocationSelected] = useState<number | null>(null);
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
  const [selectedTrainerId, setSelectedTrainerId] = useState<number | null>(
    Number.isNaN(preselectedTrainerId) ? null : preselectedTrainerId
  );
  const [paymentMode, setPaymentMode] = useState<'CASH' | 'ONLINE' | null>('ONLINE');
  const [couponCode, setCouponCode] = useState(false);

  const [selectedPackageId, setSelectedPackageId] = useState<number | null>(
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
      ? { gear: gearData.find((g: any) => g.name === filters.gear)?.value }
      : {}),
    ...(filters.city_id ? { city_id: filters.city_id } : {}),
  });

  const { trainerPackages, trainerPackageLoading } = useGetTrainerPackageList({
    page: 0,
    limit: 10,
    trainer_id: selectedTrainerId,
  });

  const handleSessionChange = (index: number, key: string, value: string | number[]) => {
    const updatedSessions = [...sessions];
    updatedSessions[index][key as keyof (typeof updatedSessions)[number]] = value;
    setSessions(updatedSessions);
  };

  useEffect(() => {
    if (initialStep >= 2 && preselectedTrainerId && preselectedPackageId) {
      setActiveStep(initialStep);
    }
  }, [initialStep, preselectedTrainerId, preselectedPackageId]);

  useEffect(() => {
    if (trainerPackages.length > 0 && preselectedPackageId && !selectedPackageId) {
      const foundPkg = trainerPackages.find((pkg) => pkg.id === preselectedPackageId);
      if (foundPkg) {
        setSelectedPackageId(foundPkg);
      }
    }
  }, [trainerPackages, preselectedPackageId]);

  useEffect(() => {
    if (selectedStudent && selectedStudent.user_addresses) {
      setPickupLocation(selectedStudent.user_addresses);
    }
  }, [selectedStudent]);

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
  const removeSession = (index: number) => {
    const updated = sessions
      .filter((_, i) => i !== index)
      .map((session, idx) => ({
        ...session,
        session_no: [idx * 2 + 1, idx * 2 + 2],
      }));
    setSessions(updated);
  };
  const handleNext = () => {
    switch (activeStep) {
      case 0:
        if (!selectedStudentId) {
          enqueueSnackbar(t('select_student_error'), { variant: 'error' });
          return;
        }
        break;
      case 1:
        if (!selectedTrainerId) {
          enqueueSnackbar(t('select_trainer_error'), { variant: 'error' });
          return;
        }
        break;
      case 2:
        if (!selectedPackageId) {
          enqueueSnackbar(t('select_package_error'), { variant: 'error' });
          return;
        }
        break;
      case 3:
        const allSessionsValid = sessions.every(
          (session) => session.start_time && session.end_time
        );
        if (!allSessionsValid) {
          enqueueSnackbar(t('select_sessions_error'), { variant: 'error' });
          return;
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
  console.log('pick up locstion', pickupLocationSelected);

  const handleSelectStudent = (id: number) => {
    setSelectedStudentId(id);
    setActiveStep((prev) => prev + 1);
  };
  const handleSelecTrainer = (id: number) => {
    setSelectedTrainerId(id);
    setActiveStep((prev) => prev + 1);
  };
  const packages = [
    {
      value: 'trial',
      label: 'Trial',
      gradient: 'linear-gradient(to right, #1E1E1E, #292929)',
    },
    {
      value: 'bronze',
      label: 'Bronze',
      gradient: 'linear-gradient(to right, #CD7F32, #000000)',
    },
    {
      value: 'silver',
      label: 'Silver',
      gradient: 'linear-gradient(to right, #8E8E8E, #000000)',
    },
    {
      value: 'gold',
      label: 'Gold',
      gradient: 'linear-gradient(to right, #FFB000, #000000)',
    },
    {
      value: 'unlimited',
      label: 'Unlimited',
      gradient: 'linear-gradient(to right, #7B156D, #3B0033)',
    },
  ];

  const getCardBackground = (index: number) => {
    return packages[index]?.gradient || '#111';
  };

  const handlePackageSelect = (pkg: any) => {
    setSelectedPackageId(pkg);
    setActiveStep((prev) => prev + 1);
  };
  const handleFilters = useCallback(
    (name: string, value: IUserTableFilterValue) => {
      table.onResetPage();
      setFilters((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    },
    [table]
  );
  const createBookingStudent = async (event: React.MouseEvent<HTMLButtonElement>) => {
    setLoadingBooking(true);

    try {
      const formData = new FormData();
      console.log('pickupLocationSelected', pickupLocationSelected);
      formData.append('student_id', selectedStudentId.toString());
      formData.append('trainer_id', selectedTrainerId.toString());
      formData.append('mode_of_payment', paymentMode);
      formData.append('coupon_code', couponCode);

      formData.append(
        'package_id',
        (initialStep >= 2 ? selectedPackageId : selectedPackageId?.package_id).toString()
      );
      if (pickupLocationSelected) {
        formData.append('pickup_location', pickupLocationSelected);
      }

      // formData.append('is_paid', paymentProof ? '1' : '0');

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

      // if (paymentProof) {
      //   formData.append('payment_proof', paymentProof); // binary file
      // }

      if (remarks) formData.append('remarks', remarks);
      if (txnId) formData.append('txn_id', txnId);

      const response = await createBooking(formData);

      if (response.status === 'success') {
        enqueueSnackbar(t('booking_created_success'), { variant: 'success' });
        router.push(paths.dashboard.assistant.booking.list);
      }
    } catch (error: any) {
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

  const renderFilters = (
    <Stack
      spacing={3}
      justifyContent="flex-end"
      alignItems={{ xs: 'flex-end', sm: 'center' }}
      direction={{ xs: 'column', sm: 'row' }}
      margin={3}
    >
      <Stack direction="row" spacing={1} flexShrink={0}>
        <TrainerFilters
          open={openFilters.value}
          onOpen={openFilters.onTrue}
          onClose={openFilters.onFalse}
          //
          filters={filters}
          onFilters={handleFilters}
          //
          canReset={canReset}
          onResetFilters={handleResetFilters}
        />
      </Stack>
    </Stack>
  );

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <>
            {' '}
            {/* {renderFilters} */}
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
          </>
        );
      case 1:
        return (
          <Box>
            {trainerPackageLoading ? (
              <Box textAlign="center" py={5}>
                <CircularProgress />
                <Typography mt={2}>{t('loading_packages')}</Typography>
              </Box>
            ) : trainerPackages.length > 0 ? (
              <Box
                display="grid"
                gridTemplateColumns={{
                  xs: '1fr',
                  sm: '1fr 1fr',
                  md: '1fr 1fr 1fr',
                }}
                gap={3}
              >
                {trainerPackages.map((pkg: any, index: number) => {
                  const translation = pkg?.package?.package_translations?.find(
                    (t: any) => t.locale.toLowerCase() === i18n.language.toLowerCase()
                  );

                  return (
                    <PackageCard
                      key={pkg.id}
                      title={translation?.name || t('n/a')}
                      sessions={pkg.package?.number_of_sessions}
                      price={pkg.price}
                      features={[
                        pkg.package?.number_of_sessions === -1
                          ? t('unlimited_driving_sessions')
                          : `${pkg.package?.number_of_sessions} ${t('driving_sessions')}`,
                        t('booking_management'),
                        t('rescheduling_flexibility'),
                      ]}
                      flagUrl={pkg.flag?.virtual_path}
                      onSelect={() => handlePackageSelect(pkg)}
                      background={getCardBackground(index)}
                      selected={pkg.package_id === selectedPackageId}
                    />
                  );
                })}
              </Box>
            ) : (
              <Box textAlign="center" py={5} border="1px dashed #999" borderRadius={2} color="gray">
                <Typography variant="h6">{t('no_packages_available_for_trainer')}</Typography>
              </Box>
            )}
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
            handleSessionChange={handleSessionChange}
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
          />
        );
      default:
        return null;
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label, index) => (
          <Step key={label}>
            <StepLabel
              onClick={() => setActiveStep(index)}
              sx={{
                cursor: 'pointer',
                '& .MuiStepLabel-label': {
                  fontSize: '12px',
                  transition: 'color 0.3s',
                  '&:hover': {
                    color: 'primary.main',
                  },
                },
              }}
            >
              {label}
            </StepLabel>
          </Step>
        ))}
      </Stepper>

      {renderStepContent()}

      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
        <Button disabled={activeStep === 0} onClick={handleBack} variant="outlined">
          {t('back')}
        </Button>

        {activeStep === steps.length - 1 ? (
          <Button variant="contained" color="primary" onClick={(e) => createBookingStudent(e)}>
            {t('submit')}
          </Button>
        ) : (
          <Button variant="contained" onClick={handleNext} disabled={trainerPackages.length === 0}>
            {t('next')}
          </Button>
        )}
      </Box>
      <Dialog open={loadingBooking} PaperProps={{ sx: { textAlign: 'center', p: 4 } }}>
        <DialogContent>
          <Box display="flex" flexDirection="column" alignItems="center">
            <CircularProgress sx={{ mb: 2 }} />
            <Typography variant="body1">{t('booking_in_progress')}</Typography>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
