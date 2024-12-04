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
import { useGetUsers } from 'src/api/users';
import { Chip, FormControl, InputLabel } from '@mui/material';

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
    user_id: Yup.array()
      .of(Yup.string())
      .when('sendAll', {
        is: (sendAll) => sendAll === 0 || sendAll === false,
        then: (schema) => schema.min(1, 'At least one User ID is required'),
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
      user_id: [],
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
  const { users, usersLoading, revalidateUsers } = useGetUsers({
    page: 0,
    limit: 1000,
    user_types: watch('userType'),
  });
  const enumData = [
    {
      name: 'STUDENT',
      value: 'STUDENT',
    },
    {
      name: 'TRAINER',
      value: 'TRAINER',
    },
    {
      name: 'SCHOOL ADMIN',
      value: 'SCHOOL_ADMIN',
    },
  ];
  const onSubmit = handleSubmit(async (data) => {
    try {
      setLoading(true);

      // Prepare the notification data
      const notificationData = {
        user_ids: data.sendAll ? [] : data.user_id, // `user_id` is now an array
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

      reset();
      handleClosePopup(false);
      revalidateNotifications();
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
    } finally {
      setLoading(false);
    }
  });

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
              <FormControl fullWidth>
                <InputLabel>User Type</InputLabel>
                <Controller
                  name="userType"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      label="User Type"
                      onChange={(e) => {
                        field.onChange(e);
                        revalidateUsers({ user_types: e.target.value });

                        setTimeout(() => {
                          document.activeElement?.blur();
                        }, 0);
                      }}
                    >
                      <MenuItem value="" disabled>
                        Select User Type
                      </MenuItem>
                      {Object.entries(enumData).map(([key, value]) => (
                        <MenuItem key={key} value={value.value}>
                          {value.name}
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                />
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>User IDs</InputLabel>
                <Controller
                  name="user_id"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      label="User IDs"
                      multiple
                      disabled={sendAll === 1}
                      value={field.value || []}
                      renderValue={(selected) =>
                        selected.map((id) => {
                          const user = users.find((user) => user.id === id);
                          return (
                            <Chip
                              key={id}
                              label={user?.name || id}
                              onDelete={() => {
                                const newValue = field.value.filter((value) => value !== id);
                                field.onChange(newValue);
                              }}
                              sx={{ margin: '2px' }}
                            />
                          );
                        })
                      }
                    >
                      {users?.map((user) => (
                        <MenuItem key={user.id} value={user.id}>
                          {user.name}
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                />
              </FormControl>

              <RHFTextField name="title" label="Notification Title" fullWidth />
              <RHFTextField name="description" label="Description" fullWidth />
              <RHFTextField
                name="detailMessage"
                label="Detail Message"
                fullWidth
                multiline
                rows={4}
              />

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
