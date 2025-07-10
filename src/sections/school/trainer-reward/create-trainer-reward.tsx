import { FormProvider, useForm, Controller } from 'react-hook-form';
import * as Yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { Box, Button, Stack, TextField, Typography } from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import { useSnackbar } from 'src/components/snackbar';
import RHFAutocompleteSearch from 'src/components/hook-form/rhf-autocomplete-search';
import { useGetSchoolTrainerList } from 'src/api/school';
import { createReward } from 'src/api/send-trainer-notification';
import { useState } from 'react';
import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
import { useSettingsContext } from 'src/components/settings';
import Container from '@mui/material/Container';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import RHFFileUpload from 'src/components/hook-form/rhf-text-file';
import { useTranslation } from 'react-i18next';

interface RewardFormData {
  trainer_id: string;
  reward_amount: number;
  reward_txn_id: string;
  tip_message: string;
}

export default function CreateRewardForm() {
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();
  const settings = useSettingsContext();
  const { t } = useTranslation();

  const [searchValue, setSearchValue] = useState('');
  const { schoolTrainersList: trainers, schoolTrainersLoading: trainersLoading } =
    useGetSchoolTrainerList({
      page: 0,
      limit: 100,
    });
  const verifiedTrainers = trainers?.filter((trainer) => trainer?.verified_at != null);
  const validationSchema = Yup.object().shape({
    trainer_id: Yup.mixed().required('Trainer is required'),
    reward_amount: Yup.number().required('Reward amount is required'),
    reward_txn_id: Yup.number(),
    tip_message: Yup.string(),
  });

  const methods = useForm<RewardFormData>({
    resolver: yupResolver(validationSchema),
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      const formData = new FormData();
      formData.append('trainer_id', data.trainer_id?.user_id);
      formData.append('reward_amount', data.reward_amount);
      formData.append('reward_txn_id', data?.reward_txn_id || '');
      formData.append('tip_message', data?.tip_message || '');

      if (data?.document) {
        formData.append('document', data.document);
      }

      const response = await createReward(formData);

      if (response) {
        enqueueSnackbar('Reward created successfully', { variant: 'success' });
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
    }
  });

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading={t('create')}
        links={[
          { name: t('dashboard'), href: paths.dashboard.root },
          { name: t('trainers'), href: paths.dashboard.school.trainer },
          { name: t('create') },
        ]}
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
            mt: 4,
            '& .MuiTextField-root': {
              marginBottom: 2,
            },
          }}
        >
          <form onSubmit={onSubmit}>
            <Stack spacing={4}>
              <Typography variant="h5" align="center" color="primary">
                {t('create_reward_for_trainer')}
              </Typography>
              <Controller
                name="trainer_id"
                control={methods.control}
                render={({ field }) => (
                  <RHFAutocompleteSearch
                    {...field}
                    label={t('select_trainer')}
                    options={verifiedTrainers || []}
                    value={field.value || null}
                    onChange={(event, newValue) => field.onChange(newValue)}
                    getOptionLabel={(option) => option?.user?.name || 'No Name'}
                    renderOption={(props, option) => (
                      <li {...props} key={option.id}>
                        {option?.user?.name || t('n/a')}
                      </li>
                    )}
                    onInputChange={(event, newInputValue) => setSearchValue(newInputValue)}
                    isLoading={trainersLoading}
                    error={Boolean(errors.trainer_id)}
                    helperText={errors.trainer_id?.message}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label={t('select_trainer')}
                        variant="outlined"
                        fullWidth
                        error={Boolean(errors.trainer_id)}
                        helperText={errors.trainer_id?.message}
                      />
                    )}
                  />
                )}
              />

              <Controller
                name="reward_amount"
                control={methods.control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label={t('reward_amount')}
                    type="number"
                    fullWidth
                    error={Boolean(errors.reward_amount)}
                    helperText={errors.reward_amount?.message}
                    variant="outlined"
                    inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                  />
                )}
              />

              <Controller
                name="reward_txn_id"
                control={methods.control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label={t('transaction_id')}
                    fullWidth
                    type="number"
                    error={Boolean(errors.reward_txn_id)}
                    helperText={errors.reward_txn_id?.message}
                    variant="outlined"
                  />
                )}
              />
              <Typography variant="subtitle1" color="primary" sx={{ mb: 1 }}>
                {t('upload_document_proof')}
              </Typography>
              <RHFFileUpload
                label={t('document_proof')}
                name="document"
                helperText={t('upload_file_helper_text')}
              />

              <Controller
                name="tip_message"
                control={methods.control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label={t('tip_message')}
                    multiline
                    rows={4}
                    fullWidth
                    error={Boolean(errors.tip_message)}
                    helperText={errors.tip_message?.message}
                    variant="outlined"
                  />
                )}
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
                  {t('create_reward')}
                </LoadingButton>
              </Stack>
            </Stack>
          </form>
        </Box>
      </FormProvider>
    </Container>
  );
}
