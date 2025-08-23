import * as Yup from 'yup';
import { useMemo, useState, useEffect, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { TimePicker } from '@mui/x-date-pickers';
import { useSnackbar } from 'src/components/snackbar';
import { useLocales } from 'src/locales';

import { createSchool, useGetAllSchoolAdmin, useGetSchoolAdmin } from 'src/api/school';
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
  RHFEditor,
} from 'src/components/hook-form';
import moment from 'moment';
import { IDeliveryItem } from 'src/types/product';
import { IconButton, InputAdornment, TextField, Tooltip, Typography } from '@mui/material';
import { countries } from 'src/assets/data';
import Iconify from 'src/components/iconify';
import { InfoOutlined } from '@mui/icons-material';
import { useBoolean } from 'src/hooks/use-boolean';
import { useTranslation } from 'react-i18next';

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
  const { t, i18n } = useTranslation();

  const { language } = useGetAllLanguage(0, 1000);
  const { revalidateSearch } = useGetSchoolAdmin(1000, 1);
  const { schoolAdminList, schoolAdminLoading } = useGetAllSchoolAdmin(1000, 1);

  // State to track translations for each locale
  const [translations, setTranslations] = useState<any>({});
  const [selectedLocale, setSelectedLocale] = useState<string | null>('en');

  const localeOptions = language?.map((item: any) => ({
    label: item.language_culture,
    value: item.language_culture,
  }));

  const DeliverySchema = Yup.object().shape({
    contact_email: Yup.string().test(
      'valid-email-format',
      t('email_invalid_format'),
      function (value) {
        // Only check format if value is present
        if (value) {
          const emailRegex = /^[^@]+@[^@]+\.[^@]+$/;
          return emailRegex.test(value);
        }
        return true; // Skip format check if value is empty
      }
    ),
    contact_phone_number: Yup.number()
      .nullable() // Allow null values
      .test('valid-phone', t('phone_number_invalid_length'), function (value) {
        // Apply regex validation only if phone_number has a value
        if (value) {
          return /^\d{1,9}$/.test(value);
        }
        return true; // No validation if the phone number is empty or null
      }),
    certificate_commission_in_percentage: Yup.string().typeError(
      t('commission_in_percentage_invalid') // Localization key
    ),

    status: Yup.string(),
    name: Yup.string().required(t('name_required')),
    about: Yup.string(),
    locale: Yup.string().required(t('locale_required')),
    is_active: Yup.boolean(),
    create_new_user: Yup.boolean(),
    user_id: Yup.mixed()
      .test('user_id-required', t('user_id_required'), function (value) {
        const { create_new_user } = this.parent;
        if (!create_new_user) {
          return !!value; // Ensures user_id is filled if create_new_user is false
        }
        return true; // No validation if create_new_user is true
      })
      .nullable(),

    user_name: Yup.string().test('user_name-required', t('user_name_required'), function (value) {
      const { create_new_user } = this.parent;
      if (create_new_user) {
        return !!value; // Ensures user_name is filled if create_new_user is true
      }
      return true; // No validation if create_new_user is false
    }),

    user_email: Yup.string()
      .test('user_email-required', t('user_email_required'), function (value) {
        const { create_new_user } = this.parent;
        if (create_new_user) {
          return !!value; // Ensures user_email is filled if create_new_user is true
        }
        return true; // No validation if create_new_user is false
      })
      .test('valid-email-format', t('invalid_email_format'), function (value) {
        // Only check format if value is present
        if (value) {
          const emailRegex = /^[^@]+@[^@]+\.[^@]+$/;
          return emailRegex.test(value);
        }
        return true; // Skip format check if value is empty
      }),
    password: Yup.string().test('password-required', t('password_required'), function (value) {
      const { create_new_user } = this.parent;
      if (create_new_user) {
        return !!value; // Ensures password is filled if create_new_user is true
      }
      return true; // No validation if create_new_user is false
    }),
    phone: Yup.string().test('Maximum 9 digit', t('phone_max_digits'), function (value) {
      const { create_new_user } = this.parent;
      if (create_new_user) {
        return value && value.length === 9 && /^5\d{0,8}$/.test(value); // Ensures phone is filled if create_new_user is true
      }
      return true; // No validation if create_new_user is false
    }),

    country_code: Yup.string(),
    certificate_min_commision: Yup.number()
      .typeError(t('min_commission_must_be_number'))
      .min(0, t('min_commission_min'))
      .max(100, t('min_commission_max'))
      .required(t('min_commission_required')),

    certificate_max_commision: Yup.number()
      .typeError(t('max_commission_must_be_number'))
      .min(0, t('max_commission_min'))
      .max(100, t('max_commission_max'))
      .required(t('max_commission_required'))
      .test('max-greater-than-min', t('max_must_be_greater_than_min'), function (value) {
        const { certificate_min_commision } = this.parent;
        return value >= certificate_min_commision;
      }),
  });

  const defaultValues = useMemo(
    () => ({
      contact_email: '',
      contact_phone_number: '',
      certificate_commission_in_percentage: '',
      status: '',
      name: '',
      about: '',
      locale:
        currentDelivery?.delivery_slot_translation?.find(
          (t) => t?.locale?.toLowerCase() === i18n.language.toLowerCase()
        )?.locale || '',
      is_active: true,
      create_new_user: false,
      user_id: '',
      user_name: '',
      user_email: '',
      password: '',
      phone: '',
      country_code: '971',
      min_commision: '',
      max_commision: '',
      certificate_min_commision: '',
      certificate_max_commision: '',
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

    const formData = new FormData();
    formData.append('contact_email', data?.contact_email);
    formData.append('contact_phone_number', data?.contact_phone_number);
    formData.append('min_commision', data?.min_commision);
    formData.append('max_commision', data?.max_commision);
    formData.append('certificate_min_commision', data?.certificate_min_commision);
    formData.append('certificate_max_commision', data?.certificate_max_commision);

    formData.append(
      'certificate_commission_in_percentage',
      data?.certificate_commission_in_percentage
    );
    formData.append('status', data?.status);
    formData.append('is_active', data.is_active ? '1' : '0');
    formData.append('create_new_user', data.create_new_user ? '1' : '0');
    if (!data?.create_new_user) {
      formData.append('user_id', data?.user_id?.value);
    }
    if (data?.create_new_user) {
      formData.append('name', data?.user_name);
      formData.append('user_email', data?.user_email);
      formData.append('password', data?.password);
      formData.append('phone', data?.phone);
      formData.append('country_code', '971');
    }
    formData.append(`vendor_translations[0][name]`, data?.name);
    formData.append(`vendor_translations[0][locale]`, data?.locale);
    formData.append(`vendor_translations[0][about]`, data?.about);

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
        enqueueSnackbar(error?.message, { variant: 'error' });
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
    setSelectedLocale('en');
    setTranslations({});
  };
  const password = useBoolean();

  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={handleClose}>
      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle>{t('create_school')}</DialogTitle>

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
                name="locale"
                label={t('locale')}
                value={selectedLocale}
                onChange={(e) => handleLocaleChange(e.target.value)}
              >
                {localeOptions?.map((option: any) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </RHFSelect>

              <RHFTextField name="name" label={t('name')} />
            </Box>
            {/* <RHFTextField name="description" label="Description" /> */}
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box display="grid" gridTemplateColumns="repeat(2, 1fr)" columnGap={2}>
            <Grid item xs={6}>
              <RHFTextField name="contact_email" label={t('email')} type="email" />
            </Grid>
            <Grid item xs={6}>
              <RHFTextField
                name="contact_phone_number"
                label={t('contact_number')}
                placeholder="503445679"
                type="number"
                prefix="+971"
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
                    <option value="">{t('select_status')}</option>
                    <option value="active">{t('active')}</option>
                    <option value="suspended">{t('suspended')}</option>
                    <option value="pending_for_verification">
                      {t('pending_for_verification')}
                    </option>
                    <option value="expired">{t('expired')}</option>
                    <option value="cancelled">{t('cancelled')}</option>
                  </RHFTextField>
                )}
              />
            </Grid>

            <Grid item xs={6} mt={2}>
              <RHFTextField
                name="certificate_commission_in_percentage"
                label={t('certificate_commission_in_percentage')}
                type="number"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Tooltip title={t('certificate_commission_tooltip')} placement="top">
                        <InfoOutlined sx={{ color: 'gray', cursor: 'pointer' }} />
                      </Tooltip>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <RHFTextField
              name="min_commision"
              label={t('min_school_commission')}
              fullWidth
              sx={{ mt: 2 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Tooltip title={t('min_commission_tooltip')}>
                      <IconButton>
                        <InfoOutlined />
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>
                ),
              }}
              error={!!errors.min_commision}
              helperText={errors.min_commision?.message}
            />

            <RHFTextField
              name="max_commision"
              label={t('max_school_commission')}
              fullWidth
              sx={{ mt: 2 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Tooltip title={t('max_commission_tooltip')}>
                      <IconButton>
                        <InfoOutlined />
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>
                ),
              }}
              error={!!errors.max_commision}
              helperText={errors.max_commision?.message}
            />
            <RHFTextField
              sx={{ mt: 2 }}
              name="certificate_min_commision"
              label={t('min_certificate_commission')}
              type="number"
            />
            <RHFTextField
              sx={{ mt: 2 }}
              name="certificate_max_commision"
              label={t('max_certificate_commission')}
              type="number"
            />
          </Box>

          <Grid item xs={12} mt={2} mb={2}>
            <Typography
              variant="body1"
              sx={{ fontSize: '17px', fontWeight: '600', ml: 1, mt: 4, mb: 1 }}
            >
              {t('about')}
            </Typography>
            <RHFEditor name="about" fullWidth />
          </Grid>

          <Grid item xs={6} mt={2} mb={2}>
            <RHFCheckbox name="is_active" label={t('active')} />
          </Grid>
          <Grid item xs={6} mt={2} mb={2}>
            <Typography variant="body1" sx={{ fontWeight: '600' }}>
              {t('choose_school_admin')}
            </Typography>
            <RHFCheckbox name="create_new_user" label={t('create_new_school_admin')} />
          </Grid>

          {!values?.create_new_user ? (
            <RHFAutocomplete
              name="user_id"
              label={t('select_school_admin')}
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
              {t('create_new_user')}
              <Box
                display="grid"
                gridTemplateColumns="repeat(2, 1fr)"
                columnGap={2}
                mt={2}
                rowGap={3}
              >
                <RHFTextField name="user_name" label={t('user_name')} />
                <RHFTextField name="user_email" label={t('user_email')} />
                <RHFTextField
                  name="password"
                  label={t('password')}
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
                <RHFTextField name="phone" label={t('phone_number')} prefix="+971" />
              </Box>
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          <Button variant="outlined" onClick={handleClose}>
            {t('cancel')}
          </Button>
          <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
            {t('create')}
          </LoadingButton>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}
