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
// _mock
// types
// assets
// components
import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFSelect, RHFTextField, RHFAutocomplete } from 'src/components/hook-form';
import { AddBulkSchoolCommision } from 'src/api/school';
import { useTranslation } from 'react-i18next';
// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  onClose: VoidFunction;
  bulkIds: any;
  type: string;
  reload: any;
};

export default function BulkSchoolCommission({ bulkIds, open, onClose, type, reload }: Props) {
  const { t } = useTranslation()
  const { enqueueSnackbar } = useSnackbar();
  const NewUserSchema = Yup.object().shape({
    commission: Yup.string(),
  });

  const defaultValues = useMemo(
    () => ({
      commission: '',
    }),
    []
  );

  const methods = useForm({
    resolver: yupResolver(NewUserSchema) as any,
    defaultValues,
  });
  const today = new Date().toISOString().split('T')[0];

  const {
    reset,
    handleSubmit,
    control,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (bulkIds?.length === 0) {
        enqueueSnackbar('Please Select School', { variant: 'error' });
      } else {
        const body = {
          vendor_ids: bulkIds,
          type: 'vendor',
          commission: data?.commission,
        };
        const response = await AddBulkSchoolCommision(body);
        if (response) {
          enqueueSnackbar(response.message, {
            variant: 'success',
          });
        }
        onClose();
        reset();
        reload();
      }
    } catch (error) {
      if (error?.errors && typeof error?.errors === 'object' && !Array.isArray(error?.errors)) {
        Object.values(error?.errors).forEach((errorMessage: any) => {
          enqueueSnackbar(errorMessage[0], { variant: 'error' });
        });
      } else {
        enqueueSnackbar(error.message, { variant: 'error' });
      }
    }
  });
  const handleClose = () => {
    reset(defaultValues);
    onClose();
  };
  return (
    <Dialog
      fullWidth
      maxWidth={false}
      open={open}
      onClose={handleClose}
      PaperProps={{
        sx: { maxWidth: 720 },
      }}
    >
      <FormProvider methods={methods} onSubmit={onSubmit}>
        <DialogTitle>{t('Add Bulk Commission')}</DialogTitle>

        <DialogContent>
          <Box
            sx={{ m: 3 }}
            rowGap={3}
            columnGap={2}
            display="grid"
            gridTemplateColumns={{
              xs: 'repeat(1, 1fr)',
              sm: 'repeat(2, 1fr)',
            }}
          >
            <RHFTextField
              type="number"
              name="commission"
              label={t("Commission in (%)")}
              prefix="%"
            ></RHFTextField>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button variant="outlined" onClick={handleClose}>
            {t("Cancel")}
          </Button>

          <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
            {t("Update")}
          </LoadingButton>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}
