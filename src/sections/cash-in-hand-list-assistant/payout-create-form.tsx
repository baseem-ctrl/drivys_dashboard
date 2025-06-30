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
import { processPayoutToTrainer } from 'src/api/payouts';
import { paths } from 'src/routes/paths';
import { useTranslation } from 'react-i18next';
import { collectCashFromAssistant } from 'src/api/booking-assistant';

const PayoutSchema = Yup.object().shape({
  amount: Yup.number().required('Amount is required').positive('Amount must be positive'),
});

export default function PayoutCreateForm({ open, onClose, assistant_id, reload, amount }) {
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
    formState: { isSubmitting, errors },
  } = methods;
  const onSubmit = async (data) => {
    try {
      const formData = new FormData();
      if (assistant_id) formData.append('assistant_id', assistant_id);
      if (data?.amount) formData.append('amount', data?.amount);

      if (data?.proof_file) formData.append('proof_file', data?.proof_file);
      const response = await collectCashFromAssistant(formData);
      if (response) {
        reset();
        onClose();
        reload();
        enqueueSnackbar(response?.message, { variant: 'success' });
        router.push(paths.dashboard.assistantCollectCash.list);
      }
    } catch (error) {
      enqueueSnackbar('Failed to create payout.', { variant: 'error' });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{t('Create Payout')}</DialogTitle>
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={2} mt={2} direction="row" flexWrap="wrap" gap={2}>
            <Box sx={{ display: 'flex', gap: 2, width: '100%' }}>
              <RHFTextField
                name="amount"
                label={t('Amount')}
                type="number"
                control={control}
                fullWidth
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
