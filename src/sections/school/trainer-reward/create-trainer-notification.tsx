import { FormProvider, useForm } from 'react-hook-form';
import * as Yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { Box, Button, Stack, TextField, Typography, Container } from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import { useSnackbar } from 'src/components/snackbar';
import RHFAutocompleteSearch from 'src/components/hook-form/rhf-autocomplete-search';
import { useGetSchoolTrainerList } from 'src/api/school';
import { useSettingsContext } from 'src/components/settings';
import { useRouter } from 'src/routes/hooks';
import { useState } from 'react';
import { sendNotification } from 'src/api/send-trainer-notification';
import { paths } from 'src/routes/paths';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

interface NotificationFormData {
  trainer_id: string;
  title: string;
  body: string;
}

export default function TrainerNotificationForm() {
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();
  const settings = useSettingsContext();

  const [searchValue, setSearchValue] = useState('');
  const { schoolTrainersList: trainers, schoolTrainersLoading: trainersLoading } =
    useGetSchoolTrainerList({
      page: 0,
      limit: 100,
    });

  const validationSchema = Yup.object().shape({
    trainer_id: Yup.mixed().required('Trainer is required'),
    title: Yup.string(),
    body: Yup.string(),
  });

  const methods = useForm<NotificationFormData>({
    resolver: yupResolver(validationSchema),
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      const sendData = {
        trainer_id: data.trainer_id?.user_id,
        title: data?.title,
        body: data?.body,
      };
      const response = await sendNotification(sendData);
      if (response) {
        enqueueSnackbar('Notification sent successfully', { variant: 'success' });
        router.push(paths.dashboard.school.trainer);
        reset();
      }
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
      reset();
    }
  });

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Send Notification"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Trainers', href: paths.dashboard.school.trainer },
          { name: 'Send Notification' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />
      <FormProvider {...methods}>
        <Box
          sx={{
            width: '100%',
            maxWidth: 700,
            padding: 4,
            boxShadow: 3,
            borderRadius: 3,
            backgroundColor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <form onSubmit={onSubmit}>
            <Stack spacing={4}>
              <Typography variant="h5" align="center" color="primary.main" fontWeight={600}>
                Send Trainer Notification
              </Typography>

              <RHFAutocompleteSearch
                name="trainer_id"
                label="Select Trainer"
                options={trainers || []}
                value={methods.watch('trainer_id') || null}
                onChange={(event, newValue) => {
                  methods.setValue('trainer_id', newValue);
                }}
                getOptionLabel={(option) => option?.user?.name || 'No Name'}
                renderOption={(props, option) => (
                  <li {...props} key={option.id}>
                    {option?.user?.name || 'No Name'}
                  </li>
                )}
                onInputChange={(event, newInputValue) => setSearchValue(newInputValue)}
                isLoading={trainersLoading}
                error={Boolean(errors.trainer_id)}
                helperText={errors.trainer_id?.message}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select Trainer"
                    variant="outlined"
                    fullWidth
                    error={Boolean(errors.trainer_id)}
                    helperText={errors.trainer_id?.message}
                  />
                )}
              />

              <TextField
                label="Title"
                fullWidth
                error={Boolean(errors.title)}
                helperText={errors.title?.message}
                variant="outlined"
                {...methods.register('title')}
                sx={{
                  marginBottom: 2,
                }}
              />

              <TextField
                label="Body"
                multiline
                rows={4}
                fullWidth
                error={Boolean(errors.body)}
                helperText={errors.body?.message}
                variant="outlined"
                {...methods.register('body')}
                sx={{
                  marginBottom: 2,
                }}
              />

              <Stack direction="row" spacing={2} justifyContent="flex-end">
                <LoadingButton
                  type="submit"
                  variant="contained"
                  loading={isSubmitting}
                  sx={{
                    width: '180px',
                    height: '40px',
                    backgroundColor: 'primary.main',
                    '&:hover': {
                      backgroundColor: 'primary.dark',
                    },
                  }}
                >
                  Send Notification
                </LoadingButton>
              </Stack>
            </Stack>
          </form>
        </Box>
      </FormProvider>
    </Container>
  );
}
