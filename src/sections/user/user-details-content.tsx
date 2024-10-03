// @mui
import Chip from '@mui/material/Chip';
import Card from '@mui/material/Card';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import ListItemText from '@mui/material/ListItemText';
// utils
import { fDate } from 'src/utils/format-time';
import { fCurrency } from 'src/utils/format-number';
// types
import { IJobItem } from 'src/types/job';
// components
import Iconify from 'src/components/iconify';
import Markdown from 'src/components/markdown';
import {
  Box,
  Button,
  CircularProgress,
  Grid,
  IconButton,
  MenuItem,
  Select,
  Switch,
  TextField,
} from '@mui/material';
import { GoogleMap, useJsApiLoader, Marker, LoadScript } from '@react-google-maps/api';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { createSchool, createUpdateSchoolAddress, useGetSchoolAdmin } from 'src/api/school';
import { enqueueSnackbar, useSnackbar } from 'src/components/snackbar';
import marker from 'react-map-gl/dist/esm/components/marker';
import Scrollbar from 'src/components/scrollbar';
import { useBoolean } from 'src/hooks/use-boolean';
import { useGetAllLanguage } from 'src/api/language';
import { RHFTextField } from 'src/components/hook-form';
import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';

// ----------------------------------------------------------------------

type Props = {
  details: any;
  loading?: any;
  reload?: VoidFunction;
};

