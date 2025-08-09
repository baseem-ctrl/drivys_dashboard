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
  RHFSwitch,
} from 'src/components/hook-form';
import moment from 'moment';
import { IDeliveryItem } from 'src/types/product';
import {
  InputAdornment,
  TextField,
  Tooltip,
  Typography,
  IconButton,
  FormControlLabel,
  Switch,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { countries } from 'src/assets/data';
import Iconify from 'src/components/iconify';
import { createUpdatePackage } from 'src/api/package';
import { useGetAllCategory } from 'src/api/category';
import RHFAutocompleteSearch from 'src/components/hook-form/rhf-autocomplete-search';
import { InfoOutlined } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { ToggleButton, ToggleButtonGroup } from '@mui/material';
import { FormatColorFill } from '@mui/icons-material';

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
  const { t, i18n } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const [searchValue, setSearchValue] = useState('');
  const [searchValueCat, setSearchValueCat] = useState('');
  const [searchValueCity, setSearchValueCity] = useState('');
  const [numberOfSlots, setNumberOfSlots] = useState(0);

  const { language } = useGetAllLanguage(0, 1000);
  // const { schoolAdminList, schoolAdminLoading, revalidateSearch } = useGetSchoolAdmin(1000, 1);
  const { category, categoryLoading } = useGetAllCategory({
    limit: 1000,
    page: 1,
    search: searchValueCat,
    published: 1,
    locale: i18n.language,
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
  const [formDataState, setFormData] = useState({
    is_published: false,
    is_pickup_fee_included: false,
    is_certificate_included: false,
    is_cash_pay_available: false,
  });
  const handleSwitchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prevData) => ({
      ...prevData,
      [event.target.name]: event.target.checked,
    }));
  };

  // State to track translations for each locale
  const [translations, setTranslations] = useState<any>({});
  const [selectedLocale, setSelectedLocale] = useState<string | null>('en');
  const [cityFields, setCityFields] = useState([
    {
      id: null,
      min_price: '',
      max_price: '',
      commision: '',
      discount_value: '',
      discount_type: 'percentage',
      offer_valid_until: null,
    },
  ]);
  const [cityErrors, setCityErrors] = useState<string[]>([]);
  const handleAddCity = () => {
    setCityFields((prevFields) => [
      ...prevFields,
      {
        id: null,
        min_price: '',
        max_price: '',
        commision: '',
        discount_value: '',
        discount_type: 'percentage',
        offer_valid_until: null,
      },
    ]);
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
    session_inclusions: Yup.string().required('Session Inclusion is required'),
    is_published: Yup.boolean(),
    is_certificate_included: Yup.boolean(),
    is_cash_pay_available: Yup.boolean(),
    is_pickup_fee_included: Yup.boolean(),
    background_color: Yup.mixed(),

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
    drivys_commision: Yup.number()
      .test(
        'valid-drivys-commission',
        "Drivy's Commission should be less than 100% when percentage is selected",
        function (value) {
          const { is_drivys_commision_percentage } = this.parent;
          // If percentage mode is ON, enforce max 100
          if (is_drivys_commision_percentage) {
            return value === null || value < 100;
          }

          // If percentage mode is OFF, just ensure it's a number
          return true;
        }
      )
      .typeError("Drivy's Commission must be a number"),
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
      is_pickup_fee_included: false,
      background_color: '',
      is_certificate_included: false,
      is_cash_pay_available: false,
      number_of_sessions: '',
      category_id: '',
      vendor_id: [],
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
  const packages = [
    {
      value: 'trial',
      label: 'Trial',
      gradient: 'linear-gradient(to right, #1E1E1E, #292929)',
    },
    {
      value: 'bronze',
      label: 'Bronze',
      gradient: 'linear-gradient(to right, #CD7F32, #000000)',
    },
    {
      value: 'silver',
      label: 'Silver',
      gradient: 'linear-gradient(to right, #8E8E8E, #000000)',
    },
    {
      value: 'gold',
      label: 'Gold',
      gradient: 'linear-gradient(to right, #FFB000, #000000)',
    },
    {
      value: 'unlimited',
      label: 'Unlimited',
      gradient: 'linear-gradient(to right, #7B156D, #3B0033)',
    },
  ];
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
      setValue('session_inclusions', translation?.session_inclusions);

      // Update the previous locale
      previousLocaleRef.current = selectedLocale;
    }
  }, [selectedLocale, setValue, translations]);
  // ** 4. Form Submission Logic **
  const onSubmit = async (data: any) => {
    // Save current locale's data before submission
    saveCurrentLocaleTranslation();
    setCityErrors([]);
    const errors: string[] = [];
    // Validate city min_price vs drivys_commision if commission is fixed amount
    if (!data.is_drivys_commision_percentage) {
      cityFields.forEach((city, index) => {
        const minPrice = parseFloat(city.min_price);
        const maxPrice = parseFloat(city.max_price);

        if (!data.is_drivys_commision_percentage) {
          const commission = parseFloat(data.drivys_commision);
          if (!isNaN(minPrice) && !isNaN(commission) && minPrice <= commission) {
            errors[index] = `Min Price must be greater than Drivy's Commission (${commission})`;
            return;
          }
        }

        if (!isNaN(minPrice) && !isNaN(maxPrice) && minPrice >= maxPrice) {
          errors[index] = `Min Price must be less than Max Price (${maxPrice})`;
          return;
        }

        errors[index] = '';
      });
    }
    if (errors.some((err) => err)) {
      setCityErrors(errors);
      enqueueSnackbar('Please fix the highlighted city fields', { variant: 'error' });
      return;
    }
    const formData = new FormData();
    if (data?.number_of_sessions) formData.append('number_of_sessions', data?.number_of_sessions);
    formData.append('is_published', formDataState.is_published ? 1 : 0);
    formData.append('is_pickup_fee_included', formDataState.is_pickup_fee_included ? 1 : 0);
    formData.append('is_certificate_included', formDataState.is_certificate_included ? 1 : 0);

    formData.append('is_cash_pay_available', formDataState.is_cash_pay_available ? 1 : 0);

    if (Array.isArray(data?.vendor_id)) {
      data.vendor_id.forEach((item: any) => {
        formData.append('vendor_id[]', item.value);
      });
    }

    formData.append('background_color', data.background_color ? data.background_color : 'normal');

    if (data?.name) formData.append(`package_translation[0][name]`, data?.name);
    if (data?.locale) formData.append(`package_translation[0][locale]`, data?.locale);
    formData.append(`package_translation[0][session_inclusions]`, data?.session_inclusions || '');
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

    if (sessionTitles.length === 0) {
      formData.append('session_titles', '');
    } else {
      sessionTitles.forEach((session, index) => {
        formData.append(`session_titles[${index}][locale]`, session.locale);
        session.titles.forEach((title, titleIndex) => {
          formData.append(`session_titles[${index}][titles][${titleIndex}]`, title);
        });
      });
    }
    if (Array.isArray(cityFields)) {
      cityFields.forEach((city, index) => {
        if (city?.id !== undefined && city?.id !== '' && city?.id) {
          formData.append(`cities_ids[${index}][id]`, String(city.id));
        }

        if (city?.min_price !== undefined && city?.min_price !== '' && city?.min_price) {
          formData.append(`cities_ids[${index}][min_price]`, String(city.min_price));
        }

        if (city?.max_price !== undefined && city?.max_price !== '' && city?.max_price) {
          formData.append(`cities_ids[${index}][max_price]`, String(city.max_price));
        }
        console.log(city.discount_value, 'discount_value');

        if (
          city?.discount_value !== undefined &&
          city?.discount_value !== '' &&
          city?.discount_value
        ) {
          console.log(city.discount_value, 'discount_value');

          formData.append(`cities_ids[${index}][discount_value]`, String(city.discount_value));
        }
        if (city?.discount_value) {
          formData.append(`cities_ids[${index}][discount_type]`, city.discount_type);
        }
        if (city?.offer_valid_until) {
          formData.append(
            `cities_ids[${index}][offer_valid_until]`,
            moment(city.offer_valid_until).format('YYYY-MM-DD')
          );
        }
      });
    } else {
      console.log('cities_ids is not an array or is undefined');
    }

    try {
      const response = await createUpdatePackage(formData);
      if (response) {
        reset();
        handleClose();
        setCityFields([
          {
            id: null,
            min_price: '',
            max_price: '',
            commision: '',
            discount_value: '',
            discount_type: 'percentage',
            offer_valid_until: null,
          },
        ]);
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
    setCityFields([
      {
        id: null,
        min_price: '',
        max_price: '',
        commision: '',
        discount_value: '',
        discount_type: 'percentage',
        offer_valid_until: null,
      },
    ]);
    setSelectedLocale(null);
  };

  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={handleClose}>
      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle>{t('Create Package')}</DialogTitle>

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
                label={t('Locale')}
                value={selectedLocale}
                onChange={(e) => handleLocaleChange(e.target.value)}
              >
                {localeOptions?.map((option: any) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </RHFSelect>

              <RHFTextField name="name" label={t('Name')} />
            </Box>
            {/* <RHFTextField name="description" label="Description" /> */}
          </Box>

          <Divider sx={{ my: 2 }} />

          <Grid spacing={2} container>
            <Grid item xs={13}>
              <RHFTextField
                name="number_of_sessions"
                label={t('Number of sessions')}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Tooltip title={t('Enter -1 for unlimited Packages')} placement="top">
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
                multiple
                label={t('Select School')}
                options={schoolList?.map((item: any) => ({
                  label: `${
                    item.vendor_translations.find(
                      (tr) => tr?.locale?.toLowerCase() === i18n.language.toLowerCase()
                    )?.name ||
                    item.vendor_translations?.[0]?.name ||
                    'Unknown'
                  }${item.email ? ` - ${item.email}` : ''}`,
                  value: item.id,
                }))}
                onInputChange={(e: any) => handleSearchChange(e)}
                loading={schoolLoading}
              />
            </Grid>
            <Grid item xs={6}>
              <RHFAutocompleteSearch
                name="category_id"
                label={t('Select Category')}
                // {option?.vendor_translations.find(item => item?.locale?.toLowerCase() === "en")?.name || "Unknown"}
                options={category?.map((item) => ({
                  label:
                    item?.category_translations.find((item) => item?.locale?.toLowerCase() === 'en')
                      ?.name || t('Unknown'),
                  value: item?.id,
                }))}
                onInputChange={(e: any) => handleSearchChange(e)}
                loading={categoryLoading}
              />
            </Grid>
            <Grid item xs={6}>
              <RHFSwitch
                name="is_drivys_commision_percentage"
                label={t('Commission in Percentage ')}
              />
            </Grid>

            <Grid item xs={6}>
              <RHFTextField
                name="drivys_commision"
                label={t("Drivy's Commission")}
                type={values?.is_drivys_commision_percentage ? 'number' : 'text'}
                inputProps={{ min: 0 }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <div onClick={handleToggle} style={{ cursor: 'pointer' }}>
                        {values?.is_drivys_commision_percentage ? (
                          '%'
                        ) : (
                          <span className="dirham-symbol">&#x00EA;</span>
                        )}
                      </div>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <Stack spacing={2} mt={2}>
                <Typography variant="subtitle2" fontWeight={500} color="primary">
                  {t('choose_background_color')}
                </Typography>
                <Controller
                  name="background_color"
                  control={control}
                  defaultValue="trial"
                  render={({ field }) => (
                    <ToggleButtonGroup
                      color="primary"
                      value={field.value}
                      exclusive
                      onChange={(_, newValue) => field.onChange(newValue)}
                      fullWidth
                    >
                      {packages.map(({ value, label, gradient }) => (
                        <ToggleButton
                          key={value}
                          value={value}
                          sx={{
                            textTransform: 'capitalize',
                            px: 3,
                            borderRadius: 2,
                            fontWeight: 'thin',
                            background: field.value === value ? gradient : '#f4f4f4',
                            color: field.value === value ? '#fff' : 'inherit',
                          }}
                        >
                          <FormatColorFill sx={{ mr: 1 }} />
                          {label}
                        </ToggleButton>
                      ))}
                    </ToggleButtonGroup>
                  )}
                />
              </Stack>
            </Grid>

            <Box sx={{ mt: 3 }}>
              {(!cityLoading &&
                cityFields?.map((cityField, index) => (
                  <Grid key={index} container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={12}>
                      <RHFAutocompleteSearch
                        name={`cities_ids[${index}][id]`}
                        label={`${t('Select City')} ${index + 1}`}
                        multiple={false}
                        options={city?.map((option: any) => ({
                          value: option?.id,
                          label:
                            option.city_translations.find(
                              (tr) => tr?.locale?.toLowerCase() === i18n.language.toLowerCase()
                            )?.name ||
                            option.city_translations?.[0]?.name ||
                            'Unknown',
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
                        label={t('City Min Price')}
                        type="number"
                        inputProps={{ min: 0 }}
                        value={cityField.min_price}
                        onChange={(event) =>
                          handleCityFieldChange(index, 'min_price', event.target.value)
                        }
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <span className="dirham-symbol">&#x00EA;</span>
                            </InputAdornment>
                          ),
                        }}
                        error={Boolean(cityErrors[index])}
                        helperText={cityErrors[index]}
                      />
                    </Grid>

                    <Grid item xs={6}>
                      <RHFTextField
                        name={`cities_ids[${index}][max_price]`}
                        label={t('City Max Price')}
                        type="number"
                        inputProps={{ min: 0 }}
                        value={cityField.max_price}
                        onChange={(event) =>
                          handleCityFieldChange(index, 'max_price', event.target.value)
                        }
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <span className="dirham-symbol">&#x00EA;</span>
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <RHFSelect
                        name={`cities_ids[${index}][discount_type]`}
                        label={t('Discount Type')}
                        value={cityField?.discount_type}
                        // sx={{ mt: 1, mb: 3 }}
                        onChange={(event) =>
                          handleCityFieldChange(index, 'discount_type', event.target.value)
                        }
                      >
                        <MenuItem value="percentage">{t('Percentage')}</MenuItem>
                        <MenuItem value="amount">{t('Amount')}</MenuItem>
                      </RHFSelect>
                    </Grid>
                    <Grid item xs={6}>
                      <RHFTextField
                        name={`cities_ids[${index}][discount_value]`}
                        label={t('Discount Price')}
                        type="number"
                        inputProps={{ min: 0 }}
                        value={cityField.discount_value}
                        onChange={(event) =>
                          handleCityFieldChange(index, 'discount_value', event.target.value)
                        }
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <div style={{ cursor: 'pointer' }}>
                                {cityField.discount_type === 'percentage' ? (
                                  '%'
                                ) : (
                                  <span className="dirham-symbol">&#x00EA;</span>
                                )}
                              </div>
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>

                    <Grid item xs={6}>
                      <RHFTextField
                        name={`cities_ids[${index}][offer_valid_until]`}
                        label={t('Discount Valid Until')}
                        type="date"
                        value={cityField.offer_valid_until || ''}
                        onChange={(event) =>
                          handleCityFieldChange(index, 'offer_valid_until', event.target.value)
                        }
                        InputLabelProps={{
                          shrink: true,
                        }}
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
                ))) ||
                []}

              <Button variant="contained" onClick={handleAddCity} sx={{ mt: 2 }}>
                {t('Add City')}
              </Button>
            </Box>

            <Grid item xs={12} mt={1}>
              <FormControlLabel
                control={
                  <Switch
                    name="is_published"
                    checked={formDataState.is_published}
                    onChange={handleSwitchChange}
                  />
                }
                label={t('Publish')}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    name="is_pickup_fee_included"
                    checked={formDataState.is_pickup_fee_included}
                    onChange={handleSwitchChange}
                  />
                }
                label={t('Pickup Fee Included')}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    name="is_certificate_included"
                    checked={formDataState.is_certificate_included}
                    onChange={handleSwitchChange}
                  />
                }
                label={t('Certificate Fee Included')}
              />
            </Grid>
            <Grid item xs={12} mt={1}>
              <FormControlLabel
                control={
                  <Switch
                    name="is_cash_pay_available"
                    checked={formDataState.is_cash_pay_available}
                    onChange={handleSwitchChange}
                  />
                }
                label={t('Pay By Cash')}
              />
            </Grid>
            <Grid item xs={12}>
              <Stack spacing={1.5} mt={2}>
                <Typography variant="subtitle2">{t('Session inclusions')}</Typography>
                <RHFEditor name="session_inclusions" />
              </Stack>
              {/* <RHFTextField name="session_inclusions" label="Session inclusions" /> */}
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button variant="outlined" onClick={handleClose}>
            {t('Cancel')}
          </Button>
          <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
            {t('Create')}
          </LoadingButton>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}
