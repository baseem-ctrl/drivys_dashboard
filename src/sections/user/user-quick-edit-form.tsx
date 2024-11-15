import * as Yup from 'yup';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import MenuItem from '@mui/material/MenuItem';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
// _mock
import { USER_STATUS_OPTIONS } from 'src/_mock';
// types
import { IUserItem } from 'src/types/user';
// assets
import { countries } from 'src/assets/data';
// components
import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, {
  RHFSelect,
  RHFTextField,
  RHFAutocomplete,
  RHFSwitch,
} from 'src/components/hook-form';
import { updateUser, useGetUserTypeEnum } from 'src/api/users';
import { useAuthContext } from 'src/auth/hooks';
import { IconButton, InputAdornment, Stack, TextField } from '@mui/material';
import { useBoolean } from 'src/hooks/use-boolean';

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  onClose: VoidFunction;
  currentUser?: any;
  reload?: any;
};

export default function UserQuickEditForm({ currentUser, open, onClose, reload }: Props) {
  const { user } = useAuthContext();

  const { enqueueSnackbar } = useSnackbar();
  const { enumData, enumLoading } = useGetUserTypeEnum();

  const [filteredValues, setFilteredValues] = useState(enumData);
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
    email: Yup.string()
      .required('Email is required')
      .matches(/^[^@]+@[^@]+\.[^@]+$/, 'Email must be in the valid format'),
    password: Yup.lazy(() => {
      // If `currentUser?.id` is not present, make the password required
      return currentUser?.id
        ? Yup.string() // No requirements if `currentUser.id` exists
        : Yup.string().required('Password is required'); // Required if `currentUser.id` is not present
    }),
    phone: Yup.string()
      .matches(/^\d{1,9}$/, 'Phone number should not exceed 9 digits ')
      .nullable(),
    country_code: Yup.string().nullable(),
    is_active: Yup.boolean(),
    user_type: Yup.string(),
  });
  const defaultValues = useMemo(
    () => ({
      name: currentUser?.name || '',
      email: currentUser?.email || '',
      password: '',
      phone: currentUser?.phone || '',
      user_type: currentUser?.user_type || '',
      country_code: currentUser?.country_code || '',
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
    handleSubmit,
    formState: { isSubmitting, errors },
  } = methods;

  useEffect(() => {
    if (currentUser) {
      reset(defaultValues);
    }
  }, [currentUser, defaultValues, reset]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      const body = new FormData();
      body.append('name', data?.name);
      body.append('email', data?.email);
      body.append('password', data?.password);
      body.append('phone', data?.phone);
      body.append('country_code', data?.country_code);
      body.append('user_type', data?.user_type);
      body.append('is_active', data?.is_active ? '1' : '0');
      body.append('user_id', currentUser?.id);
      const response = await updateUser(body);
      if (response) {
        reset();
        onClose();
        enqueueSnackbar(response?.message);
        reload();
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
  const password = useBoolean();

  return (
    <Dialog
      fullWidth
      maxWidth={false}
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { maxWidth: 720 },
      }}
    >
      <FormProvider methods={methods} onSubmit={onSubmit}>
        <DialogTitle>Quick Update</DialogTitle>

        <DialogContent>
          <Box
            rowGap={3}
            columnGap={2}
            display="grid"
            gridTemplateColumns={{
              xs: 'repeat(1, 1fr)',
              sm: 'repeat(2, 1fr)',
            }}
            pt={3}
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
                      <Iconify icon={password.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            {/* <RHFAutocomplete
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
            /> */}
            <Stack direction="row" spacing={1} alignItems="center">
              <RHFTextField name="country_code" label="Country" sx={{ maxWidth: 100 }} />
              <RHFTextField name="phone" label="Phone Number" sx={{ flex: 1 }} />
            </Stack>{' '}
            <RHFSwitch name="is_active" label="Is Active" />{' '}
          </Box>
        </DialogContent>

        <DialogActions>
          <Button variant="outlined" onClick={onClose}>
            Cancel
          </Button>

          <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
            Update
          </LoadingButton>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}
