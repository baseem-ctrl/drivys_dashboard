import * as Yup from 'yup';
import { useMemo, useState, useEffect, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { TimePicker } from '@mui/x-date-pickers';
import { useSnackbar } from 'src/components/snackbar';
import { createSchool, useGetSchoolAdmin } from 'src/api/school';
import { useGetAllLanguage } from 'src/api/language';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';
import Grid from '@mui/system/Unstable_Grid/Grid';
import FormProvider, {
  RHFTextField,
  RHFCheckbox,
  RHFSelect,
  RHFAutocomplete,
} from 'src/components/hook-form';
import moment from 'moment';
import { IDeliveryItem } from 'src/types/product';
import { TextField } from '@mui/material';
import { countries } from 'src/assets/data';
import Iconify from 'src/components/iconify';

type Props = {
  open: boolean;
  onClose: VoidFunction;
  revalidateDeliverey: VoidFunction;
  currentDelivery?: any;
};

export default function SchoolCreateForm({
  currentDelivery,
  open,
  onClose,
  revalidateDeliverey,
}: Props) {
  const { enqueueSnackbar } = useSnackbar();
  const { language } = useGetAllLanguage(0, 1000);
  const { schoolAdminList, schoolAdminLoading, revalidateSearch } = useGetSchoolAdmin(1000, 1);

  // State to track translations for each locale
  const [translations, setTranslations] = useState<any>({});
  const [selectedLocale, setSelectedLocale] = useState<string | null>();

  const localeOptions = language?.map((item: any) => ({
    label: item.language_culture,
    value: item.language_culture,
  }));

  const DeliverySchema = Yup.object().shape({
    contact_email: Yup.string().test(
      'valid-email-format',
      'Email must be in the valid format',
      function (value) {
        // Only check format if value is present
        if (value) {
          const emailRegex = /^[^@]+@[^@]+\.[^@]+$/;
          return emailRegex.test(value);
        }
        return true; // Skip format check if value is empty
      }
    ),
    contact_phone_number: Yup.number(),
    commission_in_percentage: Yup.string()
      .required('commission_in_percentage is required')
      .typeError('commission_in_percentage must be a number'),
    status: Yup.string(),
    name: Yup.string().required('Name is required'),
    locale: Yup.string().required('Locale is required'),
    is_active: Yup.boolean(),
    create_new_user: Yup.boolean(),
    user_id: Yup.mixed()
      .test('user_id-required', 'User ID is required', function (value) {
        const { create_new_user } = this.parent;
        if (!create_new_user) {
          return !!value; // Ensures user_id is filled if create_new_user is false
        }
        return true; // No validation if create_new_user is true
      })
      .nullable(),
    user_name: Yup.string().test('user_name-required', 'Username is required', function (value) {
      const { create_new_user } = this.parent;
      if (create_new_user) {
        return !!value; // Ensures user_name is filled if create_new_user is true
      }
      return true; // No validation if create_new_user is false
    }),
    user_email: Yup.string()
      .test('user_email-required', 'Email is required', function (value) {
        const { create_new_user } = this.parent;
        if (create_new_user) {
          return !!value; // Ensures user_email is filled if create_new_user is true
        }
        return true; // No validation if create_new_user is false
      })
      .test('valid-email-format', 'Email must be in the valid format', function (value) {
        // Only check format if value is present
        if (value) {
          const emailRegex = /^[^@]+@[^@]+\.[^@]+$/;
          return emailRegex.test(value);
        }
        return true; // Skip format check if value is empty
      }),
    password: Yup.string().test('password-required', 'Password is required', function (value) {
      const { create_new_user } = this.parent;
      if (create_new_user) {
        return !!value; // Ensures password is filled if create_new_user is true
      }
      return true; // No validation if create_new_user is false
    }),
    phone: Yup.string().test('Maximum 15 digit', 'Maximum 15 digit', function (value) {
      const { create_new_user } = this.parent;
      if (create_new_user) {
        return value && value.length <= 15; // Ensures password is filled if create_new_user is true
      }
      return true; // No validation if create_new_user is false
    }),
    country_code: Yup.string(),
  });

  const defaultValues = useMemo(
    () => ({
      contact_email: '',
      contact_phone_number: 0,
      commission_in_percentage: '',
      status: '',
      name: '',
      locale: currentDelivery?.delivery_slot_translation?.[0]?.locale || '',
      is_active: true,
      create_new_user: false,
      user_id: '',
      user_name: '',
      user_email: '',
      password: '',
      phone: '',
      country_code: '971',
    }),
    []
  );

  const methods = useForm({
    resolver: yupResolver(DeliverySchema) as any,
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { isSubmitting, errors },
  } = methods;

  const currentName = watch('name');
  const currentDescription = watch('description');
  const values = watch();
  const previousLocaleRef = useRef(selectedLocale);
  console.log(errors, 'errors');

  // ** 1. Saving current locale's translation before switching **
  const saveCurrentLocaleTranslation = () => {
    if (selectedLocale) {
      setTranslations((prev: any) => ({
        ...prev,
        [selectedLocale]: {
          name: currentName || '',
          description: currentDescription || '',
        },
      }));
    }
  };

  // ** 2. Handle locale change **
  const handleLocaleChange = (newLocale: string) => {
    if (newLocale !== selectedLocale) {
      // Save current locale's data before switching
      saveCurrentLocaleTranslation();

      // Set new locale as selected
      setSelectedLocale(newLocale);
    }
  };

  // ** 3. Load translation when locale changes **
  useEffect(() => {
    if (selectedLocale) {
      // Load the translation data for the newly selected locale
      const translation = translations[selectedLocale] || {};
      setValue('name', translation.name || '');
      setValue('locale', selectedLocale);

      // Update the previous locale
      previousLocaleRef.current = selectedLocale;
    }
  }, [selectedLocale, setValue, translations]);

  // ** 4. Form Submission Logic **
  const onSubmit = async (data: any) => {
    // Save current locale's data before submission
    saveCurrentLocaleTranslation();
    console.log(data, 'data');

    const formData = new FormData();

    formData.append('contact_email', data?.contact_email);
    formData.append('contact_phone_number', data?.contact_phone_number);
    formData.append('commission_in_percentage', data?.commission_in_percentage);
    formData.append('status', data?.status);
    formData.append('is_active', data.is_active ? '1' : '0');
    formData.append('create_new_user', data.create_new_user ? '1' : '0');
    formData.append('user_id', data?.user_id?.value);
    if (data?.create_new_user) {
      formData.append('name', data?.user_name);
      formData.append('user_email', data?.user_email);
      formData.append('password', data?.password);
      formData.append('phone', data?.phone);
      formData.append('country_code', data?.country_code?.phone);
    }
    formData.append(`vendor_translations[0][name]`, data?.name);
    formData.append(`vendor_translations[0][locale]`, data?.locale);

    try {
      const response = await createSchool(formData);
      if (response) {
        reset();
        handleClose();
        revalidateDeliverey();
        enqueueSnackbar(response?.message, { variant: 'success' });
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
  };
  const handleSearchChange = (e) => {
    revalidateSearch(e?.target?.value);
  };
  const handleClose = () => {
    reset(defaultValues);
    onClose();
  };
  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={handleClose}>
      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle>Create School</DialogTitle>

        <DialogContent>
          <Box mt={2} rowGap={3} columnGap={2} display="grid" gridTemplateColumns="repeat(1, 1fr)">
            <Box
              display="grid"
              gap={1}
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                sm: '25% 75% ',
              }}
            >
              <RHFSelect
                name="locale (Language)"
                label="Locale"
                onChange={(e) => handleLocaleChange(e.target.value)}
              >
                {localeOptions?.map((option: any) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </RHFSelect>
              <RHFTextField name="name" label="Name" />
            </Box>
            {/* <RHFTextField name="description" label="Description" /> */}
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box display="grid" gridTemplateColumns="repeat(2, 1fr)" columnGap={2}>
            <Grid item xs={6}>
              <RHFTextField name="contact_email" label="Email" type="email" />
            </Grid>
            <Grid item xs={6}>
              <RHFTextField
                name="contact_phone_number"
                label="Contact Number"
                maxLength={10}
                placeholder="0503445679"
              />
            </Grid>

            <Grid item xs={6} mt={2}>
              <Controller
                name="status"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <RHFTextField
                    {...field}
                    select
                    SelectProps={{ native: true }}
                    error={!!error}
                    helperText={error?.message}
                  >
                    <option value="">Select Status</option>
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                    <option value="pending_for_verification">Pending for Verification</option>
                    <option value="expired">Expired</option>
                    <option value="cancelled">Cancelled</option>
                  </RHFTextField>
                )}
              />
            </Grid>

            <Box mt={2}>
              <RHFTextField
                name="commission_in_percentage"
                label="Commission in (%)"
                type="number"
              />
            </Box>

            <RHFCheckbox name="is_active" label="Active" />
            <RHFCheckbox name="create_new_user" label="Create New User" />
          </Box>
          {!values?.create_new_user ? (
            <RHFAutocomplete
              name="user_id"
              label="Select Owner"
              options={schoolAdminList.map(({ name, email, id }) => ({
                label: `${name}[${email}]`,
                value: id,
              }))}
              onInputChange={(e: any) => handleSearchChange(e)}
              loading={schoolAdminLoading}
            />
          ) : (
            <Box>
              <Divider sx={{ my: 2 }} />
              Create New User
              <Box
                display="grid"
                gridTemplateColumns="repeat(2, 1fr)"
                columnGap={2}
                mt={2}
                rowGap={3}
              >
                <RHFTextField name="user_name" label="User Name" />
                <RHFTextField name="user_email" label="User Email" />
                <RHFTextField name="password" label="Password" type="password" />
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
                <RHFTextField name="phone" label="Phone Number" prefix="+971" />
              </Box>
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          <Button variant="outlined" onClick={handleClose}>
            Cancel
          </Button>
          <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
            Create
          </LoadingButton>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}
