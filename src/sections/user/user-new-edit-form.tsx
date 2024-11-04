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
import { CircularProgress, IconButton, InputAdornment, MenuItem, TextField } from '@mui/material';
import { useAuthContext } from 'src/auth/hooks';
import { useBoolean } from 'src/hooks/use-boolean';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { useGetAllLanguage } from 'src/api/language';
import { useGetAllCategory } from 'src/api/category';
import { useGetAllCity } from 'src/api/city';
import { useGetAllDialect } from 'src/api/dialect';

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

  const [filteredValues, setFilteredValues] = useState(enumData);
  const { enqueueSnackbar } = useSnackbar();
  const { category } = useGetAllCategory({
    limit: 1000,
    page: 0,
  });

  const { city } = useGetAllCity({
    limit: 1000,
    page: 0,
  });

  const { dialect } = useGetAllDialect({
    limit: 1000,
    page: 0,
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
    country_code: Yup.string().required('Country Code is required'),
    dob: Yup.string().required('Dob is required'),
    locale: Yup.mixed().nullable(), // not required
    user_type: Yup.string().required('User Type is required'),
    photo_url: Yup.mixed(),
    is_active: Yup.boolean(),
    gear: Yup.mixed().nullable(),
    vehicle_type_id: Yup.mixed().nullable(),
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
  });
  const defaultValues = useMemo(
    () => ({
      name: currentUser?.name || '',
      user_type: currentUser?.user_type || '',
      email: currentUser?.email || '',
      password: '',
      phone: currentUser?.phone || '',

      country_code: '971',
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
      vehicle_type_id: currentUser?.user_preference?.vehicle_type_id || '',
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
      is_pickup_enabled: currentUser?.id
        ? currentUser?.user_preference?.is_pickup_enabled
          ? 1
          : 0
        : 1,
      certificate_commission_in_percentage:
        currentUser?.user_preference?.certificate_commission_in_percentage || '',
      bio: currentUser?.user_preference?.bio || '',
      license_file: currentUser?.user_preference?.license_file || '',
    }),
    [currentUser?.locale, dialect, language]
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
    if (currentUser?.id) {
      reset(defaultValues);
      revalidateDetails();
    }
  }, [currentUser?.id, currentUser?.languages, reset, defaultValues]);

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

  // Navigate to the previous page
  const handleCancel = () => {
    router.back();
  };

  const onSubmit = handleSubmit(async (data) => {
    try {
      let response;
      const body = new FormData();
      body.append('name', data?.name);
      body.append('email', data?.email);
      if (data?.password) body.append('password', data?.password);
      body.append('phone', data?.phone);

      body.append('gear', data?.gear);
      if (data.vehicle_type_id) body.append('vehicle_type_id', data?.vehicle_type_id);
      if (data?.gender) body.append('gender', data?.gender);
      if (data?.vehicle_type_id) body.append('vehicle_type_id', data?.vehicle_type_id);
      // if (data?.gender) body.append('gender', data?.gender);
      if (data?.city_id) body.append('city_id', data?.city_id);

      body.append('country_code', data?.country_code);
      if (data?.dob) body.append('dob', data?.dob);
      body.append('user_type', data?.user_type);
      body.append('locale', data?.locale?.language_culture);
      if (data?.photo_url && data?.photo_url instanceof File) {
        body.append('photo_url', data?.photo_url);
      }
      if (data?.certificate_commission_in_percentage)
        body.append(
          'certificate_commission_in_percentage',
          data?.certificate_commission_in_percentage
        );
      if (data?.is_pickup_enabled) body.append('is_pickup_enabled', data.is_pickup_enabled ? 1 : 0);
      if (data?.max_radius_in_km) body.append('max_radius_in_km', data?.max_radius_in_km);

      if (data?.min_price) body.append('min_price', data?.min_price);
      if (data?.bio) body.append('bio', data?.bio);
      if (data?.price_per_km) body.append('price_per_km', data?.price_per_km);
      if (data?.school_commission_in_percentage)
        body.append('school_commission_in_percentage', data?.school_commission_in_percentage);

      // if (data?.languages && Array.isArray(data?.languages)) {
      //   console.log(data?.languages, "data?.languages");

      //   // Convert the array
      //   const convertedArray = data?.languages.map((item: any, index: number) => ({
      //     id: item?.court_attribute_id?.value,
      //     fluency_level: Number(item.fluency_level.value)  // Convert "value" string to number
      //   }));

      //   convertedArray.forEach((addon, index) => {
      //     if (addon.court_attribute_id) {
      //       body.append(`attributes[${index}][court_attribute_id]`, addon.court_attribute_id);
      //     }
      //     // Use nullish coalescing to handle cases where `value` might be 0
      //     body.append(`attributes[${index}][value]`, addon.value ?? '');
      //   });
      // }language[${index}].id
      if (data?.languages?.length > 0) {
        data?.languages?.forEach((languageItem, index) => {
          body.append(`languages[${index}][id]`, languageItem?.id?.id);

          // Use nullish coalescing to handle cases where `value` might be 0
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
      if (error?.errors) {
        Object.values(error?.errors).forEach((errorMessage: any) => {
          enqueueSnackbar(errorMessage[0], { variant: 'error' });
        });
      } else {
        enqueueSnackbar(error.message, { variant: 'error' });
      }
    }
  });
  useEffect(() => {
    if (currentUser) {
      reset(defaultValues);
    }
  }, [currentUser, reset, defaultValues]);
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
      enqueueSnackbar(error.message, { variant: 'error' });
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
                <RHFTextField name="price_per_km" label="Price Per Km" type="number" />
              )}
              {values.user_type === 'TRAINER' && (
                <RHFSwitch name="is_pickup_enabled" label="Is Pickup Enabled" />
              )}
              {values.user_type === 'TRAINER' && (
                <RHFTextField name="max_radius_in_km" label="Max Radius in Km" type="number" />
              )}
              {values.user_type === 'TRAINER' && (
                <RHFTextField name="min_price" label="Minimum Price" type="number" />
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
              <RHFTextField name="phone" label="Phone Number" prefix="+971" />
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
                  <RHFSelect name="vehicle_type_id" label="Category">
                    {category?.length > 0 &&
                      category?.map((option: any) => (
                        <MenuItem key={option?.id} value={option?.id}>
                          {option?.category_translations[0]?.name ?? 'Unknown'}
                        </MenuItem>
                      ))}
                  </RHFSelect>

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
                        options={dialect}
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
