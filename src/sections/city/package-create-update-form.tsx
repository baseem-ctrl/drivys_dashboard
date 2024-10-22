import { useEffect, useState } from 'react';
import LoadingButton from '@mui/lab/LoadingButton';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  CircularProgress,
} from '@mui/material';
import { useGetPackage } from 'src/api/package';

const PackageCreateEditForm = ({
  open,
  onClose,
  onSubmit,
  city_id,
  selectedPackage,
  editMode,
  setEditMode,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formValues, setFormValues] = useState({
    min_price: '',
    max_price: '',
    commision: '',
    commision_type: '',
    package_id: '',
  });
  const [errors, setErrors] = useState({});
  useEffect(() => {
    if (open) {
      if (editMode === 'Edit' && selectedPackage) {
        setLoading(true);
        setFormValues({
          min_price: selectedPackage.min_price,
          max_price: selectedPackage.max_price,
          commision: selectedPackage.commision,
          commision_type: selectedPackage.commision_type,
          package_id: selectedPackage.package_id,
        });
        setLoading(false);
      } else {
        // Reset form values for adding a new package
        setFormValues({
          min_price: '',
          max_price: '',
          commision: '',
          commision_type: '',
          package_id: '',
        });
        setErrors({});
      }
    }
  }, [selectedPackage, editMode, open]);

  const { packageList, packageLoading } = useGetPackage({
    city_id: city_id,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: undefined,
    }));
  };

  const validateFields = () => {
    const newErrors = {};
    if (!formValues.min_price) newErrors.min_price = 'Minimum Price is required.';
    if (!formValues.commision) newErrors.commision = 'Commission is required.';
    if (!formValues.commision_type) newErrors.commision_type = 'Commission Type is required.';
    if (!formValues.package_id) newErrors.package_id = 'Package ID is required.';
    return newErrors;
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    const newErrors = validateFields();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsSubmitting(false);
      return;
    }

    const { package_id, min_price, max_price, commision, commision_type } = formValues;

    if (!city_id) {
      console.error('City ID is required.');
      return;
    }

    const convertedValues = {
      package_id: package_id,
      cities_ids: [
        {
          id: city_id,
          min_price: min_price,
          max_price: max_price,
          commision: commision,
          commision_type: commision_type,
        },
      ],
    };
    onSubmit(convertedValues)
      .then(() => {
        setIsSubmitting(false);
        onClose();
      })
      .catch((error) => {
        console.error('Submission failed:', error);
        setIsSubmitting(false);
      });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth sx={{ padding: '16px' }}>
      <DialogTitle>Create or Edit Package</DialogTitle>
      <DialogContent sx={{ padding: '24px', width: '600px' }}>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Box display="flex" justifyContent="space-between" mb={5} mt={2}>
              <TextField
                name="min_price"
                label="Minimum Price"
                type="number"
                value={formValues.min_price}
                onChange={handleChange}
                fullWidth
                error={Boolean(errors.min_price)}
                helperText={errors.min_price}
                sx={{ marginRight: 3 }}
              />
              <TextField
                name="max_price"
                label="Maximum Price"
                type="number"
                value={formValues.max_price}
                onChange={handleChange}
                fullWidth
                error={Boolean(errors.max_price)}
                helperText={errors.max_price}
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
                error={Boolean(errors.commision)}
                helperText={errors.commision}
                sx={{ mb: 2, marginRight: 2 }}
              />
              <FormControl fullWidth sx={{ mb: 2 }} error={Boolean(errors.commision_type)}>
                <InputLabel id="commision-type-label">Commission Type</InputLabel>
                <Select
                  labelId="commision-type-label"
                  name="commision_type"
                  value={formValues.commision_type}
                  onChange={handleChange}
                  label="Commission Type"
                >
                  <MenuItem value="percentage">Percentage</MenuItem>
                  <MenuItem value="flat_amount">Flat Amount</MenuItem>
                </Select>
                {errors.commision_type && (
                  <Typography color="error" variant="caption">
                    {errors.commision_type}
                  </Typography>
                )}
              </FormControl>
            </Box>
            <FormControl fullWidth sx={{ mb: 2 }} error={Boolean(errors.package_id)}>
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
                    const packageTranslation = pkg.package_translations.find(
                      (translation) => translation.locale === 'en'
                    );
                    const packageName = packageTranslation
                      ? packageTranslation.name
                      : 'Unknown Package';

                    return (
                      <MenuItem key={pkg.id} value={pkg.id}>
                        {packageName} (ID: {pkg.id})
                      </MenuItem>
                    );
                  })
                )}
              </Select>
              {errors.package_id && (
                <Typography color="error" variant="caption">
                  {errors.package_id}
                </Typography>
              )}
            </FormControl>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <LoadingButton onClick={onClose}>Cancel</LoadingButton>
        <LoadingButton onClick={handleSubmit} color="primary" loading={isSubmitting}>
          Submit
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
};

export default PackageCreateEditForm;
