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
  Select,
  InputLabel,
  FormControl,
  TextField,
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
import PickupLocationStep from './select-pick-up-location';
import TrainerSelectStep from './select-trainer';
import PackageCard from './select-package';
import { useGetPackages, useGetTrainers } from 'src/api/enum';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';

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
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTrainerId, setSelectedTrainerId] = useState<number | null>(null);
  const [sessions, setSessions] = useState([{ start_time: '', end_time: '', session_no: [1, 2] }]);
  const [pickupLocation, setPickupLocation] = useState<number | null>(null);
  const [pickupLocationSelected, setPickupLocationSelected] = useState<number | null>(null);
  const [selectedPackageId, setSelectedPackageId] = useState<number | null>(null);
  const { i18n } = useTranslation();

  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();

  const { students, studentListLoading } = useGetStudentList({
    page: 0,
    limit: 1000,
    search: searchTerm,
  });
  const { trainers, trainerListLoading } = useGetTrainerList({
    page: 0,
    limit: 1000,
    search: searchTerm,
  });

  const { packageList, packageLoading, packageError } = useGetPackages({
    page: 1,
    limit: 1000,
    trainerId: selectedTrainerId,
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

  const createBookingStudent = async () => {
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
        router.push(paths.dashboard.assistant.booking);
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
            setSearchTerm={setSearchTerm}
            searchTerm={searchTerm}
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
            setSearchTerm={setSearchTerm}
            searchTerm={searchTerm}
          />
        );
      case 2:
        return (
          <Box>
            {packageList.length > 0 ? (
              <Box
                display="grid"
                gridTemplateColumns={{
                  xs: '1fr',
                  sm: '1fr 1fr',
                  md: '1fr 1fr 1fr',
                }}
                gap={3}
              >
                {packageList.map((pkg: any, index: number) => {
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
          />
        );
      case 4:
        return (
          <PickupLocationStep
            pickupLocation={Array.isArray(pickupLocation) ? pickupLocation : []}
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
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {renderStepContent()}

      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
        <Button disabled={activeStep === 0} onClick={handleBack}>
          Back
        </Button>

        {activeStep === steps.length - 1 ? (
          <Button variant="contained" color="primary" onClick={createBookingStudent}>
            Submit
          </Button>
        ) : (
          <Button variant="contained" onClick={handleNext} disabled={packageList.length === 0}>
            Next
          </Button>
        )}
      </Box>
    </Box>
  );
}
