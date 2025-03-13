import * as Yup from 'yup';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
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
import { useGetAllLanguage } from 'src/api/language';
import { IconButton, Tooltip } from '@mui/material';

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
    is_certificate_available: Yup.boolean(),
    certificate_price: Yup.string(),
    certificate_link: Yup.string(),
    price_per_km: Yup.string(),

    min_price: Yup.string(),

    reschedule_fee: Yup.mixed(),
    free_reschedule_before: Yup.mixed(),
    free_reschedule_before_type: Yup.mixed(),
  });
  const { language } = useGetAllLanguage(0, 1000);

  const localeOptions = (language || []).map((lang) => ({
    value: lang.language_culture,
    label: lang.name,
  }));
  const defaultValues = useMemo(
    () => ({
      name: currentCity?.city_translations[0]?.name || '',
      locale: currentCity?.city_translations[0]?.locale || localeOptions[0]?.value,
      published: currentCity?.is_published === 1 ? true : false,
      is_certificate_available: !!currentCity?.is_certificate_available ?? false,
      certificate_price: currentCity?.certificate_price || 0,
      price_per_km: currentCity?.price_per_km || 0,
      min_price: currentCity?.min_price || 0,

      certificate_link: currentCity?.certificate_link || '',
      reschedule_fee: currentCity?.reschedule_fee ?? '',
      free_reschedule_before: currentCity?.free_reschedule_before ?? '',
      free_reschedule_before_type: currentCity?.free_reschedule_before_type ?? '',
    }),
    [currentCity]
  );
  const methods = useForm({
    resolver: yupResolver(NewUserSchema) as any,
    defaultValues,
  });
  const {
    reset,
    handleSubmit,
    watch,
    setValue,
    formState: { isSubmitting },
  } = methods;
  const values = watch();
  const selectedLocale = watch('locale');
  const rescheduleType = watch('free_reschedule_before_type');
  const rescheduleValue = watch('free_reschedule_before');
  let tooltipTitle;
  if (!rescheduleType) {
    tooltipTitle = 'A reschedule fee applies every time the student reschedules the slot.';
  } else if (rescheduleType === 1) {
    tooltipTitle = `The reschedule fee applies only after ${rescheduleValue} day(s).`;
  } else {
    tooltipTitle = `The reschedule fee applies only after ${rescheduleValue} hour(s).`;
  }

  useEffect(() => {
    if (currentCity?.id) {
      reset(defaultValues);
    } else {
      reset();
    }
  }, [currentCity, defaultValues, reset]);
  useEffect(() => {
    const translation = currentCity?.city_translations?.find(
      (translation) => translation.locale === selectedLocale
    );
    if (translation) {
      setValue('name', translation.name);
    } else {
      setValue('name', '');
    }
  }, [selectedLocale, currentCity, setValue]);
  const onSubmit = handleSubmit(async (data) => {
    try {
      const formData = new FormData();
      formData.append('city_id', currentCity?.id || '');
      formData.append('is_published', data.published ? '1' : '0');
      formData.append('city_translation[0][locale]', data.locale);
      formData.append('city_translation[0][name]', data.name);

      formData.append('is_certificate_available', data.is_certificate_available ? '1' : '0');
      if (data?.is_certificate_available) {
        formData.append('certificate_price', data.certificate_price ?? '0');
        formData.append('certificate_link', data.certificate_link ?? '');
      }
      if (data?.reschedule_fee) {
        formData.append('reschedule_fee', data.reschedule_fee ?? '0');
      }
      if (data?.price_per_km) {
        formData.append('price_per_km', data.price_per_km ?? '0');
      }
      if (data?.min_price) {
        formData.append('min_price', data.min_price ?? '0');
      }
      if (data?.free_reschedule_before) {
        formData.append('free_reschedule_before', data.free_reschedule_before ?? '0');
      }
      if (data?.free_reschedule_before_type) {
        formData.append('free_reschedule_before_type', data.free_reschedule_before_type ?? '0');
      }

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
  useEffect(() => {
    const defaultLocale = 'En'; // default value

    // Check if locale is not set or incorrect, then set it
    if (!watch('locale')) {
      setValue('locale', defaultLocale);
    }
  }, [watch, setValue]);

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
            {/* <Select value={filters?.locale || ''} onChange={handleFilterLocale} displayEmpty>
          <MenuItem value="" disabled>
            Select Locale
          </MenuItem>
          {localeOptions?.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select> */}
            <RHFSelect name="locale" label="Locale">
              <MenuItem value="" disabled>
                Select Locale
              </MenuItem>
              {localeOptions?.length > 0 ? (
                localeOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))
              ) : (
                <MenuItem value="" disabled>
                  No options available
                </MenuItem>
              )}
            </RHFSelect>
            <RHFTextField name="name" label="Name" />
            <RHFSwitch name="published" label="Published" />
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
              </>
            )}
            <RHFTextField
              name="reschedule_fee"
              label="Reschedule Fee"
              type="number"
              inputProps={{ min: 2, max: 999999 }}
            />
            <RHFTextField name="price_per_km" label="Price Per Km" type="number" />
            <RHFTextField name="min_price" label="Min. Price" type="number" />
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
