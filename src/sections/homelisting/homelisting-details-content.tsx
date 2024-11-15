// @mui
import Chip from '@mui/material/Chip';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import { FormControl, FormHelperText, InputLabel } from '@mui/material';

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
  { label: 'TRAINER', value: 'TRAINER' },
  { label: 'CATEGORY', value: 'CATEGORY' },
  { label: 'SLIDER', value: 'SLIDER' },
];

const displayTypeOptions = [
  { label: 'SLIDER', value: 'SLIDER' },
  { label: 'HORIZONTAL_SCROLL', value: 'HORIZONTAL_SCROLL' },
  { label: 'VERTICAL_SCROLL', value: 'VERTICAL_SCROLL' },
  { label: 'LIST', value: 'LIST' },
  { label: 'GRID', value: 'GRID' },
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
      title: details?.title || '',
      catalogue_type: details?.catalogue_type || '',
      category: details?.category || '',
      display_type: details?.display_type || '',
      display_order: details?.display_order || '',
      is_active: details?.is_active === '1',
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
      const newValues = {
        locale: selectedLocaleObject?.locale || '',
        title: details?.title || '',
        catalogue_type: details?.catalogue_type || '',
        category: details?.category || '',
        display_order: details?.display_order || '',
        display_type: details?.display_type || '',
        is_active: details?.is_active === 1,
      };
      HomeListingReset(newValues); // Reset the form with the new details
    }
  }, [details, HomeListingReset, selectedLocaleObject]);

  const onSubmitBasicInfo = HomeListingSubmit(async (data) => {
    try {
      const body = new FormData();
      body.append('title', data?.title);
      body.append('display_order', data?.display_order);
      body.append('catalogue_type', data?.catalogue_type);
      body.append('display_type', data?.display_type);
      body.append('is_active', data?.is_active ? '1' : '0');
      body.append('home_listing_id', details?.id);
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
                  {
                    label: 'Is Active',
                    value: (
                      <FormControlLabel
                        control={<Switch checked={details?.is_active ?? false} disabled />}
                        label={details?.is_active ? 'Active' : 'Inactive'}
                      />
                    ),
                  },
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
            onSubmit={(e) => {
              onSubmitBasicInfo(e);
            }}
            pb={1}
          >
            <Box
              mt={2}
              rowGap={3}
              columnGap={2}
              display="grid"
              gridTemplateColumns="repeat(1, 1fr)"
            >
              <Box
                display="grid"
                gap={1}
                gridTemplateColumns={{
                  xs: 'repeat(1, 1fr)',
                  md: 'repeat(3, 1fr)',
                }}
              >
                <Controller
                  name="title"
                  control={control}
                  render={({ field }) => {
                    return (
                      <TextField
                        label="Title"
                        {...field}
                        error={!!errors.title}
                        helperText={errors?.title?.message || ''}
                      />
                    );
                  }}
                />
                <Controller
                  name="display_order"
                  control={control}
                  render={({ field }) => {
                    return (
                      <TextField
                        label="Display Order"
                        {...field}
                        error={!!errors.display_order}
                        helperText={errors?.display_order?.message || ''}
                      />
                    );
                  }}
                />
                <Controller
                  name="catalogue_type"
                  control={control}
                  render={({ field }) => {
                    return (
                      <FormControl fullWidth error={!!errors.catalogue_type}>
                        <InputLabel>Catalogue Type</InputLabel>
                        <Select
                          label="Catalogue Type"
                          {...field}
                          value={field.value || ''} // Ensuring that the value is set, default to empty string if undefined
                          onChange={(e) => field.onChange(e.target.value)} // Handling onChange
                        >
                          {catalogueOptions.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                              {option.label}
                            </MenuItem>
                          ))}
                        </Select>
                        {errors.catalogue_type && (
                          <FormHelperText>{errors.catalogue_type.message}</FormHelperText>
                        )}
                      </FormControl>
                    );
                  }}
                />
              </Box>
            </Box>

            <Box
              mt={2}
              rowGap={3}
              columnGap={3}
              display="grid"
              gridTemplateColumns="repeat(1, 1fr)"
            >
              <Box
                display="grid"
                gap={1}
                gridTemplateColumns={{
                  sm: '48% 47%',
                }}
                pt={1}
              >
                <Controller
                  name="display_type"
                  control={control}
                  render={({ field }) => {
                    return (
                      <FormControl fullWidth error={!!errors.display_type}>
                        <InputLabel>Display Type</InputLabel>
                        <Select
                          label="Display Type"
                          {...field}
                          value={field.value || ''}
                          onChange={(e) => field.onChange(e.target.value)}
                        >
                          {displayTypeOptions.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                              {option.label}
                            </MenuItem>
                          ))}
                        </Select>
                        {errors.display_type && (
                          <FormHelperText>{errors.display_type.message}</FormHelperText>
                        )}
                      </FormControl>
                    );
                  }}
                />

                <FormControlLabel
                  control={
                    <Controller
                      name="is_active"
                      control={control}
                      render={({ field }) => {
                        return (
                          <Switch {...field} error={!!errors.is_active} checked={field.value} />
                        );
                      }}
                    />
                  }
                  label="Is Active"
                />
              </Box>
            </Box>

            <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 3 }}>
              <Button
                variant="outlined"
                color="error"
                onClick={() => {
                  handleCancel();
                }}
              >
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
