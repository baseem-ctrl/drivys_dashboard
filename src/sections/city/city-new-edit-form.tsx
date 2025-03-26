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
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { IconButton, Tooltip } from '@mui/material';

// utils
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFSelect, RHFSwitch, RHFTextField } from 'src/components/hook-form';
import { updateCityTranslation } from 'src/api/city';
import { useGetAllLanguage } from 'src/api/language';

// ----------------------------------------------------------------------

export default function CityNewEditForm({ handleClosePopup, city, reload }) {
  const { enqueueSnackbar } = useSnackbar();
  const { language } = useGetAllLanguage(0, 1000);
  const localeOptions = (language || []).map((lang) => ({
    value: lang.language_culture,
    label: lang.name,
  }));
  const CitySchema = Yup.object().shape({
    name: Yup.string().required('City name is required'),
    locale: Yup.string().required('Locale is required'),
    published: Yup.boolean(),
    is_certificate_available: Yup.boolean(),
    certificate_price: Yup.string(),
    certificate_link: Yup.string(),
    price_per_km: Yup.string(),
    min_price: Yup.string(),
    reschedule_fee: Yup.mixed(),
    free_reschedule_before: Yup.mixed(),
    free_reschedule_before_type: Yup.mixed(),
  });
  const methods = useForm({
    resolver: yupResolver(CitySchema),
    defaultValues: {
      name: city?.city_translations?.[0]?.name || '',
      locale: city?.city_translations?.[0]?.locale || 'ar',
      published: city?.is_published === 1,
      id: city?.id || '',
      is_certificate_available: !!city?.is_certificate_available ?? false,
      certificate_price: city?.certificate_price || 0,
      certificate_link: city?.certificate_link || '',
      reschedule_fee: city?.reschedule_fee ?? '',
      price_per_km: city?.price_per_km || 0,
      min_price: city?.min_price || 0,
      free_reschedule_before: city?.free_reschedule_before ?? '',
      free_reschedule_before_type: city?.free_reschedule_before_type ?? '',
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
  const rescheduleType = watch('free_reschedule_before_type');
  const rescheduleValue = watch('free_reschedule_before');
  const tooltipTitle =
    rescheduleType === 1
      ? `The reschedule fee applies only after ${rescheduleValue} day(s).`
      : `The reschedule fee applies only after ${rescheduleValue} hour(s).`;
  const values = watch();
  useEffect(() => {
    if (city) {
      reset({
        name: city?.city_translations?.[0]?.name || '',
        locale: city?.city_translations?.[0]?.locale || 'ar',
        published: city?.is_published === 1,
        id: city?.id || '',
        is_certificate_available: !!city?.is_certificate_available ?? false,
        certificate_price: city?.certificate_price || 0,
        certificate_link: city?.certificate_link || '',
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
      setValue('name', '');
    }
  }, [selectedLocale, city, setValue]);

  const onSubmit = handleSubmit(async (city) => {
    try {
      const formData = new FormData();
      formData.append('city_id', city.id);
      formData.append('is_published', city.published ? '1' : '0');
      formData.append('city_translation[0][locale]', city.locale);
      formData.append('city_translation[0][name]', city.name);
      formData.append('is_certificate_available', city.is_certificate_available ? '1' : '0');
      if (city?.is_certificate_available) {
        formData.append('certificate_price', city.certificate_price ?? '0');
        formData.append('certificate_link', city.certificate_link ?? '');
      }
      if (city?.reschedule_fee) {
        formData.append('reschedule_fee', city.reschedule_fee ?? '0');
      }
      if (city?.price_per_km) {
        formData.append('price_per_km', city.price_per_km ?? '0');
      }
      if (city?.min_price) {
        formData.append('min_price', city.min_price ?? '0');
      }
      formData.append('free_reschedule_before', city.free_reschedule_before ?? '0');

      formData.append('free_reschedule_before_type', city.free_reschedule_before_type ?? '0');
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
      <Grid xs={12} md={8} p={3}>
        {/* <Card sx={{ p: 3 }}> */}
        <Box
          rowGap={3}
          columnGap={2}
          display="grid"
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
          <RHFTextField name="name" label="City Name" />

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
          <RHFSwitch name="is_certificate_available" label="Is Certificate Available" />
          {values?.is_certificate_available && (
            <>
              <RHFTextField
                name="certificate_price"
                label="Certificate Price"
                prefix="AED"
                type="number"
              />
              <RHFTextField name="certificate_link" label="Certificate Link" type="url" />
              <RHFTextField name="price_per_km" label="Price Per Km" type="number" />
              <RHFTextField name="min_price" label="Min. Price" type="number" />
              <RHFTextField
                name="reschedule_fee"
                label="Reschedule Fee"
                type="number"
                inputProps={{ min: 2, max: 999999 }}
              />
              <Box display="flex" alignItems="center" gap={1}>
                <RHFSelect name="free_reschedule_before_type" label="Free Reschedule Before Type">
                  <MenuItem value={1}>Day</MenuItem>
                  <MenuItem value={0}>Hour</MenuItem>
                </RHFSelect>
              </Box>
              <Box display="flex" alignItems="center" gap={1}>
                {' '}
                <RHFTextField
                  name="free_reschedule_before"
                  label="Free Reschedule Before"
                  type="number"
                />
                <Tooltip title={tooltipTitle} arrow placement="top">
                  <IconButton size="small" sx={{ padding: 0 }}>
                    <InfoOutlinedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </>
          )}
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
            Update
          </LoadingButton>
        </Stack>
        {/* </Card> */}
      </Grid>
    </FormProvider>
  );
}
