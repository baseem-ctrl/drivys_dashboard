import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Stack,
  Button,
  InputLabel,
  FormControlLabel,
  Checkbox,
  FormControl,
  FormLabel,
  RadioGroup,
  Radio,
} from '@mui/material';

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
  const [paymentDone, setPaymentDone] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPaymentProof(e.target.files[0]);
    }
  };

  return (
    <Box mt={5} p={3} border="1px solid #e0e0e0" borderRadius={2} bgcolor="#fafafa">
      <Typography variant="h6" fontWeight={700} mb={3}>
        Trainer Payment Details
      </Typography>

      <FormControl component="fieldset" fullWidth sx={{ mb: 3 }}>
        <FormLabel sx={{ fontWeight: 600, mb: 1 }}>Payment Status</FormLabel>
        <RadioGroup
          row
          value={paymentDone ? 'done' : 'not_done'}
          onChange={(e) => setPaymentDone(e.target.value === 'done')}
        >
          <FormControlLabel
            value="not_done"
            control={<Radio color="primary" />}
            label="Payment Not Done"
          />
          <FormControlLabel value="done" control={<Radio color="primary" />} label="Payment Done" />
        </RadioGroup>
      </FormControl>

      {paymentDone && (
        <Stack spacing={3}>
          {/* Transaction ID */}
          <TextField
            label="Transaction ID"
            value={txnId}
            onChange={(e) => setTxnId(e.target.value)}
            fullWidth
            size="small"
            variant="outlined"
          />

          {/* Remarks */}
          <TextField
            label="Remarks"
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
              Upload Payment Proof
            </Typography>
            <Button
              variant="contained"
              component="label"
              fullWidth
              sx={{ textTransform: 'none', fontWeight: 500 }}
            >
              {paymentProof ? paymentProof.name : 'Select File (PDF, JPG, PNG)'}
              <input type="file" hidden accept=".jpg,.jpeg,.png,.pdf" onChange={handleFileChange} />
            </Button>
            {paymentProof && (
              <Typography variant="caption" color="text.secondary" mt={1}>
                Selected file: {paymentProof.name}
              </Typography>
            )}
          </Box>
        </Stack>
      )}
    </Box>
  );
};

export default TrainerPaymentDetails;
