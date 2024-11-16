import * as Yup from 'yup';
import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Grid from '@mui/material/Unstable_Grid2';
import FormControlLabel from '@mui/material/FormControlLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
// utils
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFTextField } from 'src/components/hook-form';
import { updateCityTranslation } from 'src/api/city';

// ----------------------------------------------------------------------

export default function CityNewEditForm({ handleClosePopup, city, reload }) {
  const { enqueueSnackbar } = useSnackbar();

  const CitySchema = Yup.object().shape({
    name: Yup.string().required('City name is required'),
    locale: Yup.string().required('Locale is required'),
    published: Yup.boolean(),
  });
  const methods = useForm({
    resolver: yupResolver(CitySchema),
    defaultValues: {
      name: city?.city_translations?.[0]?.name || '',
      locale: city?.city_translations?.[0]?.locale || 'ar',
      published: city?.is_published === 1,
      id: city?.id || '',
    },
  });

  const {
    reset,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { isSubmitting },
  } = methods;

  const selectedLocale = watch('locale');

  useEffect(() => {
    if (city) {
      reset({
        name: city?.city_translations?.[0]?.name || '',
        locale: city?.city_translations?.[0]?.locale || 'ar',
        published: city?.is_published === '1',
        id: city?.id || '',
      });
    }
  }, [city, reset]);

  // Update name based on locale
  useEffect(() => {
    const translation = city?.city_translations?.find(
      (translation) => translation.locale === selectedLocale
    );
    if (translation) {
      setValue('name', translation.name);
    } else {
      setValue('name', 'N/A');
    }
  }, [selectedLocale, city, setValue]);

  const onSubmit = handleSubmit(async (city) => {
    try {
      const formData = new FormData();
      formData.append('city_id', city.id);
      formData.append('is_published', city.published ? '1' : '0');
      formData.append('city_translation[0][locale]', city.locale);
      formData.append('city_translation[0][name]', city.name);

      // Update city call
      const response = await updateCityTranslation(formData);
      if (response) {
        enqueueSnackbar('City translations updated successfully.');

        handleClosePopup();
        reload();
      }
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
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Grid xs={12} md={8}>
        <Card sx={{ p: 3 }}>
          <Box
            rowGap={3}
            columnGap={2}
            display="grid"
            gridTemplateColumns={{
              xs: 'repeat(1, 1fr)',
              sm: 'repeat(2, 1fr)',
            }}
          >
            <RHFTextField name="name" label="City Name" />

            <FormControl fullWidth variant="outlined">
              <InputLabel>Locale</InputLabel>
              <Controller
                name="locale"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    label="Locale"
                    onChange={(e) => {
                      const newLocale = e.target.value; // Get the selected value
                      field.onChange(newLocale); // Update the form state with the new locale
                    }}
                  >
                    <MenuItem value="en">English</MenuItem>
                    <MenuItem value="ar">Arabic</MenuItem>
                  </Select>
                )}
              />
            </FormControl>

            <FormControlLabel
              control={
                <Controller
                  name="published"
                  control={control}
                  render={({ field }) => <Switch {...field} checked={field.value} />}
                />
              }
              label="Published"
            />
          </Box>
          <Stack direction="row" justifyContent="flex-end" spacing={2} sx={{ mt: 3 }}>
            <LoadingButton variant="contained" onClick={handleClosePopup} sx={{ width: '120px' }}>
              Close
            </LoadingButton>
            <LoadingButton
              variant="contained"
              type="submit"
              loading={isSubmitting}
              sx={{ width: '120px' }}
            >
              Update City
            </LoadingButton>
          </Stack>
        </Card>
      </Grid>
    </FormProvider>
  );
}
