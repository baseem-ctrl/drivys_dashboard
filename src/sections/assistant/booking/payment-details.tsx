import React, { useEffect, useState } from 'react';
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
  paymentMode: any;
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
  paymentMode,
}) => {
  const { t } = useTranslation();
  const [paymentDone, setPaymentDone] = useState(false);
  const [couponCode, setCouponCode] = useState(false);
  const [cachedSummary, setCachedSummary] = useState<any>(null);

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
    coupon_code: couponCode,
    mode_of_payment: paymentMode,
  });

  const errorMessage = paymentSummaryError?.message?.errors?.coupon_code?.coupon_code[0] || '';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPaymentProof(e.target.files[0]);
    }
  };
  useEffect(() => {
    if (paymentSummary && !paymentSummaryError) {
      setCachedSummary(paymentSummary);
    }
  }, [paymentSummary, paymentSummaryError]);

  return (
    <PaymentSummaryBox
      summary={cachedSummary}
      setCouponCode={setCouponCode}
      couponCode={couponCode}
      errorMessage={errorMessage}
      paymentSummaryError={paymentSummaryError}
      paymentSummaryLoading={paymentSummaryLoading}
    />
  );
};

export default TrainerPaymentDetails;
