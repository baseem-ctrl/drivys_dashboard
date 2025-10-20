import React, { useState, useRef, useEffect } from 'react';
import { useSnackbar } from 'src/components/snackbar';
import {
  Button,
  TextField,
  MenuItem,
  Avatar,
  Typography,
  Box,
  IconButton,
  InputAdornment,
} from '@mui/material';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { updateProfile } from 'src/api/assistant';
import { useAuthContext } from 'src/auth/hooks';
import { useGetGenderEnum } from 'src/api/users';
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

const EditProfilePopover = () => {
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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
    password: '',
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
        initialize();
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
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#fafafa',
     p: 5,   borderRadius: 3,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 1,
        }}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
            Edit Profile
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Home / <span style={{ color: '#ff6b35' }}>Edit Profile</span>
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            onClick={handleCloseEdit}
            variant="outlined"
            sx={{
              color: '#ff6b35',
              borderColor: '#ff6b35',
              textTransform: 'none',
              px: 3,
              '&:hover': {
                borderColor: '#ff6b35',
                bgcolor: 'rgba(255, 107, 53, 0.04)',
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={loading}
            sx={{
              bgcolor: '#ff6b35',
              textTransform: 'none',
              px: 3,
              '&:hover': {
                bgcolor: '#e55a2b',
              },
            }}
          >
            {loading ? 'Saving...' : 'Save'}
          </Button>
        </Box>
      </Box>

      {/* Main Form */}
      <Box
        sx={{
          bgcolor: 'white',
          borderRadius: 2,
          p: 4,
          mt: 3,
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        }}
      >
        <Box sx={{ display: 'flex', gap: 6 }}>
          {/* Avatar Section */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Box sx={{ position: 'relative' }}>
              <Avatar
                src={formData.profileUrl}
                sx={{
                  width: 150,
                  height: 150,
                  bgcolor: '#f0f0f0',
                  border: '3px solid #e0e0e0',
                }}
              />
              <IconButton
                onClick={() => fileInputRef.current.click()}
                sx={{
                  position: 'absolute',
                  bottom: 5,
                  right: 5,
                  bgcolor: 'white',
                  boxShadow: 2,
                  width: 40,
                  height: 40,
                  '&:hover': {
                    bgcolor: '#f5f5f5',
                  },
                }}
              >
                <CameraAltIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </Box>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleImageUpload}
            />
          </Box>

          {/* Form Fields */}
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 3, mb: 3 }}>
              {/* Full Name */}
              <Box>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                  Full Name
                </Typography>
                <TextField
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter name"
                  fullWidth
                  size="small"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      bgcolor: '#fafafa',
                    },
                  }}
                />
              </Box>

              {/* Phone Number */}
              <Box>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                  Phone Number
                </Typography>
                <TextField
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+971"
                  fullWidth
                  size="small"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      bgcolor: '#fafafa',
                    },
                  }}
                />
              </Box>

              {/* Email */}
              <Box>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                  Email
                </Typography>
                <TextField
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter email"
                  fullWidth
                  size="small"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      bgcolor: '#fafafa',
                    },
                  }}
                />
              </Box>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 3 }}>
              {/* Password */}
              <Box>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                  Password
                </Typography>
                <TextField
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter password"
                  fullWidth
                  size="small"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          size="small"
                        >
                          {showPassword ? (
                            <VisibilityOffIcon fontSize="small" />
                          ) : (
                            <VisibilityIcon fontSize="small" />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      bgcolor: '#fafafa',
                    },
                  }}
                />
              </Box>

              {/* Date of Birth */}
              <Box>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                  Date of Birth
                </Typography>
                <TextField
                  name="dob"
                  type="date"
                  value={formData.dob}
                  onChange={handleChange}
                  placeholder="DD/MM/YYYY"
                  fullWidth
                  size="small"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <CalendarTodayIcon fontSize="small" sx={{ color: '#999' }} />
                      </InputAdornment>
                    ),
                  }}
                  InputLabelProps={{ shrink: true }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      bgcolor: '#fafafa',
                    },
                  }}
                />
              </Box>

              {/* Gender */}
              <Box>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                  Gender
                </Typography>
                <TextField
                  select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  placeholder="Select gender"
                  fullWidth
                  size="small"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      bgcolor: '#fafafa',
                    },
                  }}
                >
                  <MenuItem value="">Select gender</MenuItem>
                  {Array.isArray(genderData) &&
                    genderData.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.name}
                      </MenuItem>
                    ))}
                </TextField>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Document Upload Section */}
        {formData.userDocs && formData.userDocs.length > 0 && (
          <Box sx={{ mt: 4, pt: 4, borderTop: '1px solid #eee' }}>
            <Typography fontWeight={600} fontSize={16} mb={3}>
              Uploaded Documents
            </Typography>

            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                p: 3,
                border: '1px solid #eee',
                borderRadius: 2,
                bgcolor: '#fafafa',
              }}
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
                              src={
                                doc.new_file ? URL.createObjectURL(doc.new_file) : doc.doc_file
                              }
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
                value={formData.userDocs[0]?.expiry || ''}
                onChange={(e) => {
                  formData.userDocs.forEach((_, idx) =>
                    handleDocChange(idx, 'expiry', e.target.value)
                  );
                }}
                InputLabelProps={{ shrink: true }}
                sx={{
                  maxWidth: 300,
                  '& .MuiOutlinedInput-root': {
                    bgcolor: 'white',
                  },
                }}
              />
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default EditProfilePopover;
