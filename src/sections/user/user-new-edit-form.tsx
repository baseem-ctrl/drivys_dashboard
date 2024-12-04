import * as Yup from 'yup';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import Grid from '@mui/material/Grid';

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
import {
  createUser,
  deleteUser,
  updateUser,
  useGetGearEnum,
  useGetGenderEnum,
  useGetUserDetails,
  useGetUserTypeEnum,
} from 'src/api/users';
import {
  CircularProgress,
  FormControl,
  FormLabel,
  IconButton,
  Input,
  InputAdornment,
  MenuItem,
  TextField,
} from '@mui/material';
import { useAuthContext } from 'src/auth/hooks';
import { useBoolean } from 'src/hooks/use-boolean';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { useGetAllLanguage } from 'src/api/language';
import { useGetAllCategory } from 'src/api/category';
import { useGetAllCity } from 'src/api/city';
import { useGetAllDialect } from 'src/api/dialect';
import RHFAutocompleteSearch from 'src/components/hook-form/rhf-autocomplete-search';
import { useGetSchool } from 'src/api/school';
import moment from 'moment';

// ----------------------------------------------------------------------

type Props = {
  currentUser?: any;
  detailsLoading?: any;
  id?: any;
  revalidateDetails?: any;
};

const fluencyOptions = [
  { name: 'BASIC', value: 'BASIC' },
  { name: 'INTERMEDIATE', value: 'INTERMEDIATE' },
  { name: 'ADVANCED', value: 'ADVANCED' },
  { name: 'NATIVE', value: 'NATIVE' },
];

