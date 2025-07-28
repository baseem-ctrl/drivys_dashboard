// @mui
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
// components
import Iconify from 'src/components/iconify';
import { Divider } from '@mui/material';
import {
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  FormControl,
  Grid,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  TabPanel,
  Popover,
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ToggleButton, ToggleButtonGroup } from '@mui/material';

import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { useGetSchool } from 'src/api/school';
import { enqueueSnackbar } from 'src/components/snackbar';
import Scrollbar from 'src/components/scrollbar';
import { useGetAllLanguage } from 'src/api/language';
import { createUpdatePackage } from 'src/api/package';
import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
import FormHelperText from '@mui/material/FormHelperText';
import { useGetPackageDocuments } from 'src/api/packageDocument';
import Editor from '../../components/editor';
import PackageDescription from './package-html-converter';
import PackageDocumentCreateUpdate from './create-update-package-document-form';
import PackageDocumentDetails from './view/package-document-details.tsx';
import { useGetAllCategory } from 'src/api/category';
import { InfoOutlined } from '@mui/icons-material';
import RHFAutocompleteSearch from 'src/components/hook-form/rhf-autocomplete-search';
import FormProvider from 'src/components/hook-form/form-provider';
import { RHFEditor, RHFSelect, RHFSwitch, RHFTextField } from 'src/components/hook-form';
import LoadingButton from '@mui/lab/LoadingButton';
import AddCityPackage from './add-city-package';
import { useTranslation } from 'react-i18next';
import { useGetCities } from 'src/api/enum';
import { useAuthContext } from 'src/auth/hooks';
import moment from 'moment';
// ----------------------------------------------------------------------

type Props = {
  details: any;
  loading?: any;
  reload: VoidFunction;
};

