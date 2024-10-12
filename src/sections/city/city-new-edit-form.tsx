import * as Yup from 'yup';
import { useCallback, useMemo, useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import FormControlLabel from '@mui/material/FormControlLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel'; // Import InputLabel
import FormControl from '@mui/material/FormControl'; // Import FormControl
// utils
import { fData } from 'src/utils/format-number';
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
// components
import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFSwitch, RHFTextField } from 'src/components/hook-form';
import { updateCityTranslation } from 'src/api/city';

// ----------------------------------------------------------------------

export default function CityNewEditForm({ setSelectedCity, city, setViewMode, reload }) {
  const { enqueueSnackbar } = useSnackbar();

  const CitySchema = Yup.object().shape({
    name: Yup.string().required('City name is required'),
    locale: Yup.string().required('Locale is required'),
    published: Yup.boolean(),
  });

  const methods = useForm({
    resolver: yupResolver(CitySchema),
    defaultValues: {
      name: city?.city_translations[0]?.name || '',
      locale: city?.city_translations[0]?.locale || 'ar',
      published: city?.is_published === '1',
      id: city?.id || '',
    },
  });

  const {
    reset,
    watch,
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;
  useEffect(() => {
    if (city) {
      reset({
        name: city?.city_translations[0]?.name || '',
        locale: city?.city_translations[0]?.locale || 'ar',
        published: city?.is_published === '1',
        id: city?.id || '',
      });
    }
  }, [city]);
  const onSubmit = handleSubmit(async (city) => {
    try {
      console.log('city', city);
      const formData = new FormData();
      formData.append('city_id', city.id);
      formData.append('is_published', city.published ? '1' : '0');
      formData.append('city_translation[0][locale]', city.locale);
      formData.append('city_translation[0][name]', city.name);

      // Update city call
      console.log('Updating city...');
      const response = await updateCityTranslation(formData);

      if (response) {
        enqueueSnackbar('City translations updated successfully.');
        const selectedCityData = {
          id: response.data.id,
          is_published: response.data.is_published,
          city_translations: response.data.city_translations.map((translation) => ({
            id: response.data.id,
            city_id: translation.city_id,
            locale: city.locale,
            name: city.name,
          })),
          deleted_by: response.data.deleted_by,
          deleted_by_user: response.data.deleted_by_user,
        };

        setSelectedCity(selectedCityData);
        setViewMode('detail');
        reload();
      }
    } catch (error) {
      if (error.errors) {
        // Object.values(error.errors).forEach((errorMessage) => {
        //   enqueueSnackbar(errorMessage[0], { variant: 'error' });
        // });
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

            {/* Wrap Select in FormControl to include a label */}
            <FormControl fullWidth variant="outlined">
              <InputLabel>Locale</InputLabel>
              <Controller
                name="locale"
                control={control}
                render={({ field }) => (
                  <Select {...field} label="Locale">
                    <MenuItem value="en">English</MenuItem>
                    <MenuItem value="ar">Arabic</MenuItem>
                  </Select>
                )}
              />
            </FormControl>

            <FormControlLabel
              labelPlacement="start"
              control={
                <Controller
                  name="published"
                  control={control}
                  render={({ field }) => (
                    <Switch
                      {...field}
                      checked={field.value}
                      onChange={(event) => field.onChange(event.target.checked)}
                    />
                  )}
                />
              }
              label={
                <>
                  <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                    Published
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Toggle to publish or unpublish the city
                  </Typography>
                </>
              }
              sx={{ mx: 0, mb: 3, width: 1, justifyContent: 'space-between' }}
            />
          </Box>

          <Stack alignItems="flex-end" sx={{ mt: 3 }}>
            <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
              Save Changes
            </LoadingButton>
          </Stack>
        </Card>
      </Grid>
    </FormProvider>
  );
}
