import * as Yup from 'yup';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import MenuItem from '@mui/material/MenuItem';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
// types
import { ICityItem } from 'src/types/city';
// components
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFSelect, RHFTextField, RHFSwitch } from 'src/components/hook-form';
import { createCityTranslation, updateCityTranslation } from 'src/api/city';

// ----------------------------------------------------------------------

type Props = {
  title: string;
  open: boolean;
  onClose: VoidFunction;
  currentCity?: ICityItem;
  reload: VoidFunction;
};

export default function CityCreateEditForm({ title, currentCity, open, onClose, reload }: Props) {
  const { enqueueSnackbar } = useSnackbar();

  const NewUserSchema = Yup.object().shape({
    name: Yup.string().required('Name is required'),
    locale: Yup.string().required('Locale is required'),
    published: Yup.boolean(),
  });

  const defaultValues = useMemo(
    () => ({
      name: currentCity?.city_translations[0]?.name || '',
      locale: currentCity?.city_translations[0]?.locale || 'en',
      published: currentCity?.is_published === 1 ? true : false,
    }),
    [currentCity]
  );

  const methods = useForm({
    resolver: yupResolver(NewUserSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    watch,
    setValue,
    formState: { isSubmitting },
  } = methods;
  const selectedLocale = watch('locale');

  useEffect(() => {
    reset(defaultValues);
  }, [currentCity, defaultValues, reset]);
  useEffect(() => {
    const translation = currentCity?.city_translations?.find(
      (translation) => translation.locale === selectedLocale
    );
    if (translation) {
      setValue('name', translation.name);
    } else {
      setValue('name', 'N/A');
    }
  }, [selectedLocale, currentCity, setValue]);
  const onSubmit = handleSubmit(async (data) => {
    try {
      const formData = new FormData();
      formData.append('city_id', currentCity?.id || '');
      formData.append('is_published', data.published ? '1' : '0');
      formData.append('city_translation[0][locale]', data.locale);
      formData.append('city_translation[0][name]', data.name);

      // Conditional API call based on presence of currentCity
      if (currentCity?.id) {
        await updateCityTranslation(formData);
        enqueueSnackbar('City translation updated successfully.');
      } else {
        await createCityTranslation(formData);
        enqueueSnackbar('City translation created successfully.');
      }

      reset();
      onClose();
      reload();
    } catch (error) {
      if (error.errors) {
        Object.values(error.errors).forEach((errorMessage) => {
          enqueueSnackbar(errorMessage[0], { variant: 'error' });
        });
      } else {
        enqueueSnackbar(error.message, { variant: 'error' });
      }
    }
  });

  return (
    <Dialog
      fullWidth
      maxWidth={false}
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { maxWidth: 720 },
      }}
    >
      <FormProvider methods={methods} onSubmit={onSubmit}>
        <DialogTitle>{title}</DialogTitle>

        <DialogContent>
          <Box
            rowGap={3}
            columnGap={2}
            display="grid"
            sx={{ mt: 2 }}
            gridTemplateColumns={{
              xs: 'repeat(1, 1fr)',
              sm: 'repeat(2, 1fr)',
            }}
          >
            <RHFSelect name="locale" label="Locale">
              <MenuItem value="en">English</MenuItem>
              <MenuItem value="ar">Arabic</MenuItem>
            </RHFSelect>
            <RHFTextField name="name" label="Name" />
            <RHFSwitch name="published" label="Published" />
          </Box>
        </DialogContent>

        <DialogActions>
          <Button variant="outlined" onClick={onClose}>
            Cancel
          </Button>

          <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
            {currentCity?.id ? 'Update' : 'Create'}
          </LoadingButton>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}
