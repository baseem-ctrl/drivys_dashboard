import * as Yup from 'yup';
import { useEffect, useMemo, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
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
import { createTrainer, updateUser } from 'src/api/users';
import { useAuthContext } from 'src/auth/hooks';
import { Grid, IconButton, InputAdornment, Stack, TextField } from '@mui/material';
import { useBoolean } from 'src/hooks/use-boolean';
import { useGetSchool } from 'src/api/school';
import RHFAutocompleteSearch from 'src/components/hook-form/rhf-autocomplete-search';
import { useGetAllLanguage } from 'src/api/language';
import moment from 'moment';
import RHFFileUpload from 'src/components/hook-form/rhf-text-file';

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  onClose: VoidFunction;
  currentUser?: any;
  reload?: any;
};

export default function TrainerCreateEditForm({ currentUser, open, onClose, reload }: Props) {
  const { user } = useAuthContext();
  const [searchValue, setSearchValue] = useState('');

  const { enqueueSnackbar } = useSnackbar();
  const { language, languageLoading, totalpages, revalidateLanguage, languageError } =
    useGetAllLanguage(0, 1000);

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
    dob: Yup.string()
      .required('Date of birth is required for students and trainers.')
      .test('is-valid-date', 'The dob field must be a valid date.', function (value) {
        if (!value) return true;
        const isValidDate = !isNaN(Date.parse(value));
        return isValidDate;
      })
      .test('is-before-today', 'The dob field must be a date before today.', function (value) {
        if (!value) return true;
        const today = new Date();
        const dob = new Date(value);
        return dob < today;
      })
      .test('is-18-or-older', 'User must be 18 or older.', function (value) {
        if (!value) return true;
        const today = new Date();
        const birthDate = new Date(value);
        const age = today.getFullYear() - birthDate.getFullYear();
        const monthDifference = today.getMonth() - birthDate.getMonth();
        return (
          age > 18 ||
          (age === 18 &&
            (monthDifference > 0 ||
              (monthDifference === 0 && today.getDate() >= birthDate.getDate())))
        );
      }),
    locale: Yup.mixed().nullable(), // not required
    photo_url: Yup.mixed(),
    vehicle_number: Yup.string(),
    license: Yup.array().of(
      Yup.object().shape({
        license_file: Yup.mixed(), // Validate court add-on
        doc_side: Yup.mixed(), // Validate the number of add-ons
      })
    ),
    cash_clearance_date: Yup.string(),
    max_cash_in_hand_allowed: Yup.string(),
  });
  const defaultValues = useMemo(
    () => ({
      name: currentUser?.user?.name || '',
      email: currentUser?.user?.email || '',
      password: '',
      phone: currentUser?.user?.phone || '',
      country_code: currentUser?.country_code || '',
      is_active: currentUser?.id ? (currentUser?.user?.is_active ? 1 : 0) : 1,
      dob: currentUser?.user?.dob?.split('T')[0] || '',
      locale:
        language?.length > 0
          ? language?.find(
              (option) =>
                option?.language_culture.toLowerCase() === currentUser?.user?.locale.toLowerCase()
            )
          : '',
      photo_url: currentUser?.user?.photo_url || '',
      vehicle_number: currentUser?.user?.vehicle_number || '',
      cash_clearance_date: '',
      max_cash_in_hand_allowed: '',
    }),
    [currentUser?.user, language]
  );

  const methods = useForm({
    resolver: yupResolver(NewUserSchema) as any,
    defaultValues,
  });

  const {
    watch,
    reset,
    handleSubmit,
    control,
    formState: { isSubmitting, errors },
  } = methods;
  const values = watch();
  const {
    fields: licenseFields,
    remove: removeLicense,
    append: appendLicense,
  } = useFieldArray({
    control,
    name: 'license',
  });
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
      if (data?.phone) {
        body.append('country_code', '971');
      }
      body.append('is_active', data?.is_active ? '1' : '0');
      if (data?.dob) body.append('dob', moment(data?.dob).format('YYYY-MM-DD'));
      if (data?.photo_url && data?.photo_url instanceof File) {
        body.append('photo_url', data?.photo_url);
      }
      if (data?.vehicle_number) body.append('vehicle_number', data?.vehicle_number);

      if (currentUser?.user_id) {
        body.append('user_id', currentUser?.user_id);
        const response = await updateUser(body);
        if (response) {
          reset();
          onClose();
          enqueueSnackbar(response?.message);
          reload();
        }
      } else {
        const response = await createTrainer(body);
        if (response) {
          reset();
          onClose();
          enqueueSnackbar(response?.message);
          reload();
        }
      }
    } catch (error) {
      if (error?.errors && typeof error?.errors === 'object' && !Array.isArray(error?.errors)) {
        Object.values(error?.errors).forEach((errorMessage: any) => {
          enqueueSnackbar(errorMessage[0], { variant: 'error' });
        });
      } else {
        enqueueSnackbar(error.message, { variant: 'error' });
      }
    }
  });
  const password = useBoolean();
  const handleAddMoreFile = () => {
    // appendLicense({ license_file: [], doc_side: '' });
    reload();
  };
  const handleRemoveFile = (index: number) => {
    removeLicense(index);
    reload();
  };
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
        <DialogTitle>{currentUser?.id ? 'Update Trinaer' : 'Create Trainer'}</DialogTitle>

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
            <Stack direction="row" spacing={1} alignItems="center">
              <RHFTextField name="phone" label="Phone Number" sx={{ flex: 1 }} prefix="+971" />
            </Stack>{' '}
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
            <RHFTextField
              name="dob"
              label="Date of Birth"
              type="date"
              InputLabelProps={{ shrink: true }}
            />
            <RHFTextField name="vehicle_number" label="Vehicle Number" type="text" />
            <RHFSwitch name="is_active" label="Is Active" />{' '}
          </Box>
        </DialogContent>

        <DialogActions>
          <Button variant="outlined" onClick={onClose}>
            Cancel
          </Button>

          <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
            {currentUser?.id ? 'Update' : 'Create'}
          </LoadingButton>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}