export default function UserNewEditForm({
  currentUser,
  detailsLoading,
  id,
  revalidateDetails,
}: Props) {
  // const { details, detailsLoading, revalidateDetails } = useGetUserDetails(id);
  // const currentUser = currentUser ?? "";
  const router = useRouter();
  const { user } = useAuthContext();

  const { language, languageLoading, totalpages, revalidateLanguage, languageError } =
    useGetAllLanguage(0, 1000);

  const { enumData, enumLoading } = useGetUserTypeEnum();
  const { genderData, genderLoading } = useGetGenderEnum();
  const { gearData, gearLoading } = useGetGearEnum();
  const [searchCategory, setSearchCategory] = useState('');
  const [filteredValues, setFilteredValues] = useState(enumData);
  const { enqueueSnackbar } = useSnackbar();
  const { category, categoryLoading } = useGetAllCategory({
    limit: 1000,
    page: 0,
    published: '1',
    search: searchCategory,
  });
  const [searchValue, setSearchValue] = useState('');
  const { schoolList, schoolLoading, revalidateSchool } = useGetSchool({
    limit: 1000,
    search: searchValue ?? '',
  });

  const { city } = useGetAllCity({
    limit: 1000,
    page: 0,
    is_published: '1',
  });

  const { dialect } = useGetAllDialect({
    limit: 1000,
    page: 0,
    is_published: 'published',
  });

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
  const [defaultOption, setDefaultOption] = useState<any>(null);
  // const [schoolOptions, setSchoolOptions] = useState();
  const NewUserSchema = Yup.object().shape({
    name: Yup.string().required('Name is required'),
    email: Yup.string()
      .required('Email is required')
      .matches(/^[^@]+@[^@]+\.[^@]+$/, 'Email must be in the valid format'),
    password: Yup.lazy(() => {
      // If `currentUser?.id` is not present, make the password required
      return currentUser?.id
        ? Yup.string() // No requirements if `currentUser.id` exists
        : Yup.string(); // Required if `currentUser.id` is not present
    }),
    phone: Yup.string()
      .required('Phone Number is Required')
      .matches(/^\d{1,9}$/, 'Phone number should not exceed 9 digits '),
    country_code: Yup.string().required('Country &'),
    dob: Yup.string()
      .nullable()
      .test('is-valid-date', 'The dob field must be a valid date.', function (value) {
        if (!value) return true;
        const isValidDate = !isNaN(Date.parse(value));
        return isValidDate;
      })
      .test('is-before-today', 'The dob field must be a date before today.', function (value) {
        if (!value) return true; // Skip if value is missing
        const today = new Date();
        const dob = new Date(value);
        return dob < today; // Check if dob is before today
      })
      .test('is-18-or-older', 'User must be 18 or older.', function (value) {
        if (!value) return true; // Ensure value is provided
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
    user_type: Yup.string().required('User Type is required'),
    photo_url: Yup.mixed(),
    is_active: Yup.boolean(),
    gear: Yup.mixed()
      .nullable()
      .test('gear-required-for-trainer', 'Gear is required for trainers', function (value) {
        const { user_type } = this.parent; // Access other fields in the form
        if (user_type === 'TRAINER') {
          return value != null && value !== ''; // `gear` must have a value if `user_type` is 'TRAINER'
        }
        return true; // Otherwise, `gear` is not required
      }),
    vehicle_type_id: Yup.mixed().nullable(),
    vendor_id: Yup.mixed().nullable(),
    gender: Yup.mixed().nullable(),
    city_id: Yup.mixed().nullable(),
    languages: Yup.array().of(
      Yup.object().shape({
        id: Yup.mixed().required('Language is required'), // Validate court add-on
        fluency_level: Yup.mixed()
          // .typeError("Number of Add Ons must be a number")
          .required('Language fluency is required'), // Validate the number of add-ons
      })
    ),
    school_name: Yup.string()
      .nullable()
      .test('school-name-required', 'School name is required for trainers', function (value) {
        const { user_type, vendor_id } = this.parent; // Access other fields in the form
        if (
          user_type === 'TRAINER' &&
          typeof values.vendor_id === 'object' &&
          (vendor_id?.value === undefined || vendor_id?.value === null)
        ) {
          return value != null; // `gear` must have a value if `user_type` is 'TRAINER'
        }
        return true; // Otherwise, `gear` is not required
      }),
  });
  console.log('currentUser', currentUser);
  const defaultValues = useMemo(
    () => ({
      name: currentUser?.name || '',
      user_type: currentUser?.user_type || '',
      email: currentUser?.email || '',
      password: '',
      phone: currentUser?.phone || '',

      country_code: currentUser?.country_code,
      dob: currentUser?.dob?.split('T')[0] || '',
      locale: language
        ? language?.find((option) => option?.language_culture === currentUser?.locale)
        : '',
      photo_url: currentUser?.photo_url || '',
      is_active: currentUser?.id ? (currentUser?.is_active ? 1 : 0) : 1,
      languages: dialect
        ? currentUser?.languages?.map((lang) => ({
            id:
              dialect?.length > 0
                ? dialect?.find((option) => option?.id === lang?.dialect?.id)
                : '',
            fluency_level: lang?.fluency_level || '',
          }))
        : [],
      gear:
        gearData?.length > 0
          ? gearData?.find(
              (option) =>
                option?.name?.toLowerCase() === currentUser?.user_preference?.gear?.toLowerCase()
            )?.value
          : '',
      vehicle_type_id:
        category
          ?.find((item) => item?.id === currentUser?.user_preference?.vehicle_type_id)
          ?.category_translations.map((translation: any) => translation.name) // Extract all names
          .join(' - ') || '',
      vendor_id: currentUser?.vendor?.id
        ? schoolList.find((school) => school.id === currentUser?.vendor?.id)?.vendor_translations[0]
            ?.name
        : [{ label: 'Other', value: null }],
      gender:
        genderData?.length > 0
          ? genderData?.find(
              (option) =>
                option?.name?.toLowerCase() === currentUser?.user_preference?.gender?.toLowerCase()
            )?.value
          : '',
      city_id: currentUser?.user_preference?.city_id || '',
      school_commission_in_percentage:
        currentUser?.user_preference?.school_commission_in_percentage || '',
      price_per_km: currentUser?.user_preference?.price_per_km || '',
      doc_side: currentUser?.user_preference?.doc_side || '',
      min_price: currentUser?.user_preference?.min_price || '',
      max_radius_in_km: currentUser?.user_preference?.max_radius_in_km || '',
      is_pickup_enabled: currentUser?.user_preference?.is_pickup_enabled ? 1 : 0,
      certificate_commission_in_percentage:
        currentUser?.user_preference?.certificate_commission_in_percentage || '',
      bio: currentUser?.user_preference?.bio || '',
      license_file: currentUser?.user_preference?.license_file || '',
      school_name: currentUser?.school_name || '',
      license_file: currentUser?.user_preference?.license_file || null,
    }),
    [currentUser?.locale, dialect, language, schoolList]
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

  const { fields, remove, append } = useFieldArray({
    control,
    name: 'languages',
  });
  const values = watch();
  useEffect(() => {
    if (values.vendor_id?.value === undefined || values.vendor_id?.value === null) {
      setDefaultOption({ label: 'OTHER', value: null });
    } else {
      // Otherwise, retain the selected value
      const selectedOption = schoolList.find((school) => school.id === values.vendor_id.value);
      if (selectedOption) {
        setDefaultOption({
          label: `${selectedOption.vendor_translations?.[0]?.name}-${selectedOption.email}`,
          value: selectedOption.id,
        });
      }
    }
  }, [values.vendor_id, schoolList]);
  useEffect(() => {
    if (currentUser?.id) {
      reset(defaultValues);
      const selectedOption = schoolList.find((school) => school.id === currentUser?.vendor?.id);
      if (selectedOption) {
        setDefaultOption({
          label: `${selectedOption.vendor_translations?.[0]?.name}-${selectedOption.email}`,
          value: selectedOption.id,
        });
      }
    }
  }, [currentUser?.id, reset, defaultValues]);
  // Function to add more language entry
  const handleAddMore = () => {
    append({ id: '', fluency_level: '' });
    revalidateDetails();
  };

  // Function to delete language entryu
  const handleRemove = (index: number) => {
    remove(index);
    revalidateDetails();
  };

  const handleCancel = () => {
    router.back();
  };
  const onSubmit = handleSubmit(async (data) => {
    try {
      console.log('data', data);

      let response;
      const body = new FormData();
      body.append('name', data?.name);
      body.append('email', data?.email);
      if (data?.password) body.append('password', data?.password);
      body.append('phone', data?.phone);

      // Only append gear if it exists
      if (
        (data?.user_type === 'TRAINER' || data?.user_type === 'STUDENT') &&
        (data?.gear !== null || data?.gear !== undefined)
      ) {
        body.append('gear', data?.gear);
      }
      if (values?.user_type === 'TRAINER' || values?.user_type === 'STUDENT') {
        if (currentUser?.id) {
          body.append(
            'vehicle_type_id',
            data?.vehicle_type_id?.value ?? currentUser?.user_preference?.vehicle_type_id
          );
        } else {
          body.append(
            'vehicle_type_id',
            data?.vehicle_type_id?.value ?? currentUser?.user_preference?.vehicle_type_id
          );
        }
      }
      if (data?.vendor_id) {
        const matchedVendor = schoolList.find(
          (school) => school.vendor_translations[0]?.name === data.vendor_id
        );

        if (matchedVendor?.id) {
          body.append('vendor_id', matchedVendor.id);
        } else if (data?.vendor_id?.value) {
          body.append('vendor_id', data.vendor_id.value);
        }
      }
      if (data?.vendor_id?.value === undefined || data?.vendor_id?.value === null) {
        body.append('school_name', data?.school_name);
      }
      if (data?.gender) body.append('gender', data?.gender);
      if (data?.city_id) body.append('city_id', data?.city_id);
      body.append('country_code', data?.country_code);
      if (data?.dob) body.append('dob', moment(data?.dob).format('YYYY-MM-DD'));
      body.append('user_type', data?.user_type);

      if (data?.user_type === 'TRAINER') {
        // if (data?.is_pickup_enabled)
        body.append('is_pickup_enabled', data.is_pickup_enabled ? 1 : 0);
        if (data?.price_per_km) body.append('price_per_km', data?.price_per_km);
        if (data?.max_radius_in_km) body.append('max_radius_in_km', data?.max_radius_in_km);
        if (data?.min_price) body.append('min_price', data?.min_price);
        if (data?.school_commission_in_percentage)
          body.append('school_commission_in_percentage', data?.school_commission_in_percentage);
        if (data?.certificate_commission_in_percentage)
          body.append(
            'certificate_commission_in_percentage',
            data?.certificate_commission_in_percentage
          );
        if (data?.bio) body.append('bio', data?.bio);
        if (
          data?.license_file &&
          data?.license_file[0] &&
          data?.license_file[0]['0'] instanceof File
        ) {
          body.append('license_file[0]', data?.license_file[0]['0']);
        }
      }

      body.append('locale', data?.locale?.language_culture);
      if (data?.photo_url && data?.photo_url instanceof File) {
        body.append('photo_url', data?.photo_url);
      }

      if (data?.min_price) body.append('min_price', data?.min_price);
      if (data?.bio) body.append('bio', data?.bio);
      if (data?.price_per_km) body.append('price_per_km', data?.price_per_km);
      if (data?.school_commission_in_percentage)
        body.append('school_commission_in_percentage', data?.school_commission_in_percentage);
      if (data?.languages?.length > 0) {
        data?.languages.forEach((languageItem, index) => {
          body.append(`languages[${index}][id]`, languageItem?.id?.id);
          body.append(`languages[${index}][fluency_level]`, languageItem?.fluency_level ?? '');
        });
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
        if (currentUser?.id) {
          revalidateDetails();
        }
        reset();
        router.push(paths.dashboard.user.details(currentUser?.id ?? response?.data?.user?.id));
      }
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

  // Function to add more pairs

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
      confirm.onFalse();
    }
  };

  const confirm = useBoolean();
  if (
    (id && detailsLoading) ||
    // loading ||
    languageLoading ||
    enumLoading ||
    genderLoading ||
    gearLoading
  ) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          margin: '10px',
          alignSelf: 'center',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

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
                    <MenuItem key={option?.value} value={option?.value}>
                      {option?.name}
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
              {values.user_type === 'TRAINER' && (
                <RHFSwitch name="is_pickup_enabled" label="Is Pickup Enabled" />
              )}
              {values.user_type === 'TRAINER' && values?.is_pickup_enabled === true && (
                <RHFTextField name="price_per_km" label="Price Per Km" type="number" />
              )}
              {values.user_type === 'TRAINER' && values?.is_pickup_enabled === true && (
                <RHFTextField name="max_radius_in_km" label="Max Radius in Km" type="number" />
              )}
              {values.user_type === 'TRAINER' && values?.is_pickup_enabled === true && (
                <RHFTextField name="min_price" label="Minimum Price" type="number" />
              )}
              {values.user_type === 'TRAINER' && (
                <RHFAutocompleteSearch
                  name="vendor_id"
                  label="Select School"
                  placeholder="Search School..."
                  options={
                    [
                      ...schoolList?.map((item: any) => ({
                        label: `${item.vendor_translations?.[0]?.name}-${item.email}`, // Display full name
                        value: item.id,
                      })),
                      {
                        label: 'OTHER', // Add the "Other" option
                        value: null, // Value for the "Other" option
                      },
                    ] ?? []
                  }
                  setSearchOwner={(searchTerm: any) => setSearchValue(searchTerm)}
                  disableClearable={true}
                  loading={schoolLoading}
                  value={defaultOption}
                />
              )}
              {values.user_type === 'TRAINER' &&
                typeof values.vendor_id === 'object' &&
                (values.vendor_id?.value === undefined || values.vendor_id?.value === null) && (
                  <RHFTextField name="school_name" label="School Name" />
                )}
              {values.user_type === 'TRAINER' && (
                <RHFTextField
                  name="school_commission_in_percentage"
                  label="School Commission (%)"
                  type="number"
                />
              )}
              {values.user_type === 'TRAINER' && (
                <RHFTextField
                  name="certificate_commission_in_percentage"
                  label="Certificate Commission (%)"
                  type="number"
                />
              )}
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
              <Stack direction="row" spacing={1} alignItems="center">
                <RHFTextField
                  name="country_code"
                  label="Country Code"
                  sx={{ maxWidth: 100 }}
                  prefix="+"
                />

                <RHFTextField name="phone" label="Phone Number" sx={{ flex: 1 }} />
              </Stack>{' '}
              <RHFTextField
                name="dob"
                label="Date of Birth"
                type="date"
                InputLabelProps={{ shrink: true }}
              />
              {currentUser?.id && <RHFSwitch name="is_active" label="Is Active" />}
              {values.user_type === 'TRAINER' && (
                <RHFTextField name="bio" label="Bio" multiline rows={4} />
              )}
            </Box>

            {(values.user_type === 'TRAINER' || values.user_type === 'STUDENT') && (
              <>
                <Typography sx={{ fontWeight: '700', m: 2 }}> User Preferences:</Typography>
                <Box
                  rowGap={3}
                  columnGap={2}
                  display="grid"
                  sx={{ mt: 2 }}
                  gridTemplateColumns={{
                    xs: 'repeat(1, 1fr)',
                    sm: 'repeat(2, 1fr)',
                  }}
                >
                  <RHFAutocompleteSearch
                    name="vehicle_type_id"
                    label="Select Category"
                    placeholder="Search Category..."
                    options={
                      category?.map((item: any) => ({
                        label: item.category_translations
                          .map((translation: any) => translation.name) // Extract all names
                          .join(' - '), // Display full name
                        value: item.id,
                      })) ?? []
                    }
                    setSearchOwner={(searchTerm: any) => setSearchCategory(searchTerm)}
                    disableClearable={true}
                    loading={categoryLoading}
                  />
                  {values.user_type === 'TRAINER' && (
                    <Controller
                      name="license_file[0]"
                      control={control}
                      render={({ field }) => (
                        <FormControl fullWidth>
                          <FormLabel htmlFor="license-file">Upload License</FormLabel>

                          <input
                            type="file"
                            onChange={(e) => {
                              const files = e.target.files;
                              setValue('license_file[0]', files);
                            }}
                          />
                        </FormControl>
                      )}
                    />
                  )}

                  <RHFSelect name="city_id" label="City">
                    {city?.length > 0 &&
                      city?.map((option: any) => (
                        <MenuItem key={option?.id} value={option?.id}>
                          {option?.city_translations[0]?.name ?? 'Unknown'}
                        </MenuItem>
                      ))}
                  </RHFSelect>

                  <RHFSelect name="gender" label="Gender">
                    {genderData?.length > 0 &&
                      genderData?.map((option: any) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.name}
                        </MenuItem>
                      ))}
                  </RHFSelect>
                  <RHFSelect name="gear" label="Gear">
                    {gearData?.length > 0 &&
                      gearData?.map((option: any) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.name}
                        </MenuItem>
                      ))}
                  </RHFSelect>
                </Box>
                {fields.map((languageItem, index) => (
                  <Grid
                    container
                    item
                    spacing={2}
                    sx={{ mt: 2, mb: 2 }}
                    key={languageItem.id || index}
                  >
                    <Grid item xs={12} md={5}>
                      <RHFAutocomplete
                        name={`languages[${index}].id`} // Dynamic name for react-hook-form
                        label={`Language ${index + 1}`}
                        getOptionLabel={(option) => (option ? `${option?.dialect_name}` : '')}
                        options={dialect ?? []}
                        renderOption={(props, option: any) => (
                          <li {...props} key={option?.id}>
                            {option?.dialect_name ?? 'Unknown'}
                          </li>
                        )}
                        defaultValue={dialect.find((d) => d.id === languageItem.id) || null}
                      />
                    </Grid>

                    {/* Value Field */}
                    <Grid item xs={12} md={5}>
                      <RHFSelect
                        name={`languages[${index}].fluency_level`} // Dynamic name for react-hook-form
                        label="Fluency level"
                        defaultValue={languageItem.fluency_level}
                      >
                        {fluencyOptions.map((option: any) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.name}
                          </MenuItem>
                        ))}
                      </RHFSelect>
                    </Grid>

                    {/* Delete Button */}
                    <Grid item xs={12} md={2}>
                      <IconButton onClick={() => handleRemove(index)}>
                        <Iconify icon="solar:trash-bin-trash-bold" />
                      </IconButton>
                    </Grid>
                  </Grid>
                ))}

                <Grid item xs={12} sx={{ mt: 2 }}>
                  <Button variant="contained" onClick={handleAddMore}>
                    Add Language
                  </Button>
                </Grid>
              </>
            )}

            <Stack
              direction="row"
              justifyContent="flex-end"
              alignItems="center"
              spacing={2}
              sx={{ mt: 3 }}
            >
              <Button variant="outlined" onClick={handleCancel}>
                Cancel
              </Button>
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
