import * as Yup from 'yup';
import { useMemo, useState, useEffect, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useSnackbar } from 'src/components/snackbar';
import { useGetSchoolAdmin } from 'src/api/school';
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
import FormProvider, { RHFTextField, RHFCheckbox, RHFSelect } from 'src/components/hook-form';
import { createHomeListing } from 'src/api/homelisting';
import { useTranslation } from 'react-i18next';

type Props = {
  open: boolean;
  onClose: VoidFunction;
  revalidateHomeListing: VoidFunction;
};

export default function SchoolCreateForm({ open, onClose, revalidateHomeListing }: Props) {
  const { enqueueSnackbar } = useSnackbar();
  const { language } = useGetAllLanguage(0, 1000);
  const { t } = useTranslation();

  const { schoolAdminList, schoolAdminLoading, revalidateSearch } = useGetSchoolAdmin(1000, 1);

  // State to track translations for each locale
  const [translations, setTranslations] = useState<any>({});
  const [selectedLocale, setSelectedLocale] = useState<string | null>('en');

  const localeOptions = language?.map((item: any) => ({
    label: item.language_culture,
    value: item.language_culture,
  }));

  const FormSchema = Yup.object().shape({
    catalogue_type: Yup.string().trim().nullable(),
    title: Yup.string().trim().required(t('name_required')).max(255, t('name_max_length')),
    locale: Yup.string().trim().required(t('locale_required')).max(10, t('locale_max_length')),
    description: Yup.string().trim().nullable().max(1000, t('description_max_length')),
    display_order: Yup.string().trim().nullable().matches(/^\d*$/, t('display_order_numeric')),
    is_active: Yup.boolean(),
  });

  const defaultValues = useMemo(
    () => ({
      catalogue_type: '',
      title: '',
      locale: 'en',
      description: '',
      display_order: '',
      is_active: false,
    }),
    []
  );

  const methods = useForm({
    resolver: yupResolver(FormSchema) as any,
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

  const currentName = watch('title');
  const currentDescription = watch('description');
  const values = watch();
  const previousLocaleRef = useRef(selectedLocale);

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
      setValue('title', translation.title || '');
      setValue('locale', selectedLocale);

      // Update the previous locale
      previousLocaleRef.current = selectedLocale;
    }
  }, [selectedLocale, setValue, translations]);

  // ** 4. Form Submission Logic **
  const onSubmit = async (data: any) => {
    // Save current locale's data before submission
    saveCurrentLocaleTranslation();

    const body = new FormData();
    body.append('translation[0][locale]', data?.locale);
    body.append('translation[0][title]', data?.title);
    if (data?.description) body.append('translation[0][description]', data?.description);
    if (data?.display_order) body.append('display_order', data?.display_order);
    if (data?.catalogue_type) body.append('catalogue_type', data?.catalogue_type);
    body.append('is_active', data?.is_active ? '1' : '0');

    try {
      const response = await createHomeListing(body);
      if (response) {
        reset();
        handleClose();
        revalidateHomeListing();
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

  const handleClose = () => {
    reset(defaultValues);
    setSelectedLocale('en');
    onClose();
  };
  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={handleClose}>
      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle>Create Home Listing</DialogTitle>

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
              <RHFTextField name="title" label="Title" />
            </Box>
            <RHFTextField name="description" label="Description" />
          </Box>

          <Divider sx={{ my: 2 }} />

          <Grid container spacing={2}>
            <Grid item xs={6}>
              <RHFTextField name="display_order" label="Display order" />
            </Grid>

            <Grid item xs={6}>
              <Controller
                name="catalogue_type"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <RHFTextField
                    {...field}
                    select
                    SelectProps={{ native: true }}
                    error={!!error}
                    helperText={error?.message}
                  >
                    <option value="">Select Catalogue</option>
                    <option value="1">Drivers</option>
                    <option value="2">Category</option>
                  </RHFTextField>
                )}
              />
            </Grid>

            <Grid item xs={6}>
              <RHFCheckbox name="is_active" label="Active" />
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
