import React from 'react';
import {
  Box,
  Button,
  Grid,
  IconButton,
  Paper,
  TextField,
  Typography,
  Divider,
  CircularProgress,
  Dialog,
  Chip,
  FormControlLabel,
  Switch,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useGetAvailableSlots } from 'src/api/assistant';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import { useSnackbar } from 'src/components/snackbar';
import moment from 'moment';
import { scheduleRemainingBooking } from 'src/api/booking-assistant';
import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';

interface SessionStepProps {
  open: any;
  close: any;
  driverId: any;
  bookingId: any;
  t: any;
}

const RescheduleSession: React.FC<SessionStepProps> = ({
  open,
  onClose,
  driverId,
  bookingId,
  t,
}) => {
  const [sessions, setSessions] = React.useState([
    { start_time: '', end_time: '', session_no: [1, 2] },
  ]);
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();

  const [requestedDate, setRequestedDate] = React.useState(
    () => new Date().toISOString().split('T')[0]
  );
  const [openDialogIndex, setOpenDialogIndex] = React.useState<number | null>(null);
  const handleOpenDialog = (index: number) => setOpenDialogIndex(index);
  const handleCloseDialog = () => setOpenDialogIndex(null);
  const [showPickupOnly, setShowPickupOnly] = React.useState(false);
  const handleSessionChange = (index: number, key: string, value: string | number[]) => {
    const updatedSessions = [...sessions];
    updatedSessions[index][key as keyof (typeof updatedSessions)[number]] = value;
    setSessions(updatedSessions);
  };
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
  React.useEffect(() => {
    if (sessions?.[0]?.start_time) {
      const dateFromSession = sessions[0].start_time.split(' ')[0];
      if (dateFromSession !== requestedDate) {
        setRequestedDate(dateFromSession);
      }
    }
  }, [sessions, requestedDate]);

  const { availableSlots, availableSlotLoading } = useGetAvailableSlots({
    driver_id: driverId,
    requested_date: requestedDate,
  });
  const createBookingStudent = async (event: React.MouseEvent<HTMLButtonElement>) => {
    try {
      const formData = new FormData();

      formData.append('booking_id', bookingId);

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

      const response = await scheduleRemainingBooking(formData);

      if (response.status === 'success') {
        enqueueSnackbar(t('Booking Created successfully.'), { variant: 'success' });
        onClose();
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
        enqueueSnackbar(error.message || t('Server error'), { variant: 'error' });
      }
    }
  };
  const handleCancel = () => {
    onClose();
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight={600} gutterBottom>
        {t('Session Details')}
      </Typography>

      <Typography variant="body2" color="text.secondary" mb={3}>
        {t('add_session_times')}
      </Typography>

      <Grid container spacing={3}>
        {sessions.map((session, index) => (
          <Grid item xs={12} key={index}>
            <Paper
              elevation={4}
              sx={{
                p: 3,
                borderRadius: 3,
                background: '#f9fafb',
                position: 'relative',
              }}
            >
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="subtitle1" fontWeight={600}>
                  {t('Session')} {index + 1}
                </Typography>

                {index > 0 && (
                  <IconButton
                    color="error"
                    onClick={() => removeSession(index)}
                    aria-label={t('Remove Session {{number}}', { number: index + 1 })}
                    title={t('Remove Session {{number}}', { number: index + 1 })}
                    sx={{ ml: 2 }}
                  >
                    <DeleteIcon />
                  </IconButton>
                )}
              </Box>

              <Divider sx={{ mb: 3 }} />

              <Grid container spacing={2}>
                <Grid item xs={12} md={12}>
                  <TextField
                    fullWidth
                    label={t('select_date')}
                    type="date"
                    value={
                      session.start_time
                        ? session.start_time.split(' ')[0]
                        : new Date().toISOString().split('T')[0]
                    }
                    onChange={(e) => {
                      const newDate = e.target.value;
                      handleSessionChange(index, 'start_time', `${newDate} 00:00:00`);
                    }}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </Grid>

              <Button
                variant="outlined"
                fullWidth
                sx={{ mt: 2 }}
                onClick={() => handleOpenDialog(index)}
              >
                {t('select_slot')}
              </Button>

              {session.start_time && session.end_time && (
                <Box mt={1}>
                  <Chip
                    label={`${t('Selected')}: ${moment
                      .utc(session.start_time)
                      .format('hh:mm A')} - ${moment
                      .utc(`${session.start_time.split(' ')[0]} ${session.end_time}`)
                      .format('hh:mm A')}`}
                    color="primary"
                    variant="outlined"
                  />
                </Box>
              )}
            </Paper>
            <Dialog
              open={openDialogIndex !== null}
              onClose={handleCloseDialog}
              fullWidth
              maxWidth="md"
            >
              <Box p={3}>
                <Typography variant="h6" gutterBottom>
                  {t('Available Slots for {{date}}', { date: requestedDate })}
                </Typography>

                <Box display="flex" justifyContent="flex-end">
                  {' '}
                  <FormControlLabel
                    control={
                      <Switch
                        checked={showPickupOnly}
                        onChange={(e) => setShowPickupOnly(e.target.checked)}
                        color="warning"
                      />
                    }
                    label={t('Show Pickup Only')}
                    sx={{ mb: 2 }}
                  />
                </Box>

                {availableSlotLoading ? (
                  <Box display="flex" alignItems="center" gap={2}>
                    <CircularProgress size={20} />
                    <Typography>{t('Loading slots...')}</Typography>
                  </Box>
                ) : (
                  <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
                    <Grid container spacing={2}>
                      {availableSlots
                        ?.filter((slot: any) => (showPickupOnly ? slot.is_pickup_enabled : true))
                        .map((slot: any, idx: number) => (
                          <Grid item xs={12} sm={6} md={4} key={idx}>
                            <Paper
                              elevation={2}
                              sx={{
                                p: 2,
                                borderRadius: 2,
                                backgroundColor: '#3b1f0d',
                                color: '#fff',
                                border: '1px solid #ff7b00',
                                position: 'relative',
                                cursor: 'pointer',
                                textAlign: 'center',
                                '&:hover': {
                                  backgroundColor: '#f38647',
                                },
                              }}
                              onClick={() => {
                                const startUtc = moment
                                  .utc(slot.start_time)
                                  .format('YYYY-MM-DD HH:mm:ss');
                                const endUtc = moment.utc(slot.end_time).format('HH:mm:ss');
                                if (openDialogIndex !== null) {
                                  handleSessionChange(openDialogIndex, 'start_time', startUtc);
                                  handleSessionChange(openDialogIndex, 'end_time', endUtc);
                                  handleSessionChange(
                                    openDialogIndex,
                                    'is_pickup_enabled',
                                    slot.is_pickup_enabled
                                  );
                                  handleCloseDialog();
                                }
                              }}
                            >
                              <Typography variant="body1" fontWeight={500}>
                                {moment.utc(slot.start_time).format('hh:mm A')}
                              </Typography>

                              {slot.is_pickup_enabled && (
                                <DirectionsCarIcon
                                  sx={{
                                    fontSize: 18,
                                    color: '#ff7b00',
                                    position: 'absolute',
                                    bottom: 8,
                                    right: 8,
                                  }}
                                />
                              )}
                            </Paper>
                          </Grid>
                        ))}
                      {availableSlots?.filter((slot: any) =>
                        showPickupOnly ? slot.is_pickup_enabled : true
                      ).length === 0 && (
                        <Typography variant="body2" sx={{ mt: 2, ml: 2 }}>
                          {t('No available slots for this filter.')}
                        </Typography>
                      )}
                    </Grid>
                  </Box>
                )}
                <Chip
                  icon={<DirectionsCarIcon color="primary" sx={{ fontSize: 16 }} />}
                  label={t('indicates Pickup option available')}
                  variant="soft"
                  color="primary"
                  sx={{
                    mt: 2,
                    color: 'text.secondary',
                    borderColor: '#ff7b00',
                    fontSize: 12,
                    height: 28,
                    '.MuiChip-icon': {
                      marginLeft: '4px',
                      marginRight: '-4px',
                    },
                  }}
                />
                <Box display="flex" justifyContent="flex-end" mt={3}>
                  <Button onClick={handleCloseDialog}>{t('Close')}</Button>
                </Box>
              </Box>
            </Dialog>
          </Grid>
        ))}
      </Grid>

      <Box mt={4}>
        <Button
          variant="outlined"
          onClick={addSession}
          startIcon={<AddIcon />}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 500,
            px: 3,
            py: 1,
            backgroundColor: '#fff',
            borderColor: '#ccc',
            '&:hover': {
              backgroundColor: '#f0f0f0',
            },
          }}
        >
          {t('Add Session')}
        </Button>
      </Box>
      <Box mt={4} display="flex" gap={2} justifyContent="flex-end">
        <Button
          variant="contained"
          color="primary"
          onClick={createBookingStudent}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 500,
            px: 3,
            py: 1,
          }}
        >
          {t('Submit')}
        </Button>

        <Button
          variant="outlined"
          color="secondary"
          onClick={handleCancel}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 500,
            px: 3,
            py: 1,
          }}
        >
          {t('Cancel')}
        </Button>
      </Box>
    </Box>
  );
};

export default RescheduleSession;
