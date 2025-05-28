import axios from 'axios';
import React, { useState, useRef } from 'react';
import { useSnackbar } from 'src/components/snackbar';
import {
  Button,
  Popover,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Avatar,
  Typography,
  Switch,
  FormControlLabel,
  Box,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { updateProfile } from 'src/api/assistant';
import { endpoints } from 'src/utils/axios';

const EditProfilePopover = ({ formData, setFormData, genderData }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const handleEditClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, profileFile: file }));

      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, profileUrl: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const formDataToSend = new FormData();

      formDataToSend.append('name', formData.name);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('phone', formData.phone);
      formDataToSend.append('dob', formData.dob);
      formDataToSend.append('password', formData.password || '');

      if (formData.profileFile) {
        formDataToSend.append('photo_url', formData.profileFile);
      }

      const response = await updateProfile(formDataToSend);

      if (response.status === 'success') {
        enqueueSnackbar(`Profile Updated successfully.`, { variant: 'success' });
      }
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
    } finally {
      setLoading(false);
      handlePopoverClose();
    }
  };

  return (
    <Box>
      <Button
        variant="outlined"
        startIcon={<EditIcon />}
        onClick={handleEditClick}
        sx={{
          color: '#ff99ac',
          px: 3,
          borderRadius: 8,
          textTransform: 'none',
          fontSize: '12px',
          '&:hover': {
            background: 'linear-gradient(to right, #ff4e77, #ff89a1)',
          },
        }}
      >
        Edit Profile
      </Button>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handlePopoverClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        transformOrigin={{ vertical: 'top', horizontal: 'center' }}
        PaperProps={{
          sx: {
            width: '50vw',
          },
        }}
      >
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent
          sx={{
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Click the image to upload a new one:
          </Typography>

          <Avatar
            src={formData.profileUrl}
            alt="Profile"
            sx={{
              width: 100,
              height: 100,
              cursor: 'pointer',
              alignSelf: 'center',
              border: '2px solid #ccc',
            }}
            onClick={() => fileInputRef.current.click()}
          />
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleImageUpload}
          />
          <Box display="flex" gap={2}>
            {' '}
            <TextField
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              fullWidth
            />
          </Box>

          <Box display="flex" gap={2}>
            <TextField
              label="Phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              label="DOB"
              name="dob"
              type="date"
              value={formData.dob}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </Box>

          <Box display="flex" gap={2}>
            <TextField
              label="Email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              select
              label="Gender"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              fullWidth
            >
              {Array.isArray(genderData) &&
                genderData.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.name}
                  </MenuItem>
                ))}
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handlePopoverClose} color="primary" variant="outlined">
            Cancel
          </Button>
          <Button onClick={handleSubmit} variant="contained" color="primary" disabled={loading}>
            {loading ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Popover>
    </Box>
  );
};

export default EditProfilePopover;
