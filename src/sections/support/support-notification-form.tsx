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
import FormProvider, { RHFTextField, RHFSwitch, RHFSelect } from 'src/components/hook-form';
import { sendNotification } from 'src/api/notification'; // Assuming you have this utility
import { IUserItem } from 'src/types/user';
import { useGetUsers } from 'src/api/users';
import { Chip, FormControl, InputLabel } from '@mui/material';
import RHFAutocompleteSearch from 'src/components/hook-form/rhf-autocomplete-search';
import { useTranslation } from 'react-i18next';
import { useGetAllLanguage } from 'src/api/language';

type Props = {
  currentUser?: IUserItem;
  handleClosePopup?: any;
};

export default function SendNotificationForm({
  currentUser,
  handleClosePopup,
  revalidateNotifications,
}: Props) {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const { language } = useGetAllLanguage(0, 1000);

  const localeOptions = (language || []).map((lang) => ({
    value: lang.language_culture,
    label: lang.name,
  }));
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
      locale: 'En',
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
        user_ids: data?.sendAll ? [] : data?.user_id, // `user_id` is now an array
        user_type: data?.userType,
        title: data?.title,
        locale: data?.locale,
        description: data?.description,
        detail_message: data?.detailMessage,
        send_all: data?.sendAll ? 1 : 0,
      };

      const response = await sendNotification(notificationData);

      enqueueSnackbar(t('Notification sent successfully!'), {
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
          <Grid sx={{ p: 3, width: '100%', mb: 5 }}>
            <Box
              rowGap={3}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(2, 1fr)',
              }}
            >
              {/* Locale Selection Dropdown */}
              <RHFSelect name="locale" label={t('Locale')}>
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

              <FormControl fullWidth>
                <InputLabel>{t('User Type')}</InputLabel>
                <Controller
                  name="userType"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      label={t('User Type')}
                      onChange={(e) => {
                        field.onChange(e);
                        revalidateUsers({ user_types: e.target.value });

                        setTimeout(() => {
                          document.activeElement?.blur();
                        }, 0);
                      }}
                    >
                      <MenuItem value="" disabled>
                        {t('Select User Type')}
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
                <Controller
                  name="user_id"
                  control={control}
                  render={({ field }) => (
                    <RHFAutocompleteSearch
                      {...field}
                      label={t('User IDs')}
                      multiple
                      disabled={sendAll === 1}
                      options={users?.map((user) => ({
                        value: user.id,
                        label: user.name,
                      }))}
                      value={field.value || []}
                      onChange={(event, newValue) => {
                        field.onChange(newValue.map((user) => user.value));
                      }}
                      renderOption={(props, option) => (
                        <li {...props} key={option?.value}>
                          {option?.label || 'Unknown'}
                        </li>
                      )}
                    />
                  )}
                />
              </FormControl>

              <RHFTextField name="title" label={t('Notification Title')} fullWidth />
              <RHFTextField name="description" label={t('Description')} fullWidth />
              <RHFTextField name="detailMessage" label={t('Body')} fullWidth multiline rows={4} />

              <RHFSwitch name="sendAll" label={t('Send to all users?')} labelPlacement="start" />
            </Box>

            <Stack alignItems="flex-end" sx={{ mt: 3 }}>
              <LoadingButton type="submit" variant="contained" loading={isSubmitting || loading}>
                {t('Send Notification')}
              </LoadingButton>
            </Stack>
          </Grid>
        </Grid>
      </Grid>
    </FormProvider>
  );
}
