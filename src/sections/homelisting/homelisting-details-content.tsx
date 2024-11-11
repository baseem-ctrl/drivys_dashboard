// @mui
import Chip from '@mui/material/Chip';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import { FormControl, InputLabel } from '@mui/material';

// components
import Iconify from 'src/components/iconify';
import {
  Box,
  Button,
  CircularProgress,
  FormControlLabel,
  Grid,
  MenuItem,
  Select,
  Switch,
  TextField,
  Paper,
  Typography,
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import FormProvider, { RHFMultiSelectAuto } from 'src/components/hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { enqueueSnackbar, useSnackbar } from 'src/components/snackbar';
import Scrollbar from 'src/components/scrollbar';
import { useGetAllLanguage } from 'src/api/language';
import { createHomeListing } from 'src/api/homelisting';
import { useGetAllCategory } from 'src/api/category';

// ----------------------------------------------------------------------

type Props = {
  details: any;
  loading?: any;
  reload: VoidFunction;
};
const catalogueOptions = [
  { label: 'Drivers', value: '1' },
  { label: 'Categories', value: '2' },
];

export default function HomeListingDetailsContent({ details, loading, reload }: Props) {
  const [selectedLanguage, setSelectedLanguage] = useState(
    details?.translations?.length > 0 ? details?.translations[0]?.locale : ''
  );
  const [editMode, setEditMode] = useState(false);
  const [selectedCatalogue, setSelectedCatalogue] = useState(catalogueOptions[0]?.value ?? '');

  const { language } = useGetAllLanguage(0, 1000);
  // This useEffect sets the initial selectedLanguage value once details are available
  useEffect(() => {
    if (details?.translations?.length > 0) {
      setSelectedLanguage(details?.translations[0]?.locale);
    }
  }, [details]);

  const [localeOptions, setLocaleOptions] = useState([]);
  useEffect(() => {
    if ((language && language?.length > 0) || details?.translations?.length > 0) {
      let initialLocaleOptions = [];
      if (Array.isArray(language)) {
        initialLocaleOptions = language?.map((item: any) => ({
          label: item?.language_culture,
          value: item?.language_culture,
        }));
      }
      // const newLocales = details?.translations
      //   ?.map((category: any) => category?.locale)
      //   ?.filter(
      //     (locale: any) => !initialLocaleOptions?.some((option: any) => option?.value === locale)
      //   )
      //   .map((locale: any) => ({ label: locale, value: locale }));
      // if (newLocales) {
      //   setLocaleOptions([...initialLocaleOptions, ...newLocales]);
      // } else {
      setLocaleOptions([...initialLocaleOptions]);
      // }
    }
  }, [language, details]);

  // Find the selectedLocaleObject whenever selectedLanguage or details change
  const selectedLocaleObject = details?.translations?.find(
    (item: { locale: string }) => item.locale === selectedLanguage
  );

  const handleChangeCatalogue = (event: { target: { value: SetStateAction<string> } }) => {
    setSelectedCatalogue(event.target.value);
  };

  const VendorSchema = Yup.object().shape({
    locale: Yup.mixed(),
    title: Yup.string().required('Name is required'),
    description: Yup.string(),
    catalogue_type: Yup.mixed(),
    category: Yup.mixed(),
    display_order: Yup.string(),
    is_active: Yup.boolean(),
  });

  const defaultVendorValues = useMemo(
    () => ({
      locale: selectedLocaleObject?.locale || '',
      title: selectedLocaleObject?.title || '',
      description: selectedLocaleObject?.description || '',
      catalogue_type: details?.catalogue_type || '',
      category: details?.category || '',
      display_order: details?.display_order || '',
      is_active: details?.is_active === '1' ? true : false,
    }),
    [selectedLocaleObject, details, editMode]
  );
  const HomeListingMethods = useForm({
    resolver: yupResolver(VendorSchema),
    defaultValues: defaultVendorValues, // Ensure default values are passed correctly
    mode: 'onChange',
  });

  const {
    reset: HomeListingReset,
    watch: HomeListingWatch,
    setValue: HomeListingSetValue,
    handleSubmit: HomeListingSubmit,
    formState: HomeListingFormState,
  } = HomeListingMethods;

  const { isSubmitting, errors } = HomeListingFormState;
  const { control } = HomeListingMethods;

  const handleChange = (event: { target: { value: any } }) => {
    setSelectedLanguage(event.target.value);
    const selectedLocaleObject = details?.translations.find(
      (item: { locale: string }) => item.locale === event.target.value
    );

    // Update the form values to reflect the selected locale
    if (selectedLocaleObject) {
      HomeListingSetValue('title', selectedLocaleObject.name); // Update name to match the locale
    } else {
      HomeListingSetValue('title', '');
    }
  };

  useEffect(() => {
    if (details) {
      const defaultVendorValues = {
        title: selectedLocaleObject?.title || '',
        locale: selectedLocaleObject?.locale || '',
        description: selectedLocaleObject?.description || '',
        display_order: details?.display_order || '',
        is_active: details?.is_active === '1' ? true : false,
        // user_id: vendor_user?.user !== null ? vendor_user?.user_id : '' || '',
        catalogue_type: details?.catalogue_type || '',
      };
      HomeListingReset(defaultVendorValues);
    }
  }, [details, HomeListingReset, selectedLocaleObject]);

  const onSubmitBasicInfo = HomeListingSubmit(async (data) => {
    try {
      const body = new FormData();
      body.append('translation[0][locale]', selectedLanguage);
      body.append('translation[0][title]', data?.title);
      body.append('translation[0][description]', data?.description);
      body.append('display_order', data?.display_order);
      body.append('catalogue_type', data?.catalogue_type);
      body.append('is_active', data?.is_active ? '1' : '0');
      body.append('home_page_listing_id', details?.id);
      const response = await createHomeListing(body);
      if (response) {
        enqueueSnackbar(response.message, {
          variant: 'success',
        });
        setEditMode(false);
      }
    } catch (error) {
      if (error?.errors) {
        Object.values(error?.errors).forEach((errorMessage: any) => {
          enqueueSnackbar(errorMessage[0], { variant: 'error' });
        });
      } else {
        enqueueSnackbar(error.message, { variant: 'error' });
      }
    } finally {
      reload();
    }
  });

  const handleCancel = () => {
    HomeListingReset(); // Reset to the original values
    setEditMode(false);
  };
  const renderContent = (
    <Stack component={Card} spacing={3} sx={{ p: 3 }}>
      {!editMode && (
        <Stack
          alignItems="end"
          sx={{
            width: '-webkit-fill-available',
            cursor: 'pointer',
            position: 'absolute',
            top: '1.5rem',
            right: '1rem',
            zIndex: '10',
          }}
        >
          <Iconify
            icon="solar:pen-bold"
            onClick={() => setEditMode(true)}
            sx={{ cursor: 'pointer' }}
          />
        </Stack>
      )}
      <Scrollbar>
        {!editMode ? (
          <Paper elevation={3} sx={{ padding: 3, borderRadius: 2, boxShadow: 3 }}>
            <Stack direction="row" spacing={2} justifyContent="center" alignItems="center">
              {/* Image Section */}
              {/* <Box sx={{ minWidth: '120px', maxWidth: '150px' }}>
                {details?.picture?.virtual_path ? (
                  <img
                    src={details.picture.virtual_path}
                    alt="picture"
                    style={{
                      width: '100%',
                      height: 'auto',
                      borderRadius: '8px',
                      objectFit: 'cover',
                    }}
                  />
                ) : (
                  'N/A'
                )}
              </Box> */}

              {/* Details Section */}
              <Stack spacing={2} sx={{ flex: 1 }}>
                {[
                  { label: 'Title', value: details?.title ?? 'N/A' },
                  { label: 'Display Order', value: details?.display_order ?? 'NA' },
                  { label: 'Catalogue Type', value: details?.catalogue_type ?? 'NA' },
                  { label: 'Display Type', value: details?.display_type ?? 'NA' },
                ].map((item, index) => (
                  <Box
                    key={index}
                    sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 'bold', width: '200px' }}>
                      {item.label}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', width: '130px' }}>
                      :
                    </Typography>
                    <Box sx={{ flex: 1, overflowWrap: 'break-word' }}>{item.value ?? 'N/A'}</Box>
                  </Box>
                ))}
              </Stack>
            </Stack>
          </Paper>
        ) : (
          <Box
            component="form"
            rowGap={2}
            columnGap={2}
            display="grid"
            onSubmit={onSubmitBasicInfo}
            pb={1}
          >
            <Box
              mt={2}
              rowGap={3}
              columnGap={2}
              display="grid"
              gridTemplateColumns="repeat(1, 1fr)"
              // sx={{ mb: 2, p: 2, border: '1px solid #ddd' }}
            >
              <Box
                display="grid"
                gap={1}
                gridTemplateColumns={{
                  xs: 'repeat(1, 1fr)',
                  // sm: '25% 70% ',
                  md: 'repeat(3, 1fr)',
                }}
              >
                <Controller
                  name="locale"
                  control={control}
                  render={({ field }) => (
                    <Select {...field} value={selectedLanguage || ''} onChange={handleChange}>
                      {localeOptions?.map((option: any) => (
                        <MenuItem key={option?.value} value={option?.value}>
                          {option?.label}
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                />
                <Controller
                  name="title"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      label="Title"
                      {...field}
                      error={errors?.title?.message}
                      helperText={errors?.title ? errors?.title?.message : ''}
                    />
                  )}
                />
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      label="Description"
                      {...field}
                      error={errors?.description?.message}
                      helperText={errors?.description ? errors?.description?.message : ''}
                    />
                  )}
                />
              </Box>
            </Box>

            <Box
              mt={2}
              rowGap={3}
              columnGap={3}
              display="grid"
              gridTemplateColumns="repeat(1, 1fr)"
              // sx={{ mb: 2, p: 2, border: '1px solid #ddd' }}
            >
              <Box
                display="grid"
                gap={1}
                gridTemplateColumns={{
                  // xs: 'repeat(1, 1fr)',
                  sm: '48% 47% ',
                  // md: 'repeat(2, 1fr)',
                }}
                pt={1}
              >
                <Controller
                  name="display_order"
                  control={control}
                  render={({ field }) => (
                    <TextField label="Display order" {...field} error={!!errors.display_order} />
                  )}
                />{' '}
                <FormControl fullWidth>
                  <InputLabel id="catalogue-type-label">Catalogue Type</InputLabel>
                  <Controller
                    defaultValue={defaultVendorValues.catalogue_type}
                    name="catalogue_type"
                    control={control}
                    render={({ field }) => (
                      <Select
                        {...field}
                        labelId="catalogue-type-label"
                        value={selectedCatalogue || ''}
                        name="catalogue_type"
                        onChange={handleChangeCatalogue}
                        label="Catalogue Type"
                      >
                        {catalogueOptions?.map((option: any) => (
                          <MenuItem key={option?.value} value={option?.value}>
                            {option?.label}
                          </MenuItem>
                        ))}
                      </Select>
                    )}
                  />
                </FormControl>
                <FormControlLabel
                  control={
                    <Controller
                      name="is_active"
                      control={control}
                      render={({ field }) => (
                        <Switch {...field} error={!!errors.is_active} checked={field.value} />
                      )}
                    />
                  }
                  label="Is Active"
                />
              </Box>
            </Box>
            <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 3 }}>
              <Button variant="outlined" color="error" onClick={handleCancel}>
                Cancel
              </Button>
              <Button type="submit" variant="contained">
                Save
              </Button>
            </Stack>
          </Box>
        )}
      </Scrollbar>
      {/* <SchoolCreateForm
        open={quickCreate.value}
        onClose={quickCreate.onFalse}
        revalidateDeliverey={reload}
        currentSchool={details}
      /> */}
      {/* {editMode && (
        <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 3 }}>
          <Button variant="outlined" color="error" onClick={handleCancel}>
            Cancel
          </Button>
          <Button type="submit" variant="contained">
            Save
          </Button>
        </Stack>
      )} */}
    </Stack>
  );

  return (
    <>
      {loading ? (
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
      ) : (
        <Grid container spacing={1} rowGap={1}>
          <Grid xs={12}>{renderContent}</Grid>
        </Grid>
      )}
    </>
  );
}
