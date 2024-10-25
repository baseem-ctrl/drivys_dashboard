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
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import { useGetPackageTrainerById } from 'src/api/package-trainer';
import { useGetPackage } from 'src/api/package';

const TrainerPackageCreateEditForm = ({
  open,
  onClose,
  onSubmit,
  trainer_id,
  selectedPackage,
  editMode,
  setEditMode,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formValues, setFormValues] = useState({
    trainer_price: '',
    switch_status: '',
    is_published: '',
    package_id: '',
  });
  const [errors, setErrors] = useState({});
  useEffect(() => {
    if (open) {
      if (editMode === 'Edit' && selectedPackage) {
        setLoading(true);
        setFormValues({
          trainer_price: selectedPackage.trainer_price,
          switch_status: selectedPackage.switch_status,
          is_published: selectedPackage.is_published,
          package_id: selectedPackage.package_id,
        });
        setLoading(false);
      } else {
        // Reset form values for adding a new package
        setFormValues({
          switch_status: '',
          trainer_price: '',
          is_published: '',
          package_id: '',
        });
        setErrors({});
      }
    }
  }, [selectedPackage, editMode, open]);
  const { packageList, packageLoading } = useGetPackage();
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
    if (!formValues.trainer_price) newErrors.trainer_price = 'Trainer Price is required.';
    if (!formValues.switch_status) newErrors.switch_status = 'Status is required.';
    if (!formValues.is_published) newErrors.is_published = 'Publish status is required.';
    return newErrors;
  };
  const { packageTrainer, packageTrainerLoading } = useGetPackageTrainerById(trainer_id);
  const handleSubmit = () => {
    // setIsSubmitting(true);
    const newErrors = validateFields();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsSubmitting(false);
      return;
    }

    const { package_id, trainer_price, switch_status, is_published } = formValues;

    if (!trainer_id) {
      console.error('Trainer ID is required.');
      return;
    }

    const convertedValues = {
      package_id: formValues.package_id,
      trainer_ids: [
        {
          id: trainer_id,
          price: formValues.trainer_price,
          is_published: formValues.is_published === 'on' ? 1 : 0,
          status: formValues.switch_status === 'on' ? 1 : 0,
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
                name="trainer_price"
                label="Trainer Price"
                type="number"
                value={formValues.trainer_price}
                onChange={handleChange}
                fullWidth
                error={Boolean(errors.trainer_price)}
                helperText={errors.trainer_price}
                sx={{ marginRight: 3 }}
              />
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
            </Box>
            <FormControlLabel
              control={
                <Switch
                  name="switch_status"
                  checked={formValues.switch_status}
                  onChange={handleChange}
                  color="primary"
                />
              }
              label="Status"
              labelPlacement="start"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formValues.is_published}
                  onChange={handleChange}
                  name="is_published"
                  color="primary"
                />
              }
              label="Published"
              labelPlacement="start"
            />
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

export default TrainerPackageCreateEditForm;
