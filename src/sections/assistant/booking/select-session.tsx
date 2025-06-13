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
  const [showPickupOnly, setShowPickupOnly] = React.useState(false);

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
                    label="Show Pickup Only"
                    sx={{ mb: 2 }}
                  />
                </Box>

                {availableSlotLoading ? (
                  <Box display="flex" alignItems="center" gap={2}>
                    <CircularProgress size={20} />
                    <Typography>Loading slots...</Typography>
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
                        <Typography variant="body2" sx={{ mt: 2 }}>
                          No available slots for this filter.
                        </Typography>
                      )}
                    </Grid>
                  </Box>
                )}
                <Chip
                  icon={<DirectionsCarIcon color="primary" sx={{ fontSize: 16 }} />}
                  label="indicates Pickup option available"
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
