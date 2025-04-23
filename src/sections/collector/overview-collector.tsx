import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Avatar,
  Box,
  Divider,
  Chip,
  Button,
  TextField,
} from '@mui/material';
import { useAuthContext } from 'src/auth/hooks';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';

const OverviewCollectorPage = () => {
  const { user } = useAuthContext();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.user?.name || '',
    email: user?.user?.email || '',
    phone: user?.user?.phone || '',
    dob: user?.user?.dob || '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const toggleEdit = () => {
    setIsEditing(!isEditing);
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', p: 3, backgroundColor: '#f4f6f8' }}>
      <Box sx={{ width: '90%', maxWidth: 900 }}>
        <Card sx={{ mb: 2, p: 2, borderRadius: 3 }}>
          <Grid container alignItems="center" spacing={2}>
            <Grid item>
              <Avatar
                sx={{ width: 80, height: 80 }}
                src={user?.user?.photo_url || '/static/images/avatar_placeholder.png'}
              />
            </Grid>
            <Grid item xs>
              <Typography variant="h5" fontWeight="bold">
                {user?.user?.name || 'Collector'}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {user?.user?.user_type || 'User Role'}
              </Typography>
            </Grid>
            <Grid item>
              <Chip
                label={user?.user?.is_active ? 'Active' : 'Inactive'}
                color={user?.user?.is_active ? 'success' : 'error'}
              />
            </Grid>
          </Grid>
          {/* Cash Info Card */}
          <Card sx={{ mb: 3, p: 2, borderRadius: 3, boxShadow: 3 }}>
            <Grid container spacing={2} justifyContent="center">
              <Grid item xs={12} sm={6}>
                <Box
                  sx={{ textAlign: 'center', p: 2, backgroundColor: '#e8f5e9', borderRadius: 2 }}
                >
                  <Typography variant="body2" fontWeight="bold" color="text.secondary">
                    Collected Cash In Hand
                  </Typography>
                  <Typography variant="h6" color="#4caf50" fontWeight="bold">
                    ₹ {user?.user?.collected_cash_in_hand || '0'}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box
                  sx={{ textAlign: 'center', p: 2, backgroundColor: '#ffebee', borderRadius: 2 }}
                >
                  <Typography variant="body2" fontWeight="bold" color="text.secondary">
                    Max Cash In Hand Allowed
                  </Typography>
                  <Typography variant="h6" color="#f44336" fontWeight="bold">
                    ₹ {user?.user?.collected_max_cash_in_hand_allowed || '0'}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Card>
        </Card>

        <Card sx={{ mb: 2, p: 2, borderRadius: 3 }}>
          <CardContent>
            <Grid container justifyContent="space-between" alignItems="center">
              <Typography variant="h6">Personal Information</Typography>
              <Box>
                {isEditing && (
                  <Button
                    size="small"
                    variant="contained"
                    color="primary"
                    sx={{ mr: 1 }}
                    onClick={() => {
                      setFormData({
                        name: user?.user?.name || '',
                        email: user?.user?.email || '',
                        phone: user?.user?.phone || '',
                        dob: user?.user?.dob || '',
                      });
                      setIsEditing(false);
                    }}
                  >
                    Cancel
                  </Button>
                )}
                <Button
                  size="small"
                  variant="outlined"
                  color="primary"
                  startIcon={isEditing ? <SaveIcon /> : <EditIcon />}
                  onClick={toggleEdit}
                >
                  {isEditing ? 'Save' : 'Edit'}
                </Button>
              </Box>
            </Grid>

            <Divider sx={{ my: 1 }} />
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body2" fontWeight="bold">
                  First Name
                </Typography>
                <TextField
                  name="name"
                  variant="outlined"
                  fullWidth
                  size="small"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </Grid>

              <Grid item xs={6}>
                <Typography variant="body2" fontWeight="bold">
                  Email
                </Typography>
                <TextField
                  name="email"
                  variant="outlined"
                  fullWidth
                  size="small"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </Grid>

              <Grid item xs={6}>
                <Typography variant="body2" fontWeight="bold">
                  Phone
                </Typography>
                <TextField
                  name="phone"
                  variant="outlined"
                  fullWidth
                  size="small"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </Grid>

              <Grid item xs={6}>
                <Typography variant="body2" fontWeight="bold">
                  Date of Birth
                </Typography>
                <TextField
                  name="dob"
                  variant="outlined"
                  fullWidth
                  size="small"
                  value={formData.dob}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default OverviewCollectorPage;
