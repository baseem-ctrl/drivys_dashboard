import * as Yup from 'yup';
import { useCallback, useEffect, useMemo, useState } from 'react';
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
import FormControlLabel from '@mui/material/FormControlLabel';
// utils
import { fData } from 'src/utils/format-number';
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
// types
import { IUserItem } from 'src/types/user';
// assets
import { countries } from 'src/assets/data';
// components
import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, {
  RHFSwitch,
  RHFTextField,
  RHFUploadAvatar,
  RHFAutocomplete,
  RHFSelect,
} from 'src/components/hook-form';
import { createUser, deleteUser, updateUser, useGetUserTypeEnum } from 'src/api/users';
import { IconButton, InputAdornment, MenuItem } from '@mui/material';
import { useAuthContext } from 'src/auth/hooks';
import { useBoolean } from 'src/hooks/use-boolean';
import { ConfirmDialog } from 'src/components/custom-dialog';

// ----------------------------------------------------------------------

type Props = {
  currentUser?: any;
};

export default function UserNewEditForm({ currentUser }: Props) {
  const router = useRouter();
  const { user } = useAuthContext();

  const { enumData, enumLoading } = useGetUserTypeEnum();
  const [filteredValues, setFilteredValues] = useState(enumData);
  const { enqueueSnackbar } = useSnackbar();
  useEffect(() => {
    if (enumData?.length > 0) {
      const updatedValues =
        user?.user?.user_type === 'SYSTEM_ADMIN'
          ? enumData
          : enumData?.filter((item) => item.value !== 'SYSTEM_ADMIN');

      // Update state with the filtered list
      setFilteredValues(updatedValues);
    }
  }, [enumData]);

  const NewUserSchema = Yup.object().shape({
    name: Yup.string().required('Name is required'),
    email: Yup.string().required('Email is required').email('Email must be a valid email address'),
    password: Yup.lazy(() => {
      // If `currentUser?.id` is not present, make the password required
      return currentUser?.id
        ? Yup.string() // No requirements if `currentUser.id` exists
        : Yup.string().required('Password is required'); // Required if `currentUser.id` is not present
    }),
    phone: Yup.string()
      .matches(/^\d{1,9}$/, 'Phone number shpuld not exceed 9 digits ')
      .nullable(),
    country_code: Yup.mixed().nullable(),
    dob: Yup.string().nullable(),
    locale: Yup.string().nullable(), // not required
    user_type: Yup.string(),
    photo_url: Yup.mixed(),
    is_active: Yup.boolean(),
  });

  const defaultValues = useMemo(
    () => ({
      name: currentUser?.name || '',
      user_type: currentUser?.user_type || '',
      email: currentUser?.email || '',
      password: '',
      phone: currentUser?.phone || '',
      country_code: countries?.find((option) => option?.phone === currentUser?.country_code) || '',
      dob: currentUser?.dob?.split('T')[0] || '',
      locale: currentUser?.locale || '',
      photo_url: currentUser?.photo_url || '',
      is_active: currentUser?.is_active || 1,
    }),
    [currentUser]
  );

  const methods = useForm({
    resolver: yupResolver(NewUserSchema) as any,
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

  const values = watch();
  useEffect(() => {
    if (currentUser?.id) {
      reset(defaultValues);
    }
  }, [currentUser, reset]);
  const onSubmit = handleSubmit(async (data) => {
    try {
      let response;
      const body = new FormData();
      body.append('name', data?.name);
      body.append('email', data?.email);
      body.append('password', data?.password);
      body.append('phone', data?.phone);
      body.append('country_code', data?.country_code?.phone);
      if (data?.dob) body.append('dob', data?.dob);
      body.append('user_type', data?.user_type);
      body.append('locale', data?.locale);
      if (data?.photo_url && typeof data?.photo_url === 'file') {
        body.append('photo_url', data?.photo_url);
      }

      if (currentUser?.id) {
        body.append('is_active', data?.is_active ? '1' : '0');
        body.append('user_id', currentUser?.id);
        response = await updateUser(body);
      } else {
        response = await createUser(body);
      }
      if (response) {
        enqueueSnackbar(currentUser ? response?.message : response?.message);
        reset();
        router.push(paths.dashboard.user.list);
      }
    } catch (error) {
      if (error?.errors) {
        Object.values(error?.errors).forEach((errorMessage: any) => {
          enqueueSnackbar(errorMessage[0], { variant: 'error' });
        });
      } else {
        enqueueSnackbar(error.message, { variant: 'error' });
      }
    }
  });

  const handleDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];

      const newFile = Object.assign(file, {
        preview: URL.createObjectURL(file),
      });

      if (file) {
        setValue('photo_url', newFile, { shouldValidate: true });
      }
    },
    [setValue]
  );
  const password = useBoolean();
  const handleDelete = async () => {
    try {
      const response = await deleteUser(currentUser?.id);
      if (response) {
        enqueueSnackbar(response?.message ?? 'User Deleted Successfully');
        router.push(paths.dashboard.user.list);
      }
    } catch (error) {
      enqueueSnackbar(error.message, { variant: 'error' });
      confirm.onFalse();
    }
  };
  const confirm = useBoolean();
  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        {currentUser?.id && (
          <Grid xs={12} md={4}>
            <Card sx={{ pt: 10, pb: 5, px: 3 }}>
              {currentUser && (
                <Label
                  color={
                    (values.is_active === true && 'success') ||
                    (values.is_active === false && 'error') ||
                    'warning'
                  }
                  sx={{ position: 'absolute', top: 24, right: 24 }}
                >
                  {values.is_active ? 'Active' : 'In Active'}
                </Label>
              )}

              <Box sx={{ mb: 5 }}>
                <RHFUploadAvatar
                  name="photo_url"
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
              </Box>

              {currentUser && (
                <Stack justifyContent="center" alignItems="center" sx={{ mt: 3 }}>
                  <Button variant="soft" color="error" onClick={confirm.onTrue}>
                    Delete User
                  </Button>
                </Stack>
              )}
            </Card>
          </Grid>
        )}

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
              <RHFSelect name="user_type" label="User Type">
                {filteredValues?.length > 0 &&
                  filteredValues?.map((option: any) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.name}
                    </MenuItem>
                  ))}
              </RHFSelect>
              <RHFTextField name="name" label="Full Name" />
              <RHFTextField name="email" label="Email Address" />
              <RHFTextField
                name="password"
                label="Password"
                type={password.value ? 'text' : 'password'}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={password.onToggle} edge="end">
                        <Iconify
                          icon={password.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'}
                        />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <RHFAutocomplete
                name="country_code"
                label="Country Code"
                options={countries}
                getOptionLabel={(option) => {
                  return option ? `${option.phone} ${option.label}` : '';
                }}
                isOptionEqualToValue={(option, value) => option.countryCode === value.countryCode}
                filterOptions={(options, state) => {
                  return options.filter(
                    (option) =>
                      // Check if the input matches either countryCode or label
                      option.phone.toLowerCase().includes(state.inputValue.toLowerCase()) ||
                      option.label.toLowerCase().includes(state.inputValue.toLowerCase())
                  );
                }}
                renderOption={(props, option) => {
                  return (
                    <li {...props} key={option.label}>
                      <Iconify
                        key={option.label}
                        icon={`circle-flags:${option.code.toLowerCase()}`}
                        width={28}
                        sx={{ mr: 1 }}
                      />
                      {option.phone} {option.label}
                    </li>
                  );
                }}
              />
              <RHFTextField name="phone" label="Phone Number" />

              <RHFTextField
                name="dob"
                label="Date of Birth"
                type="date"
                InputLabelProps={{ shrink: true }}
              />
              <RHFTextField name="locale" label="Preffered Language " />
              {currentUser?.id && <RHFSwitch name="is_active" label="Is Active" />}
            </Box>

            <Stack alignItems="flex-end" sx={{ mt: 3 }}>
              <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                {!currentUser ? 'Create User' : 'Save Changes'}
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </Grid>
      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete"
        content={<>Are you sure want to delete this user</>}
        onConfirm={() => {
          confirm.onFalse();
          handleDelete();
        }}
        action={
          <Button variant="contained" color="error">
            Delete
          </Button>
        }
      />
    </FormProvider>
  );
}
