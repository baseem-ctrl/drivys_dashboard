import * as Yup from 'yup';
import moment from 'moment';
import { useEffect, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
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
import { createOrUpdateWorkingHours } from 'src/api/trainer-working-hours';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';

// ----------------------------------------------------------------------

type Props = {
  title: string;
  open: boolean;
  onClose: VoidFunction;
  currentWorkingHour?: any;
  reload: VoidFunction;
  userId: number | string;
};

export default function WorkingHoursCreateEditForm({
  title,
  currentWorkingHour,
  open,
  onClose,
  reload,
  userId,
}: Props) {
  const { enqueueSnackbar } = useSnackbar();
  const WorkingHoursSchema = Yup.object().shape({
    day_of_week: Yup.string().required('Day of week is required'),
    start_time: Yup.date().required('Start time is required'),
    end_time: Yup.date().required('End time is required'),
    is_off_day: Yup.boolean(),
    is_full_day: Yup.boolean().test(
      'is-full-day-only-if-not-off-day',
      'Cannot be full day if it is an off day',
      function (value) {
        const { is_off_day } = this.parent;
        return !is_off_day || !value;
      }
    ),
  });
  const defaultTime = new Date();

  const defaultValues = useMemo(
    () => ({
      day_of_week: currentWorkingHour?.day_of_week || 'MONDAY',
      start_time: currentWorkingHour?.start_time
        ? moment.utc(currentWorkingHour.start_time).toDate()
        : defaultTime,
      end_time: currentWorkingHour?.end_time
        ? moment.utc(currentWorkingHour.end_time).toDate()
        : defaultTime,
      is_off_day: currentWorkingHour?.is_off_day || false,
      is_full_day: currentWorkingHour?.is_full_day || false,
    }),
    [currentWorkingHour]
  );

  const methods = useForm({
    resolver: yupResolver(WorkingHoursSchema),
    defaultValues,
  });

  const {
    reset,
    watch,
    handleSubmit,
    control,
    formState: { isSubmitting, errors },
  } = methods;
  useEffect(() => {
    reset(defaultValues);
  }, [currentWorkingHour, defaultValues, reset]);

  const isOffDay = watch('is_off_day');
  const isFullDay = watch('is_full_day');

  useEffect(() => {
    if (isFullDay) {
      reset((formValues) => ({
        ...formValues,
        start_time: new Date(new Date().setHours(0, 0, 0)),
        end_time: new Date(new Date().setHours(0, 0, 0)),
        is_off_day: false,
      }));
    }
  }, [isFullDay, reset]);
  useEffect(() => {
    if (isOffDay) {
      reset((formValues) => ({ ...formValues, is_full_day: false }));
    }
  }, [isOffDay, reset]);
  const onSubmit = handleSubmit(async (data) => {
    try {
      const formData = {
        user_id: userId,
        day_of_week: data.day_of_week,
        start_time: new Date(data.start_time).toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }),
        end_time: new Date(data.end_time).toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }),
        is_off_day: data.is_off_day ? 1 : 0,
        is_full_day: data.is_full_day ? 1 : 0,
        ...(currentWorkingHour?.id && { id: currentWorkingHour.id }),
      };
      await createOrUpdateWorkingHours(formData);
      enqueueSnackbar(
        currentWorkingHour?.id
          ? 'Working hours updated successfully.'
          : 'Working hours created successfully.'
      );

      reset();
      onClose();
      reload();
    } catch (error) {
      enqueueSnackbar(error.message, { variant: 'error' });
    }
  });
  const daysOfWeek = [
    { value: 'MONDAY', label: 'Monday' },
    { value: 'TUESDAY', label: 'Tuesday' },
    { value: 'WEDNESDAY', label: 'Wednesday' },
    { value: 'THURSDAY', label: 'Thursday' },
    { value: 'FRIDAY', label: 'Friday' },
    { value: 'SATURDAY', label: 'Saturday' },
    { value: 'SUNDAY', label: 'Sunday' },
  ];
  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={onClose}>
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
            <Box>
              <RHFSelect name="day_of_week" label="Day of Week">
                {daysOfWeek.map((day) => (
                  <MenuItem key={day.value} value={day.value}>
                    {day.label}
                  </MenuItem>
                ))}
              </RHFSelect>
              {errors.day_of_week && (
                <Box color="error.main" fontSize="small" mt={0.5}>
                  {errors.day_of_week.message}
                </Box>
              )}
            </Box>

            <Box>
              <Controller
                name="start_time"
                control={control}
                render={({ field }) => (
                  <TimePicker
                    label="Start Time"
                    {...field}
                    ampm={false}
                    onChange={(newValue) => field.onChange(newValue)}
                    disabled={isFullDay || isOffDay}
                  />
                )}
              />
              {errors.start_time && (
                <Box color="error.main" fontSize="small" mt={0.5}>
                  {errors.start_time.message}
                </Box>
              )}
            </Box>

            <Box>
              <Controller
                name="end_time"
                control={control}
                render={({ field }) => (
                  <TimePicker
                    label="End Time"
                    {...field}
                    ampm={false}
                    onChange={(newValue) => field.onChange(newValue)}
                    disabled={isFullDay || isOffDay}
                  />
                )}
              />
              {errors.end_time && (
                <Box color="error.main" fontSize="small" mt={0.5}>
                  {errors.end_time.message}
                </Box>
              )}
            </Box>

            <Box>
              <RHFSwitch name="is_off_day" label="Is Off Day" />
            </Box>

            <Box>
              <RHFSwitch name="is_full_day" label="Is Full Day" />
            </Box>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button variant="outlined" onClick={onClose}>
            Cancel
          </Button>
          <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
            {currentWorkingHour?.id ? 'Update' : 'Create'}
          </LoadingButton>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}
