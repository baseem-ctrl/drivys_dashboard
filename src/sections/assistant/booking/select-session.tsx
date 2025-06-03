import React from 'react';
import { Box, Button, Grid, IconButton, Paper, TextField, Typography } from '@mui/material';
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
      <Typography variant="h6" gutterBottom>
        Session Details
      </Typography>

      {sessions.map((session, index) => (
        <Paper
          key={index}
          elevation={3}
          sx={{ p: 3, mb: 3, borderRadius: 2, position: 'relative' }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="subtitle1">Session {index + 1}</Typography>
            {index > 0 && (
              <IconButton
                color="error"
                onClick={() => removeSession(index)}
                aria-label={`Remove Session ${index + 1}`}
              >
                <DeleteIcon />
              </IconButton>
            )}
          </Box>

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
      ))}

      <Button
        variant="outlined"
        onClick={addSession}
        startIcon={<AddIcon />}
        sx={{ borderRadius: 2 }}
      >
        Add Session
      </Button>
    </Box>
  );
};

export default SessionStep;
