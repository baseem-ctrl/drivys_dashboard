import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  CircularProgress,
  CardHeader,
  Grid,
  Container,
  Divider,
  Box,
} from '@mui/material';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import ReceiptIcon from '@mui/icons-material/Receipt';
import PercentIcon from '@mui/icons-material/Percent';
import EventIcon from '@mui/icons-material/Event';
import { useGetRefundById } from 'src/api/refund';
import { useParams } from 'react-router';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { useTranslation } from 'react-i18next';
import { paths } from 'src/routes/paths';

function SummaryItem({ icon, label, value, color = 'text.primary' }) {
  return (
    <Box display="flex" flexDirection="column" gap={0.5}>
      <Box display="flex" alignItems="center" gap={1}>
        {icon}
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
      </Box>
      <Typography variant="subtitle1" fontWeight={600} color={color}>
        {value}
      </Typography>
    </Box>
  );
}

export default function RefundDetailsDashboard() {
  const { id } = useParams();
  const { t } = useTranslation();

  const { refundDetails, refundError, refundLoading } = useGetRefundById(id);

  if (refundLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  if (refundError) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <Typography color="error" variant="h6">
          {t('refund_failed_to_load')}
        </Typography>
      </Box>
    );
  }

  if (!refundDetails) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <Typography variant="h6">{t('no_refund_details_available')}</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <CustomBreadcrumbs
        heading={t('refund')}
        links={[
          { name: t('dashboard'), href: paths.dashboard.root },
          { name: t('refund'), href: paths.dashboard.booking.refund },
          { name: t('list') },
        ]}
        sx={{ mb: 3 }}
      />

      <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
        {/* <CardHeader
          title={t('refund_summary')}
          sx={{
            textAlign: 'center',
            fontWeight: 'bold',
            bgcolor: 'primary.main',
            color: 'white',
            borderTopLeftRadius: 12,
            borderTopRightRadius: 12,
            padding: 2,
          }}
        /> */}
        <CardContent>
          <Grid container spacing={3}>
            {/* Key Amounts */}
            <Grid item xs={6}>
              <SummaryItem
                icon={<MonetizationOnIcon fontSize="small" color="success" />}
                label={t('total_paid_amount')}
                value={`₹${Number(refundDetails.total_paid_amount_by_student).toFixed(2)}`}
                color="success.main"
              />
            </Grid>
            <Grid item xs={6}>
              <SummaryItem
                icon={<MonetizationOnIcon fontSize="small" color="info" />}
                label={t('refundable_amount')}
                value={`₹${Number(refundDetails.refundable_amount).toFixed(2)}`}
                color="info.main"
              />
            </Grid>

            <Grid item xs={12}>
              <Divider />
            </Grid>

            {/* Fees */}
            <Grid item xs={6}>
              <SummaryItem
                icon={<ReceiptIcon fontSize="small" color="warning" />}
                label={t('cancellation_fee')}
                value={`₹${Number(refundDetails.cancellation_fee).toFixed(2)}`}
              />
            </Grid>
            <Grid item xs={6}>
              <SummaryItem
                icon={<ReceiptIcon fontSize="small" color="warning" />}
                label={t('cash_service_fee')}
                value={`₹${Number(refundDetails.cash_service_fee).toFixed(2)}`}
              />
            </Grid>
            <Grid item xs={6}>
              <SummaryItem
                icon={<PercentIcon fontSize="small" color="secondary" />}
                label={t('tax_amount')}
                value={`₹${Number(refundDetails.tax_amount).toFixed(2)}`}
              />
            </Grid>

            <Grid item xs={12}>
              <Divider />
            </Grid>

            {/* Commissions */}
            <Grid item xs={6}>
              <SummaryItem
                label={t('drivys_commission')}
                value={`₹${Number(refundDetails.drivys_commission).toFixed(2)}`}
              />
            </Grid>
            <Grid item xs={6}>
              <SummaryItem
                label={t('vendor_commission')}
                value={`₹${Number(refundDetails.vendor_commission).toFixed(2)}`}
              />
            </Grid>
            <Grid item xs={6}>
              <SummaryItem
                label={t('trainer_commission')}
                value={`₹${Number(refundDetails.trainer_commission).toFixed(2)}`}
              />
            </Grid>
            <Grid item xs={6}>
              <SummaryItem
                label={t('total_commissions')}
                value={`₹${Number(refundDetails.total_commissions).toFixed(2)}`}
                color="primary.main"
              />
            </Grid>

            <Grid item xs={12}>
              <Divider />
            </Grid>

            {/* Sessions */}
            <Grid item xs={4}>
              <SummaryItem
                icon={<EventIcon fontSize="small" color="info" />}
                label={t('number_of_sessions')}
                value={refundDetails.number_of_session}
              />
            </Grid>
            <Grid item xs={4}>
              <SummaryItem
                label={t('completed_sessions')}
                value={refundDetails.completed_session}
                color="success.main"
              />
            </Grid>
            <Grid item xs={4}>
              <SummaryItem
                label={t('cancelled_sessions')}
                value={refundDetails.cancelled_session}
                color="error.main"
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Container>
  );
}