export default function PackageDetails({ details, loading, reload }: Props) {
  const { t, i18n } = useTranslation();
  const { user } = useAuthContext();

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [openAddCityDialog, setOpenAddCityDialog] = useState(false);
  const handleOpenAddCityDialog = () => {
    setOpenAddCityDialog(true);
  };

  const handleCloseAddCityDialog = () => {
    setOpenAddCityDialog(false);
  };
  const handleAddCity = (newCityData: any) => {
    handleCloseAddCityDialog();
  };
  const [selectedLanguage, setSelectedLanguage] = useState(() => {
    const translations = details?.package_translations || [];

    const matched = translations.find(
      (t: any) => t.locale?.toLowerCase() === i18n.language.toLowerCase()
    );

    return matched?.locale || translations[0]?.locale || '';
  });
  const { documents, revalidateDocuments } = useGetPackageDocuments({
    packageId: details?.id,
  });

  const [editMode, setEditMode] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const router = useRouter();
  const [searchValue, setSearchValue] = useState('');
  const [searchCategory, setSearchCategory] = useState('');
  const [editCityIndex, setEditCityIndex] = useState<number | null>(null);

  const [selectedTab, setSelectedTab] = useState(0);
  const { language, languageLoading, totalpages, revalidateLanguage, languageError } =
    useGetAllLanguage(0, 1000);

  const { schoolList, schoolLoading } = useGetSchool({ limit: 1000, page: 1, search: searchValue });
  const { category, categoryLoading } = useGetAllCategory({
    limit: 1000,
    page: 1,
    search: searchCategory,
    locale: i18n.language,
  });
  const { cities } = useGetCities(0, 1000);

  // This useEffect sets the initial selectedLanguage value once details are available
  useEffect(() => {
    if (details?.package_translations?.length > 0) {
      setSelectedLanguage(
        details?.package_translations.find(
          (tr) => tr?.locale?.toLowerCase() === i18n.language.toLowerCase()
        )?.locale ?? details?.package_translations[0]?.locale
      );
    }
  }, [details]);

  const [localeOptions, setLocaleOptions] = useState([]);

  useEffect(() => {
    if ((language && language?.length > 0) || details?.package_translations?.length > 0) {
      let initialLocaleOptions = [];
      if (Array.isArray(language)) {
        initialLocaleOptions = language?.map((item: any) => ({
          label: item?.language_culture,
          value: item?.language_culture,
        }));
      }
      setLocaleOptions([...initialLocaleOptions]);
    }
  }, [language, details]);

  const selectedLocaleObject = details?.package_translations?.find(
    (item: { locale: string }) => item.locale === selectedLanguage
  );

  const VendorSchema = Yup.object().shape({
    locale: Yup.mixed(),
    name: Yup.string(),
    session_inclusions: Yup.string(),
    number_of_sessions: Yup.string(),
    status: Yup.string(),
    is_published: Yup.boolean(),
    is_certificate_included: Yup.boolean(),
    is_cash_pay_available: Yup.boolean(),
    background_color: Yup.mixed(),

    drivys_commision: Yup.mixed(),
    is_pickup_fee_included: Yup.boolean(),
    vendor_id: Yup.mixed(),
    category_id: Yup.mixed(),
  });
  const defaultVendorValues = useMemo(
    () => ({
      locale: selectedLocaleObject?.locale || '',
      name: selectedLocaleObject?.name || '',
      session_inclusions: selectedLocaleObject?.session_inclusions || '',
      number_of_sessions: details?.number_of_sessions || '',
      is_published: !!details?.is_published,
      is_certificate_included: !!details?.is_certificate_included,
      is_cash_pay_available: !!details?.is_cash_pay_available,
      background_color: details?.background_color || '',
      is_pickup_fee_included: !!details?.is_pickup_fee_included,
      drivys_commision: details?.drivys_commision || '',
      vendor_id:
        schoolList
          .find((school) => school?.id === details?.vendor?.id)
          ?.vendor_translations?.find(
            (tr) => tr?.locale?.toLowerCase() === i18n.language.toLowerCase()
          )?.name ??
        schoolList.find((school) => school?.id === details?.vendor?.id)?.vendor_translations?.[0]
          ?.name,

      category_id:
        category?.length > 0
          ? category
              .find((category) => category?.id === details?.category_id)
              ?.category_translations?.find(
                (tr) => tr?.locale?.toLowerCase() === i18n.language.toLowerCase()
              )?.name ??
            category.find((category) => category?.id === details?.category_id)
              ?.category_translations?.[0]?.name
          : '',
    }),
    [selectedLocaleObject, details, schoolList, category]
  );
  const Schoolmethods = useForm({
    resolver: yupResolver(VendorSchema) as any,
    defaultVendorValues,
  });
  const {
    reset: schoolReset,
    watch: schoolWatch,
    control: schoolControl,
    setValue: schoolSetValue,
    handleSubmit: packageSubmit,
    formState: schoolFormState,
  } = Schoolmethods;
  const { isSubmitting, errors } = schoolFormState;
  const values = schoolWatch();

  const handleChange = (event: { target: { value: any } }) => {
    const selectedLocale = event.target.value;
    setSelectedLanguage(selectedLocale);

    const selectedLocaleObject = details?.package_translations.find(
      (item: { locale: string }) => item.locale.toLowerCase() === selectedLocale.toLowerCase()
    );
    if (selectedLocaleObject) {
      schoolSetValue('name', selectedLocaleObject.name); // Update name to match the locale
      schoolSetValue('session_inclusions', selectedLocaleObject.session_inclusions); // Update session inclusions to match the locale

      const updatedSessionTitles = details?.session_details?.map((session: any) => {
        const translation = session.translations.find(
          (t: { locale: string }) => t.locale.toLowerCase() === selectedLocale.toLowerCase()
        );
        return { title: translation?.title || '' };
      });

      const sessionCount = details?.number_of_sessions / 2 || 0;
      const filledSessionTitles = Array.from({ length: sessionCount }, (_, index) => ({
        title: updatedSessionTitles[index]?.title || '',
      }));

      setSessionTitles(filledSessionTitles);
      filledSessionTitles.forEach((session, index) => {
        schoolSetValue(`session_titles[${index}]`, session.title);
      });
    } else {
      schoolSetValue('name', '');
      schoolSetValue('session_inclusions', '');

      const sessionCount = details?.number_of_sessions / 2 || 0;
      const emptySessionTitles = Array.from({ length: sessionCount }, () => ({ title: '' }));

      setSessionTitles(emptySessionTitles);
      emptySessionTitles?.forEach((session, index) => {
        schoolSetValue(`session_titles[${index}]`, session.title);
      });
    }
  };

  useEffect(() => {
    if (editMode !== null) {
      schoolReset(defaultVendorValues);
    }
  }, [selectedLocaleObject, editMode, schoolList, category]);
  const handleOpenDialog = () => {
    setOpenDialog(true);
  };
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  // Function to handle the edit action for a specific city
  const handleEditCity = (index: number) => {
    setEditCityIndex(index);
    setEditMode(true);
  };
  const handleCancelEdit = () => {
    setEditCityIndex(null);
    setEditMode(false);
  };
  const [sessionTitles, setSessionTitles] = useState(details?.session_details || []);
  const numberOfSessions = schoolWatch('number_of_sessions', sessionTitles.length);

  useEffect(() => {
    if (details?.session_details) {
      const initialTitles = details.session_details?.map((session) => ({
        title:
          session.translations?.find(
            (tr) => tr?.locale?.toLowerCase() === i18n.language.toLowerCase()
          )?.title ??
          session.translations?.[0]?.title ??
          '',
      }));
      setSessionTitles(initialTitles);
    }
  }, [details]);

  useEffect(() => {
    const halfSessions = Math.floor(numberOfSessions / 2);
    const updatedTitles = Array.from({ length: halfSessions }, (_, index) => ({
      title:
        details?.session_details?.[index]?.translations?.[0]?.title ||
        sessionTitles[index]?.title ||
        '',
    }));
    setSessionTitles(updatedTitles);

    updatedTitles?.forEach((title, index) => {
      schoolSetValue(`session_titles[${index}]`, title.title);
    });
  }, [numberOfSessions, details, schoolSetValue]);
  const handleSessionTitleChange = (index, value) => {
    const updatedTitles = [...sessionTitles];
    updatedTitles[index].title = value;
    setSessionTitles(updatedTitles);
    schoolSetValue(`session_titles[${index}]`, value);
  };
  const onSubmit = packageSubmit(async (data) => {
    try {
      let payload = {
        package_translations: [
          {
            name: data?.name || selectedLocaleObject?.name,
            locale: selectedLanguage || selectedLocaleObject?.locale,
            session_inclusions:
              data?.session_inclusions || selectedLocaleObject?.session_inclusions,
          },
        ],
        number_of_sessions: data?.number_of_sessions,
        is_published: data?.is_published ? 1 : 0,
        background_color: data?.background_color || details?.background_color,
        drivys_commision: data?.drivys_commision || details?.drivys_commision,
        is_certificate_included: data?.is_certificate_included ? 1 : 0,
        is_cash_pay_available: data?.is_cash_pay_available ? 1 : 0,
        is_pickup_fee_included: data?.is_pickup_fee_included ? 1 : 0,
        vendor_id: data?.vendor_id?.value || details?.vendor_id,
        category_id: data?.category_id?.value || details?.category_id,
      };

      let formData = new FormData();
      // Append fields to FormData
      formData.append('is_published', payload.is_published);
      formData.append('is_certificate_included', payload.is_certificate_included);
      formData.append('is_cash_pay_available', payload.is_cash_pay_available);
      formData.append('background_color', payload.background_color);
      formData.append('drivys_commision', payload.drivys_commision);
      formData.append('is_pickup_fee_included', payload.is_pickup_fee_included);
      formData.append('number_of_sessions', payload.number_of_sessions);
      if (data.vendor_id?.value) {
        formData.append('vendor_id[]', data.vendor_id.value);
      }

      formData.append('package_id', details.id || '');
      formData.append('category_id', payload.category_id || '');

      // Handle `package_translations` (assumes only one translation)
      if (Array.isArray(payload.package_translations) && payload.package_translations.length > 0) {
        const translation = payload.package_translations[0];
        if (translation.name) {
          formData.append('package_translation[0][name]', translation.name);
        }
        if (translation.locale) {
          formData.append('package_translation[0][locale]', translation.locale);
        }
        if (translation.session_inclusions) {
          formData.append(
            'package_translation[0][session_inclusions]',
            translation.session_inclusions
          );
        }
      }

      // const sessionTitles = [];
      // const selectedLocale = data?.locale?.toLowerCase() || selectedLanguage.toLowerCase();

      // const filteredSessionTitles = Array.isArray(data?.session_titles)
      //   ? data.session_titles.filter((title) => title)
      //   : [];
      // const sessionDetails = filteredSessionTitles.map((newTitle) => ({
      //   locale: selectedLocale || selectedLanguage,
      //   title: newTitle,
      // }));
      // console.log('session.locale ', sessionTitles);
      // sessionTitles.forEach((session, index) => {
      //   if (session.locale && sessionTitles.length > 0) {
      //     sessionTitles.push({
      //       locale: selectedLocale || selectedLanguage,
      //       titles: sessionDetails.map((session) => session.title),
      //     });
      //     formData.append(`session_titles[${index}][locale]`, session.locale);
      //   }
      //   if (Array.isArray(session.titles)) {
      //     session.titles.forEach((title, titleIndex) => {
      //       if (title) {
      //         formData.append(`session_titles[${index}][titles][${titleIndex}]`, title);
      //       }
      //     });
      //   }
      // });
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

      // Handle City Edits
      if (Array.isArray(details?.package_city) && details.package_city.length > 0) {
        details.package_city.forEach((cityItem, index) => {
          if (editCityIndex === index) {
            const updatedCity = data.cities_ids?.[index];

            formData.append(`cities_ids[${index}][id]`, cityItem?.city_id ?? '');
            formData.append(
              `cities_ids[${index}][min_price]`,
              updatedCity?.min_price ?? cityItem?.min_price ?? ''
            );
            formData.append(
              `cities_ids[${index}][max_price]`,
              updatedCity?.max_price ?? cityItem?.max_price ?? ''
            );
            formData.append(
              `cities_ids[${index}][commision]`,
              updatedCity?.commision ?? cityItem?.commision ?? ''
            );
            formData.append(
              `cities_ids[${index}][commision_type]`,
              updatedCity?.commision_type ?? cityItem?.commision_type ?? ''
            );
            formData.append(
              `cities_ids[${index}][discount_value]`,
              updatedCity?.discount_value ?? cityItem?.discount_value ?? ''
            );
            formData.append(
              `cities_ids[${index}][discount_type]`,
              updatedCity?.discount_type === true ? 'percentage' : 'amount'
            );
            if (updatedCity?.offer_valid_until) {
              formData.append(
                `cities_ids[${index}][offer_valid_until]`,
                moment(updatedCity.offer_valid_until).format('YYYY-MM-DD')
              );
            }
          }
        });
      }
      if (sessionTitles.length === 0) {
        formData.append('session_titles', '');
      }

      const response = await createUpdatePackage(formData);
      if (response) {
        enqueueSnackbar(response.message, {
          variant: 'success',
        });
        setEditMode(false);
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
    } finally {
      reload();
    }
  });
  const getColor = (color) => {
    const colorMap = {
      trial: '#292929',
      bronze: '#CD7F32',
      silver: '#8E8E8E',
      gold: '#FFB000',
      unlimited: '#7B156D',
    };
    return colorMap[color] || 'transparent';
  };

  const citySubmit = packageSubmit(async (data) => {
    try {
      let formData = new FormData();
      formData.append('package_id', details.id || '');

      if (details?.package_city && details.package_city.length > 0) {
        details.package_city?.forEach((cityItem, index) => {
          if (editCityIndex === index) {
            const updatedCity = data.cities_ids?.[index];

            formData.append(`cities_ids[${index}][id]`, updatedCity?.id ?? cityItem?.city_id ?? '');
            formData.append(
              `cities_ids[${index}][min_price]`,
              updatedCity?.min_price ?? cityItem?.min_price ?? ''
            );
            formData.append(
              `cities_ids[${index}][max_price]`,
              updatedCity?.max_price ?? cityItem?.max_price ?? ''
            );
            formData.append(
              `cities_ids[${index}][commision]`,
              updatedCity?.commision ?? cityItem?.commision ?? ''
            );
            formData.append(
              `cities_ids[${index}][commision_type]`,
              updatedCity?.commision_type ?? cityItem?.commision_type ?? ''
            );
            formData.append(
              `cities_ids[${index}][discount_value]`,
              updatedCity?.discount_value ?? cityItem?.discount_value ?? ''
            );
            formData.append(
              `cities_ids[${index}][discount_type]`,
              updatedCity?.discount_type ?? cityItem?.discount_type ?? ''
            );
            formData.append(
              `cities_ids[${index}][offer_valid_until]`,
              updatedCity?.offer_valid_until
                ? moment(updatedCity.offer_valid_until).format('YYYY-MM-DD')
                : ''
            );
          }
        });
      }

      const response = await createUpdatePackage(formData);
      if (response) {
        enqueueSnackbar(response.message, {
          variant: 'success',
        });
        setEditMode(false);
      }
    } catch (error) {
      if (error?.errors) {
        if (typeof error?.errors === 'object' && !Array.isArray(error?.errors)) {
          Object.values(error?.errors)?.forEach((errorMessage) => {
            enqueueSnackbar(errorMessage[0], { variant: 'error' });
          });
        } else {
          enqueueSnackbar(error.errors, { variant: 'error' });
        }
      } else {
        enqueueSnackbar(error.message, { variant: 'error' });
      }
    } finally {
      reload();
    }
  });
  const handleCancel = () => {
    schoolReset(); // Reset to the original values
    setEditMode(false);
  };
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

  const renderContent = (
    <Stack component={Card} spacing={3} sx={{ p: 3 }}>
      {!editMode && user?.user?.user_type === 'ADMIN' && (
        <Stack
          alignItems="end"
          onClick={() => setEditMode(true)}
          sx={{
            width: '-webkit-fill-available',
            cursor: 'pointer',
            position: 'absolute',
            // top: '1.5rem',
            right: '1rem',
          }}
        >
          <Iconify icon="solar:pen-bold" />
        </Stack>
      )}
      <Scrollbar>
        {!editMode ? (
          <Stack spacing={1} alignItems="flex-start" sx={{ typography: 'body2' }}>
            {[
              ...(details?.package_translations?.flatMap((itm: any) => [
                { label: `${t('Name')} (${t(itm?.locale)})`, value: itm?.name ?? t('n/a') },
              ]) || []),
              ...(details?.package_translations?.flatMap((itm: any) => [
                {
                  label: `${t('Session inclusions')} (${t(itm?.locale)})`,
                  value: <PackageDescription description={itm?.session_inclusions} /> ?? t('n/a'),
                },
              ]) || []),

              ...(details?.vendor?.vendor_translations?.flatMap((itm: any) => [
                {
                  label: `${t('School Name')} (${t(itm?.locale?.toLowerCase() || 'n/a')})`,
                  value: itm?.name ?? t('n/a'),
                },
              ]) || []),

              { label: t('Number of sessions'), value: details?.number_of_sessions ?? t('n/a') },
              {
                label: t('Drivys Commission'),
                value: (
                  <>
                    <span className="dirham-symbol">&#x00EA;</span>
                    {details?.drivys_commision ?? '0'}
                  </>
                ),
              },

              {
                label: t('Category'),
                value:
                  category
                    ?.find((cat) => cat.id === details?.category_id)
                    ?.category_translations?.find(
                      (tr) => tr?.locale?.toLowerCase() === i18n.language.toLowerCase()
                    )?.name ??
                  category?.find((cat) => cat.id === details?.category_id)
                    ?.category_translations?.[0]?.name ??
                  t('n/a'),
              },

              {
                label: t('is_published'),
                value:
                  details?.is_published === 1 ? (
                    <Iconify color="green" icon="bi:check-square-fill" />
                  ) : (
                    <Iconify color="red" icon="bi:x-square-fill" />
                  ),
              },
              {
                label: t('Is Cerificate Fee Included'),
                value:
                  details?.is_certificate_included === true ? (
                    <Iconify color="green" icon="bi:check-square-fill" />
                  ) : (
                    <Iconify color="red" icon="bi:x-square-fill" />
                  ),
              },
              {
                label: t('Is Pay By Cash Available'),
                value:
                  details?.is_cash_pay_available === true ? (
                    <Iconify color="green" icon="bi:check-square-fill" />
                  ) : (
                    <Iconify color="red" icon="bi:x-square-fill" />
                  ),
              },
              {
                label: t('Background Color'),
                value: details?.background_color ? (
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Box
                      sx={{
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        backgroundColor: getColor(details.background_color),
                        border: '1px solid #ccc',
                      }}
                    />
                    <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                      {details.background_color}
                    </Typography>
                  </Stack>
                ) : (
                  t('n/a')
                ),
              },

              //
              {
                label: t('Is Pickup Fee Included'),
                value:
                  details?.is_pickup_fee_included === true ? (
                    <Iconify color="green" icon="bi:check-square-fill" />
                  ) : (
                    <Iconify color="red" icon="bi:x-square-fill" />
                  ),
              },
              ...((details?.number_of_sessions !== -1 &&
                details?.session_details
                  ?.slice(0, Math.floor(numberOfSessions / 2))
                  ?.map((sessionItem: any) => ({
                    label: `${t('Slot')} ${sessionItem.slot_number} ${t('Title')}`,
                    value:
                      sessionItem.translations?.find(
                        (tr) => tr?.locale?.toLowerCase() === i18n.language.toLowerCase()
                      )?.title ??
                      sessionItem.translations?.[0]?.title ??
                      t('n/a'),
                  }))) ||
                []),
            ]?.map((item, index) => (
              <Box key={index} sx={{ display: 'flex', width: '100%' }}>
                <Box component="span" sx={{ minWidth: '200px', fontWeight: 'bold' }}>
                  {item.label}
                </Box>
                <Box component="span" sx={{ minWidth: '100px', fontWeight: 'bold' }}>
                  :
                </Box>
                <Box component="span" sx={{ flex: 1 }}>
                  {item.value ?? t('n/a')}
                </Box>
              </Box>
            ))}
          </Stack>
        ) : (
          <Box rowGap={2} columnGap={2} display="grid" pb={1}>
            <FormProvider methods={Schoolmethods} onSubmit={onSubmit}>
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
                    sm: '25% 70% ',
                  }}
                >
                  <RHFSelect
                    name="locale (Language)"
                    label={t('Locale')}
                    value={selectedLanguage}
                    onChange={(e) => handleChange(e)}
                  >
                    {localeOptions?.map((option: any) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </RHFSelect>
                  <RHFTextField name="name" label={t('Name')} />
                </Box>
              </Box>

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
                    // xs: 'repeat(1, 1fr)',
                    sm: '48% 47% ',
                    // md: 'repeat(2, 1fr)',
                  }}
                  pt={1}
                >
                  <RHFTextField
                    name="number_of_sessions"
                    label={t('Number of sessions')}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <Tooltip title="Enter -1 for unlimited Packages" placement="top">
                            <InfoOutlined sx={{ color: '#006C9B', cursor: 'pointer' }} />
                          </Tooltip>
                        </InputAdornment>
                      ),
                    }}
                  />
                  <RHFAutocompleteSearch
                    name="vendor_id"
                    label={t('Select School')}
                    placeholder="Search School..."
                    options={schoolList?.map((item: any) => ({
                      label: `${
                        item.vendor_translations?.find(
                          (tr) => tr?.locale?.toLowerCase() === i18n.language.toLowerCase()
                        )?.name ??
                        item.vendor_translations?.[0]?.name ??
                        'Unknown'
                      }${item.email ? ` - ${item.email}` : ''}`,
                      value: item.id,
                    }))}
                    setSearchOwner={(searchTerm: any) => setSearchValue(searchTerm)}
                    disableClearable={true}
                    loading={schoolLoading}
                  />

                  <RHFAutocompleteSearch
                    name="category_id"
                    label={t('Select Category')}
                    placeholder={t('Search Category...')}
                    options={category?.map((item: any) => ({
                      label: `${
                        item.category_translations?.find(
                          (tr) => tr?.locale?.toLowerCase() === i18n.language.toLowerCase()
                        )?.name ??
                        item.category_translations?.[0]?.name ??
                        'Unknown'
                      }`,
                      value: item.id,
                    }))}
                    setSearchOwner={(searchTerm: any) => setSearchCategory(searchTerm)}
                    disableClearable={true}
                    loading={categoryLoading}
                  />

                  <Stack direction="row" alignItems="center">
                    <RHFSwitch name="is_published" label={t('Publish')} />
                  </Stack>
                  <Stack direction="row" alignItems="center">
                    <RHFSwitch
                      name="is_certificate_included"
                      label={t('Is Certificate fee included')}
                    />
                  </Stack>
                  <Stack direction="row" alignItems="center">
                    <RHFSwitch name="is_cash_pay_available" label={t('Is Pay by Cash Available')} />
                  </Stack>

                  <Stack direction="row" alignItems="center">
                    <RHFSwitch name="is_pickup_fee_included" label={t('Is Pickup fee included')} />
                  </Stack>
                  <RHFTextField
                    name="drivys_commision"
                    label={t('Drivys Commission')}
                    InputProps={{
                      endAdornment: <span className="dirham-symbol">&#x00EA;</span>,
                    }}
                  />

                  <Grid item xs={12}>
                    <Stack spacing={2} mt={2}>
                      <Typography variant="subtitle2" fontWeight={600}>
                        {t('choose_background_color')}{' '}
                      </Typography>

                      <ToggleButtonGroup
                        color="primary"
                        value={values.background_color || ''}
                        exclusive
                        onChange={(_, newValue) =>
                          newValue && schoolSetValue('background_color', newValue)
                        }
                        fullWidth
                      >
                        {packages.map((pkg) => (
                          <ToggleButton
                            key={pkg.value}
                            value={pkg.value}
                            sx={{
                              textTransform: 'capitalize',
                              fontWeight: 'bold',
                              borderColor: (theme) =>
                                values.background_color === pkg.value
                                  ? theme.palette.primary.main
                                  : 'rgba(0, 0, 0, 0.2)',
                              background: (theme) =>
                                values.background_color === pkg.value
                                  ? pkg.gradient
                                  : 'transparent',
                              color: (theme) =>
                                values.background_color === pkg.value
                                  ? '#fff'
                                  : theme.palette.text.primary,
                              '&:hover': {
                                opacity: 0.8,
                              },
                            }}
                          >
                            {pkg.label}
                          </ToggleButton>
                        ))}
                      </ToggleButtonGroup>
                    </Stack>
                  </Grid>
                </Box>
                <Box mt={2}>
                  {sessionTitles && sessionTitles.length > 0 && (
                    <Typography variant="subtitle2" mb={3}>
                      {t('Session Details')}
                    </Typography>
                  )}
                  <Grid item xs={10}>
                    <Grid container spacing={2}>
                      {sessionTitles?.map((session, index) => (
                        <Grid item xs={12} key={index}>
                          <RHFTextField
                            fullWidth
                            name={`session_titles[${index}]`}
                            label={`${t('Session Title')} ${index + 1}`}
                            value={session.title}
                            onChange={(e) => handleSessionTitleChange(index, e.target.value)}
                          />
                        </Grid>
                      ))}
                    </Grid>
                  </Grid>
                </Box>
                <Stack spacing={1.5}>
                  <Typography variant="subtitle2">{t('Session Inclusion')}</Typography>
                  <RHFEditor name="session_inclusions" />
                </Stack>
              </Box>
              <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 3 }}>
                <Button variant="outlined" color="error" onClick={handleCancel}>
                  {t('Cancel')}
                </Button>
                {/* <Button type="submit" variant="contained">
                  {isSubmitting ? <CircularProgress size="20px" /> : 'Save'}
                </Button> */}
                <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                  {t('Update')}
                </LoadingButton>
              </Stack>
            </FormProvider>
          </Box>
        )}
      </Scrollbar>
    </Stack>
  );
  const handleCardClick = (cityId) => {
    router.push(paths.dashboard.system.viewDetails(cityId));
  };

  const renderCityContent = (
    <Stack spacing={3}>
      <Scrollbar>
        {!editMode ? (
          <Stack spacing={1} alignItems="flex-start" sx={{ typography: 'body2' }}>
            {details?.package_city?.map((cityItem: any, index: number) => (
              <Box
                key={index}
                sx={{
                  width: '90%',
                  mt: 2,
                  mb: 2,
                  position: 'relative',
                  ml: 4,
                  padding: 4,
                }}
                component={Card}
              >
                <Box
                  sx={{
                    fontWeight: 'bold',
                    fontSize: 'h6',
                    mb: 2,
                  }}
                >
                  {t('City')} {index + 1}
                </Box>

                <hr style={{ borderColor: '#CF5A0D', margin: '0 0 16px 0', borderWidth: '1px' }} />

                {user?.user?.user_type === 'ADMIN' && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                      cursor: 'pointer',
                    }}
                    onClick={() => handleEditCity(index)} // Function to handle editing specific city
                  >
                    <Iconify icon="solar:pen-bold" />
                  </Box>
                )}

                <Box
                  sx={{
                    display: 'flex',
                    mb: 1,
                    mt: 5,
                    ...(cityItem?.city?.city_translations[0]?.city_id && {
                      cursor: 'pointer',
                      '&:hover': { textDecoration: 'underline' },
                    }),
                  }}
                  onClick={
                    cityItem?.city?.city_translations[0]?.city_id
                      ? () => handleCardClick(cityItem?.city?.city_translations[0]?.city_id)
                      : undefined
                  }
                >
                  <Box component="span" sx={{ minWidth: '200px', fontWeight: 'bold' }}>
                    {t('City')}
                  </Box>
                  <Box component="span" sx={{ minWidth: '100px', fontWeight: 'bold' }}>
                    :
                  </Box>
                  <Box component="span" sx={{ flex: 1 }}>
                    {cityItem?.city?.city_translations?.find(
                      (tr) => tr?.locale?.toLowerCase() === i18n.language.toLowerCase()
                    )?.name ??
                      cityItem?.city?.city_translations?.[0]?.name ??
                      t('n/a')}
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', mb: 1 }}>
                  <Box component="span" sx={{ minWidth: '200px', fontWeight: 'bold' }}>
                    {t('Min Price')}
                  </Box>
                  <Box component="span" sx={{ minWidth: '100px', fontWeight: 'bold' }}>
                    :
                  </Box>
                  <Box component="span" sx={{ flex: 1 }}>
                    {cityItem?.min_price ?? t('n/a')}
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', mb: 1 }}>
                  <Box component="span" sx={{ minWidth: '200px', fontWeight: 'bold' }}>
                    {t('Max Price')}
                  </Box>
                  <Box component="span" sx={{ minWidth: '100px', fontWeight: 'bold' }}>
                    :
                  </Box>
                  <Box component="span" sx={{ flex: 1 }}>
                    {cityItem?.max_price ?? t('n/a')}
                  </Box>
                </Box>

                {/* <Box sx={{ display: 'flex', mb: 1 }}>
                  <Box component="span" sx={{ minWidth: '200px', fontWeight: 'bold' }}>
                    Commission
                  </Box>
                  <Box component="span" sx={{ minWidth: '100px', fontWeight: 'bold' }}>
                    :
                  </Box>
                  <Box component="span" sx={{ flex: 1 }}>
                    {cityItem?.commision ??  t('n/a')}
                  </Box>
                </Box> */}
                <Box sx={{ display: 'flex', mb: 1 }}>
                  <Box component="span" sx={{ minWidth: '200px', fontWeight: 'bold' }}>
                    {t('Offer Price')}
                  </Box>
                  <Box component="span" sx={{ minWidth: '100px', fontWeight: 'bold' }}>
                    :
                  </Box>
                  <Box component="span" sx={{ flex: 1 }}>
                    {cityItem?.discount_type === 'amount' ? (
                      <>
                        {cityItem.discount_value ? cityItem.discount_value : t('n/a')}
                        <span className="dirham-symbol">&#x00EA;</span>
                      </>
                    ) : (
                      <>{cityItem.discount_value ? cityItem.discount_value : t('n/a')}%</>
                    )}
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', mb: 1 }}>
                  <Box component="span" sx={{ minWidth: '200px', fontWeight: 'bold' }}>
                    {t('Offer Valid Until')}
                  </Box>
                  <Box component="span" sx={{ minWidth: '100px', fontWeight: 'bold' }}>
                    :
                  </Box>
                  <Box component="span" sx={{ flex: 1 }}>
                    {cityItem?.offer_valid_until
                      ? moment(cityItem.offer_valid_until).format('YYYY-MM-DD')
                      : t('n/a')}
                  </Box>
                </Box>
              </Box>
            ))}
          </Stack>
        ) : (
          <Box rowGap={2} columnGap={2} display="grid" pb={1}>
            <FormProvider methods={Schoolmethods} onSubmit={citySubmit}>
              <Box
                mt={2}
                rowGap={3}
                columnGap={2}
                display="grid"
                gridTemplateColumns="repeat(1, 1fr)"
              >
                {details?.package_city?.map((cityItem: any, index: number) => (
                  <Box key={index}>
                    {editCityIndex === index && ( // Only render editable fields for the clicked city
                      <>
                        {/* <Controller
                          name={`cities_ids[${index}][id]`}
                          control={schoolControl}
                          defaultValue={cityItem?.city_id ?? null}
                          render={({ field }) => {
                            const options =
                              cities?.map((item: any) => ({
                                label: item.city_translations
                                  .map((translation: any) => translation.name)
                                  .join(' - '),
                                value: item.id,
                              })) ?? [];

                            const selectedOption =
                              options.find((opt) => opt.value === field.value) || null;

                            return (
                              <Autocomplete
                                options={options}
                                value={selectedOption}
                                getOptionLabel={(option) => option.label}
                                onChange={(event, newValue) =>
                                  field.onChange(newValue ? newValue.value : null)
                                }
                                renderInput={(params) => (
                                  <TextField {...params} label={t('city')} variant="outlined" />
                                )}
                                renderOption={(props, option) => (
                                  <li {...props} key={option.value}>
                                    {option.label}
                                  </li>
                                )}
                                sx={{ mt: 1, mb: 3 }}
                                isOptionEqualToValue={(option, value) =>
                                  option.value === value.value
                                }
                              />
                            );
                          }}
                        /> */}
                        <RHFTextField
                          name={`cities_ids[${index}][min_price]`}
                          label={t('Min Price')}
                          defaultValue={cityItem?.min_price ?? ''}
                          sx={{ mt: 1, mb: 3 }}
                        />
                        <RHFTextField
                          name={`cities_ids[${index}][max_price]`}
                          label={t('Max Price')}
                          defaultValue={cityItem?.max_price ?? ''}
                          sx={{ mt: 1, mb: 3 }}
                        />
                        <RHFTextField
                          name={`cities_ids[${index}][discount_value]`}
                          label={t('Offer Price')}
                          defaultValue={cityItem?.discount_value ?? ''}
                          sx={{ mt: 1, mb: 3 }}
                          type="number"
                          inputProps={{ min: 0 }}
                        />
                        <RHFSelect
                          name={`cities_ids[${index}][discount_type]`}
                          label={t('Offer Type')}
                          defaultValue={
                            cityItem?.discount_type === 'percentage' ? 'percentage' : 'amount'
                          }
                          sx={{ mt: 1, mb: 3 }}
                        >
                          <MenuItem value="percentage">{t('Percentage')}</MenuItem>
                          <MenuItem value="amount">{t('Amount')}</MenuItem>
                        </RHFSelect>

                        <RHFTextField
                          name={`cities_ids[${index}][offer_valid_until]`}
                          label={t('Offer Valid Until')}
                          type="date"
                          defaultValue={
                            cityItem?.offer_valid_until
                              ? moment(cityItem.offer_valid_until).format('YYYY-MM-DD')
                              : ''
                          }
                          sx={{ mt: 1, mb: 3 }}
                          InputLabelProps={{
                            shrink: true,
                          }}
                        />
                      </>
                    )}
                  </Box>
                ))}
              </Box>

              <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 3 }}>
                <Button variant="outlined" color="error" onClick={handleCancelEdit}>
                  {t('Cancel')}
                </Button>
                <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                  {t('Update')}
                </LoadingButton>
              </Stack>
            </FormProvider>
          </Box>
        )}
      </Scrollbar>
    </Stack>
  );

  return (
    <>
      <Tabs value={selectedTab} onChange={handleTabChange} aria-label="package details tabs">
        <Tab label={t('Details')} />
        <Tab label={t('City')} />
      </Tabs>
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
        <>
          {' '}
          {selectedTab === 0 && (
            <Grid container spacing={1} rowGap={1} sx={{ mt: 4 }}>
              <Grid xs={12} md={8}>
                {renderContent}
              </Grid>
            </Grid>
          )}{' '}
          {selectedTab === 0 && user?.user?.user_type === 'ADMIN' && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<Iconify icon="eva:plus-fill" />}
              sx={{ mt: 7, mb: 5 }}
              onClick={handleOpenDialog}
            >
              {t('Add package document')}
            </Button>
          )}
          {selectedTab === 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              {user?.user?.user_type === 'ADMIN' && (
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<Iconify icon="eva:plus-fill" />}
                  sx={{ mt: 7, mb: 5 }}
                  onClick={handleOpenAddCityDialog}
                >
                  {t('Add City')}
                </Button>
              )}
            </Box>
          )}
          {selectedTab === 1 && details?.package_city?.length > 0 && (
            <Grid container spacing={1} rowGap={1} sx={{ mt: 4 }}>
              <Grid xs={12} md={8}>
                {renderCityContent}
              </Grid>
            </Grid>
          )}
          <AddCityPackage
            open={openAddCityDialog}
            onClose={handleCloseAddCityDialog}
            handleAddCity={handleAddCity}
            currentCityData={details?.package_city || []}
            id={details?.id}
            reload={reload}
          />
          <PackageDocumentCreateUpdate
            open={openDialog}
            onClose={handleCloseDialog}
            reload={revalidateDocuments}
            packageId={details?.id}
            sessionNumber={details?.number_of_sessions}
          />{' '}
          {documents &&
            documents.length > 0 &&
            selectedTab === 0 &&
            user?.user?.user_type === 'ADMIN' && (
              <PackageDocumentDetails
                documents={documents}
                reload={revalidateDocuments}
                sessionNumber={details?.number_of_sessions}
              />
            )}
        </>
      )}
    </>
  );
}
