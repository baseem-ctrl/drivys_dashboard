import * as Yup from 'yup';
import { useMemo, useState, useEffect, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { TimePicker } from '@mui/x-date-pickers';
import { useSnackbar } from 'src/components/snackbar';
import { createSchool, useGetSchool, useGetSchoolAdmin } from 'src/api/school';
import { useGetAllLanguage } from 'src/api/language';
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
import { TextField, Typography } from '@mui/material';
import { countries } from 'src/assets/data';
import Iconify from 'src/components/iconify';
import { createUpdatePackage } from 'src/api/package';

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
  const { language } = useGetAllLanguage(0, 1000);
  const { schoolAdminList, schoolAdminLoading, revalidateSearch } = useGetSchoolAdmin(1000, 1);
  const { schoolList, schoolLoading } = useGetSchool(1000, 1);
  console.log(schoolList, "schoolList");


  // State to track translations for each locale
  const [translations, setTranslations] = useState<any>({});
  const [selectedLocale, setSelectedLocale] = useState<string | null>();

  const localeOptions = language?.map((item: any) => ({
    label: item.language_culture,
    value: item.language_culture,
  }));

  const DeliverySchema = Yup.object().shape({
    name: Yup.string().required('Name is required'),
    locale: Yup.string().required('Locale is required'),
    session_inclusions: Yup.string().required('Session inclusions is required'),
    is_published: Yup.boolean(),
    number_of_sessions: Yup.number(),
    vendor_id: Yup.mixed(),
  });

  const defaultValues = useMemo(
    () => ({
      // contact_email: '',
      // contact_phone_number: 0,
      // commission_in_percentage: '',
      // status: '',
      // name: '',
      // locale: currentDelivery?.delivery_slot_translation?.[0]?.locale || '',
      // is_published: true,
      // create_new_user: false,
      // user_id: '',
      // user_name: '',
      // user_email: '',
      // password: '',
      // phone: '',
      // country_code: '',
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

  const currentName = watch('name');
  const currentDescription = watch('description');
  const values = watch();
  const previousLocaleRef = useRef(selectedLocale);
  console.log(errors, 'errors');

  // ** 1. Saving current locale's translation before switching **
  const saveCurrentLocaleTranslation = () => {
    if (selectedLocale) {
      setTranslations((prev: any) => ({
        ...prev,
        [selectedLocale]: {
          name: currentName || '',
          description: currentDescription || '',
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


      // Update the previous locale
      previousLocaleRef.current = selectedLocale;
    }
  }, [selectedLocale, setValue, translations]);

  // ** 4. Form Submission Logic **
  const onSubmit = async (data: any) => {
    // Save current locale's data before submission
    saveCurrentLocaleTranslation();

    const formData = new FormData();
    formData.append('number_of_sessions', data?.number_of_sessions);
    formData.append('is_published', data.is_published ? '1' : '0');
    formData.append('vendor_id', data?.vendor_id?.value);
    formData.append(`package_translation[0][name]`, data?.name);
    formData.append(`package_translation[0][locale]`, data?.locale);
    formData.append(`package_translation[0][session_inclusions]`, data?.session_inclusions);

    try {
      const response = await createUpdatePackage(formData);
      if (response) {
        reset();
        onClose();
        revalidateDeliverey();
        enqueueSnackbar(response?.message, { variant: 'success' });
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
  };
  const handleSearchChange = (e) => {
    revalidateSearch(e?.target?.value);
  };
  const handleClose = () => {
    reset(defaultValues);
    onClose();
  };
  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={onClose}>
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
            <Grid item xs={6}>
              <RHFTextField name="number_of_sessions" label="Number of sessions" />
            </Grid>

            <Grid item xs={6}>
              <RHFAutocomplete
                name="vendor_id"
                label="Select School"
                // {option?.vendor_translations.find(item => item?.locale?.toLowerCase() === "en")?.name || "Unknown"}
                options={schoolList?.map((item) => ({
                  label: item?.vendor_translations.find(item => item?.locale?.toLowerCase() === "en")?.name || "Unknown",
                  value: item?.id,
                }))}
                onInputChange={(e: any) => handleSearchChange(e)}
                loading={schoolAdminLoading}
              />
            </Grid>
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
