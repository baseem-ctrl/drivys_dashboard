import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { useGetPackage } from 'src/api/package';

const PackageCreateEditForm = ({ open, onClose, onSubmit, city_id }) => {
  const [formValues, setFormValues] = useState({
    min_price: '',
    max_price: '',
    commision: '',
    commision_type: 'percentage', // Default value
    package_id: '', // Added package_id to the formValues state
  });
  // Fetch package list using your custom hook
  const { packageList, packageLoading } = useGetPackage({
    /* Your parameters here */
  });
  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log('value', e.target);

    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = () => {
    const { package_id, min_price, max_price, commision, commision_type } = formValues;

    if (!city_id) {
      console.error('City ID is required.');
      return;
    }
    if (!package_id) {
      console.error('Package ID is required.');
      return;
    }

    const convertedValues = {
      package_id: package_id, // Ensure this is a number
      cities_ids: [
        // Wrap cities_ids in an array
        {
          id: city_id, // Ensure this is set correctly
          min_price: min_price, // Convert to string if necessary
          max_price: max_price, // Convert to string if necessary
          commision: commision, // Convert to number if necessary
          commision_type: 'percentage', // Ensure this is a valid type
        },
      ],
    };

    console.log('Converted values:', convertedValues);

    // Submit the converted values
    onSubmit(convertedValues);
  };

  // useEffect(() => {
  //   if (packageList.length > 0) {
  //     console.log('Fetched package list:', packageList); // Log package list for debugging
  //   }
  // }, [packageList]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth sx={{ padding: '16px' }}>
      <DialogTitle>Create or Edit Package</DialogTitle>
      <DialogContent sx={{ padding: '24px', width: '600px' }}>
        <Box display="flex" justifyContent="space-between" mb={5} mt={2}>
          <TextField
            name="min_price"
            label="Minimum Price"
            type="number"
            value={formValues.min_price}
            onChange={handleChange}
            fullWidth
            sx={{ marginRight: 3 }}
          />
          <TextField
            name="max_price"
            label="Maximum Price"
            type="number"
            value={formValues.max_price}
            onChange={handleChange}
            fullWidth
          />
        </Box>
        <Box display="flex" justifyContent="space-between" mb={2}>
          <TextField
            name="commision"
            label="Commission"
            type="number"
            value={formValues.commision}
            onChange={handleChange}
            fullWidth
            sx={{ mb: 2, marginRight: 2 }}
          />
          <TextField
            name="commision_type"
            label="Commission Type"
            value={formValues.commision_type}
            onChange={handleChange}
            fullWidth
            sx={{ mb: 2 }}
          />
        </Box>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel id="package-id-label">Package ID</InputLabel>
          <Select
            labelId="package-id-label"
            name="package_id"
            value={formValues.package_id}
            onChange={handleChange}
            label="Package ID"
          >
            {packageLoading ? (
              <MenuItem disabled>Loading...</MenuItem>
            ) : (
              packageList.map((pkg) => {
                // Log the package to console

                // Extract the name from package_translations
                const packageTranslation = pkg.package_translations.find(
                  (translation) => translation.locale === 'en'
                );
                const packageName = packageTranslation
                  ? packageTranslation.name
                  : 'Unknown Package';

                return (
                  <MenuItem key={pkg.id} value={pkg.id}>
                    {packageName} (ID: {pkg.id}) {/* Display package name and ID */}
                  </MenuItem>
                );
              })
            )}
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} color="primary">
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PackageCreateEditForm;
