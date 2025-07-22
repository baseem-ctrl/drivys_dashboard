import React from 'react';
import {
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Typography,
  useTheme,
  Paper,
} from '@mui/material';
import { useTranslation } from 'react-i18next';

type PaymentMode = 'CASH' | 'ONLINE';

interface PaymentModeSelectorProps {
  value: PaymentMode | null;
  setPaymentMode: (mode: PaymentMode) => void;
}

const PaymentModeSelector: React.FC<PaymentModeSelectorProps> = ({ value, setPaymentMode }) => {
  const { t } = useTranslation();
  const theme = useTheme();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPaymentMode(event.target.value as PaymentMode);
  };

  return (
    <Paper
      elevation={1}
      sx={{
        p: 3,
        mt: 4,
        borderRadius: 2,
        backgroundColor: theme.palette.background.default,
        // maxWidth: 400,
      }}
    >
      <FormControl component="fieldset" fullWidth>
        <Typography variant="subtitle1" fontWeight={600} color="text.primary" gutterBottom>
          {t('mode_of_payment')}
        </Typography>
        <RadioGroup row value={value ?? ''} onChange={handleChange} name="payment-mode">
          <FormControlLabel value="ONLINE" control={<Radio />} label={t('online')} />
          <FormControlLabel value="CASH" control={<Radio />} label={t('cash')} />
        </RadioGroup>
      </FormControl>
    </Paper>
  );
};

export default PaymentModeSelector;
