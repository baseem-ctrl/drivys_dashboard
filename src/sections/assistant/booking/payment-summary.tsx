import { Box, Typography, Stack, Divider } from '@mui/material';
import { useTranslation } from 'react-i18next';

export const PaymentSummaryBox = ({ summary }: { summary: any }) => {
  const { t } = useTranslation();

  if (!summary) return null;

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
        <SummaryRow label={t('package_price_after_discount')} value={`₹${summary.package_price}`} />
        <SummaryRow label={t('transport_fee_after_discount')} value={`₹${summary.transport_fee}`} />
        <SummaryRow label={t('tax_amount')} value={`₹${summary.tax_amount}`} />

        <SummaryRow
          label={t('coupon_code')}
          value={
            summary.coupon_code ? (
              <Typography fontSize={13} fontWeight={600} color="success.main">
                #{summary.coupon_code}
              </Typography>
            ) : (
              <Typography fontSize={13} color="text.secondary">
                —
              </Typography>
            )
          }
        />
        <Divider />

        <SummaryRow label={t('booking_method')} value={summary.booking_method} />
        <SummaryRow label={t('payment_method')} value={summary.payment_method} />

        <Divider sx={{ my: 1 }} />

        <Stack direction="row" justifyContent="space-between" alignItems="center" mt={1}>
          <Typography fontSize={14} fontWeight={700}>
            {t('total_payable')}
          </Typography>
          <Typography fontSize={14} fontWeight={700} color="primary">
            ₹{summary.total}
          </Typography>
        </Stack>
      </Stack>
    </Box>
  );
};

const SummaryRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <Stack direction="row" justifyContent="space-between">
    <Typography fontSize={13} color="text.secondary">
      {label}
    </Typography>
    <Typography fontSize={13} fontWeight={500}>
      {value}
    </Typography>
  </Stack>
);
