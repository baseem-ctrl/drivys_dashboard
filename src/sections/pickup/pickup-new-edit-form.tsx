import * as Yup from 'yup';
import { useEffect, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Autocomplete, TextField } from '@mui/material';
import RHFAutocompleteSearch from 'src/components/hook-form/rhf-autocomplete-search';

import moment from 'moment';

// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import MenuItem from '@mui/material/MenuItem';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

// components
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, {
  RHFSelect,
  RHFTextField,
  RHFSwitch,
  RHFAutocomplete,
} from 'src/components/hook-form';
import { DatePicker, TimePicker } from '@mui/x-date-pickers';
import { useGetAllCity } from 'src/api/city';
import { useGetAllLanguage } from 'src/api/language';
import { createUpdateCityPickupExclusion } from 'src/api/pickup';
import { useTranslation } from 'react-i18next';

// ----------------------------------------------------------------------

export default function PickupCreateEditForm({
  title,
  currentPickup,
  open,
  onClose,
  reload,
}: Props) {
  const { t, i18n } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const { city } = useGetAllCity({
    limit: 1000,
    page: 0,
    is_published: '1',
  });
  const NewUserSchema = Yup.object().shape({
    city_id: Yup.mixed(),
    end_date: Yup.date().required('End Date is required'),
    end_time: Yup.string().required('End Time is required'),
    start_date: Yup.date().required('Start Date is required'),
    start_time: Yup.string().required('Start Time is required'),
    status: Yup.boolean().required('Status is required'),
  });

  const formattedEndTime = moment.utc(currentPickup?.end_time).format('HH:mm');
  const formattedEndTime12hr = moment.utc(currentPickup?.end_time).format('hh:mm a');
  const parseTime = (time) => {
    return moment(time, 'HH:mm:ss').isValid() ? moment(time, 'HH:mm:ss').toDate() : new Date();
  };
  const defaultValues = useMemo(
    () => ({
      city_id: currentPickup?.city
        ? {
            value: currentPickup?.city?.id,
            label:
              currentPickup?.city?.city_translations?.find(
                (t) => t?.locale?.toLowerCase() === i18n.language.toLowerCase()
              )?.name || 'Unknown',
          }
        : null,

      end_date: currentPickup?.end_date ? moment(currentPickup.end_date).toDate() : new Date(),
      end_time: currentPickup?.end_time && parseTime(currentPickup?.end_time),
      start_date: currentPickup?.start_date
        ? moment(currentPickup.start_date).toDate()
        : new Date(),
      start_time: currentPickup?.start_time && parseTime(currentPickup?.start_time),
      status: currentPickup?.status || false,
    }),
    [currentPickup]
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
    formState: { isSubmitting, errors },
  } = methods;

  useEffect(() => {
    if (currentPickup?.id) {
      reset(defaultValues);
    }
  }, [currentPickup, defaultValues, reset]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      const formData = new FormData();
      if (currentPickup?.id) {
        formData.append('id', currentPickup.id);
      }
      formData.append('city_id', data?.city_id?.value || currentPickup.city_id);
      const startDate = data.start_date ? moment(data.start_date).format('YYYY-MM-DD') : '';
      const endDate = data.end_date ? moment(data.end_date).format('YYYY-MM-DD') : '';

      const startTime = data.start_time ? moment.utc(data.start_time).format('HH:mm') : '';

      const endTime = data.end_time ? moment.utc(data.end_time).format('HH:mm') : '';

      formData.append('start_date', startDate);
      formData.append('end_date', endDate);
      formData.append('start_time', startTime);
      formData.append('end_time', endTime);
      formData.append('status', data.status === true ? 1 : 0 || 0);

      if (currentPickup?.id) {
        await createUpdateCityPickupExclusion(formData);
        enqueueSnackbar('Pickup unavailability updated successfully.');
      } else {
        await createUpdateCityPickupExclusion(formData);
        enqueueSnackbar('Pickup unavailability created successfully.');
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
        <DialogTitle>{t(title)}</DialogTitle>

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
            <RHFAutocomplete
              name="city_id"
              label={t('City')}
              options={city?.map((option: any) => ({
                value: option?.id,
                label:
                  option?.city_translations?.find(
                    (tr: any) => tr?.locale?.toLowerCase() === i18n.language.toLowerCase()
                  )?.name ?? 'Unknown',
              }))}
              getOptionLabel={(option) => option?.label ?? ''}
              renderOption={(props, option: any) => (
                <li {...props} key={option?.value?.toString()}>
                  {option?.label ?? 'Unknown'}
                </li>
              )}
            />

            <DatePicker
              name="start_date"
              label={t('Start Date')}
              value={watch('start_date')}
              onChange={(value) => setValue('start_date', value)}
              renderInput={(params) => <RHFTextField {...params} />}
            />

            <TimePicker
              name="start_time"
              label={t('Start Time')}
              value={watch('start_time')}
              onChange={(value) => setValue('start_time', value)}
              renderInput={(params) => <RHFTextField {...params} />}
            />

            <DatePicker
              name="end_date"
              label={t('End Date')}
              value={watch('end_date')}
              onChange={(value) => setValue('end_date', value)}
              renderInput={(params) => <RHFTextField {...params} />}
            />

            <TimePicker
              name="end_time"
              label={t('End Time')}
              value={watch('end_time')}
              onChange={(value) => setValue('end_time', value)}
              renderInput={(params) => <RHFTextField {...params} />}
            />

            <RHFSwitch name="status" label={t('Status')} />
          </Box>
        </DialogContent>

        <DialogActions>
          <Button variant="outlined" onClick={onClose}>
            {t('Cancel')}
          </Button>

          <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
            {currentPickup?.id ? t('Update') : t('Create')}
          </LoadingButton>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}
