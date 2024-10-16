import * as Yup from 'yup';
import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Grid from '@mui/material/Unstable_Grid2';
import FormControlLabel from '@mui/material/FormControlLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
// utils
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFTextField } from 'src/components/hook-form';
import { updateStateTranslation } from 'src/api/state';

// ----------------------------------------------------------------------

export default function StateNewEditForm({
  handleClosePopup,
  setSelectedState,
  state,
  setViewMode,
  stateProvinceID,
  reload,
}) {
  const { enqueueSnackbar } = useSnackbar();

  const StateSchema = Yup.object().shape({
    name: Yup.string().required('State name is required'),
    locale: Yup.string().required('Locale is required'),
    published: Yup.boolean(),
  });

  const methods = useForm({
    resolver: yupResolver(StateSchema),
    defaultValues: {
      name: state?.translations?.[0]?.name || '',
      locale: state?.translations?.[0]?.locale || 'en',
      published: state?.is_published === '1',
      id: state?.id || '',
    },
  });

  const {
    reset,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { isSubmitting },
  } = methods;

  const selectedLocale = watch('locale');

  // Update name based on locale
  useEffect(() => {
    const translation = state?.translations?.find(
      (translation: { locale: any; }) => translation.locale === selectedLocale
    );
    if (translation) {
      setValue('name', translation.name);
    } else {
      setValue('name', 'N/A');
    }
  }, [selectedLocale, setValue]);

  useEffect(() => {
    if (state) {
      reset({
        name: state?.translations?.[0]?.name || '',
        locale: state?.translations?.[0]?.locale || 'en',
        published: state?.is_published === '1',
        id: state?.id || '',
      });
    }
  }, [state, reset]);

  const onSubmit = handleSubmit(async (state) => {
    try {
      const formData = new FormData();
      console.log('state', state);
      formData.append('order', stateProvinceID);
      formData.append('state_id', state?.id || '');
      formData.append('is_published', state.published ? '1' : '0');
      formData.append('translations[0][locale]', state.locale);
      formData.append('translations[0][name]', state.name);

      // Update state call
      const response = await updateStateTranslation(formData);
      if (response) {
        enqueueSnackbar('State translations updated successfully.');

        setSelectedState(response.data);
        setViewMode('detail');
        handleClosePopup();
        reload();
      }
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
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Grid xs={12} md={8}>
        <Card sx={{ p: 3 }}>
          <Box
            rowGap={3}
            columnGap={2}
            display="grid"
            gridTemplateColumns={{
              xs: 'repeat(1, 1fr)',
              sm: 'repeat(2, 1fr)',
            }}
          >
            <RHFTextField name="name" label="State Name" />

            <FormControl fullWidth variant="outlined">
              <InputLabel>Locale</InputLabel>
              <Controller
                name="locale"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    label="Locale"
                    onChange={(e) => {
                      const newLocale = e.target.value;
                      field.onChange(newLocale);
                    }}
                  >
                    <MenuItem value="en">English</MenuItem>
                    <MenuItem value="ar">Arabic</MenuItem>
                  </Select>
                )}
              />
            </FormControl>

            <FormControlLabel
              control={
                <Controller
                  name="published"
                  control={control}
                  render={({ field }) => <Switch {...field} checked={field.value} />}
                />
              }
              label="Published"
            />
          </Box>
          <Stack direction="row" justifyContent="flex-end" spacing={2} sx={{ mt: 3 }}>
            <LoadingButton variant="contained" onClick={handleClosePopup} sx={{ width: '120px' }}>
              Close
            </LoadingButton>
            <LoadingButton
              variant="contained"
              type="submit"
              loading={isSubmitting}
              sx={{ width: '120px' }}
            >
              Update State
            </LoadingButton>
          </Stack>
        </Card>
      </Grid>
    </FormProvider>
  );
}
