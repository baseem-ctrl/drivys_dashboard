import { useState } from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  IconButton,
  TextField,
  Chip,
  Grid,
  Stack,
  Box,
  Typography,
  Button,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import Scrollbar from 'src/components/scrollbar';
import { enqueueSnackbar } from 'src/components/snackbar';
import { updateUser } from 'src/api/users';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import { useAuthContext } from 'src/auth/hooks';

const BankDetailsCard = ({ details, t, reload }) => {
  const { user } = useAuthContext();
  const hasBankDetails = details?.bank_detail?.length > 0;
  const [isEditing, setIsEditing] = useState(false);

  const [formValues, setFormValues] = useState({
    account_holder_name: details?.bank_detail?.[0]?.account_holder_name || '',
    account_number: details?.bank_detail?.[0]?.account_number || '',
    bank_name: details?.bank_detail?.[0]?.bank_name || '',
    iban_number: details?.bank_detail?.[0]?.iban_number || '',
  });

  const handleChange = (field, value) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      const body = {
        user_id: details?.id,
        account_holder_name: formValues.account_holder_name,
        account_number: formValues.account_number,
        bank_name: formValues.bank_name,
        iban_number: formValues.iban_number,
      };

      const response = await updateUser(body);
      if (response.status === 'error') {
        throw response;
      }
      if (response) {
        enqueueSnackbar(response.message);
        reload();
        setIsEditing(false);
      }
    } catch (error) {
      if (typeof error?.errors === 'object') {
        Object.values(error.errors).forEach((msg) => {
          enqueueSnackbar(msg[0] || msg, { variant: 'error' });
        });
      } else if (error?.message) {
        enqueueSnackbar(error.message, { variant: 'error' });
      } else {
        enqueueSnackbar('An unknown error occurred', { variant: 'error' });
      }
    }
  };

  return hasBankDetails || isEditing ? (
    <Grid item xs={12}>
      <Card>
        {user?.user?.user_type === 'ADMIN' && (
          <CardHeader
            title={t('bank_details')}
            titleTypographyProps={{ fontWeight: 600, color: 'primary', fontSize: '18px' }}
            action={
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  cursor: 'pointer',
                  color: 'primary.main',
                }}
                onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
              >
                {isEditing ? <SaveIcon /> : <EditIcon />}
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {isEditing ? t('save') : t('edit')}
                </Typography>
              </Box>
            }
          />
        )}

        <CardContent>
          <Scrollbar>
            <Stack
              spacing={1}
              alignItems="flex-start"
              sx={{ typography: 'body2', pb: 1, padding: 2 }}
            >
              {isEditing ? (
                <>
                  <TextField
                    fullWidth
                    label={t('account_holder_name')}
                    value={formValues.account_holder_name}
                    onChange={(e) => handleChange('account_holder_name', e.target.value)}
                  />
                  <TextField
                    fullWidth
                    label={t('account_number')}
                    value={formValues.account_number}
                    onChange={(e) => handleChange('account_number', e.target.value)}
                  />
                  <TextField
                    fullWidth
                    label={t('bank_name')}
                    value={formValues.bank_name}
                    onChange={(e) => handleChange('bank_name', e.target.value)}
                  />
                  <TextField
                    fullWidth
                    label={t('iban')}
                    value={formValues.iban_number}
                    onChange={(e) => handleChange('iban_number', e.target.value)}
                  />
                </>
              ) : (
                <>
                  {[
                    {
                      label: t('account_holder_name'),
                      value: formValues.account_holder_name || t('n/a'),
                    },
                    { label: t('account_number'), value: formValues.account_number || t('n/a') },
                    { label: t('bank_name'), value: formValues.bank_name || t('n/a') },
                    { label: t('iban'), value: formValues.iban_number || t('n/a') },
                    {
                      label: t('active'),
                      value: (
                        <Chip
                          label={formValues.is_active ? t('yes') : t('no')}
                          color={formValues.is_active ? 'success' : 'error'}
                          variant="soft"
                        />
                      ),
                    },
                  ].map((item, index) => (
                    <Box key={index} sx={{ display: 'flex', width: '100%' }}>
                      <Box sx={{ minWidth: '200px', fontWeight: 'bold', mt: '10px' }}>
                        {item.label}
                      </Box>
                      <Box sx={{ minWidth: '30px', fontWeight: 'bold', mt: '10px' }}>:</Box>
                      <Box sx={{ flex: 1, mt: '10px' }}>{item.value}</Box>
                    </Box>
                  ))}
                </>
              )}
            </Stack>
          </Scrollbar>
        </CardContent>
      </Card>
    </Grid>
  ) : (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      p={4}
      border="1px dashed #ccc"
      borderRadius={2}
      bgcolor="#fafafa"
    >
      <AccountBalanceIcon sx={{ fontSize: 30, mb: 1 }} />
      <Typography variant="h6" color="primary" gutterBottom>
        {t('no_bank_details_found')}
      </Typography>
      {user?.user?.user_type === 'ADMIN' && (
        <Button
          variant="contained"
          color="inherit"
          startIcon={<AddIcon />}
          onClick={() => {
            setFormValues({
              account_holder_name: '',
              account_number: '',
              bank_name: '',
              iban_number: '',
            });
            setIsEditing(true);
          }}
        >
          {t('add_bank_details')}
        </Button>
      )}
    </Box>
  );
};

export default BankDetailsCard;
