import React, { useState, useEffect } from 'react';
import * as Yup from 'yup';
import { useForm, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import FormControlLabel from '@mui/material/FormControlLabel';
import { Controller } from 'react-hook-form';
import Switch from '@mui/material/Switch';

import Grid from '@mui/material/Grid';
// components
import { useSnackbar } from 'src/components/snackbar';
import { RHFSwitch, RHFTextField } from 'src/components/hook-form';
import { createOrUpdateDialect } from 'src/api/dialect';
import { useTranslation } from 'react-i18next';

type Props = {
  title: string;
  open: boolean;
  onClose: VoidFunction;
  currentDialect?: any;
  reload: VoidFunction;
};

export default function DialectCreateEditForm({
  title,
  currentDialect,
  open,
  onClose,
  reload,
}: Props) {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const methods = useForm({
    resolver: yupResolver(
      Yup.object().shape({
        language_name: Yup.string().required(t('language_name_required')),
        dialect_name: Yup.string(),
        keywords: Yup.string(),
        description: Yup.string(),
        order: Yup.number().typeError(t('order_must_be_number')).nullable(),
        is_published: Yup.boolean(),
      })
    ),
    defaultValues: {
      language_name: currentDialect?.language_name || '',
      dialect_name: currentDialect?.dialect_name || '',
      keywords: currentDialect?.keywords || '',
      description: currentDialect?.description || '',
      order: currentDialect?.order || '',
      is_published: currentDialect?.is_published === 1 ? true : false,
    },
  });

  const { handleSubmit, reset } = methods;

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      let formData = new FormData();
      formData.append('is_published', data.is_published ? '1' : '0');
      formData.append('language_name', data.language_name);
      formData.append('dialect_name', data.dialect_name);
      formData.append('keywords', data.keywords);
      formData.append('description', data.description);
      formData.append('order', data.order);

      if (currentDialect?.id) {
        formData.append('dialect_id', currentDialect.id);
        const response = await createOrUpdateDialect(formData);
        enqueueSnackbar(response.message);
        reload(); // Refresh or reload data
        onClose(); // Close the form
      } else {
        const response = await createOrUpdateDialect(formData);
        enqueueSnackbar(response.message);
        reload(); // Refresh or reload data
        onClose(); // Close the form
        reset();
      }
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
    } finally {
      setIsSubmitting(false); // Reset loading state
    }
  };
  useEffect(() => {
    if (currentDialect?.id) {
      reset();
    }
  }, [currentDialect]);
  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={onClose}>
      <FormProvider {...methods}>
        <DialogTitle>{currentDialect ? t(title) : t('Create Dialect')}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <RHFTextField name="language_name" label={t('Language Name')} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <RHFTextField name="dialect_name" label={t('Dialect Name')} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <RHFTextField name="keywords" label={t('Keywords')} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <RHFTextField name="description" label={t('Description')} multiline rows={2} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <RHFTextField name="order" label={t('Order')} type="number" />
              </Grid>
              <Grid item xs={12} sm={6}>
                <RHFSwitch name="is_published" label={t('Published')} />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={onClose}>
            {t('Cancel')}
          </Button>
          <LoadingButton
            type="submit"
            variant="contained"
            loading={isSubmitting}
            onClick={handleSubmit(onSubmit)}
          >
            {currentDialect?.id ? t('Update') : t('Create')}
          </LoadingButton>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}
