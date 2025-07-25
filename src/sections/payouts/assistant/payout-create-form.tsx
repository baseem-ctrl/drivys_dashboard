import * as Yup from 'yup';
import { useMemo, useState, useEffect, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useSnackbar } from 'src/components/snackbar';
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import Stack from '@mui/material/Stack';
import { useRouter } from 'src/routes/hooks';
import FormProvider, { RHFSelect, RHFTextField } from 'src/components/hook-form';
import { usePaymentMethodEnum } from 'src/api/enum';
import { MenuItem, Typography } from '@mui/material';
import RHFFileUpload from 'src/components/hook-form/rhf-text-file';
import { processPayoutToAssistant, processPayoutToSchool } from 'src/api/payouts';
import { paths } from 'src/routes/paths';
import { useTranslation } from 'react-i18next';

const PayoutSchema = Yup.object().shape({
  amount: Yup.number().required('Amount is required').positive('Amount must be positive'),
  payment_method: Yup.string().required('Payment Method is required'),
  payment_method_details: Yup.string().required('Payment Method Details are required'),
  notes: Yup.string().max(500, 'Notes should not exceed 500 characters'),
});

export default function PayoutCreateForm({ open, onClose, vendorId, reload, amount }) {
  const { t } = useTranslation();
  const defaultValues = useMemo(
    () => ({
      amount: '',
      payment_method: '',

      payment_method_details: '',
      notes: '',
    }),
    []
  );
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const { paymentMethodEnum, paymentMethodLoading, paymentMethodError } = usePaymentMethodEnum();
  const methods = useForm({
    resolver: yupResolver(PayoutSchema),
    defaultValues,
  });
  const {
    handleSubmit,
    control,
    reset,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();
      if (vendorId) formData.append('assistant_id', vendorId);
      if (data?.amount) formData.append('amount', data?.amount);
      if (data?.payment_method) formData.append('payment_method', data?.payment_method);
      if (data?.payment_method_details)
        formData.append('payment_method_details', data?.payment_method_details);

      formData.append('status', 'processed');

      if (data?.notes) formData.append('notes', data?.notes);
      if (data?.proof_file) formData.append('proof_file', data?.proof_file);
      const response = await processPayoutToAssistant(formData);
      if (response) {
        reset();
        onClose();
        reload();
        enqueueSnackbar(response?.message, { variant: 'success' });
        router.push(paths.dashboard.payouts.assistant);
      }
    } catch (error) {
      enqueueSnackbar(t('Failed to create payout.'), { variant: 'error' });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{t('Create Payout')}</DialogTitle>
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              mt: 1,
              mb: 2,
              backgroundColor: '#E8F5E9',
              padding: 2,
              borderRadius: 2,
              boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.1)',
            }}
          >
            <Typography sx={{ fontSize: '16px', fontWeight: 'bold', color: 'green' }}>
              {t('Amount Required From Admin is ')}
              <span className="dirham-symbol">&#x00EA;</span> {amount}
            </Typography>
          </Box>

          <Stack spacing={2} mt={2} direction="row" flexWrap="wrap" gap={2}>
            <Box sx={{ display: 'flex', gap: 2, width: '100%' }}>
              <RHFTextField
                name="amount"
                label={t('Amount')}
                type="number"
                control={control}
                fullWidth
              />

              <RHFSelect
                name="payment_method"
                label={t('Payment Method')}
                control={control}
                fullWidth
              >
                <MenuItem value="">{t('Select Payment Method')} </MenuItem>
                {paymentMethodEnum.map((method) => (
                  <MenuItem key={method.value} value={method.value}>
                    {method.name}
                  </MenuItem>
                ))}
              </RHFSelect>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, width: '100%' }}>
              <RHFTextField
                name="payment_method_details"
                label={t('Payment Method Details')}
                control={control}
                multiline
                rows={3}
                fullWidth
              />
              <RHFTextField
                name="notes"
                label={t('Notes')}
                multiline
                rows={3}
                control={control}
                fullWidth
              />
            </Box>
            <Box sx={{ width: '100%' }}>
              <Typography variant="subtitle1" color="primary" gutterBottom>
                {t('Upload Proof of Payment')}
              </Typography>
              <RHFFileUpload
                name="proof_file"
                label={t('Proof of Payment')}
                control={control}
                accept="image/*"
                required
              />
            </Box>
          </Stack>
        </FormProvider>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('Cancel')}</Button>
        <LoadingButton
          type="submit"
          variant="contained"
          loading={isSubmitting}
          onClick={handleSubmit(onSubmit)}
        >
          {t('Submit')}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}
