import { useState } from 'react';
import {
  Typography,
  Box,
  Stack,
  Card,
  Grid,
  Avatar,
  Button,
  MenuItem,
  Select,
  TextField,
} from '@mui/material';
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { createOrUpdateDialect } from 'src/api/dialect';
import { LoadingButton } from '@mui/lab';
import { useSnackbar } from 'src/components/snackbar';

// ----------------------------------------------------------------------

export default function DialectDetails({ onEdit, dialect, reload, setSelectedDialect }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editedDialect, setEditedDialect] = useState(dialect);
  const { enqueueSnackbar } = useSnackbar();

  const handleEditClick = () => {
    setIsEditing(true);
  };
  const handleSave = async () => {
    try {
      setIsSubmitting(true);

      // Prepare the data for the update
      const updateData = {
        dialect_id: editedDialect.id,
        language_name: editedDialect.language_name,
        dialect_name: editedDialect.dialect_name,
        keywords: editedDialect.keywords,
        description: editedDialect.description,
        is_published: editedDialect.is_published,
        order: editedDialect.order,
      };
      // Call the createOrUpdateDialect function with the transformed data
      const response = await createOrUpdateDialect(updateData);
      setSelectedDialect(response.data);

      enqueueSnackbar(response.message);

      reload();
      setIsEditing(false);
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
      setIsSubmitting(false); // Set loading state to false
    }
  };

  // Function to handle cancel action
  const handleCancel = () => {
    setIsEditing(false);
  };
  const handleChange = (event) => {
    const { name, value } = event.target;
    setEditedDialect({ ...editedDialect, [name]: value });
  };

  const renderDetails = () => (
    <>
      {dialect ? (
        <Grid container spacing={3} paddingBottom={5}>
          <Grid item xs={12} sm={6} md={6} marginBottom={5}>
            <Stack spacing={3} sx={{ p: 3, position: 'relative' }}>
              <Scrollbar>
                <Stack spacing={2} alignItems="space-between" sx={{ typography: 'body2' }}>
                  <Box sx={{ p: 2, width: '100%' }}>
                    <Stack spacing={1} sx={{ width: '100%' }}>
                      <Box sx={{ display: 'flex', width: '100%' }}>
                        <Box component="span" sx={{ minWidth: '200px', fontWeight: 'bold' }}>
                          Language Name
                        </Box>
                        <Box component="span" sx={{ minWidth: '50px', fontWeight: 'bold' }}>
                          :
                        </Box>
                        <Box component="span" sx={{ flex: 1 }}>
                          {dialect.language_name ?? 'N/A'}
                        </Box>
                      </Box>

                      <Box sx={{ display: 'flex', width: '100%' }}>
                        <Box component="span" sx={{ minWidth: '200px', fontWeight: 'bold' }}>
                          Dialect Name
                        </Box>
                        <Box component="span" sx={{ minWidth: '50px', fontWeight: 'bold' }}>
                          :
                        </Box>
                        <Box component="span" sx={{ flex: 1 }}>
                          {dialect.dialect_name ?? 'N/A'}
                        </Box>
                      </Box>

                      <Box sx={{ display: 'flex', width: '100%' }}>
                        <Box component="span" sx={{ minWidth: '200px', fontWeight: 'bold' }}>
                          Keywords
                        </Box>
                        <Box component="span" sx={{ minWidth: '50px', fontWeight: 'bold' }}>
                          :
                        </Box>
                        <Box component="span" sx={{ flex: 1 }}>
                          {dialect.keywords ?? 'N/A'}
                        </Box>
                      </Box>

                      <Box sx={{ display: 'flex', width: '100%' }}>
                        <Box component="span" sx={{ minWidth: '200px', fontWeight: 'bold' }}>
                          Description
                        </Box>
                        <Box component="span" sx={{ minWidth: '50px', fontWeight: 'bold' }}>
                          :
                        </Box>
                        <Box component="span" sx={{ flex: 1 }}>
                          {dialect.description ?? 'N/A'}
                        </Box>
                      </Box>

                      <Box sx={{ display: 'flex', width: '100%' }}>
                        <Box component="span" sx={{ minWidth: '200px', fontWeight: 'bold' }}>
                          Published
                        </Box>
                        <Box component="span" sx={{ minWidth: '50px', fontWeight: 'bold' }}>
                          :
                        </Box>
                        <Box component="span" sx={{ flex: 1 }}>
                          <Typography
                            variant="body2"
                            sx={{
                              color: dialect.is_published === '1' ? 'success.main' : 'error.main',
                              fontWeight: 'bold',
                            }}
                          >
                            {dialect.is_published === '1' ? 'Yes' : 'No'}
                          </Typography>
                        </Box>
                      </Box>

                      <Box sx={{ display: 'flex', width: '100%' }}>
                        <Box component="span" sx={{ minWidth: '200px', fontWeight: 'bold' }}>
                          Created By
                        </Box>
                        <Box component="span" sx={{ minWidth: '50px', fontWeight: 'bold' }}>
                          :
                        </Box>
                        <Box component="span" sx={{ flex: 1 }}>
                          {dialect.created_by_user.name ?? 'N/A'} ({dialect.created_by_user.email})
                        </Box>
                      </Box>

                      <Box sx={{ display: 'flex', width: '100%' }}>
                        <Box component="span" sx={{ minWidth: '200px', fontWeight: 'bold' }}>
                          Order
                        </Box>
                        <Box component="span" sx={{ minWidth: '50px', fontWeight: 'bold' }}>
                          :
                        </Box>
                        <Box component="span" sx={{ flex: 1 }}>
                          {dialect.order ?? 'N/A'}
                        </Box>
                      </Box>
                    </Stack>
                  </Box>
                </Stack>
              </Scrollbar>
            </Stack>
          </Grid>

          <Grid item xs={12} sm={6} md={5} marginBottom={5}>
            <Stack component={Card} spacing={3} sx={{ p: 3, position: 'relative' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar
                  src={dialect.created_by_user.photo_url}
                  alt={dialect.created_by_user.name}
                />
                <Stack sx={{ ml: 2 }}>
                  <Typography variant="subtitle1">{dialect.created_by_user.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {dialect.created_by_user.email}
                  </Typography>
                </Stack>
              </Box>
              <Stack spacing={1} sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', width: '100%' }}>
                  <Box component="span" sx={{ minWidth: '200px', fontWeight: 'bold' }}>
                    Phone:
                  </Box>
                  <Box component="span" sx={{ minWidth: '50px', fontWeight: 'bold' }}>
                    :
                  </Box>
                  <Box component="span" sx={{ flex: 1 }}>
                    {dialect.created_by_user.country_code}-{dialect.created_by_user.phone ?? 'N/A'}
                  </Box>
                </Box>

                <Box sx={{ display: 'flex' }}>
                  <Box component="span" sx={{ minWidth: '200px', fontWeight: 'bold' }}>
                    User Type
                  </Box>
                  <Box component="span" sx={{ minWidth: '50px', fontWeight: 'bold' }}>
                    :
                  </Box>
                  <Box component="span" sx={{ flex: 1 }}>
                    {dialect.created_by_user.user_type ?? 'N/A'}
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', width: '100%' }}>
                  <Box component="span" sx={{ minWidth: '200px', fontWeight: 'bold' }}>
                    Wallet Balance
                  </Box>
                  <Box component="span" sx={{ minWidth: '50px', fontWeight: 'bold' }}>
                    :
                  </Box>
                  <Box component="span" sx={{ flex: 1 }}>
                    {dialect.created_by_user.wallet_balance ?? '0'}
                  </Box>
                </Box>
              </Stack>
            </Stack>
          </Grid>
        </Grid>
      ) : (
        <Typography>No dialect data available.</Typography>
      )}
    </>
  );

  const renderEditForm = () => (
    <Grid container spacing={3} paddingBottom={5}>
      <Grid item xs={12} sm={6} md={6} marginBottom={5}>
        <Stack spacing={3} sx={{ p: 3 }}>
          <Stack spacing={2} alignItems="space-between" sx={{ typography: 'body2' }}>
            <Box sx={{ width: '100%' }}>
              <Stack spacing={2} sx={{ width: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  <Box component="span" sx={{ minWidth: '200px', fontWeight: 'bold' }}>
                    Language Name
                  </Box>
                  <TextField
                    variant="outlined"
                    name="language_name"
                    value={editedDialect.language_name}
                    onChange={handleChange}
                    fullWidth
                  />
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  <Box component="span" sx={{ minWidth: '200px', fontWeight: 'bold' }}>
                    Dialect Name
                  </Box>
                  <TextField
                    variant="outlined"
                    name="dialect_name"
                    value={editedDialect.dialect_name}
                    onChange={handleChange}
                    fullWidth
                  />
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  <Box component="span" sx={{ minWidth: '200px', fontWeight: 'bold' }}>
                    Keywords
                  </Box>
                  <TextField
                    variant="outlined"
                    name="keywords"
                    value={editedDialect.keywords}
                    onChange={handleChange}
                    fullWidth
                  />
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  <Box component="span" sx={{ minWidth: '200px', fontWeight: 'bold' }}>
                    Description
                  </Box>
                  <TextField
                    variant="outlined"
                    name="description"
                    value={editedDialect.description}
                    onChange={handleChange}
                    fullWidth
                  />
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  <Box component="span" sx={{ minWidth: '200px', fontWeight: 'bold' }}>
                    Order{' '}
                  </Box>
                  <TextField
                    variant="outlined"
                    name="description"
                    value={editedDialect.order}
                    onChange={handleChange}
                    fullWidth
                  />
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  <Box component="span" sx={{ minWidth: '200px', fontWeight: 'bold' }}>
                    Published
                  </Box>
                  <Select
                    name="is_published"
                    value={editedDialect.is_published}
                    onChange={handleChange}
                    fullWidth
                    variant="outlined"
                  >
                    <MenuItem value="1">Yes</MenuItem>
                    <MenuItem value="0">No</MenuItem>
                  </Select>
                </Box>
              </Stack>
            </Box>
            <Stack direction="row" spacing={2} sx={{ width: '100%', mt: 4 }}>
              <LoadingButton
                variant="contained"
                onClick={handleSave}
                loading={isSubmitting}
                fullWidth
              >
                Save
              </LoadingButton>
              <Button variant="outlined" onClick={handleCancel} fullWidth>
                Cancel
              </Button>
            </Stack>
          </Stack>
        </Stack>
      </Grid>
    </Grid>
  );

  return (
    <Box sx={{ position: 'relative', pt: 6 }}>
      <Stack
        alignItems="end"
        sx={{
          position: 'absolute',
          right: '1rem',
          top: '1rem',
          cursor: 'pointer',
          zIndex: 10,
        }}
      >
        {!isEditing && (
          <Iconify icon="solar:pen-bold" onClick={handleEditClick} sx={{ cursor: 'pointer' }} />
        )}
      </Stack>
      {isEditing ? renderEditForm() : renderDetails()}
    </Box>
  );
}
