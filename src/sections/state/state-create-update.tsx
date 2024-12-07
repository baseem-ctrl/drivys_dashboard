import * as Yup from 'yup';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui components
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import MenuItem from '@mui/material/MenuItem';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
// types
import { IStateItem } from 'src/types/state';
// custom components
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFSelect, RHFTextField, RHFSwitch } from 'src/components/hook-form';
import { createStateTranslation, updateStateTranslation } from 'src/api/state';
import { useGetAllLanguage } from 'src/api/language';
import { useGetAllCity } from 'src/api/city';

// ----------------------------------------------------------------------

type Props = {
  title: string;
  open: boolean;
  onClose: VoidFunction;
  currentState?: IStateItem;
  reload: VoidFunction;
};

export default function StateCreateEditForm({ title, currentState, open, onClose, reload }: Props) {
  const { enqueueSnackbar } = useSnackbar();

  const CitySchema = Yup.object().shape({
    name: Yup.string().required('Name is required'),
    locale: Yup.string().required('Locale is required'),
    published: Yup.boolean(),
    order: Yup.number().required('Order is required').integer('Order must be an integer'), // New validation for orderj
  });
  const { language } = useGetAllLanguage(0, 1000);
  const { city, cityLoading, cityError } = useGetAllCity({
    limit: 100,
  });
  console.log('currentState', currentState);
  const localeOptions = (language || []).map((lang) => ({
    value: lang.language_culture,
    label: lang.name,
  }));
  const defaultValues = useMemo(
    () => ({
      name: currentState?.translations?.[0]?.name || '',
      locale: currentState?.translations?.[0]?.locale || 'en',
      city_id: currentState?.city?.city_translations[0]?.city_id || '',
      published: currentState?.is_published === 1,
      order: currentState?.order || 0, // Set default order to 0 if not provided
    }),
    [currentState]
  );
  console.log('defaultValues', defaultValues);
  const methods = useForm({
    resolver: yupResolver(CitySchema) as any,
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    setValue,
    watch,
    formState: { isSubmitting },
  } = methods;
  const selectedLocale = watch('locale');

  // Update name based on locale
  useEffect(() => {
    const translation = currentState?.translations?.find(
      (translation) => translation.locale === selectedLocale
    );
    if (translation) {
      setValue('name', translation.name);
    } else {
      setValue('name', '');
    }
  }, [selectedLocale, setValue]);

  useEffect(() => {
    if (currentState) {
      reset(defaultValues);
    }
  }, [currentState, defaultValues, reset]);
  useEffect(() => {
    const translation = currentState?.translations?.find(
      (translation) => translation.locale === selectedLocale
    );
    if (translation) {
      setValue('name', translation.name);
    } else {
      setValue('name', '');
    }
  }, [selectedLocale, currentState, setValue]);
  const onSubmit = handleSubmit(async (data) => {
    try {
      const formData = new FormData();

      // Add the state ID while updating

      formData.append('city_id', currentState?.city_id || data.city_id);
      formData.append('is_published', data.published ? '1' : '0');
      formData.append('translations[0][locale]', data.locale);
      formData.append('translations[0][name]', data.name);
      formData.append('order', data.order.toString()); // Append the order value

      if (currentState?.id) {
        formData.append('state_id', currentState?.id || '');
        await updateStateTranslation(formData);
        enqueueSnackbar('State translation updated successfully.');
      } else {
        await createStateTranslation(formData);
        enqueueSnackbar('State translation created successfully.');
        reset();
      }

      onClose();
      reload();
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
    }
  });

  return (
    <Dialog
      fullWidth
      maxWidth="md"
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
              <MenuItem value="" disabled>
                Select Locale
              </MenuItem>
              {localeOptions?.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </RHFSelect>
            <RHFSelect name="city_id" label="Select City">
              {city?.map((city: any) =>
                city.city_translations.map((translation: any) => (
                  <MenuItem key={`${city.id}-${translation.locale}`} value={city.id}>
                    {translation.name} ({translation.locale.toUpperCase()})
                  </MenuItem>
                ))
              )}
            </RHFSelect>
            <RHFTextField name="name" label="Name" />
            <RHFTextField name="order" label="Order" type="number" />
            <RHFSwitch name="published" label="Published" />
          </Box>
        </DialogContent>

        <DialogActions>
          <Button variant="outlined" onClick={onClose}>
            Cancel
          </Button>
          <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
            {currentState?.id ? 'Update' : 'Create'}
          </LoadingButton>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}
