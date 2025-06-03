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
import TrainerPackageStep from './select-trainer-package';
import { useSnackbar } from 'src/components/snackbar';

import SessionStep from './select-session';
import PickupLocationStep from './select-pick-up-location';

const steps = ['Select Student', 'Select Trainer', 'Schedule Sessions', 'Select Pickup Location'];

export default function CreateBooking() {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTrainerPackageId, setSelectedTrainerPackageId] = useState<number | null>(null);
  const [sessions, setSessions] = useState([{ start_time: '', end_time: '', session_no: [1, 2] }]);
  const [pickupLocation, setPickupLocation] = useState<number | null>(null);
  const [pickupLocationSelected, setPickupLocationSelected] = useState<number | null>(null);

  const { enqueueSnackbar } = useSnackbar();
  console.log('selectedStudent', selectedStudent);
  const { students, studentListLoading } = useGetStudentList({
    page: 0,
    limit: 1000,
    search: searchTerm,
  });
  const { trainers, trainerListLoading } = useGetTrainerList({ page: 0, limit: 1000 });
  const { trainerPackages, trainerPackageLoading, totalTrainerPackagePages } =
    useGetTrainerPackageList({
      page: 0,
      limit: 1000,
    });

  const handleSessionChange = (index: number, key: string, value: string | number[]) => {
    const updatedSessions = [...sessions];
    updatedSessions[index][key as keyof (typeof updatedSessions)[number]] = value;
    setSessions(updatedSessions);
  };

  // inside CreateBooking component

  useEffect(() => {
    console.log('selectedStudent', selectedStudent);
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
  const createBookingStudent = async () => {
    const fixedSessions = sessions.map(({ start_time, end_time, session_no }) => {
      // Format start_time fully
      const formattedStart = moment(start_time).format('YYYY-MM-DD HH:mm');

      // Combine date from start_time with end_time (time only)
      const datePart = moment(start_time).format('YYYY-MM-DD');
      const formattedEnd = moment(`${datePart} ${end_time}`, 'YYYY-MM-DD HH:mm').format(
        'YYYY-MM-DD HH:mm'
      );

      return {
        start_time: formattedStart,
        end_time: formattedEnd,
        session_no,
      };
    });

    const body = {
      student_id: selectedStudentId,
      package_trainer_id: selectedTrainerPackageId,
      pickup_location: pickupLocationSelected,
      sessions: fixedSessions,
    };

    try {
      const response = await createBooking(body);
      if (response.status === 'success') {
        enqueueSnackbar(`Booking Created successfully.`, { variant: 'success' });
      }
      console.log('Booking created:', response);
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
          <TrainerPackageStep
            trainerPackages={trainerPackages}
            selectedTrainerPackageId={selectedTrainerPackageId}
            setSelectedTrainerPackageId={setSelectedTrainerPackageId}
            isLoading={trainerPackageLoading}
            handleNext={handleNext}
          />
        );

      case 2:
        return (
          <SessionStep
            sessions={sessions}
            handleSessionChange={handleSessionChange}
            addSession={addSession}
            removeSession={removeSession}
          />
        );
      case 3:
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
          <Button variant="contained" onClick={handleNext}>
            Next
          </Button>
        )}
      </Box>
    </Box>
  );
}
