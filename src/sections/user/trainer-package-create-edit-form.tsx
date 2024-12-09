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
import { useGetPackage, useGetPublicPackage } from 'src/api/package';

const TrainerPackageCreateEditForm = ({
  open,
  onClose,
  onSubmit,
  trainer_details,
  selectedPackage,
  editMode,
  setEditMode,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState({});
  const [formValues, setFormValues] = useState({
    trainer_price: '',
    switch_status: false,
    is_published: false,
    package_id: '',
  });

  useEffect(() => {
    if (open) {
      if (editMode === 'Edit' && selectedPackage) {
        setLoading(true);
        setFormValues({
          trainer_price: selectedPackage?.price || '',
          switch_status: selectedPackage.status === 1 ? true : false, // Convert to boolean
          is_published: selectedPackage.is_published === 1 ? true : false, // Convert to boolean
          package_id: selectedPackage.package_id || '',
        });
        setLoading(false);
      } else {
        setFormValues({
          switch_status: false,
          trainer_price: '',
          is_published: false,
          package_id: '',
        });
        setErrors({});
      }
    }
  }, [selectedPackage, editMode, open]);

  const handleSwitchChange = (e) => {
    const { name, checked } = e.target;

    setFormValues((prev) => ({
      ...prev,
      [name]: checked,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: undefined,
    }));
  };

  useEffect(() => {});
  const { packageList, packageLoading } = useGetPublicPackage({
    vendor_id: trainer_details?.vendor?.id,
    city_id: trainer_details?.user_preference?.city_id,
    is_public: 1,
    is_published: 1,
    category_id: trainer_details?.user_preference?.vehicle_type_id ?? '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (!name || value === undefined) {
      console.error('Missing name or value in event:', e);
      return;
    }

    const updatedValue = name === 'trainer_price' && value !== '' ? parseFloat(value) : value;

    setFormValues((prev) => ({
      ...prev,
      [name]: updatedValue,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: undefined,
    }));
  };

  const validateFields = () => {
    const newErrors = {};
    if (!formValues.trainer_price) newErrors.trainer_price = 'Trainer Price is required.';
    if (!formValues.package_id && !selectedPackage) {
      newErrors.package_id = 'Package ID is required.';
    }
    return newErrors;
  };

  const { packageTrainer, packageTrainerLoading } = useGetPackageTrainerById(trainer_details?.id);
  const handleSubmit = () => {
    // setIsSubmitting(true);
    const newErrors = validateFields();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsSubmitting(false);
      return;
    }

    if (!trainer_details?.id) {
      console.error('Trainer ID is required.');
      return;
    }
    const convertedValues = {
      package_id: formValues.package_id,
      trainer_ids: [
        {
          id: trainer_details?.id,
          price: formValues.trainer_price,
          is_published: formValues.is_published ? 1 : 0,
          status: formValues.switch_status ? 1 : 0,
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
      <DialogTitle>Add Packages</DialogTitle>
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
                onInput={handleChange}
                fullWidth
                error={Boolean(errors.trainer_price)}
                helperText={errors.trainer_price}
                sx={{ marginRight: 3 }}
              />
              {!selectedPackage && (
                <FormControl fullWidth sx={{ mb: 2 }} error={Boolean(errors.package_id)}>
                  <InputLabel id="package-id-label">Package ID</InputLabel>
                  <Select
                    labelId="package-id-label"
                    name="package_id"
                    value={formValues.package_id}
                    onChange={(e) => {
                      handleChange(e);
                    }}
                    label="Package ID"
                  >
                    {packageLoading ? (
                      <MenuItem disabled>Loading...</MenuItem>
                    ) : (
                      packageList.map((pkg) =>
                        pkg.package_translations.map((translation) => (
                          <MenuItem key={translation.id} value={pkg.id}>
                            {translation.name} ({translation.locale}) (ID: {pkg.id})
                          </MenuItem>
                        ))
                      )
                    )}
                  </Select>
                </FormControl>
              )}
            </Box>
            <FormControlLabel
              control={
                <Switch
                  name="switch_status"
                  checked={formValues.switch_status}
                  onChange={handleSwitchChange}
                  color="primary"
                />
              }
              label="Status"
              labelPlacement="start"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formValues.is_published ? 1 : 0}
                  onChange={handleSwitchChange}
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
