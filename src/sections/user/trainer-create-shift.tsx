import * as Yup from 'yup';
import moment from 'moment';
import { useEffect, useMemo } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import MenuItem from '@mui/material/MenuItem';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFSelect, RHFSwitch } from 'src/components/hook-form';
import { createOrUpdateWorkingHours, createShift } from 'src/api/trainer-working-hours';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { Chip } from '@mui/material';
import { useTranslation } from 'react-i18next';

type Props = {
  open: boolean;
  onClose: VoidFunction;
  currentWorkingHour?: any;
  reload: VoidFunction;
  userId: number | string;
};

export default function CreateTrainerShiftForm({
  currentWorkingHour,
  open,
  onClose,
  reload,
  userId,
}: Props) {
  const { enqueueSnackbar } = useSnackbar();

  const { t } = useTranslation();

  // Validation schema
  const ShiftHoursSchema = Yup.object().shape({
    is_24_shours: Yup.boolean(),
    shift_start_time: Yup.date().when('is_24_shours', {
      is: false,
      then: (schema) => schema.required('Start time is required'),
      otherwise: (schema) => schema.notRequired(),
    }),
    shift_end_time: Yup.date().when('is_24_shours', {
      is: false,
      then: (schema) => schema.required('End time is required'),
      otherwise: (schema) => schema.notRequired(),
    }),
  });

  const methods = useForm({
    resolver: yupResolver(ShiftHoursSchema) as any,
    defaultValues: {
      is_24_shours: false,
    },
  });

  const {
    reset,
    watch,
    handleSubmit,
    control,
    setError,
    setValue,
    formState: { isSubmitting, errors },
  } = methods;

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'working_hours',
  });

  const isOffDay = watch('is_off_day');
  const isFullDay = watch('is_full_day');
  useEffect(() => {
    if (isFullDay) {
      setValue('working_hours', [
        {
          start_time: moment('00:00', 'HH:mm').toDate(),
          end_time: moment('23:59', 'HH:mm').toDate(),
        },
      ]);
    }
  }, [isFullDay, setValue]);
  useEffect(() => {
    if (isOffDay) {
      setValue('working_hours', [{ start_time: null, end_time: null }]);
    }
  }, [isOffDay, setValue]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      const formData = {
        trainer_id: userId,
        is_24_shours: data.is_24_shours ? 1 : 0,
        ...(data.is_24_shours
          ? {}
          : {
              shift_start_time: data.shift_start_time
                ? moment(data.shift_start_time).format('HH:mm')
                : null,
              shift_end_time: data.shift_end_time
                ? moment(data.shift_end_time).format('HH:mm')
                : null,
            }),
      };

      await createShift(formData);
      enqueueSnackbar('Shift created successfully.');
      reset();
      onClose();
      reload();
    } catch (error) {
      if (error?.errors && typeof error?.errors === 'object' && !Array.isArray(error?.errors)) {
        Object.values(error?.errors).forEach((errorMessage: any) => {
          enqueueSnackbar(errorMessage[0], { variant: 'error' });
        });
      } else {
        enqueueSnackbar(error.message, { variant: 'error' });
      }
    }
  });

  // const daysOfWeek = [
  //   { value: 'EVERYDAY', label: 'Everyday' },
  //   { value: 'MONDAY', label: 'Monday' },
  //   { value: 'TUESDAY', label: 'Tuesday' },
  //   { value: 'WEDNESDAY', label: 'Wednesday' },
  //   { value: 'THURSDAY', label: 'Thursday' },
  //   { value: 'FRIDAY', label: 'Friday' },
  //   { value: 'SATURDAY', label: 'Saturday' },
  //   { value: 'SUNDAY', label: 'Sunday' },
  // ];
  const predefinedTimeSlots = [
    { label: 'Morning', start: '08:00', end: '12:00' },
    { label: 'Afternoon', start: '13:00', end: '17:00' },
    { label: 'Evening', start: '18:00', end: '22:00' },
  ];
  const handleClose = () => {
    onClose();
  };
  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={handleClose}>
      <FormProvider methods={methods} onSubmit={onSubmit}>
        <DialogTitle>{t('Create Shift')}</DialogTitle>

        <DialogContent>
          {/* Shifts */}

          <Box sx={{ mt: 2 }}>
            <Box display="flex" alignItems="center" gap={2} mb={2}>
              <Controller
                name="shift_start_time"
                control={control}
                render={({ field }) => (
                  <TimePicker
                    {...field}
                    label={t('Shift Start Time')}
                    ampm={false}
                    disabled={watch('is_24_shours')}
                  />
                )}
              />
              <Controller
                name="shift_end_time"
                control={control}
                render={({ field }) => (
                  <TimePicker
                    {...field}
                    label={t('Shift End Time')}
                    ampm={false}
                    disabled={watch('is_24_shours')}
                  />
                )}
              />
            </Box>

            <RHFSwitch name="is_24_shours" label={t('Available 24 hours')} />
          </Box>
        </DialogContent>

        <DialogActions>
          <Button variant="outlined" onClick={handleClose}>
            {t('Cancel')}
          </Button>
          <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
            {currentWorkingHour?.id ? t('Update') : t('Create')}
          </LoadingButton>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}
