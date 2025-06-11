import React, { useEffect, useState } from 'react';
import moment from 'moment';

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

const steps = [
  'Select Student',
  'Select Trainer',
  'Select Package',
  'Schedule Sessions',
  'Select Location',
];

export default function CreateBooking() {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);
  const [searchTermStudent, setSearchTermStudent] = useState('');
  const [searchTermTrainer, setSearchTermTrainer] = useState('');

  const [selectedTrainerId, setSelectedTrainerId] = useState<number | null>(null);
  const [sessions, setSessions] = useState([{ start_time: '', end_time: '', session_no: [1, 2] }]);
  const [pickupLocation, setPickupLocation] = useState<number | null>(null);
  const [pickupLocationSelected, setPickupLocationSelected] = useState<number | null>(null);
  const [selectedPackageId, setSelectedPackageId] = useState<number | null>(null);
  const [loadingBooking, setLoadingBooking] = useState(false);

  const { i18n } = useTranslation();

  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();

  const { students, studentListLoading } = useGetStudentList({
    page: 0,
    limit: 1000,
    search: searchTermStudent,
  });
  const { trainers, trainerListLoading } = useGetTrainerList({
    page: 0,
    limit: 1000,
    search: searchTermTrainer,
    has_package: 1,
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

  // inside CreateBooking component

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
          enqueueSnackbar('Please select a student.', { variant: 'error' });
          return;
        }
        break;
      case 1:
        if (!selectedTrainerId) {
          enqueueSnackbar('Please select a trainer.', { variant: 'error' });
          return;
        }
        break;
      case 2:
        if (!selectedPackageId) {
          enqueueSnackbar('Please select a package.', { variant: 'error' });
          return;
        }
        break;
      case 3:
        const allSessionsValid = sessions.every(
          (session) => session.start_time && session.end_time
        );
        if (!allSessionsValid) {
          enqueueSnackbar('Please select time slots for all sessions.', { variant: 'error' });
          return;
        }
        break;
      case 4:
        if (!pickupLocationSelected) {
          enqueueSnackbar('Please select a pickup location.', { variant: 'error' });
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
  };

  const handleSelectStudent = (id: number) => {
    setSelectedStudentId(id);
    setActiveStep((prev) => prev + 1);
  };
  const handleSelecTrainer = (id: number) => {
    setSelectedTrainerId(id);
    setActiveStep((prev) => prev + 1);
  };
  const getCardBackground = (index: number) => {
    const gradients = [
      'linear-gradient(to bottom right, #f98423, #505050)',
      'linear-gradient(to bottom right, #2f2f2f, #aaaaaa)',
      'linear-gradient(to bottom right, #002b36, #c3f8ff)',
    ];
    return gradients[index] || '#111';
  };

  const handlePackageSelect = (pkg: any) => {
    setSelectedPackageId(pkg);
    setActiveStep((prev) => prev + 1);
  };

  const createBookingStudent = async (event: React.MouseEvent<HTMLButtonElement>) => {
    if (!pickupLocationSelected) {
      enqueueSnackbar('Please select a pickup location.', { variant: 'error' });
      return;
    }
    setLoadingBooking(true);
    const fixedSessions = sessions.map(({ start_time, end_time, session_no }) => {
      const formattedStart = moment(start_time).format('YYYY-MM-DD HH:mm');

      const datePart = moment(start_time).format('YYYY-MM-DD');
      const formattedEnd = moment(`${datePart} ${end_time}`, 'YYYY-MM-DD HH:mm').format('HH:mm');

      return {
        start_time: formattedStart,
        end_time: formattedEnd,
        session_no,
      };
    });

    const body = {
      student_id: selectedStudentId,
      trainer_id: selectedTrainerId,
      package_id: selectedPackageId?.package_id,
      pickup_location: pickupLocationSelected,
      sessions: fixedSessions,
    };

    try {
      const response = await createBooking(body);
      if (response.status === 'success') {
        enqueueSnackbar(`Booking Created successfully.`, { variant: 'success' });
        router.push(paths.dashboard.assistant.overview);
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
        enqueueSnackbar(error.message || 'Server error', { variant: 'error' });
      }
    } finally {
      setLoadingBooking(false);
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
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
      case 1:
        return (
          <TrainerSelectStep
            trainers={trainers}
            selectedTrainerId={selectedTrainerId}
            setSelectedTrainerId={handleSelecTrainer}
            isLoading={trainerListLoading}
            setSearchTerm={setSearchTermTrainer}
            searchTerm={searchTermTrainer}
          />
        );
      case 2:
        return (
          <Box>
            {trainerPackageLoading ? (
              <Box textAlign="center" py={5}>
                <CircularProgress />
                <Typography mt={2}>Loading packages...</Typography>
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
                      title={translation?.name || 'N/A'}
                      sessions={pkg.package?.number_of_sessions}
                      price={pkg.price}
                      features={[
                        pkg.package?.number_of_sessions === -1
                          ? 'Unlimited Driving Sessions'
                          : `${pkg.package?.number_of_sessions} Driving Sessions`,
                        'Booking Management',
                        'Rescheduling Flexibility',
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
                <Typography variant="h6">No packages available for this trainer.</Typography>
              </Box>
            )}
          </Box>
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
          />
        );
      case 4:
        return (
          <AddressSelector
            locations={Array.isArray(pickupLocation) ? pickupLocation : []}
            setPickupLocation={setPickupLocation}
            setPickupLocationSelected={setPickupLocationSelected}
            pickupLocationSelected={pickupLocationSelected}
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
          Back
        </Button>

        {activeStep === steps.length - 1 ? (
          <Button variant="contained" color="primary" onClick={(e) => createBookingStudent(e)}>
            Submit
          </Button>
        ) : (
          <Button variant="contained" onClick={handleNext} disabled={trainerPackages.length === 0}>
            Next
          </Button>
        )}
      </Box>
      <Dialog open={loadingBooking} PaperProps={{ sx: { textAlign: 'center', p: 4 } }}>
        <DialogContent>
          <Box display="flex" flexDirection="column" alignItems="center">
            <CircularProgress sx={{ mb: 2 }} />
            <Typography variant="body1">Booking in Progess...</Typography>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
