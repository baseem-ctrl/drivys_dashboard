import * as Yup from 'yup';
import { useMemo, useState, useEffect, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { TimePicker } from '@mui/x-date-pickers';
import { useSnackbar } from 'src/components/snackbar';
import { createSchool } from 'src/api/school';
import { useGetAllLanguage } from 'src/api/language';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';
import Grid from '@mui/system/Unstable_Grid/Grid';
import FormProvider, { RHFTextField, RHFCheckbox, RHFSelect } from 'src/components/hook-form';
import moment from 'moment';
import { IDeliveryItem } from 'src/types/product';
import { TextField } from '@mui/material';

type Props = {
  open: boolean;
  onClose: VoidFunction;
  revalidateDeliverey: VoidFunction;
  currentDelivery?: any;
};

export default function SchoolCreateForm({
  currentDelivery,
  open,
  onClose,
  revalidateDeliverey,
}: Props) {
  const { enqueueSnackbar } = useSnackbar();
  const { language } = useGetAllLanguage(0, 1000);

  // State to track translations for each locale
  const [translations, setTranslations] = useState<any>({});
  const [selectedLocale, setSelectedLocale] = useState<string | null>(null);

  const localeOptions = language?.map((item: any) => ({
    label: item.language_culture,
    value: item.language_culture,
  }));

  const DeliverySchema = Yup.object().shape({
    start_time: Yup.string().required('Start time is required'),
    end_time: Yup.string().required('End time is required'),
    max_orders: Yup.number()
      .required('Max orders is required')
      .typeError('Max orders must be a number'),
    day_of_week: Yup.string().required('Day of the week is required'),
    name: Yup.string().required('Name is required'),
    description: Yup.string().required('Description is required'),
    locale: Yup.string().required('Locale is required'),
    published: Yup.boolean(),
  });

  const defaultValues = useMemo(
    () => ({
      start_time: currentDelivery?.start_time || '',
      end_time: currentDelivery?.end_time || '',
      max_orders: currentDelivery?.max_orders || '',
      day_of_week: currentDelivery?.day_of_week || '',
      name: '',
      description: '',
      locale: currentDelivery?.delivery_slot_translation?.[0]?.locale || '',
      published: currentDelivery?.published || false,
    }),
    [currentDelivery]
  );

  const methods = useForm({
    resolver: yupResolver(DeliverySchema) as any,
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { isSubmitting },
  } = methods;

  const currentName = watch('name');
  const currentDescription = watch('description');

  const previousLocaleRef = useRef(selectedLocale);

  // ** 1. Saving current locale's translation before switching **
  const saveCurrentLocaleTranslation = () => {
    if (selectedLocale) {
      setTranslations((prev: any) => ({
        ...prev,
        [selectedLocale]: {
          name: currentName || '',
          description: currentDescription || '',
        },
      }));
    }
  };

  // ** 2. Handle locale change **
  const handleLocaleChange = (newLocale: string) => {
    if (newLocale !== selectedLocale) {
      // Save current locale's data before switching
      saveCurrentLocaleTranslation();

      // Set new locale as selected
      setSelectedLocale(newLocale);
    }
  };

  // ** 3. Load translation when locale changes **
  useEffect(() => {
    if (selectedLocale) {
      // Load the translation data for the newly selected locale
      const translation = translations[selectedLocale] || {};
      setValue('name', translation.name || '');
      setValue('description', translation.description || '');
      setValue('locale', selectedLocale);

      // Update the previous locale
      previousLocaleRef.current = selectedLocale;
    }
  }, [selectedLocale, setValue, translations]);

  // ** 4. Form Submission Logic **
  const onSubmit = async (data: any) => {
    // Save current locale's data before submission
    saveCurrentLocaleTranslation();

    const formData = new FormData();

    formData.append('start_time', moment(data.start_time).format('HH:mm'));
    formData.append('end_time', moment(data.end_time).format('HH:mm'));
    formData.append('max_orders', data.max_orders);
    formData.append('day_of_week', data.day_of_week);
    formData.append('published', data.published ? '1' : '0');

    // Merge all translations before sending to the backend
    Object.keys(translations).forEach((locale, index) => {
      formData.append(`delivery_slot_translation[${index}][name]`, translations[locale].name);
      formData.append(
        `delivery_slot_translation[${index}][description]`,
        translations[locale].description
      );
      formData.append(`delivery_slot_translation[${index}][locale]`, locale);
    });

    try {
      const response = await createSchool(formData);
      if (response) {
        reset();
        onClose();
        revalidateDeliverey();
        enqueueSnackbar('Delivery slot created successfully!', { variant: 'success' });
      }
    } catch (error) {
      enqueueSnackbar('Failed to create delivery slot.', { variant: 'error' });
    }
  };

  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={onClose}>
      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle>Create Delivery Slot</DialogTitle>

        <DialogContent>
          <Box mt={2} rowGap={3} columnGap={2} display="grid" gridTemplateColumns="repeat(1, 1fr)">
            <Box
              display="grid"
              gap={1}
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                sm: '75% 25% ',
              }}
            >
              <RHFTextField name="name" label="Name" />
              <RHFSelect
                name="locale"
                label="Locale"
                onChange={(e) => handleLocaleChange(e.target.value)}
              >
                {localeOptions?.map((option: any) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </RHFSelect>
            </Box>
            <RHFTextField name="description" label="Description" />
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box display="grid" gridTemplateColumns="repeat(2, 1fr)" columnGap={2}>
            <Grid item xs={6}>
              <Controller
                name="start_time"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <TimePicker
                    {...field}
                    sx={{ width: '100%' }}
                    label="Start Time"
                    ampm={false}
                    views={['hours', 'minutes']}
                    format="HH:mm"
                    mask="__:__"
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        error={!!error}
                        helperText={error?.message}
                      />
                    )}
                  />
                )}
              />
            </Grid>
            <Grid item xs={6}>
              <Controller
                name="end_time"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <TimePicker
                    {...field}
                    label="End Time"
                    ampm={false}
                    sx={{ width: '100%' }}
                    views={['hours', 'minutes']}
                    format="HH:mm"
                    mask="__:__"
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        error={!!error}
                        helperText={error?.message}
                      />
                    )}
                  />
                )}
              />
            </Grid>

            <Grid item xs={6} mt={2}>
              <Controller
                name="day_of_week"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <RHFTextField
                    {...field}
                    select
                    SelectProps={{ native: true }}
                    error={!!error}
                    helperText={error?.message}
                  >
                    <option value="">Select Day of Week</option>
                    <option value="0">Saturday</option>
                    <option value="1">Sunday</option>
                    <option value="2">Monday</option>
                    <option value="3">Tuesday</option>
                    <option value="4">Wednesday</option>
                    <option value="5">Thursday</option>
                    <option value="6">Friday</option>
                  </RHFTextField>
                )}
              />
            </Grid>

            <Box mt={2}>
              <RHFTextField name="max_orders" label="Max Orders" />
            </Box>
            <RHFCheckbox name="published" label="Published" />
          </Box>
        </DialogContent>

        <DialogActions>
          <Button variant="outlined" onClick={onClose}>
            Cancel
          </Button>
          <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
            Create
          </LoadingButton>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}
