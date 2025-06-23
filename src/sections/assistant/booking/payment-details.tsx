import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Stack,
  Button,
  FormControlLabel,
  FormControl,
  FormLabel,
  RadioGroup,
  Radio,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useGetPaymentSummary } from 'src/api/booking-assistant';
import { PaymentSummaryBox } from './payment-summary';

interface TrainerPaymentDetailsProps {
  paymentProof: File | null;
  setPaymentProof: (file: File | null) => void;
  remarks: string;
  setRemarks: (val: string) => void;
  txnId: string;
  setTxnId: (val: string) => void;
  trainerId: any;
  studentId: any;
  packageId: any;
}

const TrainerPaymentDetails: React.FC<TrainerPaymentDetailsProps> = ({
  paymentProof,
  setPaymentProof,
  remarks,
  setRemarks,
  txnId,
  setTxnId,
  trainerId,
  studentId,
  packageId,
}) => {
  const { t } = useTranslation();
  const [paymentDone, setPaymentDone] = useState(false);

  const {
    paymentSummary,
    paymentSummaryLoading,
    paymentSummaryError,
    paymentSummaryValidating,
    revalidatePaymentSummary,
  } = useGetPaymentSummary({
    trainer_id: trainerId,
    student_id: studentId,
    package_id: packageId,
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPaymentProof(e.target.files[0]);
    }
  };

  return (
    <>
      <PaymentSummaryBox summary={paymentSummary} />

      <Box mt={5} p={3} border="1px solid #e0e0e0" borderRadius={2} bgcolor="#fafafa">
        <Typography variant="h6" fontWeight={700} mb={3}>
          {t('trainer_payment_details')}
        </Typography>

        <FormControl component="fieldset" fullWidth sx={{ mb: 3 }}>
          <FormLabel sx={{ fontWeight: 600, mb: 1 }}>{t('payment_status')}</FormLabel>
          <RadioGroup
            row
            value={paymentDone ? 'done' : 'not_done'}
            onChange={(e) => setPaymentDone(e.target.value === 'done')}
          >
            <FormControlLabel
              value="not_done"
              control={<Radio color="primary" />}
              label={t('payment_not_done')}
            />
            <FormControlLabel
              value="done"
              control={<Radio color="primary" />}
              label={t('payment_done')}
            />
          </RadioGroup>
        </FormControl>

        {paymentDone && (
          <Stack spacing={3}>
            {/* Transaction ID */}
            <TextField
              label={t('transaction_id')}
              value={txnId}
              onChange={(e) => setTxnId(e.target.value)}
              fullWidth
              size="small"
              variant="outlined"
            />

            {/* Remarks */}
            <TextField
              label={t('remarks')}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              fullWidth
              multiline
              minRows={3}
              variant="outlined"
            />

            {/* Upload Payment Proof */}
            <Box>
              <Typography fontWeight={600} mb={1}>
                {t('upload_payment_proof')}
              </Typography>
              <Button
                variant="contained"
                component="label"
                fullWidth
                sx={{ textTransform: 'none', fontWeight: 500 }}
              >
                {paymentProof
                  ? paymentProof.name
                  : t('select_file', { defaultValue: t('select_file') })}
                <input
                  type="file"
                  hidden
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={handleFileChange}
                />
              </Button>
              {paymentProof && (
                <Typography variant="caption" color="text.secondary" mt={1}>
                  {t('selected_file')}: {paymentProof.name}
                </Typography>
              )}
            </Box>
          </Stack>
        )}
      </Box>
    </>
  );
};

export default TrainerPaymentDetails;