export default function UserDetailsContent({ details, loading, reload }: Props) {
  const [selectedLanguage, setSelectedLanguage] = useState(
    details?.vendor_translations?.length > 0 ? details?.vendor_translations[0]?.locale : ''
  );
  const [editMode, setEditMode] = useState(false);

  const { language, languageLoading, totalpages, revalidateLanguage, languageError } =
    useGetAllLanguage(0, 1000);
  const { schoolAdminList, schoolAdminLoading } = useGetSchoolAdmin(1000, 1, '');

  // This useEffect sets the initial selectedLanguage value once details are available
  useEffect(() => {
    if (details?.vendor_translations?.length > 0) {
      setSelectedLanguage(details?.vendor_translations[0]?.locale);
    }
  }, [details]);

  const [localeOptions, setLocaleOptions] = useState([]);

  useEffect(() => {
    if ((language && language?.length > 0) || details?.vendor_translations?.length > 0) {
      let initialLocaleOptions = [];
      if (Array.isArray(language)) {
        initialLocaleOptions = language?.map((item: any) => ({
          label: item?.language_culture,
          value: item?.language_culture,
        }));
      }
      // const newLocales = details?.vendor_translations
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
  const selectedLocaleObject = details?.vendor_translations?.find(
    (item: { locale: string }) => item.locale === selectedLanguage
  );
  console.log(selectedLocaleObject, selectedLanguage, 'selectedLocaleObject');

  const VendorSchema = Yup.object().shape({
    locale: Yup.mixed(),
    name: Yup.string().required('Name is required'),
    contact_email: Yup.string().email('Invalid email'),
    phone_number: Yup.string().matches(/^\d{1,15}$/, 'Phone number must be less that 15 digits'),
    commission_in_percentage: Yup.string(),
    license_expiry: Yup.string(),
    website: Yup.string().url('Invalid URL'),
    status: Yup.string(),
    license_file: Yup.mixed().nullable(),
    is_active: Yup.boolean(),
    user_id: Yup.string(),
  });
  const defaultVendorValues = useMemo(
    () => ({
      locale: selectedLocaleObject?.locale || '',
      name: selectedLocaleObject?.name || '',
      contact_email: details?.email || '',
      phone_number: details?.phone_number || '',
      commission_in_percentage: details?.commission_in_percentage || '',
      license_expiry: details?.license_expiry || '',
      license_file: null,
      website: details?.website || '',
      status: details?.status || '',
      is_active: true,
      user_id: details?.vendor_user?.user_id,
    }),
    [selectedLocaleObject, details, editMode]
  );
  const Schoolethods = useForm({
    resolver: yupResolver(VendorSchema) as any,
    defaultVendorValues,
  });
  const {
    reset: schoolReset,
    watch: schoolWatch,
    control: schoolControl,
    setValue: schoolSetValue,
    handleSubmit: schoolSubmit,
    formState: schoolFormState,
  } = Schoolethods;
  const { isSubmitting, errors } = schoolFormState;
  const [uploadedFileUrl, setUploadedFileUrl] = useState('');
  console.log(errors, 'errors');
  useEffect(() => {
    if (details?.license_file) {
      setUploadedFileUrl(details.license_file); // Set the initial file URL from the response
    }
  }, [details]);
  const handleChange = (event: { target: { value: any } }) => {
    setSelectedLanguage(event.target.value);
    const selectedLocaleObject = details?.vendor_translations.find(
      (item: { locale: string }) => item.locale === event.target.value
    );

    // Update the form values to reflect the selected locale
    if (selectedLocaleObject) {
      schoolSetValue('name', selectedLocaleObject.name); // Update name to match the locale
    } else {
      schoolSetValue('name', '');
    }
  };
  useEffect(() => {
    if (details) {
      const defaultVendorValues = {
        locale: selectedLocaleObject?.locale || '',
        name: selectedLocaleObject?.name || '',
        contact_email: details?.email || '',
        phone_number: details?.phone_number || '',
        commission_in_percentage: details?.commission_in_percentage || '',
        license_expiry: details?.license_expiry || '',
        license_file: null,
        website: details?.website || '',
        status: details?.status || '',
        is_active: details?.is_active === '0' ? false : true,
        user_id: details?.vendor_user?.user_id,
      };
      schoolReset(defaultVendorValues);
    }
  }, [details, schoolReset, selectedLocaleObject]);
  const onSubmitBasicInfo = schoolSubmit(async (data) => {
    try {
      let payload = {
        vendor_translations: [
          {
            name: data?.name || selectedLocaleObject?.name,
            locale: selectedLanguage || selectedLocaleObject?.locale,
          },
        ],
        contact_email: data?.contact_email,
        contact_phone_number: data?.phone_number,
        status: data?.status,
        is_active: data?.is_active ? '1' : '0',
        commission_in_percentage: data?.commission_in_percentage,
        create_new_user: 0,
        license_expiry: data?.license_expiry,
        license_file: data?.license_file,
        user_id: data?.user_id,
        vendor_id: details?.id,
        website: data?.website,
      };
      let formData = new FormData();

      // Append fields to FormData
      formData.append('contact_email', payload.contact_email || '');
      formData.append('contact_phone_number', payload.contact_phone_number || '');
      formData.append('status', payload.status || '');
      formData.append('is_active', payload.is_active);
      formData.append('commission_in_percentage', payload.commission_in_percentage || '');
      formData.append('create_new_user', payload.create_new_user.toString());
      formData.append('license_expiry', payload.license_expiry || '');
      formData.append('user_id', payload.user_id || '');
      formData.append('vendor_id', payload.vendor_id || '');
      formData.append('website', payload.website || '');

      // Handle `vendor_translations` (assumes only one translation)
      if (payload.vendor_translations && payload.vendor_translations.length > 0) {
        formData.append('vendor_translations[0][name]', payload.vendor_translations[0].name || '');
        formData.append(
          'vendor_translations[0][locale]',
          payload.vendor_translations[0].locale || ''
        );
      }

      // Append file field if it exists and is a File object
      if (payload.license_file) {
        formData.append('license_file', payload.license_file); // Assumes `license_file` is a File object
      }

      const response = await createSchool(formData);
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
    schoolReset(); // Reset to the original values
    setEditMode(false);
  };
  const router = useRouter();
  const handleEditRow = useCallback(() => {
    router.push(paths.dashboard.user.edit(details?.id));
  }, [router]);
  const renderContent = (
    <Stack component={Card} spacing={3} sx={{ p: 3 }}>
      <Stack
        alignItems="end"
        sx={{
          width: '-webkit-fill-available',
          cursor: 'pointer',
          position: 'absolute',
          // top: '1.5rem',
          right: '1rem',
        }}
      >
        <Iconify icon="solar:pen-bold" onClick={handleEditRow} sx={{ cursor: 'pointer' }} />
      </Stack>
      <Stack
        spacing={1}
        alignItems={{ xs: 'center', md: 'center' }}
        direction={{
          xs: 'column',
          md: 'row',
        }}
        sx={{
          p: 2.5,
          // pr: { xs: 2.5, md: 1 },
        }}
      >
        {/* <Grid item xs={12} sm={8} md={8}> */}
        <Avatar
          alt={details?.name}
          src={details?.photo_url}
          sx={{ width: 300, height: 300, borderRadius: 2, mb: 2 }}
          variant="square"
        />
        {/* </Grid> */}
        <Grid item xs={12} sm={8} md={8}>
          <Scrollbar>
            <Stack spacing={1} alignItems="flex-start" sx={{ typography: 'body2', pb: 2 }}>
              {[
                { label: 'Name', value: details?.name ?? 'N/A' },
                { label: 'Email', value: details?.email ?? 'NA' },
                {
                  label: 'Phone Number',
                  value: details?.country_code
                    ? `${details?.country_code}-${details?.phone}`
                    : details?.phone ?? 'NA',
                },
                { label: 'User Type', value: details?.user_type ?? 'NA' },

                { label: 'Preffered Language', value: details?.locale ?? 'NA' },
                { label: 'Wallet Balance', value: details?.wallet_balance ?? 'NA' },
                { label: 'Wallet Points', value: details?.wallet_points ?? 'NA' },

                {
                  label: 'Is Active',
                  value:
                    details?.is_active === '1' ? (
                      <Chip label="Active" color="success" variant="soft" />
                    ) : (
                      <Chip label="In Active" color="error" variant="soft" />
                    ),
                },
                ...(details?.user_type === 'TRAINER'
                  ? [
                      {
                        label: 'Max Cash Allowded in Hand',
                        value: details?.max_cash_in_hand_allowed ?? 'N/A',
                      },
                      { label: 'Cash in Hand', value: details?.cash_in_hand ?? 'N/A' },
                      {
                        label: 'Cash Clearance Date',
                        value: details?.cash_clearance_date ?? 'N/A',
                      },
                      {
                        label: 'Last Booking At',
                        value: details?.last_booking_was ?? 'N/A',
                      },
                      {
                        label: 'Vendor Commission',
                        value: details?.vendor_commission_in_percentage ?? 'N/A',
                      },
                    ]
                  : []),
              ].map((item, index) => (
                <Box key={index} sx={{ display: 'flex', width: '100%' }}>
                  <Box component="span" sx={{ minWidth: '200px', fontWeight: 'bold' }}>
                    {item.label}
                  </Box>
                  <Box component="span" sx={{ minWidth: '100px', fontWeight: 'bold' }}>
                    :
                  </Box>
                  <Box component="span" sx={{ flex: 1 }}>
                    {item.value ?? 'N/A'}
                  </Box>
                  {/* <Box component="span">{loading ? 'Loading...' : item.value}</Box> */}
                </Box>
              ))}
            </Stack>
          </Scrollbar>
        </Grid>
      </Stack>
    </Stack>
  );

  const renderCompany = (
    <Stack
      component={Paper}
      variant="outlined"
      spacing={2}
      sx={{ p: 3, borderRadius: 2 }}
      height={350}
      // onClick={route}
    >
      <Avatar
        alt={details?.vendor_user?.user?.name}
        src={details?.vendor_user?.name?.user?.photo_url}
        variant="rounded"
        sx={{ width: 64, height: 64 }}
      />

      <Stack spacing={1}>
        {details?.vendor_user?.user?.name && (
          <Typography variant="subtitle1">
            {details?.vendor_user?.user?.name ?? 'Name Not Availbale'}
          </Typography>
        )}
        {details?.vendor_user?.user?.email && (
          <Typography variant="body2">
            {details?.vendor_user?.user?.email ?? 'Email Not Availbale'}
          </Typography>
        )}
        {details?.vendor_user?.user?.phone && (
          <Typography variant="body2">
            {details?.vendor_user?.user?.country_code
              ? details?.vendor_user?.user?.country_code - details?.vendor_user?.user?.phone
              : details?.vendor_user?.user?.phone || 'Phone_Not_Available'}
          </Typography>
        )}
        {details?.vendor_user?.user?.user_type && (
          <Typography variant="body2">{details?.vendor_user?.user?.user_type ?? 'NA'}</Typography>
        )}
        {details?.vendor_user?.user?.dob && (
          <Typography variant="body2">{details?.vendor_user?.user?.dob ?? 'NA'}</Typography>
        )}
        {details?.vendor_user?.user?.wallet_balance !== 0 && (
          <Typography variant="body2">
            WAllet Balance-{details?.vendor_user?.user?.dob ?? 'NA'}
          </Typography>
        )}
        {details?.vendor_user?.user?.wallet_points !== 0 && (
          <Typography variant="body2">{details?.vendor_user?.user?.dob ?? 'NA'}</Typography>
        )}
      </Stack>
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
          <Grid xs={12} md={12}>
            {renderContent}
          </Grid>

          {/* <Grid xs={12} md={4}>
            {renderCompany}
          </Grid> */}
        </Grid>
      )}
    </>
  );
}
