import * as Yup from 'yup';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import MenuItem from '@mui/material/MenuItem';
import { useSnackbar } from 'src/components/snackbar';

import Grid from '@mui/material/Grid';
import FormProvider, { RHFTextField, RHFSelect } from 'src/components/hook-form';
import { createOrUpdatePackageDocument } from 'src/api/packageDocument';
import RHFFileUpload from 'src/components/hook-form/rhf-text-file';
import { useTranslation } from 'react-i18next';
import { useGetAllLanguage } from 'src/api/language';

type Props = {
  open: boolean;
  onClose: VoidFunction;
  currentDocument?: any;
  reload?: any;
  packageId?: any;
  sessionNumber?: any;
};

export default function PackageDocumentCreateUpdate({
  reload,
  open,
  onClose,
  currentDocument,
  packageId,
  sessionNumber,
}: Props) {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const { language } = useGetAllLanguage(0, 1000);
  const [selectedLocale, setSelectedLocale] = useState<string | null>('en');

  const localeOptions = language?.map((item: any) => ({
    label: item.language_culture,
    value: item.language_culture,
  }));
  const DocumentSchema = Yup.object().shape({
    translations: Yup.array()
      .of(
        Yup.object().shape({
          locale: Yup.string().required('Locale is required'),
          title: Yup.string().required('Title is required'),
          description: Yup.string().required('Description is required'),
        })
      )
      .min(1),
    type: Yup.string(),
    status: Yup.string(),
    session_no: Yup.number().when([], {
      is: () => sessionNumber === -1,
      then: (schema) => schema.required('Session number is required'),
      otherwise: (schema) =>
        schema
          .max(sessionNumber, `Session number cannot exceed ${sessionNumber}.`)
          .required('Session number is required'),
    }),
  });

  // Default values (populate for update if `currentDocument` exists)
  const defaultValues = useMemo(
    () => ({
      package_id: packageId || '',
      translations: [
        {
          locale: currentDocument?.translations?.[0]?.locale || selectedLocale || 'en',
          title: currentDocument?.translations?.[0]?.title || '',
          description: currentDocument?.translations?.[0]?.description || '',
        },
      ],
      type: currentDocument?.type || 'image',
      status: currentDocument?.status || 'active',
      session_no: currentDocument?.session_no || '',
      icon: currentDocument?.icon || null,
    }),
    [currentDocument, packageId, selectedLocale]
  );

  const methods = useForm({
    resolver: yupResolver(DocumentSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    reset,
    formState: { isSubmitting, errors },
    setValue,
    watch,
  } = methods;
  // Watch the type field
  const fileType = watch('type');
  let acceptedFileTypes = '';

  // Restrict the file type
  if (fileType === 'image') {
    acceptedFileTypes = '.jpg,.jpeg,.png';
  } else if (fileType === 'video') {
    acceptedFileTypes = '.mp4';
  } else if (fileType === 'pdf') {
    acceptedFileTypes = '.pdf';
  }
  const onSubmit = async (data: any) => {
    try {
      const updatedDocument = new FormData();

      if (data.icon) {
        updatedDocument.append('icon', data.icon);
      }

      if (data.file) {
        updatedDocument.append('file', data.file);
      }

      updatedDocument.append('package_id', packageId);
      updatedDocument.append('session_no', data.session_no || '');
      updatedDocument.append('type', data.type || '');
      updatedDocument.append('status', data.status || '');

      if (data.translations && data.translations.length > 0) {
        updatedDocument.append('translations[0][locale]', data.translations[0].locale || '');
        updatedDocument.append('translations[0][title]', data.translations[0].title || '');
        updatedDocument.append(
          'translations[0][description]',
          data.translations[0].description || ''
        );
      }

      const response = await createOrUpdatePackageDocument(updatedDocument);
      enqueueSnackbar(response?.message, { variant: 'success' });
      reload();
      reset();
      onClose();
    } catch (error) {
      if (error?.errors && typeof error?.errors === 'object' && !Array.isArray(error?.errors)) {
        Object.values(error?.errors).forEach((errorMessage) => {
          if (typeof errorMessage === 'object') {
            enqueueSnackbar(errorMessage[0], { variant: 'error' });
          } else {
            enqueueSnackbar(errorMessage, { variant: 'error' });
          }
        });
      } else {
        enqueueSnackbar(error.message, { variant: 'error' });
      }
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  // options for file type
  const typeOptions = [
    { value: 'image', label: 'Image' },
    { value: 'video', label: 'Video' },
    { value: 'pdf', label: 'PDF' },
  ];
  // options for status
  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'pending', label: 'Pending' },
  ];
  useEffect(() => {
    if (currentDocument) {
      methods.trigger();
    }
  }, [currentDocument, methods]);
  const handleLocaleChange = (newLocale: string) => {
    if (newLocale !== selectedLocale) {
      setSelectedLocale(newLocale);
    }
  };
  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={handleClose}>
      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle>{currentDocument ? t('Update Document') : t('Create Document')}</DialogTitle>

        <DialogContent>
          <Box mt={2}>
            <Grid container spacing={2}>
              <Grid item xs={6} sx={{ mb: 1 }}>
                <RHFSelect
                  name="translations[0].locale"
                  label={t('Locale')}
                  onChange={(e) => {
                    handleLocaleChange(e.target.value);
                    setValue('translations[0].locale', e.target.value);
                  }}
                >
                  {localeOptions?.map((option: any) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </RHFSelect>
              </Grid>

              <Grid item xs={6} sx={{ mb: 1 }}>
                <RHFTextField
                  name="session_no"
                  label={t('Session Number')}
                  type="number"
                  fullWidth
                />
              </Grid>

              <Grid item xs={6} sx={{ mb: 1 }}>
                <RHFTextField name="translations[0].title" label={t('Title')} fullWidth />
              </Grid>

              <Grid item xs={6} sx={{ mb: 1 }}>
                <RHFTextField
                  name="translations[0].description"
                  label={t('Description')}
                  fullWidth
                />
              </Grid>

              <Grid item xs={6} sx={{ mb: 1 }}>
                <RHFSelect name="type" label={t('Type')} fullWidth>
                  {typeOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </RHFSelect>
              </Grid>

              <Grid item xs={6} sx={{ mb: 1 }}>
                <RHFSelect name="status" label={t('Status')} fullWidth>
                  {statusOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </RHFSelect>
              </Grid>

              <Grid item xs={12}>
                <Box
                  sx={{ fontWeight: 'bold', fontSize: '1.125rem', mb: 1, color: 'primary.main' }}
                >
                  {t('Package Document Upload')}
                </Box>
              </Grid>

              <Grid item xs={12} sx={{ mb: 1 }}>
                <RHFFileUpload
                  name="file"
                  label={t('Upload Package Document')}
                  helperText={t('Please upload a package document')}
                />
              </Grid>

              <Grid item xs={12}>
                <Box
                  sx={{ fontWeight: 'bold', fontSize: '1.125rem', mb: 1, color: 'primary.main' }}
                >
                  {t('Package Icon Upload')}
                </Box>
              </Grid>

              <Grid item xs={12} sx={{ mb: 1 }}>
                <RHFFileUpload
                  name="icon"
                  label={t('Upload Icon')}
                  helperText={t('Upload an icon image (optional)')}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button variant="outlined" onClick={handleClose}>
            {t('Cancel')}
          </Button>
          <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
            {currentDocument ? t('Update') : t('Create')}
          </LoadingButton>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}
