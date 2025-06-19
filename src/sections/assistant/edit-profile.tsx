import axios from 'axios';
import React, { useState, useRef, useEffect } from 'react';
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
import { useAuthContext } from 'src/auth/hooks';
import { useGetGearEnum, useGetGenderEnum } from 'src/api/users';
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

const EditProfilePopover = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const { genderData, genderLoading } = useGetGenderEnum();
  const router = useRouter();
  const { user, initialize } = useAuthContext();
  const [formData, setFormData] = useState({
    name: user?.user?.name || '',
    email: user?.user?.email || '',
    phone: user?.user?.phone || '',
    dob: user?.user?.dob || '',
    gender: '',
    profileUrl: user?.user?.photo_url || '',
    userDocs: user?.user?.user_docs || [],
  });
  const [originalData, setOriginalData] = useState(null);

  useEffect(() => {
    if (user?.user) {
      setOriginalData({
        name: user.user.name || '',
        email: user.user.email || '',
        phone: user.user.phone || '',
        dob: user.user.dob || '',
        gender: user.user.gender || '',
        profileUrl: user.user.photo_url || '',
        userDocs: user.user.user_docs || [],
      });
    }
  }, [user]);
  const getChangedFields = (current, original) => {
    const changed = {};
    Object.keys(current).forEach((key) => {
      if (key === 'userDocs' || key === 'profileFile' || key === 'profileUrl') return;
      if (current[key] !== original[key]) {
        changed[key] = current[key];
      }
    });
    return changed;
  };

  const handleCloseEdit = () => {
    router.push(paths.dashboard.assistant.overview);
  };
  const handleDocChange = (index, key, value) => {
    setFormData((prev) => {
      const updatedDocs = [...prev.userDocs];
      const updatedDoc = { ...updatedDocs[index], [key]: value };

      if (key === 'expiry') {
        updatedDoc.doc_file = null;
        updatedDoc.new_file = null;
      }

      updatedDocs[index] = updatedDoc;
      return { ...prev, userDocs: updatedDocs };
    });
  };

  const handleDocFileChange = (index, file) => {
    if (!file) return;
    handleDocChange(index, 'new_file', file);
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
    if (!originalData) return;

    setLoading(true);
    try {
      const formDataToSend = new FormData();

      const changedFields = getChangedFields(formData, originalData);
      Object.entries(changedFields).forEach(([key, value]) => {
        formDataToSend.append(key, value);
      });

      formDataToSend.append('country_code', '+971');

      if (formData.profileFile) {
        formDataToSend.append('photo_url', formData.profileFile);
      }

      formData.userDocs.forEach((doc, i) => {
        const originalDoc = originalData.userDocs[i];

        if (doc.doc_side !== originalDoc?.doc_side) {
          formDataToSend.append(`assistant_id_side[${i}]`, doc.doc_side);
        }

        if (doc.new_file) {
          formDataToSend.append(`assistant_id_proof[${i}]`, doc.new_file);
        }
      });

      if (
        formData.userDocs?.[0]?.expiry &&
        formData.userDocs[0]?.expiry !== originalData.userDocs?.[0]?.expiry
      ) {
        formDataToSend.append('assistant_id_exipry', formData.userDocs[0].expiry);
      }

      const response = await updateProfile(formDataToSend);

      if (response.status === 'success') {
        enqueueSnackbar('Profile Updated successfully.', { variant: 'success' });
        handleCloseEdit();
      }
    } catch (error) {
      if (error?.errors && typeof error.errors === 'object') {
        Object.values(error.errors).forEach((err) => {
          enqueueSnackbar(Array.isArray(err) ? err[0] : err, { variant: 'error' });
        });
      } else {
        enqueueSnackbar(error.message, { variant: 'error' });
      }
    } finally {
      setLoading(false);
      initialize();
    }
  };

  useEffect(() => {
    if (genderData && genderData?.length && user?.user?.gender) {
      const matchedGender = genderData.find(
        (option) => option.name.toLowerCase() === user.user.gender.toLowerCase()
      )?.value;

      if (matchedGender) {
        setFormData((prev) => ({ ...prev, gender: matchedGender }));
      }
    }
  }, [genderData, user?.user?.gender]);
  return (
    <Box
      sx={{
        width: '80%',
        backgroundColor: '#fffff',
        borderRadius: 2,
        boxShadow: 3,
        p: 3,
      }}
    >
      <Typography>Edit Profile</Typography>
      <Typography variant="body2" color="primary" sx={{ fontSize: '12px' }}>
        Click the image to upload a new one:
      </Typography>

      <Box
        sx={{
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
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
        <Box mt={4}>
          <Typography fontWeight={600} fontSize={16} mb={2}>
            Uploaded Documents
          </Typography>

          <Box
            display="flex"
            flexDirection="column"
            gap={2}
            mb={3}
            p={2}
            border="1px solid #eee"
            borderRadius={2}
          >
            <Typography variant="subtitle2" fontWeight={500}>
              Assistant ID Proof
            </Typography>

            <Box display="flex" gap={2}>
              {formData.userDocs.map((doc, index) => (
                <Box key={doc.doc_side} textAlign="center">
                  <Box position="relative" width={100} height={100} mx="auto">
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.pdf"
                      style={{ display: 'none' }}
                      id={`upload-doc-${index}`}
                      onChange={(e) => handleDocFileChange(index, e.target.files[0])}
                    />
                    <label htmlFor={`upload-doc-${index}`} style={{ cursor: 'pointer' }}>
                      {doc.new_file || doc.doc_file ? (
                        <Box
                          sx={{
                            position: 'relative',
                            width: 100,
                            height: 100,
                            borderRadius: 1,
                            overflow: 'hidden',
                            border: '1px solid #ccc',
                            backgroundColor: '#f9f9f9',
                            '&:hover .hover-overlay': {
                              opacity: 1,
                            },
                          }}
                        >
                          <Box
                            component="img"
                            src={doc.new_file ? URL.createObjectURL(doc.new_file) : doc.doc_file}
                            alt={doc.doc_side}
                            sx={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'contain',
                            }}
                          />
                          <Box
                            className="hover-overlay"
                            sx={{
                              position: 'absolute',
                              bottom: 0,
                              width: '100%',
                              textAlign: 'center',
                              bgcolor: 'rgba(0,0,0,0.5)',
                              color: '#fff',
                              fontSize: 10,
                              py: 0.5,
                              borderBottomLeftRadius: 4,
                              borderBottomRightRadius: 4,
                              opacity: 0,
                              transition: 'opacity 0.2s ease-in-out',
                            }}
                          >
                            Click to change
                          </Box>
                        </Box>
                      ) : (
                        <Box
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          sx={{
                            width: 100,
                            height: 100,
                            border: '1px dashed #aaa',
                            borderRadius: 1,
                            cursor: 'pointer',
                            color: '#888',
                            fontSize: 14,
                            backgroundColor: '#fafafa',
                          }}
                        >
                          Upload {doc.doc_side}
                        </Box>
                      )}
                    </label>
                  </Box>

                  {/* Label the side */}
                  <Typography fontSize={12} mt={1} color="text.secondary">
                    {doc.doc_side === 'front' ? 'Front Side' : 'Back Side'}
                  </Typography>
                </Box>
              ))}
            </Box>

            <TextField
              label="Expiry Date"
              type="date"
              size="small"
              fullWidth
              value={formData.userDocs[0].expiry || ''}
              onChange={(e) => {
                formData.userDocs.forEach((_, idx) =>
                  handleDocChange(idx, 'expiry', e.target.value)
                );
              }}
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </Box>
      </Box>
      <Box sx={{ px: 3, pb: 2, display: 'flex', justifyContent: 'end', gap: 1 }}>
        <Button onClick={handleCloseEdit} color="primary" variant="outlined">
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" color="primary" disabled={loading}>
          {loading ? 'Saving...' : 'Save'}
        </Button>
      </Box>
    </Box>
  );
};

export default EditProfilePopover;
