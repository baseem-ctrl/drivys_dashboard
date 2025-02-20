import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Box, Divider, Grid, Stack, Button, Card, CardContent } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import FormProvider, { RHFTextField, RHFCheckbox } from 'src/components/hook-form';
import { useGetGearEnum, useGetUsers } from 'src/api/users';
import RHFAutocompleteSearch from 'src/components/hook-form/rhf-autocomplete-search';
import { paths } from 'src/routes/paths';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs/custom-breadcrumbs';
import { Container } from '@mui/system';
import { useSettingsContext } from 'src/components/settings';
import { Switch, FormControlLabel } from '@mui/material';
import { useGetAllCategory } from 'src/api/category';
import { useGetAllCity } from 'src/api/city';
import { addCertificateRequest } from 'src/api/certificate';
import { useSnackbar } from 'src/components/snackbar';
import { useRouter } from 'src/routes/hooks';

// import RHFAutocompleteSearch from 'src/components/RHFAutocompleteSearch'; // Import the RHFAutocompleteSearch component

export default function GenerateCertificateForm() {
  const settings = useSettingsContext();
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();

  const { users: studentUsers, usersLoading: studentUsersLoading } = useGetUsers({
    page: 0,
    limit: 1000,
    user_types: 'STUDENT',
  });

  const { users: trainerUsers, usersLoading: trainerUsersLoading } = useGetUsers({
    page: 0,
    limit: 1000,
    user_types: 'TRAINER',
  });
  const { category, categoryLoading } = useGetAllCategory({
    limit: 1000,
    page: 0,
    published: '1',
  });
  const categoryOptions = category?.map((cat) => {
    const firstTranslation = cat.category_translations[0];
    return {
      label: firstTranslation?.name || 'N/A',
      value: cat.id,
    };
  });

  const { city, cityLoading } = useGetAllCity({
    limit: 1000,
    page: 0,
  });
  const cityOptions = city?.map((cityItem) => {
    const firstTranslation = cityItem.city_translations[0];
    return {
      label: firstTranslation?.name || 'N/A',
      value: cityItem.id,
    };
  });
  const { gearData, gearLoading } = useGetGearEnum();

  const [searchValue, setSearchValue] = useState('');

  const methods = useForm({
    defaultValues: {
      student_id: '',
      trainer_id: '',
      certificate_name: '',
      certificate_code: '',
      certificate_template: '',
      is_published: false,
    },
  });

  const {
    reset,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { isSubmitting, errors },
  } = methods;

  const onSubmit = async (data) => {
    try {
      const requestBody = {
        user_id: data.user_id?.value,
        trainer_id: data.trainer_id?.value,
        is_paid: data.is_paid,
        category_id: data.category_id?.value,
        city_id: data.city_id?.value,
        gear_id: data.gear_id?.value,
      };

      const response = await addCertificateRequest(requestBody);

      if (response.status === 'success') {
        router.push(paths.dashboard.certificate);
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
  };

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="List"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          {
            name: 'Generate Certificate',
            href: paths.dashboard.certificate,
          },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <Card sx={{ width: '70%', padding: 3 }}>
        <CardContent>
          <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
            <Box
              mt={2}
              rowGap={3}
              columnGap={2}
              display="grid"
              gridTemplateColumns="repeat(2, 1fr)"
            >
              <Box display="grid" gap={1}>
                <RHFAutocompleteSearch
                  name="user_id"
                  label="Select Student"
                  placeholder="Search for a student"
                  loading={studentUsersLoading}
                  options={studentUsers
                    ?.filter((user) => user.id != null)
                    .map((user) => ({
                      label: user.name || 'N/A',
                      value: user.id,
                    }))}
                  setSearchOwner={setSearchValue}
                />
              </Box>

              <Box display="grid" gap={1}>
                <RHFAutocompleteSearch
                  name="trainer_id"
                  label="Select Trainer"
                  placeholder="Search for a trainer"
                  loading={trainerUsersLoading}
                  options={trainerUsers
                    ?.filter((user) => user.id != null)
                    .map((user) => ({
                      label: user.name || 'N/A',
                      value: user.id,
                    }))}
                  setSearchOwner={setSearchValue}
                />
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box
              display="grid"
              gap={1}
              gridTemplateColumns={{ xs: 'repeat(1, 1fr)', sm: '50% 50%' }} // Two inputs in one line
            >
              <RHFAutocompleteSearch
                name="category_id"
                label="Select Category"
                placeholder="Search for a category"
                loading={categoryLoading}
                options={categoryOptions}
              />

              <RHFAutocompleteSearch
                name="city_id"
                label="Select City"
                placeholder="Search for a city"
                loading={cityLoading}
                options={cityOptions}
              />
            </Box>
            <Divider sx={{ my: 2 }} />
            <Box display="grid" gap={1} gridTemplateColumns="repeat(2, 1fr)">
              <Box display="grid" gap={1}>
                <RHFAutocompleteSearch
                  name="gear_id"
                  label="Select Gear"
                  placeholder="Search for gear"
                  loading={gearLoading}
                  options={gearData?.map((gear) => ({
                    label: gear.name || 'N/A',
                    value: gear.id,
                  }))}
                />
              </Box>

              <Grid item xs={12}>
                <Controller
                  name="is_paid"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={
                        <Switch
                          {...field}
                          checked={field.value}
                          onChange={(e) => field.onChange(e.target.checked)}
                        />
                      }
                      label="Paid"
                    />
                  )}
                />
              </Grid>
            </Box>

            <Stack direction="row" justifyContent="flex-end" spacing={2} mt={3}>
              <Button variant="outlined" onClick={() => reset()}>
                Reset
              </Button>
              <LoadingButton type="submit" loading={isSubmitting} variant="contained">
                Submit
              </LoadingButton>
            </Stack>
          </FormProvider>
        </CardContent>
      </Card>
    </Container>
  );
}
