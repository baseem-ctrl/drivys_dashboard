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
import EditIcon from '@mui/icons-material/Edit';
import { useTranslation } from 'react-i18next';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { useSnackbar } from 'notistack';

// Type Definitions
interface PaymentSummary {
  package_price: number;
  package_price_before_discount?: number;
  transport_fee: number;
  transport_fee_before_discount?: number;
  tax_amount: number;
  cash_service_charge: number;
  booking_method: string;
  payment_method: string;
  coupon_code?: string;
  discount_amount: number;
  total: number;
}

interface PaymentError {
  message: {
    errors: {
      coupon_code?: string[];
    };
  };
}

interface PaymentSummaryBoxProps {
  summary: PaymentSummary;
  couponCode: string | null;
  setCouponCode: (code: string | null) => void;
  errorMessage: string;
  paymentSummaryError: PaymentError | null;
  paymentSummaryLoading: boolean;
  setActiveStep: (step: number) => void;
}

interface SummaryRowProps {
  label: string;
  value: React.ReactNode;
  originalValue?: React.ReactNode;
}

// Constants
const CURRENCY_SYMBOL = '\u00EA'; // Dirham symbol
const STYLES = {
  container: {
    border: '1px solid #e5e7eb',
    borderRadius: '16px',
    p: 3,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    border: '1px solid #e5e7eb',
    borderRadius: '16px',
    p: 5,
    backgroundColor: '#fff',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
  strikethrough: {
    textDecoration: 'line-through',
    color: 'error.main',
    mb: '2px',
    display: 'inline-block',
    px: 0.5,
    borderRadius: 1,
    backgroundColor: 'rgba(255, 0, 0, 0.05)',
  },
  editButton: {
    border: '1px solid',
    borderColor: 'divider',
    borderRadius: 1,
    padding: '4px',
  },
} as const;

// Utility Functions
const formatCurrency = (amount: number): React.ReactNode => (
  <>
    <span className="dirham-symbol">{CURRENCY_SYMBOL}</span>
    {amount.toFixed(2)}
  </>
);

// Sub-components
const SummaryRow: React.FC<SummaryRowProps> = ({ label, value, originalValue }) => (
  <Stack direction="row" justifyContent="space-between" alignItems="center">
    <Typography fontSize={13} color="text.secondary">
      {label}
    </Typography>
    <Box textAlign="right">
      {originalValue && (
        <Typography fontSize={13} fontWeight={600} sx={STYLES.strikethrough}>
          {originalValue}
        </Typography>
      )}
      <Typography fontSize={13} fontWeight={600} color="text.primary">
        {value}
      </Typography>
    </Box>
  </Stack>
);

const LoadingState: React.FC = () => (
  <Box sx={STYLES.loadingContainer}>
    <CircularProgress />
  </Box>
);

// Main Component
export const PaymentSummaryBox: React.FC<PaymentSummaryBoxProps> = ({
  summary,
  couponCode,
  setCouponCode,
  errorMessage,
  paymentSummaryError,
  paymentSummaryLoading,
  setActiveStep,
}) => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();

  // State
  const [couponInput, setCouponInput] = useState<string>(summary?.coupon_code || '');
  const [localError, setLocalError] = useState<string>('');

  // Computed Values
  const isCouponApplied = useMemo(
    () => !!couponCode && couponCode?.toLowerCase?.() === couponInput?.trim()?.toLowerCase?.(),
    [couponCode, couponInput]
  );

  const hasDiscount = useCallback(
    (original?: number, current?: number) => original && original !== current,
    []
  );

  // Event Handlers
  const handleCouponInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setCouponInput(e.target.value);
      setLocalError('');
    },
    []
  );

  const handleApplyCoupon = useCallback(() => {
    const trimmedCoupon = couponInput.trim();
    if (!trimmedCoupon) {
      setLocalError(t('please_enter_coupon_code'));
      return;
    }
    setCouponCode(trimmedCoupon);
  }, [couponInput, t, setCouponCode]);

  const handleEditCoupon = useCallback(() => {
    setCouponCode('');
  }, [setCouponCode]);

  // Effects
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

      enqueueSnackbar(errorMessage, { variant: 'error' });
      setCouponInput('');
      setCouponCode(null);
    }
  }, [paymentSummaryError, setActiveStep, enqueueSnackbar, setCouponCode]);

  // Debug logging (consider removing in production)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('paymentSummaryError', paymentSummaryError);
    }
  }, [paymentSummaryError]);

  // Conditional Rendering
  if (paymentSummaryLoading) {
    return <LoadingState />;
  }

  // Render Methods
  const renderCouponSection = () => (
    <Grid container spacing={1} alignItems="center">
      <Grid item xs>
        <TextField
          fullWidth
          size="small"
          value={couponInput}
          onChange={handleCouponInputChange}
          placeholder={t('enter_coupon_code')}
          error={Boolean(localError)}
          helperText={localError}
          disabled={isCouponApplied}
          inputProps={{ 'aria-label': t('enter_coupon_code') }}
        />
      </Grid>
      <Grid item>
        {!isCouponApplied ? (
          <Button
            onClick={handleApplyCoupon}
            size="small"
            variant="contained"
            color="primary"
            sx={{ minWidth: 80, textTransform: 'none' }}
            aria-label={t('apply_coupon')}
          >
            {t('apply')}
          </Button>
        ) : (
          <IconButton
            size="small"
            onClick={handleEditCoupon}
            sx={STYLES.editButton}
            aria-label={t('edit_coupon')}
          >
            <EditIcon fontSize="small" />
          </IconButton>
        )}
      </Grid>
    </Grid>
  );

  const renderCouponSuccess = () =>
    isCouponApplied && !paymentSummaryError && (
      <Stack spacing={0.5} mt={0.5}>
        <Typography variant="caption" color="success.main">
          {t('coupon_applied_successfully')} {t('you_saved')} AED{' '}
          {summary?.discount_amount.toFixed(2)}!
        </Typography>
      </Stack>
    );

  return (
    <Box sx={STYLES.container}>
      <Typography variant="subtitle1" fontWeight={700} mb={2}>
        {t('payment_summary')}
      </Typography>

      <Divider sx={{ mb: 2 }} />

      <Stack spacing={1.5}>
        <SummaryRow
          label={t('package_price_after_discount')}
          value={formatCurrency(summary?.package_price || 0)}
          originalValue={
            hasDiscount(summary?.package_price_before_discount, summary?.package_price)
              ? formatCurrency(summary?.package_price_before_discount!)
              : undefined
          }
        />

        <SummaryRow
          label={t('transport_fee_after_discount')}
          value={formatCurrency(summary?.transport_fee || 0)}
          originalValue={
            hasDiscount(summary?.transport_fee_before_discount, summary?.transport_fee)
              ? formatCurrency(summary?.transport_fee_before_discount!)
              : undefined
          }
        />

        <SummaryRow
          label={t('tax_amount')}
          value={formatCurrency(summary?.tax_amount || 0)}
        />

        <SummaryRow
          label={t('cash_service_fee')}
          value={formatCurrency(summary?.cash_service_charge || 0)}
        />

        <Divider />

        <SummaryRow label={t('booking_method')} value={summary?.booking_method} />
        <SummaryRow label={t('payment_method')} value={summary?.payment_method} />

        <Divider sx={{ my: 1 }} />

        {renderCouponSection()}
        {renderCouponSuccess()}

        <Stack direction="row" justifyContent="space-between" alignItems="center" mt={1}>
          <Typography fontSize={14} fontWeight={700}>
            {t('total_payable')}
          </Typography>
          <Typography fontSize={14} fontWeight={700} color="primary">
            {formatCurrency(summary?.total || 0)}
          </Typography>
        </Stack>
      </Stack>
    </Box>
  );
};

// Display name for debugging
PaymentSummaryBox.displayName = 'PaymentSummaryBox';
SummaryRow.displayName = 'SummaryRow';
