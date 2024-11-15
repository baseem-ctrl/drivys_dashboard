// @mui
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
// components
import Iconify from 'src/components/iconify';
import {
  Box,
  Button,
  CircularProgress,
  Grid,
  MenuItem,
  Select,
  Switch,
  TextField,
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
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
// ----------------------------------------------------------------------

type Props = {
  details: any;
  loading?: any;
  reload: VoidFunction;
};

export default function PackageDetails({ details, loading, reload }: Props) {
  const [selectedLanguage, setSelectedLanguage] = useState(
    details?.package_translations?.length > 0 ? details?.package_translations[0]?.locale : ''
  );
  const { documents, revalidateDocuments } = useGetPackageDocuments({
    packageId: details?.id,
  });

  const [editMode, setEditMode] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const router = useRouter();

  const { language, languageLoading, totalpages, revalidateLanguage, languageError } =
    useGetAllLanguage(0, 1000);

  const { schoolList, schoolLoading } = useGetSchool(1000, 1);
  const { category } = useGetAllCategory({
    limit: 1000,
    page: 1,
  });
  // This useEffect sets the initial selectedLanguage value once details are available
  useEffect(() => {
    if (details?.package_translations?.length > 0) {
      setSelectedLanguage(details?.package_translations[0]?.locale);
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

  // Find the selectedLocaleObject whenever selectedLanguage or details change
  const selectedLocaleObject = details?.package_translations?.find(
    (item: { locale: string }) => item.locale === selectedLanguage
  );

  const VendorSchema = Yup.object().shape({
    locale: Yup.mixed(),
    name: Yup.string().required('Name is required'),
    session_inclusions: Yup.string(),
    number_of_sessions: Yup.string(),
    status: Yup.string(),
    is_published: Yup.boolean(),
    vendor_id: Yup.string(),
    category_id: Yup.string(),
  });
  const defaultVendorValues = useMemo(
    () => ({
      locale: selectedLocaleObject?.locale || '',
      name: selectedLocaleObject?.name || '',
      session_inclusions: selectedLocaleObject?.session_inclusions || '',
      number_of_sessions: details?.number_of_sessions || '',
      is_published: true,
      vendor_id: details?.vendor_id,
      category_id: details?.category_id,
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

  const handleChange = (event: { target: { value: any } }) => {
    setSelectedLanguage(event.target.value);
    const selectedLocaleObject = details?.package_translations.find(
      (item: { locale: string }) => item.locale === event.target.value
    );

    // Update the form values to reflect the selected locale
    if (selectedLocaleObject) {
      schoolSetValue('name', selectedLocaleObject.name); // Update name to match the locale
      schoolSetValue('session_inclusions', selectedLocaleObject.session_inclusions); // Update name to match the locale
    } else {
      schoolSetValue('name', '');
      schoolSetValue('session_inclusions', ''); // Update name to match the locale
    }
  };
  console.log('detailsdetails', details);
  useEffect(() => {
    if (details) {
      const defaultVendorValues = {
        locale: selectedLocaleObject?.locale || '',
        name: selectedLocaleObject?.name || '',
        number_of_sessions: details?.number_of_sessions || '',
        session_inclusions: selectedLocaleObject?.session_inclusions || '',
        is_published: details?.is_published === 0 ? false : true,
        vendor_id: details?.vendor_id,
        category_id: details?.category_id || '',
      };
      schoolReset(defaultVendorValues);
    }
  }, [details, schoolReset, selectedLocaleObject]);
  const handleOpenDialog = () => {
    setOpenDialog(true);
  };
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };
  const onSubmit = schoolSubmit(async (data) => {
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
        is_published: data?.is_published ? '1' : '0',
        vendor_id: data?.vendor_id || details?.vendor_id,
        category_id: data?.category_id || details?.category_id,
      };
      let formData = new FormData();

      // Append fields to FormData
      formData.append('is_published', payload.is_published);
      formData.append('number_of_sessions', payload.number_of_sessions);

      formData.append('vendor_id', payload.vendor_id || '');
      formData.append('package_id', details.id || '');
      formData.append('category_id', payload.category_id || '');

      // Handle `package_translations` (assumes only one translation)
      if (payload.package_translations && payload.package_translations.length > 0) {
        formData.append('package_translation[0][name]', payload.package_translations[0].name || '');
        formData.append(
          'package_translation[0][locale]',
          payload.package_translations[0].locale || ''
        );
        formData.append(
          'package_translation[0][session_inclusions]',
          payload.package_translations[0].session_inclusions || ''
        );
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
  const renderContent = (
    <Stack component={Card} spacing={3} sx={{ p: 3 }}>
      {!editMode && (
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
                { label: `Name (${itm?.locale})`, value: itm?.name ?? 'N/A' },
              ]) || []),
              ...(details?.package_translations?.flatMap((itm: any) => [
                {
                  label: `Session inclusions (${itm?.locale})`,
                  value: <PackageDescription description={itm?.session_inclusions} /> ?? 'N/A',
                },
              ]) || []),
              {
                label: 'School Id',
                value: (
                  <Box
                    component="span"
                    onClick={() => {
                      router.push(paths.dashboard.school.details(details?.vendor_id)); // Navigate to the school details page
                    }}
                    sx={{ cursor: 'pointer', color: 'blue', textDecoration: 'underline' }} // Add some styles to indicate it's clickable
                  >
                    {details?.vendor_id ?? 'N/A'}
                  </Box>
                ),
              },
              ...(details?.vendor?.vendor_translations?.flatMap((itm: any) => [
                { label: `School Name (${itm?.locale})`, value: itm?.name ?? 'N/A' },
              ]) || []),

              { label: 'Number of sessions', value: details?.number_of_sessions ?? 'NA' },
              {
                label: 'Category',
                value: (() => {
                  const selectedCategory = category?.find((cat) => cat.id === details?.category_id);
                  return selectedCategory
                    ? selectedCategory.category_translations[0]?.name || 'N/A' // Adjust if you need a specific locale
                    : 'N/A';
                })(),
              },
              {
                label: 'Is Published',
                value:
                  details?.is_published === 1 ? (
                    <Iconify color="green" icon="bi:check-square-fill" />
                  ) : (
                    <Iconify color="red" icon="bi:x-square-fill" />
                  ),
              },
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
        ) : (
          <Box component="form" rowGap={2} columnGap={2} display="grid" onSubmit={onSubmit} pb={1}>
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
                  sm: '25% 70% ',
                  // md: 'repeat(2, 1fr)',
                }}
              >
                <Controller
                  name="locale"
                  control={schoolControl}
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
                  name="name"
                  control={schoolControl}
                  render={({ field }) => (
                    <TextField
                      label="Name"
                      {...field}
                      error={errors?.name?.message}
                      helperText={errors?.name ? errors?.name?.message : ''}
                    />
                  )}
                />
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
                <Controller
                  name="number_of_sessions"
                  control={schoolControl}
                  render={({ field }) => (
                    <TextField
                      label="Number of sessions"
                      {...field}
                      error={!!errors.number_of_sessions}
                    />
                  )}
                />

                <Controller
                  name="vendor_id"
                  control={schoolControl}
                  render={({ field }) => (
                    <Select {...field} value={field?.value || ''}>
                      {schoolList?.map((option: any) => (
                        <MenuItem key={option.id} value={option.id}>
                          {option?.vendor_translations.find(
                            (item) => item?.locale?.toLowerCase() === 'en'
                          )?.name || 'Unknown'}
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                />
                <Controller
                  name="category_id"
                  control={schoolControl}
                  render={({ field }) => (
                    <Select
                      {...field}
                      value={field.value || ''} // Ensure the field value is controlled
                      displayEmpty // This prop allows the placeholder to be visible
                    >
                      <MenuItem value="" disabled>
                        <em>Select a category</em>
                      </MenuItem>
                      {category?.length > 0 ? (
                        category.map((item) =>
                          item.category_translations.map((translation) => (
                            <MenuItem key={`${item.id}-${translation.id}`} value={item.id}>
                              {translation.name} ({translation.locale})
                            </MenuItem>
                          ))
                        )
                      ) : (
                        <MenuItem disabled value="">
                          <em>No categories available</em>
                        </MenuItem>
                      )}
                    </Select>
                  )}
                />

                <Stack direction="row" alignItems="center">
                  <Typography>Published</Typography>
                  <Controller
                    name="is_published"
                    control={schoolControl}
                    render={({ field }) => (
                      <Switch {...field} error={!!errors.is_published} checked={field.value} />
                    )}
                  />
                </Stack>
              </Box>
            </Box>
            <Controller
              name="session_inclusions"
              control={schoolControl}
              render={({ field, fieldState: { error } }) => (
                <Editor
                  id="session_inclusions"
                  value={field.value}
                  onChange={field.onChange}
                  error={!!error}
                  helperText={
                    !!error && (
                      <FormHelperText error={!!error} sx={{ px: 2 }}>
                        {error ?? error?.message}
                      </FormHelperText>
                    )
                  }
                />
              )}
            />
            <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 3 }}>
              <Button variant="outlined" color="error" onClick={handleCancel}>
                Cancel
              </Button>
              <Button type="submit" variant="contained">
                {isSubmitting ? <CircularProgress size="20px" /> : 'Save'}
              </Button>
            </Stack>
          </Box>
        )}
      </Scrollbar>
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
        <>
          {' '}
          <Grid container spacing={1} rowGap={1}>
            <Grid xs={12} md={8}>
              {renderContent}
            </Grid>
          </Grid>{' '}
          <Button
            variant="contained"
            color="primary"
            startIcon={<Iconify icon="eva:plus-fill" />}
            sx={{ mt: 7, mb: 5 }}
            onClick={handleOpenDialog}
          >
            Add package document
          </Button>
          <PackageDocumentCreateUpdate
            open={openDialog}
            onClose={handleCloseDialog}
            reload={revalidateDocuments}
            packageId={details?.id}
            sessionNumber={details?.number_of_sessions}
          />
          {documents && documents.length > 0 && (
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
