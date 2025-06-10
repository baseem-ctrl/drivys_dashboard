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
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';

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
}

const SessionStep: React.FC<SessionStepProps> = ({
  sessions,
  handleSessionChange,
  addSession,
  removeSession,
}) => {
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
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Start Time"
                    type="datetime-local"
                    value={session.start_time}
                    onChange={(e) => handleSessionChange(index, 'start_time', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="End Time"
                    type="time"
                    value={session.end_time}
                    onChange={(e) => handleSessionChange(index, 'end_time', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </Grid>
            </Paper>
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
