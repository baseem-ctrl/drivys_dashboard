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
