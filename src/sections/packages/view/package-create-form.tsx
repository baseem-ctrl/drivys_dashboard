import * as Yup from 'yup';
import { useMemo, useState, useEffect, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { TimePicker } from '@mui/x-date-pickers';
import { useSnackbar } from 'src/components/snackbar';
import { createSchool, useGetSchool, useGetSchoolAdmin } from 'src/api/school';
import { useGetAllLanguage } from 'src/api/language';
import { useGetAllCity } from 'src/api/city';
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
import Stack from '@mui/material/Stack';
import FormProvider, {
  RHFTextField,
  RHFCheckbox,
  RHFSelect,
  RHFAutocomplete,
  RHFEditor,
} from 'src/components/hook-form';
import moment from 'moment';
import { IDeliveryItem } from 'src/types/product';
import { InputAdornment, TextField, Tooltip, Typography, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { countries } from 'src/assets/data';
import Iconify from 'src/components/iconify';
import { createUpdatePackage } from 'src/api/package';
import { useGetAllCategory } from 'src/api/category';
import RHFAutocompleteSearch from 'src/components/hook-form/rhf-autocomplete-search';
import { InfoOutlined } from '@mui/icons-material';

type Props = {
  open: boolean;
  onClose: VoidFunction;
  revalidateDeliverey: VoidFunction;
  currentDelivery?: any;
};

export default function PackageCreateForm({
  currentDelivery,
  open,
  onClose,
  revalidateDeliverey,
}: Props) {
  const { enqueueSnackbar } = useSnackbar();
  const [searchValue, setSearchValue] = useState('');
  const [searchValueCat, setSearchValueCat] = useState('');
  const [searchValueCity, setSearchValueCity] = useState('');
  const [numberOfSlots, setNumberOfSlots] = useState(0);

  const { language } = useGetAllLanguage(0, 1000);
  // const { schoolAdminList, schoolAdminLoading, revalidateSearch } = useGetSchoolAdmin(1000, 1);
  const { category } = useGetAllCategory({
    limit: 1000,
    page: 1,
    search: searchValueCat,
    published: 1,
  });
  const { schoolList, schoolLoading } = useGetSchool({
    limit: 1000,
    page: 1,
    search: searchValue,
    is_active: 1,
  });
  const { city, cityLoading } = useGetAllCity({
    limit: 100,
    page: 1,
    search: searchValueCity,
    is_published: 1,
  });
  // State to track translations for each locale
  const [translations, setTranslations] = useState<any>({});
  const [selectedLocale, setSelectedLocale] = useState<string | null>('en');
  const [cityFields, setCityFields] = useState([
    { id: null, min_price: '', max_price: '', commision: '' },
  ]);

  const handleAddCity = () => {
    setCityFields((prevFields) => [...prevFields, { id: null, min_price: '', max_price: '' }]);
  };

  const handleCityFieldChange = (index: number, field: string, value: any) => {
    const updatedCities = [...cityFields];
    updatedCities[index] = {
      ...updatedCities[index],
      [field]: value,
    };
    setCityFields(updatedCities);
  };
  const handleRemoveCity = (index) => {
    const updatedCityFields = cityFields.filter((_, i) => i !== index);
    setCityFields(updatedCityFields);
  };

  const localeOptions = language?.map((item: any) => ({
    label: item.language_culture,
    value: item.language_culture,
  }));

  const DeliverySchema = Yup.object().shape({
    name: Yup.string().required('Name is required'),
    locale: Yup.string().required('Locale is required'),
    session_inclusions: Yup.string(),
    is_published: Yup.boolean(),
    number_of_sessions: Yup.number().test(
      'is-even',
      'Number of sessions must be an even number',
      function (value) {
        // If the value is defined, check if it's even
        if (value === -1) {
          return true;
        }
        if (value !== undefined && value !== null) {
          return value % 2 === 0;
        }
        // If value is undefined or null, the validation passes
        return true;
      }
    ),
    category_id: Yup.mixed(),
    vendor_id: Yup.mixed().nullable(),
    drivys_commision: Yup.number(),
    min_price: Yup.string(),
    max_price: Yup.string(),
    is_drivys_commision_percentage: Yup.boolean(),
  });

  const defaultValues = useMemo(
    () => ({
      name: '',
      locale: '',
      session_inclusions: '',
      is_published: false,
      number_of_sessions: '',
      category_id: '',
      vendor_id: '',
      drivys_commision: '',
      min_price: '',
      max_price: '',
      is_drivys_commision_percentage: false,
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
  const numOfSession = watch('number_of_sessions');

  useEffect(() => {
    if (numOfSession) {
      setNumberOfSlots(Math.floor(numOfSession / 2));
    }
  }, [numOfSession]);
  const currentName = watch('name');
  const currentSessionInclusions = watch('session_inclusions');
  const values = watch();
  const handleToggle = () => {
    setValue('is_drivys_commision_percentage', !values?.is_drivys_commision_percentage);
  };
  const previousLocaleRef = useRef(selectedLocale);
  console.log(errors);

  // ** 1. Saving current locale's translation before switching **
  const saveCurrentLocaleTranslation = () => {
    if (selectedLocale) {
      setTranslations((prev: any) => ({
        ...prev,
        [selectedLocale]: {
          name: currentName || '',
          session_inclusions: currentSessionInclusions || '',
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
      setValue('session_inclusions', translation?.session_inclusions);

      // Update the previous locale
      previousLocaleRef.current = selectedLocale;
    }
  }, [selectedLocale, setValue, translations]);
  // ** 4. Form Submission Logic **
  const onSubmit = async (data: any) => {
    // Save current locale's data before submission
    saveCurrentLocaleTranslation();
    const formData = new FormData();
    if (data?.number_of_sessions) formData.append('number_of_sessions', data?.number_of_sessions);
    formData.append('is_published', data.is_published ? 1 : 0);
    if (data?.vendor_id?.value) formData.append('vendor_id', data?.vendor_id?.value);
    if (data?.name) formData.append(`package_translation[0][name]`, data?.name);
    if (data?.locale) formData.append(`package_translation[0][locale]`, data?.locale);
    if (data?.session_inclusions)
      formData.append(`package_translation[0][session_inclusions]`, data?.session_inclusions);
    if (data?.category_id) formData.append(`category_id`, data?.category_id?.value);
    if (data?.drivys_commision) formData.append('drivys_commision', data?.drivys_commision);
    if (data.is_drivys_commision_percentage !== undefined) {
      formData.append(
        'is_drivys_commision_percentage',
        data.is_drivys_commision_percentage === true ? 1 : 0
      );
    }

    const sessionTitles = [];
    if (data?.locale && data?.session_titles) {
      const selectedLocale = data.locale.toLowerCase();

      const titles = data.session_titles.filter((title: string) => title);

      sessionTitles.push({
        locale: selectedLocale,
        titles: titles,
      });
    }

    sessionTitles.forEach((session, index) => {
      formData.append(`session_titles[${index}][locale]`, session.locale);
      session.titles.forEach((title, titleIndex) => {
        formData.append(`session_titles[${index}][titles][${titleIndex}]`, title);
      });
    });

    if (Array.isArray(cityFields)) {
      cityFields.forEach((city, index) => {
        if (city?.id !== undefined) {
          formData.append(`cities_ids[${index}][id]`, String(city.id));
        }

        if (city?.min_price !== undefined) {
          formData.append(`cities_ids[${index}][min_price]`, String(city.min_price));
        }

        if (city?.max_price !== undefined) {
          formData.append(`cities_ids[${index}][max_price]`, String(city.max_price));
        }
        if (!city?.id && !city?.min_price && !city?.max_price) {
        }
      });
    } else {
      console.log('cities_ids is not an array or is undefined');
    }

    try {
      const response = await createUpdatePackage(formData);
      if (response) {
        reset();
        onClose();
        setCityFields([{ id: null, min_price: '', max_price: '' }]);
        revalidateDeliverey();
        enqueueSnackbar(response?.message, { variant: 'success' });
      }
    } catch (error) {
      if (error?.errors) {
        if (typeof error?.errors === 'object' && !Array.isArray(error?.errors)) {
          Object.values(error?.errors).forEach((errorMessage) => {
            enqueueSnackbar(errorMessage[0], { variant: 'error' });
          });
        } else {
          enqueueSnackbar(error.errors, { variant: 'error' });
        }
      } else {
        enqueueSnackbar(error.message, { variant: 'error' });
      }
    }
  };
  const handleSearchChange = (e) => {
    setSearchValue(e?.target?.value);
  };
  const handleClose = () => {
    reset(defaultValues);
    onClose();
    setCityFields([{ id: null, min_price: '', max_price: '' }]);
    setSelectedLocale('');
  };
  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={handleClose}>
      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle>Create Package</DialogTitle>

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
                value={selectedLocale}
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

          <Grid spacing={2} container>
            <Grid item xs={13}>
              <RHFTextField
                name="number_of_sessions"
                label="Number of sessions"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Tooltip title="Enter -1 for unlimeted Packages" placement="top">
                        <InfoOutlined sx={{ color: '#006C9B', cursor: 'pointer' }} />
                      </Tooltip>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={10}>
              <Grid container spacing={2}>
                {Array.from({ length: numberOfSlots }).map((_, index) => (
                  <Grid item xs={12} key={index}>
                    <RHFTextField
                      fullWidth
                      name={`session_titles[${index}]`}
                      label={`session_titles ${index + 1}`}
                    />
                  </Grid>
                ))}
              </Grid>
            </Grid>

            <Grid item xs={6}>
              <RHFAutocompleteSearch
                name="vendor_id"
                label="Select School"
                // {option?.vendor_translations.find(item => item?.locale?.toLowerCase() === "en")?.name || "Unknown"}
                options={schoolList?.map((item) => ({
                  label:
                    item?.vendor_translations.find((item) => item?.locale?.toLowerCase() === 'en')
                      ?.name || 'Unknown',
                  value: item?.id,
                }))}
                onInputChange={(e: any) => handleSearchChange(e)}
                loading={schoolLoading}
              />
            </Grid>
            <Grid item xs={6}>
              <RHFTextField
                name="drivys_commision"
                label="Drivy's Commission"
                type={values?.is_drivys_commision_percentage ? 'number' : 'text'}
                inputProps={{ min: 0 }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <div onClick={handleToggle} style={{ cursor: 'pointer' }}>
                        {values?.is_drivys_commision_percentage ? '%' : 'AED'}
                      </div>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            {/* <RHFSwitch name="use_percentage" label={t('Use Percentage')} /> */}

            <Grid item xs={6}>
              <RHFAutocompleteSearch
                name="category_id"
                label="Select Category"
                // {option?.vendor_translations.find(item => item?.locale?.toLowerCase() === "en")?.name || "Unknown"}
                options={category?.map((item) => ({
                  label:
                    item?.category_translations.find((item) => item?.locale?.toLowerCase() === 'en')
                      ?.name || 'Unknown',
                  value: item?.id,
                }))}
                onInputChange={(e: any) => handleSearchChange(e)}
                loading={schoolLoading}
              />
            </Grid>
            <Box sx={{ mt: 2 }}>
              {cityFields?.map((cityField, index) => (
                <Grid key={index} container spacing={2} sx={{ mb: 2 }}>
                  <Grid item xs={12}>
                    <RHFAutocompleteSearch
                      name={`cities_ids[${index}][id]`}
                      label={`Select City ${index + 1}`}
                      multiple={false}
                      options={city?.map((option: any) => ({
                        value: option?.id,
                        label: option?.city_translations[0]?.name ?? 'Unknown',
                      }))}
                      onChange={(event, value) => {
                        handleCityFieldChange(index, 'id', value?.value || null);
                      }}
                      loading={cityLoading}
                    />
                  </Grid>

                  <Grid item xs={6}>
                    <RHFTextField
                      name={`cities_ids[${index}][min_price]`}
                      label="City Min Price"
                      type="number"
                      inputProps={{ min: 0 }}
                      value={cityField.min_price}
                      onChange={(event) =>
                        handleCityFieldChange(index, 'min_price', event.target.value)
                      }
                      suffix="AED"
                    />
                  </Grid>

                  <Grid item xs={6}>
                    <RHFTextField
                      name={`cities_ids[${index}][max_price]`}
                      label="City Max Price"
                      type="number"
                      inputProps={{ min: 0 }}
                      value={cityField.max_price}
                      onChange={(event) =>
                        handleCityFieldChange(index, 'max_price', event.target.value)
                      }
                      suffix="AED"
                    />
                  </Grid>

                  {index > 0 && (
                    <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                      <IconButton
                        onClick={() => handleRemoveCity(index)}
                        color="error"
                        sx={{ color: 'black' }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Grid>
                  )}
                </Grid>
              )) || []}

              <Button variant="contained" onClick={handleAddCity} sx={{ mt: 2 }}>
                Add City
              </Button>
            </Box>
            <Grid item xs={6}>
              <RHFCheckbox name="is_published" label="Publish" />
            </Grid>
            <Grid item xs={12}>
              <Stack spacing={1.5} mt={2}>
                <Typography variant="subtitle2">Session inclusions</Typography>
                <RHFEditor name="session_inclusions" />
              </Stack>
              {/* <RHFTextField name="session_inclusions" label="Session inclusions" /> */}
            </Grid>
          </Grid>
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
