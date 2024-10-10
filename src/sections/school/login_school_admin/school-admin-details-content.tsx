// @mui
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
// types
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
import { useEffect, useMemo, useState } from 'react';
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

// ----------------------------------------------------------------------

type Props = {
  details: any;
  loading?: any;
  reload: VoidFunction;
};

export default function SchoolAdminDetailsContent({ details, loading, reload }: Props) {
  // const [selectedLanguage, setSelectedLanguage] = useState(
  //   details?.vendor_translations?.length > 0 ? details?.vendor_translations[0]?.locale : ''
  // );
  const [editMode, setEditMode] = useState(false);

  // const { language, languageLoading, totalpages, revalidateLanguage, languageError } =
  //   useGetAllLanguage(0, 1000);

  // This useEffect sets the initial selectedLanguage value once details are available
  // useEffect(() => {
  //   if (details?.vendor_translations?.length > 0) {
  //     setSelectedLanguage(details?.vendor_translations[0]?.locale);
  //   }
  // }, [details]);

  // const [localeOptions, setLocaleOptions] = useState([]);

  // useEffect(() => {
  //   if ((language && language?.length > 0) || details?.vendor_translations?.length > 0) {
  //     let initialLocaleOptions = [];
  //     if (Array.isArray(language)) {
  //       initialLocaleOptions = language?.map((item: any) => ({
  //         label: item?.language_culture,
  //         value: item?.language_culture,
  //       }));
  //     }
  //     // const newLocales = details?.vendor_translations
  //     //   ?.map((category: any) => category?.locale)
  //     //   ?.filter(
  //     //     (locale: any) => !initialLocaleOptions?.some((option: any) => option?.value === locale)
  //     //   )
  //     //   .map((locale: any) => ({ label: locale, value: locale }));
  //     // if (newLocales) {
  //     //   setLocaleOptions([...initialLocaleOptions, ...newLocales]);
  //     // } else {
  //     setLocaleOptions([...initialLocaleOptions]);
  //     // }
  //   }
  // }, [language, details]);

  // Find the selectedLocaleObject whenever selectedLanguage or details change
  // const selectedLocaleObject = details?.vendor_translations?.find(
  //   (item: { locale: string }) => item.locale === selectedLanguage
  // );

  // const VendorSchema = Yup.object().shape({
  //   locale: Yup.mixed(),
  //   name: Yup.string().required('Name is required'),
  //   contact_email: Yup.string().email('Invalid email'),
  //   phone_number: Yup.string().matches(/^\d{1,15}$/, 'Phone number must be less that 15 digits'),
  //   commission_in_percentage: Yup.string(),
  //   license_expiry: Yup.string(),
  //   website: Yup.string().url('Invalid URL'),
  //   status: Yup.string(),
  //   license_file: Yup.mixed().nullable(),
  //   is_active: Yup.boolean(),
  //   user_id: Yup.string(),
  // });
  // const defaultVendorValues = useMemo(
  //   () => ({
  //     locale: selectedLocaleObject?.locale || '',
  //     name: selectedLocaleObject?.name || '',
  //     contact_email: details?.email || '',
  //     phone_number: details?.phone_number || '',
  //     commission_in_percentage: details?.commission_in_percentage || '',
  //     license_expiry: details?.license_expiry || '',
  //     license_file: null,
  //     website: details?.website || '',
  //     status: details?.status || '',
  //     is_active: true,
  //     user_id: details?.vendor_user?.user_id,
  //   }),
  //   [selectedLocaleObject, details, editMode]
  // );
  // const Schoolethods = useForm({
  //   resolver: yupResolver(VendorSchema) as any,
  //   defaultVendorValues,
  // });
  // const {
  //   reset: schoolReset,
  //   watch: schoolWatch,
  //   control: schoolControl,
  //   setValue: schoolSetValue,
  //   handleSubmit: schoolSubmit,
  //   formState: schoolFormState,
  // } = Schoolethods;
  // const { isSubmitting, errors } = schoolFormState;
  // const [uploadedFileUrl, setUploadedFileUrl] = useState('');
  // console.log(errors, 'errors');
  // useEffect(() => {
  //   if (details?.license_file) {
  //     setUploadedFileUrl(details.license_file); // Set the initial file URL from the response
  //   }
  // }, [details]);
  // const handleChange = (event: { target: { value: any } }) => {
  //   setSelectedLanguage(event.target.value);
  //   const selectedLocaleObject = details?.vendor_translations.find(
  //     (item: { locale: string }) => item.locale === event.target.value
  //   );

  //   // Update the form values to reflect the selected locale
  //   if (selectedLocaleObject) {
  //     schoolSetValue('name', selectedLocaleObject.name); // Update name to match the locale
  //   } else {
  //     schoolSetValue('name', '');
  //   }
  // };
  // useEffect(() => {
  //   if (details) {
  //     const defaultVendorValues = {
  //       locale: selectedLocaleObject?.locale || '',
  //       name: selectedLocaleObject?.name || '',
  //       contact_email: details?.email || '',
  //       phone_number: details?.phone_number || '',
  //       commission_in_percentage: details?.commission_in_percentage || '',
  //       license_expiry: details?.license_expiry || '',
  //       license_file: null,
  //       website: details?.website || '',
  //       status: details?.status || '',
  //       is_active: details?.is_active === '0' ? false : true,
  //       user_id: details?.vendor_user?.user_id,
  //     };
  //     schoolReset(defaultVendorValues);
  //   }
  // }, [details, schoolReset, selectedLocaleObject]);
  // const onSubmitBasicInfo = schoolSubmit(async (data) => {
  //   try {
  //     let payload = {
  //       vendor_translations: [
  //         {
  //           name: data?.name || selectedLocaleObject?.name,
  //           locale: selectedLanguage || selectedLocaleObject?.locale,
  //         },
  //       ],
  //       contact_email: data?.contact_email,
  //       contact_phone_number: data?.phone_number,
  //       status: data?.status,
  //       is_active: data?.is_active ? '1' : '0',
  //       commission_in_percentage: data?.commission_in_percentage,
  //       create_new_user: 0,
  //       license_expiry: data?.license_expiry,
  //       license_file: data?.license_file,
  //       user_id: data?.user_id,
  //       vendor_id: details?.id,
  //       website: data?.website,
  //     };
  //     let formData = new FormData();

  //     // Append fields to FormData
  //     formData.append('contact_email', payload.contact_email || '');
  //     formData.append('contact_phone_number', payload.contact_phone_number || '');
  //     formData.append('status', payload.status || '');
  //     formData.append('is_active', payload.is_active);
  //     formData.append('commission_in_percentage', payload.commission_in_percentage || '');
  //     formData.append('create_new_user', payload.create_new_user.toString());
  //     formData.append('license_expiry', payload.license_expiry || '');
  //     formData.append('user_id', payload.user_id || '');
  //     formData.append('vendor_id', payload.vendor_id || '');
  //     formData.append('website', payload.website || '');

  //     // Handle `vendor_translations` (assumes only one translation)
  //     if (payload.vendor_translations && payload.vendor_translations.length > 0) {
  //       formData.append('vendor_translations[0][name]', payload.vendor_translations[0].name || '');
  //       formData.append(
  //         'vendor_translations[0][locale]',
  //         payload.vendor_translations[0].locale || ''
  //       );
  //     }

  //     // Append file field if it exists and is a File object
  //     if (payload.license_file) {
  //       formData.append('license_file', payload.license_file); // Assumes `license_file` is a File object
  //     }

  //     const response = await createSchool(formData);
  //     if (response) {
  //       enqueueSnackbar(response.message, {
  //         variant: 'success',
  //       });
  //       setEditMode(false);
  //     }
  //   } catch (error) {
  //     if (error?.errors) {
  //       Object.values(error?.errors).forEach((errorMessage: any) => {
  //         enqueueSnackbar(errorMessage[0], { variant: 'error' });
  //       });
  //     } else {
  //       enqueueSnackbar(error.message, { variant: 'error' });
  //     }
  //   } finally {
  //     reload();
  //   }
  // });

  // const handleCancel = () => {
  //   schoolReset(); // Reset to the original values
  //   setEditMode(false);
  // };
  const renderContent = (
    <Stack component={Card} spacing={3} sx={{ p: 3 }}>
      {!editMode && (
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
          {/* <Iconify
            icon="solar:pen-bold"
            onClick={() => setEditMode(true)}
            sx={{ cursor: 'pointer' }}
          /> */}
        </Stack>
      )}
      <Scrollbar>
        {!editMode ? (
          <Stack spacing={1} alignItems="flex-start" sx={{ typography: 'body2' }}>
            {[
              ...(details?.vendor_translations?.flatMap((itm: any) => [
                { label: `Name (${itm?.locale})`, value: itm?.name ?? 'N/A' },
              ]) || []),
              // { label: 'Name', value: items?.name ?? 'N/A' },
              { label: 'Email', value: details?.email ?? 'NA' },
              { label: 'Phone Number', value: details?.phone_number ?? 'NA' },
              { label: 'Commission in (%)', value: details?.commission_in_percentage ?? 'NA' },

              { label: 'License Expiry', value: details?.license_expiry ?? 'NA' },
              {
                label: 'License File',
                value: details?.license_file ? (
                  <a
                    href={details?.license_file}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ wordBreak: 'break-all', overflowWrap: 'break-word' }}
                  >
                    {details?.license_file}
                  </a>
                ) : (
                  'N/A'
                ),
              },
              {
                label: 'Website',
                value: details?.website ? (
                  <a
                    href={details?.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ wordBreak: 'break-all', overflowWrap: 'break-word' }}
                  >
                    {details?.website}
                    {details?.website && (
                      <img src="/assets/icons/navbar/ic_link.svg" alt="" width={22} height={22} />
                    )}
                  </a>
                ) : (
                  'N/A'
                ),
              },
              { label: 'Status', value: details?.status ?? 'NA' },
              {
                label: 'Is Active',
                value:
                  details?.is_active === '1' ? (
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
          <></>
          // <Box
          //   component="form"
          //   rowGap={2}
          //   columnGap={2}
          //   display="grid"
          //   onSubmit={onSubmitBasicInfo}
          //   pb={1}
          // >
          //   <Box
          //     mt={2}
          //     rowGap={3}
          //     columnGap={2}
          //     display="grid"
          //     gridTemplateColumns="repeat(1, 1fr)"
          //   // sx={{ mb: 2, p: 2, border: '1px solid #ddd' }}
          //   >
          //     <Box
          //       display="grid"
          //       gap={1}
          //       gridTemplateColumns={{
          //         xs: 'repeat(1, 1fr)',
          //         sm: '25% 70% ',
          //         // md: 'repeat(2, 1fr)',
          //       }}
          //     >
          //       <Controller
          //         name="locale"
          //         control={schoolControl}
          //         render={({ field }) => (
          //           <Select {...field} value={selectedLanguage || ''} onChange={handleChange}>
          //             {localeOptions?.map((option: any) => (
          //               <MenuItem key={option?.value} value={option?.value}>
          //                 {option?.label}
          //               </MenuItem>
          //             ))}
          //           </Select>
          //         )}
          //       />
          //       <Controller
          //         name="name"
          //         control={schoolControl}
          //         render={({ field }) => (
          //           <TextField
          //             label="Name"
          //             {...field}
          //             error={errors?.name?.message}
          //             helperText={errors?.name ? errors?.name?.message : ''}
          //           />
          //         )}
          //       />
          //     </Box>
          //   </Box>

          //   <Box
          //     mt={2}
          //     rowGap={3}
          //     columnGap={2}
          //     display="grid"
          //     gridTemplateColumns="repeat(1, 1fr)"
          //   // sx={{ mb: 2, p: 2, border: '1px solid #ddd' }}
          //   >
          //     <Box
          //       display="grid"
          //       gap={1}
          //       gridTemplateColumns={{
          //         // xs: 'repeat(1, 1fr)',
          //         sm: '48% 47% ',
          //         // md: 'repeat(2, 1fr)',
          //       }}
          //       pt={1}
          //     >
          //       <Controller
          //         name="contact_email"
          //         control={schoolControl}
          //         render={({ field }) => (
          //           <TextField label="Email" {...field} error={!!errors.contact_email} />
          //         )}
          //       />{' '}
          //       <Controller
          //         name="phone_number"
          //         control={schoolControl}
          //         render={({ field }) => (
          //           <TextField
          //             label="Phone Number"
          //             type="number"
          //             {...field}
          //             error={!!errors.phone_number?.message}
          //             helperText={errors?.phone_number ? errors?.phone_number?.message : ''}
          //           />
          //         )}
          //       />
          //       <Controller
          //         name="commission_in_percentage"
          //         control={schoolControl}
          //         render={({ field }) => (
          //           <TextField
          //             label="Commission in (%)"
          //             {...field}
          //             error={!!errors.commission_in_percentage}
          //             type="number"
          //           />
          //         )}
          //       />
          //       <Controller
          //         name="license_expiry"
          //         control={schoolControl}
          //         render={({ field }) => (
          //           <TextField
          //             label="License Expiry"
          //             {...field}
          //             error={!!errors.license_expiry}
          //             type="date"
          //             InputLabelProps={{ shrink: true }}
          //           />
          //         )}
          //       />
          //       <Controller
          //         name="license_file"
          //         control={schoolControl}
          //         defaultValue={null}
          //         render={({ field }) => (
          //           <>
          //             <TextField
          //               label="License File"
          //               error={!!errors.license_file}
          //               type="file"
          //               InputLabelProps={{ shrink: true }}
          //               inputRef={field.ref} // Use React Hook Form's ref to handle file input correctly
          //               inputProps={{
          //                 accept: '.pdf,.doc,.jpg,.png', // Optional: specify allowed file types
          //               }}
          //               onChange={(e) => {
          //                 // Update the field value when a file is selected
          //                 field.onChange(e.target.files[0]);
          //               }}
          //             />
          //             {uploadedFileUrl && (
          //               <Box>
          //                 <TextField
          //                   label="Uploaded File URL"
          //                   value={uploadedFileUrl}
          //                   InputProps={{
          //                     readOnly: true,
          //                   }}
          //                   disabled
          //                   fullWidth
          //                 // variant="outlined"
          //                 // margin="normal"
          //                 />
          //                 {/* Optional: Show the uploaded file as a clickable link */}
          //                 {/* <a href={uploadedFileUrl} target="_blank" rel="noopener noreferrer">
          //                   View Uploaded File
          //                 </a> */}
          //               </Box>
          //             )}
          //           </>
          //         )}
          //       />
          //       <Controller
          //         name="website"
          //         control={schoolControl}
          //         render={({ field }) => (
          //           <TextField label="Website" {...field} error={!!errors.website} />
          //         )}
          //       />
          //       <Controller
          //         name="status"
          //         control={schoolControl}
          //         render={({ field, fieldState: { error } }) => (
          //           <TextField {...field} select SelectProps={{ native: true }} error={!!error}>
          //             <option value="">Select Status</option>
          //             <option value="active">Active</option>
          //             <option value="suspended">Suspended</option>
          //             <option value="pending_for_verification">Pending for Verification</option>
          //             <option value="expired">Expired</option>
          //             <option value="cancelled">Cancelled</option>
          //           </TextField>
          //         )}
          //       />
          //       <Controller
          //         name="user_id"
          //         control={schoolControl}
          //         render={({ field }) => (
          //           <Select {...field} value={field?.value || ''}>
          //             {schoolAdminList.map((option: any) => (
          //               <MenuItem key={option.id} value={option.id}>
          //                 {option.name}
          //               </MenuItem>
          //             ))}
          //           </Select>
          //         )}
          //       />
          //       <Controller
          //         name="is_active"
          //         control={schoolControl}
          //         render={({ field }) => (
          //           <Switch {...field} error={!!errors.is_active} checked={field.value} />
          //         )}
          //       />
          //     </Box>
          //   </Box>
          //   <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 3 }}>
          //     <Button variant="outlined" color="error" onClick={handleCancel}>
          //       Cancel
          //     </Button>
          //     <Button type="submit" variant="contained">
          //       Save
          //     </Button>
          //   </Stack>
          // </Box>
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
        <Grid container spacing={1} rowGap={1}>
          <Grid xs={12} md={8}>
            {renderContent}
          </Grid>


        </Grid>
      )}
    </>
  );
}
