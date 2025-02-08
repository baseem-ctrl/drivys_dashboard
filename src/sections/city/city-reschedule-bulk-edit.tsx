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
import { createCityTranslation, updateCityTranslation, updateRescheduleBulk } from 'src/api/city';
import { useGetAllLanguage } from 'src/api/language';
import { IconButton, Tooltip } from '@mui/material';

// ----------------------------------------------------------------------

type Props = {
  title: string;
  open: boolean;
  onClose: VoidFunction;
  currentCity?: ICityItem;
  selectedCityIds: any;
  setSelelectedCityId: any;
  onClosePopOver: any;
  reload: VoidFunction;
};

export default function CityUpdateBulkRescheduleFee({
  title,
  currentCity,
  open,
  onClose,
  reload,
  selectedCityIds,
  onClosePopOver,
  setSelelectedCityId,
}: Props) {
  const { enqueueSnackbar } = useSnackbar();
  console.log('selectedCityIds', selectedCityIds);
  const NewUserSchema = Yup.object().shape({
    reschedule_fee: Yup.mixed(),
    free_reschedule_before: Yup.mixed(),
    free_reschedule_before_type: Yup.mixed(),
  });

  const defaultValues = useMemo(
    () => ({
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
  const tooltipTitle =
    rescheduleType === 1
      ? `The reschedule fee applies only after ${rescheduleValue} day(s).`
      : `The reschedule fee applies only after ${rescheduleValue} hour(s).`;
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

      selectedCityIds.forEach((cityId) => {
        formData.append('city_ids[]', cityId);
      });

      if (data?.reschedule_fee) {
        formData.append('reschedule_fee', data.reschedule_fee ?? '0');
      }

      formData.append('free_reschedule_before', data.free_reschedule_before ?? '0');
      formData.append('free_reschedule_before_type', data.free_reschedule_before_type ?? '0');

      await updateRescheduleBulk(formData);
      enqueueSnackbar('Reschedule Fee updated successfully.');

      reset();
      onClose();
      reload();
      onClosePopOver();
      setSelelectedCityId([]);
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
