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
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useGetAvailableSlots } from 'src/api/assistant';
import moment from 'moment';

interface Session {
  start_time: string;
  end_time: string;
  session_no: number[];
}

interface SessionStepProps {
  sessions: Session[];
  handleSessionChange: (index: number, key: string, value: string | number[]) => void;
  addSession: () => void;
  removeSession: (index: number) => void;
  driverId: number;
  handleNext: () => void;
}

const SessionStep: React.FC<SessionStepProps> = ({
  sessions,
  handleSessionChange,
  addSession,
  removeSession,
  driverId,
  handleNext,
}) => {
  const [requestedDate, setRequestedDate] = React.useState(() => {
    return new Date().toISOString().split('T')[0]; // initially today
  });
  const [openDialogIndex, setOpenDialogIndex] = React.useState<number | null>(null);
  const handleOpenDialog = (index: number) => setOpenDialogIndex(index);
  const handleCloseDialog = () => setOpenDialogIndex(null);

  React.useEffect(() => {
    if (sessions?.[0]?.start_time) {
      const dateFromSession = sessions[0].start_time.split(' ')[0];
      if (dateFromSession !== requestedDate) {
        setRequestedDate(dateFromSession);
      }
    }
  }, [sessions]);

  const { availableSlots, availableSlotLoading } = useGetAvailableSlots({
    driver_id: driverId,
    requested_date: requestedDate,
  });

  return (
    <Box>
      <Typography variant="h5" fontWeight={600} gutterBottom>
        Session Details
      </Typography>

      <Typography variant="body2" color="text.secondary" mb={3}>
        Add session times for your driving package.
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
                  Session {index + 1}
                </Typography>

                {index > 0 && (
                  <IconButton
                    color="error"
                    onClick={() => removeSession(index)}
                    aria-label={`Remove Session ${index + 1}`}
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
                    label="Select Date"
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
                Select Slot
              </Button>

              {session.start_time && session.end_time && (
                <Box mt={1}>
                  <Chip
                    label={`Selected: ${moment.utc(session.start_time).format('hh:mm A')} - ${moment
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
                  Available Slots for {requestedDate}
                </Typography>

                {availableSlotLoading ? (
                  <Box display="flex" alignItems="center" gap={2}>
                    <CircularProgress size={20} />
                    <Typography>Loading slots...</Typography>
                  </Box>
                ) : availableSlots?.length ? (
                  <Box
                    sx={{
                      maxHeight: 400,
                      overflowY: 'auto',
                      pr: 1,
                    }}
                  >
                    <Grid container spacing={2}>
                      {availableSlots.map((slot: any, idx: number) => (
                        <Grid item xs={12} sm={6} md={4} key={idx}>
                          <Paper
                            elevation={2}
                            sx={{
                              p: 2,
                              borderRadius: 2,
                              backgroundColor: '#f9d3bd',
                              textAlign: 'center',
                              cursor: 'pointer',
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
                                handleCloseDialog();
                              }
                            }}
                          >
                            <Typography variant="body1" fontWeight={500}>
                              {moment.utc(slot.start_time).format('hh:mm A')} -{' '}
                              {moment.utc(slot.end_time).format('hh:mm A')}
                            </Typography>
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                ) : (
                  <Typography variant="body2">No available slots for this date.</Typography>
                )}
                <Box display="flex" justifyContent="flex-end" mt={3}>
                  <Button onClick={handleCloseDialog}>Close</Button>
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
          Add Session
        </Button>
      </Box>
    </Box>
  );
};

export default SessionStep;
