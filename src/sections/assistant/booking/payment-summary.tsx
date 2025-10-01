import {
  Box,
  Typography,
  Stack,
  Divider,
  TextField,
  IconButton,
  Button,
  Grid,
  CircularProgress,
} from '@mui/material';

import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import EditIcon from '@mui/icons-material/Edit';
import { useSnackbar } from 'notistack';

export const PaymentSummaryBox = ({
  summary,
  couponCode,
  setCouponCode,
  errorMessage,
  paymentSummaryError,
  paymentSummaryLoading,
  setActiveStep,
}: {
  summary: any;
  couponCode: any;
  setCouponCode: any;
  errorMessage: any;
  setActiveStep: any;
}) => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();

  const [couponInput, setCouponInput] = useState(summary?.coupon_code || '');
  const [localError, setLocalError] = useState('');
  console.log('paymentSummaryError', paymentSummaryError);
  const isCouponApplied =
    !!couponCode && couponCode?.toLowerCase?.() === couponInput?.trim()?.toLowerCase?.();

  useEffect(() => {
    setLocalError(errorMessage || '');
  }, [errorMessage]);
  useEffect(() => {
    if (paymentSummaryError?.message?.errors) {
      setActiveStep(4);

      const couponErrors = paymentSummaryError.message.errors.coupon_code;

      const errorMessage = Array.isArray(couponErrors)
        ? couponErrors.join('\n')
        : 'Something went wrong.';

      enqueueSnackbar(errorMessage, {
        variant: 'error',
      });
      setCouponInput('');
      setCouponCode(null);
    }
  }, [paymentSummaryError]);

  if (paymentSummaryLoading) {
    return (
      <Box
        sx={{
          border: '1px solid #e5e7eb',
          borderRadius: '16px',
          p: 5,
          backgroundColor: '#fff',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 200,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // if (paymentSummaryError) {
  //   const couponErrors = paymentSummaryError?.message?.errors?.coupon_code;
  //   return (
  //     <Box
  //       sx={{
  //         border: '1px solid #e5e7eb',
  //         borderRadius: '16px',
  //         p: 3,
  //         backgroundColor: '#fff',
  //         textAlign: 'center',
  //       }}
  //     >
  //       <Typography variant="subtitle1" fontWeight={700} mb={2}>
  //         {t('payment_summary')}
  //       </Typography>
  //       <Divider sx={{ mb: 2 }} />

  //       {couponErrors?.length ? (
  //         <Stack spacing={0.5}>
  //           {couponErrors.map((err, index) => (
  //             <Typography key={index} color="error.main" fontSize={14}>
  //               {err}
  //             </Typography>
  //           ))}
  //         </Stack>
  //       ) : (
  //         <Typography color="text.secondary">{t('summary_not_available')}</Typography>
  //       )}
  //     </Box>
  //   );
  // }

  return (
    <Box
      sx={{
        border: '1px solid #e5e7eb',
        borderRadius: '16px',
        p: 3,
        backgroundColor: '#fff',
      }}
    >
      <Typography variant="subtitle1" fontWeight={700} mb={2}>
        {t('payment_summary')}
      </Typography>

      <Divider sx={{ mb: 2 }} />

      <Stack spacing={1.5}>
        <SummaryRow
          label={t('package_price_after_discount')}
          value={
            <>
              <span className="dirham-symbol">&#x00EA;</span>
              {(summary?.package_price || 0).toFixed(2)}
            </>
          }
          originalValue={
            summary?.package_price_before_discount &&
            summary?.package_price_before_discount !== summary.package_price ? (
              <>
                <span className="dirham-symbol">&#x00EA;</span>
                {summary?.package_price_before_discount.toFixed(2)}
              </>
            ) : undefined
          }
        />
        <SummaryRow
          label={t('transport_fee_after_discount')}
          value={
            <>
              <span className="dirham-symbol">&#x00EA;</span>
              {summary?.transport_fee.toFixed(2)}
            </>
          }
          originalValue={
            summary?.transport_fee_before_discount &&
            summary?.transport_fee_before_discount !== summary?.transport_fee ? (
              <>
                <span className="dirham-symbol">&#x00EA;</span>
                {summary?.transport_fee_before_discount.toFixed(2)}
              </>
            ) : undefined
          }
        />

        <SummaryRow
          label={t('tax_amount')}
          value={
            <>
              <span className="dirham-symbol">&#x00EA;</span>
              {summary?.tax_amount.toFixed(2)}
            </>
          }
        />
        <SummaryRow
          label={t('cash_service_fee')}
          value={
            <>
              <span className="dirham-symbol">&#x00EA;</span>
              {summary?.cash_service_charge.toFixed(2)}
            </>
          }
        />
        <Divider />
        <SummaryRow label={t('booking_method')} value={summary?.booking_method} />
        <SummaryRow label={t('payment_method')} value={summary?.payment_method} />
        <Divider sx={{ my: 1 }} />
        <Grid container spacing={1} alignItems="center">
          <Grid item xs>
            <TextField
              fullWidth
              size="small"
              value={couponInput}
              onChange={(e) => {
                setCouponInput(e.target.value);
                setLocalError('');
              }}
              placeholder={t('enter_coupon_code')}
              error={Boolean(localError)}
              helperText={localError}
              disabled={isCouponApplied}
            />
          </Grid>

          <Grid item>
            {!isCouponApplied ? (
              <Button
                onClick={() => {
                  if (!couponInput.trim()) {
                    setLocalError(t('please_enter_coupon_code'));
                  }
                  setCouponCode(couponInput.trim());
                }}
                size="small"
                variant="contained"
                color="primary"
                sx={{ minWidth: 80, textTransform: 'none' }}
              >
                {t('apply')}
              </Button>
            ) : (
              <IconButton
                size="small"
                onClick={() => {
                  setCouponCode('');
                }}
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  padding: '4px',
                }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            )}
          </Grid>
        </Grid>

        {isCouponApplied && !paymentSummaryError && (
          <Stack spacing={0.5} mt={0.5}>
            <Typography variant="caption" color="success.main">
              {t('coupon_applied_successfully')} {t('you_saved')} AED{' '}
              {summary?.discount_amount.toFixed(2)}!
            </Typography>
          </Stack>
        )}

        <Stack direction="row" justifyContent="space-between" alignItems="center" mt={1}>
          <Typography fontSize={14} fontWeight={700}>
            {t('total_payable')}
          </Typography>
          <Typography fontSize={14} fontWeight={700} color="primary">
            <span className="dirham-symbol">&#x00EA;</span>
            {summary?.total.toFixed(2)}
          </Typography>
        </Stack>
      </Stack>
    </Box>
  );
};

const SummaryRow = ({
  label,
  value,
  originalValue,
}: {
  label: string;
  value: React.ReactNode;
  originalValue?: React.ReactNode;
}) => (
  <Stack direction="row" justifyContent="space-between" alignItems="center">
    <Typography fontSize={13} color="text.secondary">
      {label}
    </Typography>
    <Box textAlign="right">
      {originalValue && (
        <Typography
          fontSize={13}
          fontWeight={600}
          sx={{
            textDecoration: 'line-through',
            color: 'error.main',
            mb: '2px',
            display: 'inline-block',
            px: 0.5,
            borderRadius: 1,
            backgroundColor: 'rgba(255, 0, 0, 0.05)',
          }}
        >
          {originalValue}
        </Typography>
      )}
      <Typography fontSize={13} fontWeight={600} color="text.primary">
        {value}
      </Typography>
    </Box>
  </Stack>
);
