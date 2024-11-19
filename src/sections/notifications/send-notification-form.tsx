import * as Yup from 'yup';
import { useCallback, useMemo, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import FormControlLabel from '@mui/material/FormControlLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
// components
import Label from 'src/components/label';
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFTextField, RHFSwitch } from 'src/components/hook-form';
import { sendNotification } from 'src/api/notification'; // Assuming you have this utility
import { IUserItem } from 'src/types/user';
import { useGetUserTypeEnum } from 'src/api/users';
import { FormControl, InputLabel } from '@mui/material';

type Props = {
  currentUser?: IUserItem;
  handleClosePopup?: any;
};

export default function SendNotificationForm({
  currentUser,
  handleClosePopup,
  revalidateNotifications,
}: Props) {
  const { enqueueSnackbar } = useSnackbar();

  const [loading, setLoading] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const NotificationSchema = Yup.object().shape({
    userType: Yup.string().required('User type is required'),
    user_id: Yup.string().when('sendAll', {
      is: (sendAll) => sendAll === 0 || sendAll === false,
      then: (schema) => schema.required('User ID is required'),
      otherwise: (schema) => schema.notRequired(),
    }),
    title: Yup.string().required('Title is required'),
    description: Yup.string().required('Description is required'),
    detailMessage: Yup.string().required('Detail message is required'),
  });

  const defaultValues = useMemo(
    () => ({
      userType: currentUser?.userType || 'SCHOOL_ADMIN',
      title: '',
      description: '',
      detailMessage: '',
      sendAll: 0,
    }),
    [currentUser]
  );

  const methods = useForm({
    resolver: yupResolver(NotificationSchema),
    defaultValues,
  });

  const {
    reset,
    watch,
    control,
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  // Watch the sendAll field to conditionally disable user_id
  const sendAll = watch('sendAll');
  console.log(watch('sendAll'));
  // Use the custom hook to get user types
  const { enumData, enumLoading, enumError } = useGetUserTypeEnum();

  const onSubmit = handleSubmit(async (data) => {
    try {
      setLoading(true);
      console.log('data', data);
      const notificationData = {
        user_ids: data.sendAll ? [] : [data?.user_id],
        user_type: data.userType,
        title: data.title,
        description: data.description,
        detail_message: data.detailMessage,
        send_all: data.sendAll ? 1 : 0,
      };

      const response = await sendNotification(notificationData);

      enqueueSnackbar('Notification sent successfully!', {
        variant: 'success',
      });

      handleClosePopup(false);
      setLoading(false);
      revalidateNotifications();
    } catch (error) {
      enqueueSnackbar('Something went wrong!', {
        variant: 'error',
      });
      handleClosePopup(false);
      setLoading(false);
    }
  });

  if (enumLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" sx={{ height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  if (enumError) return <Typography>Error loading user types.</Typography>;

  return (
    <FormProvider
      methods={methods}
      onSubmit={onSubmit}
      sx={{ display: 'flex', flexDirection: 'column', width: '100%', mt: 2, mb: 2 }}
    >
      <Grid container spacing={3} sx={{ width: '100%' }}>
        <Grid xs={12}>
          <Card sx={{ p: 3, width: '100%', mb: 5 }}>
            <Box
              rowGap={3}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(2, 1fr)',
              }}
            >
              <RHFTextField name="title" label="Notification Title" fullWidth />

              {/* Conditionally change the label for user_id */}

              <RHFTextField name="user_id" label="User ID" fullWidth disabled={sendAll === 1} />

              <RHFTextField name="description" label="Description" fullWidth multiline rows={4} />
              <RHFTextField
                name="detailMessage"
                label="Detail Message"
                fullWidth
                multiline
                rows={4}
              />

              {/* Add Select for userType */}
              <FormControl fullWidth>
                <InputLabel>User Type</InputLabel>
                <Controller
                  name="userType"
                  control={control}
                  render={({ field }) => (
                    <Select {...field} label="User Type">
                      {/* Placeholder */}
                      <MenuItem value="" disabled>
                        Select User Type
                      </MenuItem>

                      {/* Enum Data */}
                      {Object.entries(enumData).map(([key, value]) => (
                        <MenuItem key={key} value={value.value}>
                          {value.name} {/* Display the name of the user type */}
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                />
              </FormControl>

              <RHFSwitch name="sendAll" label="Send to all users?" labelPlacement="start" />
            </Box>

            <Stack alignItems="flex-end" sx={{ mt: 3 }}>
              <LoadingButton type="submit" variant="contained" loading={isSubmitting || loading}>
                Send Notification
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </FormProvider>
  );
}
