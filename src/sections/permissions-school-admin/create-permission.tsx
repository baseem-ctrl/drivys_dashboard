import React, { useState } from 'react';
import { TextField, Button, Box, Typography, Stack } from '@mui/material';
import { createPermission } from 'src/api/roles-and-permission';
import { useSnackbar } from 'src/components/snackbar';

const CreatePermission = ({ onClose, reload }) => {
  const { enqueueSnackbar } = useSnackbar();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  const [errors, setErrors] = useState({
    name: '',
    description: '',
  });

  const validate = () => {
    let tempErrors = { name: '', description: '' };
    tempErrors.name = formData.name ? '' : 'Name is required.';
    tempErrors.description = formData.description ? '' : 'Description is required.';
    setErrors(tempErrors);
    return Object.values(tempErrors).every((x) => x === '');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    try {
      e.preventDefault();
      if (validate()) {
        const createData = {
          name: formData.name,
          description: formData.description,
        };

        const response = await createPermission(createData);
        if (response.status === 'success') {
          enqueueSnackbar('Permission Created successfully!', {
            variant: 'success',
          });
        }
        onClose();
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
      reload();
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <TextField
        fullWidth
        label="Name"
        name="name"
        variant="outlined"
        value={formData.name}
        onChange={handleChange}
        error={Boolean(errors.name)}
        helperText={errors.name}
        sx={{ mb: 3, mt: 2 }}
      />
      <TextField
        fullWidth
        label="Description"
        name="description"
        variant="outlined"
        multiline
        rows={4}
        value={formData.description}
        onChange={handleChange}
        error={Boolean(errors.description)}
        helperText={errors.description}
        sx={{ mb: 3, mt: 2 }}
      />
      <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mb: 3 }}>
        <Button variant="outlined" color="primary" onClick={onClose} type="button">
          Cancel
        </Button>
        <Button type="submit" variant="contained" color="primary">
          Create
        </Button>
      </Stack>
    </Box>
  );
};

export default CreatePermission;
