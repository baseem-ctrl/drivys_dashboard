import * as Yup from 'yup';
import { useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

// @mui components
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';

// Components and hooks
import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';
import { useRouter } from 'src/routes/hooks';
import FormProvider, {
  RHFSwitch,
  RHFTextField,
  RHFUploadAvatar,
  RHFAutocomplete,
} from 'src/components/hook-form';
import { fData } from 'src/utils/format-number';
import { countries } from 'src/assets/data';
import { UpdateProfile, DeleteUserProfile } from 'src/api/auth';
import { useAuthContext } from 'src/auth/hooks';
import { useGetAllLanguage } from 'src/api/language';

// ----------------------------------------------------------------------

export default function AccountGeneral() {
  const { enqueueSnackbar } = useSnackbar();
  const { user, logout } = useAuthContext();
  const router = useRouter();
  const { language, languageLoading, totalpages, revalidateLanguage, languageError } =
    useGetAllLanguage(0, 1000);
  // Setting up default values

  // Setup Yup schema validation
  const UpdateUserSchema = Yup.object().shape({
    displayName: Yup.string().required('Name is required'),
    email: Yup.string().required('Email is required').email('Email must be a valid email address'),
    photoURL: Yup.mixed<any>().nullable(),
    phoneNumber: Yup.string()
      .required('Phone number is required')
      .matches(/^\d{1,9}$/, 'Phone number should not exceed 9 digits '),
    countryCode: Yup.string().required('Country Code is required'),
    DOB: Yup.string(), // Optional field
    isPublic: Yup.boolean(),
    isActive: Yup.boolean(), // New field for validation
    walletBalance: Yup.number().required('Wallet balance is required'),
    walletPoints: Yup.number().required('Wallet points are required'),
    locale: Yup.mixed().nullable(),
  });
  const defaultValues = {
    countryCode: user?.user?.country_code || '',
    DOB: user?.user?.dob || '',
    displayName: user?.user?.name || '',
    email: user?.user?.email || '',
    photoURL: user?.user?.photo_url || null,
    phoneNumber: user?.user?.phone || '',
    isPublic: user?.user?.is_active || false,
    isActive: user?.user?.is_active || false,
    walletBalance: user?.user?.wallet_balance || 0,
    walletPoints: user?.user?.wallet_points || 0,
    locale: language
      ? language?.find((option) => option?.language_culture === user?.user?.locale)
      : '',
  };
  // Initializing useForm hook with yupResolver and defaultValues
  const methods = useForm({
    resolver: yupResolver(UpdateUserSchema) as any,
    defaultValues,
  });

  const {
    setValue,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = methods;

  // Function to delete user profile
  const handleDeleteUser = async (id) => {
    try {
      await DeleteUserProfile(id);
      enqueueSnackbar('User deleted successfully!', { variant: 'success' });

      // Navigate to home
      router.replace('/');
      await logout();
    } catch (error) {
      enqueueSnackbar('Failed to delete user.', { variant: 'error' });
    }
  };

  // Function to submit the user profile for updating the user profile
  const onSubmit = handleSubmit(async (data) => {
    try {
      console.log('Form submitted');
      console.log('Original form data:', data);

      // Map the data to the required structure for your API
      const updatedData = {
        name: data.displayName,
        email: data.email,
        phone: data.phoneNumber,
        country_code: '971',
        locale: data.locale?.language_culture,
        password: data.password || '',
        photo_url: data.photoURL?.preview || data.photoURL,
        is_active: data.isActive,
      };

      // Call the API with the updated data
      await UpdateProfile(updatedData);
      enqueueSnackbar('Update success!');
    } catch (error) {
      if (error?.errors && typeof error?.errors === 'object' && !Array.isArray(error?.errors)) {
        Object.values(error?.errors).forEach((errorMessage) => {
          enqueueSnackbar(errorMessage[0], { variant: 'error' });
        });
      } else {
        enqueueSnackbar(error.message, { variant: 'error' });
      }
    }
  });

  // Handle image upload
  const handleDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      const newFile = Object.assign(file, {
        preview: URL.createObjectURL(file),
      });

      if (file) {
        setValue('photoURL', newFile, { shouldValidate: true });
      }
    },
    [setValue]
  );

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        <Grid xs={12} md={4}>
          <Card sx={{ pt: 10, pb: 5, px: 3, textAlign: 'center' }}>
            <RHFUploadAvatar
              name="photoURL"
              maxSize={3145728}
              onDrop={handleDrop}
              helperText={
                <Typography
                  variant="caption"
                  sx={{
                    mt: 3,
                    mx: 'auto',
                    display: 'block',
                    textAlign: 'center',
                    color: 'text.disabled',
                  }}
                >
                  Allowed *.jpeg, *.jpg, *.png, *.gif
                  <br /> max size of {fData(3145728)}
                </Typography>
              }
            />

            {/* <RHFSwitch
              name="isActive"
              labelPlacement="start"
              label="Is Active"
              sx={{ mt: 5 }}
              disabled
            /> */}

            {user?.user?.userType === 'ADMIN' ||
              (user?.user?.userType === 'SUPER_ADMIN' && (
                <Button
                  variant="soft"
                  color="error"
                  sx={{ mt: 3 }}
                  onClick={() => handleDeleteUser(user?.user?.id)}
                >
                  Delete User
                </Button>
              ))}
          </Card>
        </Grid>

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
              <RHFTextField name="displayName" label="Name" />
              <RHFTextField name="email" label="Email Address" />
              <RHFTextField name="phoneNumber" label="Phone Number" prefix="+971" />
              {/* <RHFTextField name="countryCode" label="Country Code" /> */}
              <RHFTextField name="password" label="Password" type="password" />
              <RHFAutocomplete
                name="locale"
                label="Locale"
                options={language ?? []}
                getOptionLabel={(option) => {
                  return option ? `${option?.name}` : '';
                }}
                renderOption={(props, option: any) => {
                  return (
                    <li {...props} key={option?.id}>
                      {option?.name}
                    </li>
                  );
                }}
              />
            </Box>
            <RHFSwitch name="isActive" labelPlacement="start" label="Is Active" sx={{ mt: 2 }} />
            <Stack spacing={3} alignItems="flex-end" sx={{ mt: 3 }}>
              <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                Save Changes
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </FormProvider>
  );
}
