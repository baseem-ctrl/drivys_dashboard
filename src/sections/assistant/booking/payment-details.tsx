import React from 'react';
import { Box, Typography, TextField, Stack, Button, InputLabel } from '@mui/material';

interface TrainerPaymentDetailsProps {
  paymentProof: File | null;
  setPaymentProof: (file: File | null) => void;
  remarks: string;
  setRemarks: (val: string) => void;
  txnId: string;
  setTxnId: (val: string) => void;
}

const TrainerPaymentDetails: React.FC<TrainerPaymentDetailsProps> = ({
  paymentProof,
  setPaymentProof,
  remarks,
  setRemarks,
  txnId,
  setTxnId,
}) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPaymentProof(e.target.files[0]);
    }
  };

  return (
    <Box mt={4}>
      <Typography fontWeight={600} fontSize={18} mb={2}>
        Trainer Payment Details
      </Typography>

      <Stack spacing={3}>
        {/* Transaction ID */}
        <TextField
          label="Transaction ID"
          value={txnId}
          onChange={(e) => setTxnId(e.target.value)}
          fullWidth
          size="small"
        />

        {/* Remarks */}
        <TextField
          label="Remarks"
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          fullWidth
          multiline
          minRows={3}
        />

        {/* Payment Proof Upload */}
        <Box>
          <InputLabel sx={{ mb: 1, fontWeight: 500 }}>Upload Payment Proof</InputLabel>
          <Button variant="outlined" component="label" fullWidth>
            {paymentProof ? paymentProof.name : 'Choose File'}
            <input type="file" hidden accept=".jpg,.png,.pdf" onChange={handleFileChange} />
          </Button>
        </Box>
      </Stack>
    </Box>
  );
};

export default TrainerPaymentDetails;
