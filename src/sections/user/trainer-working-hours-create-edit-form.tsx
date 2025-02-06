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
import { createOrUpdateWorkingHours } from 'src/api/trainer-working-hours';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { Chip } from '@mui/material';

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

  // Validation schema
  const WorkingHoursSchema = Yup.object().shape({
    // day_of_week: Yup.string().required('Day of week is required'),
    working_hours: Yup.array().of(
      Yup.object().shape({
        start_time: Yup.date().required('Start time is required'),
        end_time: Yup.date()
          .required('End time is required')
          .test('is-after-start-time', 'End time must be after start time', function (value) {
            const { start_time } = this.parent;
            return moment(value).isAfter(moment(start_time));
          }),
      })
    ),
    is_off_day: Yup.boolean(),
    is_full_day: Yup.boolean(),
  });

  const defaultValues = useMemo(
    () => ({
      // day_of_week: currentWorkingHour?.day_of_week || 'MONDAY',
      working_hours: currentWorkingHour?.working_hours || [{ start_time: null, end_time: null }],
      is_off_day: currentWorkingHour?.is_off_day || false,
      is_full_day: currentWorkingHour?.is_full_day || false,
    }),
    [currentWorkingHour]
  );

  const methods = useForm({
    resolver: yupResolver(WorkingHoursSchema) as any,
    defaultValues,
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

  useEffect(() => {
    reset(defaultValues);
  }, [currentWorkingHour, defaultValues, reset]);

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
        day_of_week: 'EVERYDAY',
        working_hours: data.working_hours.map((shift) => ({
          start_time: moment(shift.start_time).format('HH:mm'),
          end_time: moment(shift.end_time).format('HH:mm'),
        })),
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
    reset(defaultValues);
    onClose();
  };
  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={handleClose}>
      <FormProvider methods={methods} onSubmit={onSubmit}>
        <DialogTitle>{title}</DialogTitle>

        <DialogContent>
          <Box
            display="grid"
            rowGap={3}
            columnGap={2}
            sx={{ mt: 2 }}
            gridTemplateColumns={{
              xs: 'repeat(1, 1fr)',
              sm: 'repeat(2, 1fr)',
            }}
          >
            <Box sx={{ mb: 2, fontWeight: 'bold', fontSize: '1.1rem' }}>
              Select the shifts for Every Day:
            </Box>
            {/* Is Off Day */}
            {/* <RHFSwitch name="is_off_day" label="Is Off Day" /> */}

            {/* Is Full Day */}
          </Box>
          <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
            {predefinedTimeSlots.map((time, chipIndex) => (
              <Button
                key={chipIndex}
                variant="contained"
                color="primary"
                onClick={() => {
                  setValue(
                    `working_hours.${fields.length - 1}.start_time`,
                    moment(time.start, 'HH:mm').toDate()
                  );
                  setValue(
                    `working_hours.${fields.length - 1}.end_time`,
                    moment(time.end, 'HH:mm').toDate()
                  );
                }}
              >
                {`${time.label} ${time.start} - ${time.end}`}
              </Button>
            ))}
          </Box>
          <RHFSwitch name="is_full_day" label="Is Full Day" />

          {/* Shifts */}

          <Box sx={{ mt: 2 }}>
            {fields.map((field, index) => (
              <Box key={field.id} display="flex" alignItems="center" gap={2} mb={2}>
                <Controller
                  name={`working_hours.${index}.start_time`}
                  control={control}
                  render={({ field }) => (
                    <TimePicker
                      label="Start Time"
                      ampm={false}
                      {...field}
                      onChange={(newValue) => field.onChange(newValue)}
                    />
                  )}
                />
                <Controller
                  name={`working_hours.${index}.end_time`}
                  control={control}
                  render={({ field }) => (
                    <TimePicker
                      label="End Time"
                      ampm={false}
                      {...field}
                      onChange={(newValue) => field.onChange(newValue)}
                    />
                  )}
                />
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => remove(index)}
                  disabled={fields.length === 1}
                >
                  Remove
                </Button>
              </Box>
            ))}
            <Button
              variant="outlined"
              onClick={() => append({ start_time: null, end_time: null })}
              sx={{ mt: 2 }}
            >
              Add Shift
            </Button>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button variant="outlined" onClick={handleClose}>
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
