import React, { useEffect, useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';

import {
  TextField,
  Switch,
  FormControlLabel,
  Button,
  Box,
  Typography,
  Container,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  CircularProgress,
  IconButton,
  InputAdornment,
  Autocomplete,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import Tooltip from '@mui/material/Tooltip';
import { useGetAllLanguage } from 'src/api/language';
import { enqueueSnackbar } from 'src/components/snackbar';
import { updateValue, useGetAllAppSettings } from 'src/api/app-settings';
import { useGetSchool } from 'src/api/school';

import PrivacyPolicy from './privacy-policy';
import { useTranslation } from 'react-i18next';

interface FormField {
  id: number;
  key: string;
  value: any;
  locale: string | null;
}

const EditableForm: React.FC = () => {
  const { t } = useTranslation();
  const { language } = useGetAllLanguage(0, 1000);
  const [selectedLocale, setSelectedLocale] = useState('En');
  const methods = useForm();
  const [editedFields, setEditedFields] = useState<Record<number, boolean>>({});
  const fieldTooltips: Record<string, string> = {
    DEFAULT_MAX_CASH_IN_HAND_ALLOWED: t(
      'The maximum amount of cash a trainer is allowed to hold for transactions.'
    ),
    REWARD_FEE: t('The commission deducted from the reward given to the trainer by the student.'),
    TAX_RATE: t('The percentage of tax applied to the booking amount.'),
    CANCELLATION_FEE: t('The fee charged when a student cancels a booking.'),
    MINIMUM_KM: t(
      'The minimum distance covered that determines the base price for the pickup option.'
    ),
    SLOT_DURATION: t('The duration of each booking slot.'),
    CASH_FEE: t('Additional fee applied when the payment method is cash.'),
    FREE_PICKUP_FEE_FOR_CHANGING_TRAINER:
      'If a student changes trainers within the same school, the first few kilometers are free.\n\nExample:\nSetting = 2 KM\nOld distance = 100 KM\nNew distance = 105 KM\nStudent pays only for 3 KM.',
  };
  const {
    appSettings: data,
    appSettingsLoading,
    totalpages,
    revalidateAppSettings,
    appSettingsError,
  } = useGetAllAppSettings(0, 1000);
  const { schoolList, schoolLoading } = useGetSchool({
    limit: 1000,
  });
  const localeOptions = (language || []).map((lang) => ({
    value: lang.language_culture,
    label: lang.name,
  }));
  const handleLocaleChange = (event: SelectChangeEvent<string>) => {
    setSelectedLocale(event.target.value);
  };

  const [formData, setFormData] = useState<FormField[]>([]);
  // Instead of just item.value, derive the locale-based value like:

  useEffect(() => {
    if (data && Array.isArray(data)) {
      setFormData([...data]);
    }
  }, [data]);

  const handleChange = (id: number, newValue: any) => {
    setFormData((prevData) =>
      prevData.map((item) => (item.id === id ? { ...item, value: newValue } : item))
    );
    setEditedFields((prev) => ({ ...prev, [id]: true }));
  };
  const handleCancelEdit = (id) => {
    setEditedFields((prev) => ({ ...prev, [id]: false }));
    setFormData([...data]);
  };
  const [updatedItem, setUpdatedItem] = useState<{ id: number; value: boolean } | null>(null);

  const handleToggle = (id: number, newValue: boolean) => {
    handleChange(id, newValue); // First update state
    setUpdatedItem({ id, value: newValue }); // Store the latest change
  };

  // Trigger `handleSave` after state update
  useEffect(() => {
    if (updatedItem) {
      handleSave(updatedItem.id);
      setUpdatedItem(null); // Reset after saving
    }
  }, [updatedItem]); // Runs when `updatedItem` changes

  const handleSave = async (id: number) => {
    try {
      const editedField = formData.find((item) => item.id === id);
      if (!editedField) return;

      const body = {
        id: editedField.id,
        key: editedField.key,
        value: editedField.value.toString(),
        locale: selectedLocale,
      };

      const updatedData = formData.map((item) => ({
        key: item.key,
        value: item.value,
        id: item.id,
      }));
      const response = await updateValue(body);
      if (response) {
        enqueueSnackbar(response.message, {
          variant: 'success',
        });
        revalidateAppSettings();
        setEditedFields((prev) => ({ ...prev, [id]: false }));
      }
    } catch (error) {
      if (error?.errors && typeof error?.errors === 'object' && !Array.isArray(error?.errors)) {
        Object.values(error?.errors).forEach((errorMessage: any) => {
          enqueueSnackbar(errorMessage[0], { variant: 'error' });
        });
      } else {
        enqueueSnackbar(error.message, { variant: 'error' });
      }
    } finally {
      revalidateAppSettings();
    }
  };
  let sortedFormData = [];
  if (!appSettingsLoading) {
    sortedFormData = [
      // Numbers and short strings (≤ 20 characters)
      ...formData.filter(
        (item) =>
          (typeof item.value === 'number' || typeof item.value === 'string') &&
          item.value.toString().length <= 20
      ),

      // Long strings (> 20 characters)
      ...formData.filter(
        (item) => typeof item.value === 'string' && item.value.toString().length > 20
      ),

      // Boolean values
      ...formData.filter((item) => typeof item.value === 'boolean'),
    ];
  }

  const renderInputField = (item: FormField) => {
    if (item.key === 'PRIVACY POLICY') {
      return (
        <Box width="100%" display="flex" flexDirection="column">
          <Typography variant="body1" color="primary" gutterBottom>
            {t('Privacy policy')}
          </Typography>
          <PrivacyPolicy
            item={item}
            selectedLocale={selectedLocale}
            formData={formData}
            revalidateAppSettings={revalidateAppSettings}
            setEditedFields={setEditedFields}
          />
        </Box>
      );
    }
    if (item.key === 'DEFAULT_SCHOOL') {
      const selectedSchool = schoolList.find((school) => school.id === item.value);
      return (
        <Grid alignItems="center" spacing={2} sx={{ ml: 2 }}>
          {/* <Grid item xs={6}> */}
          {/* <Typography variant="body1" sx={{ mt: 2, mb: 2 }} fontWeight="500" color="gray">
            {item.key
              .replace(/_/g, ' ')
              .toLowerCase()
              .replace(/\b\w/g, (char) => char.toUpperCase())}
          </Typography> */}
          {/* </Grid> */}

          <Grid item xs={11}>
            <Autocomplete
              fullWidth
              options={
                schoolList?.map((school) => ({
                  label: school.vendor_translations
                    .slice(0, 2)
                    .map((translation) => translation.name)
                    .join(' - '),
                  value: school.id,
                })) ?? []
              }
              getOptionLabel={(option) => option.label}
              value={
                selectedSchool
                  ? {
                      label: selectedSchool.vendor_translations
                        .slice(0, 2)
                        .map((translation) => translation.name)
                        .join(' - '),
                      value: selectedSchool.id,
                    }
                  : null
              }
              onChange={(event, newValue) => handleChange(item.id, newValue?.value || '')}
              loading={schoolLoading}
              renderInput={(params) => (
                <TextField {...params} label="Default School" placeholder={t('Select School')} />
              )}
              renderOption={(props, option) => (
                <li {...props} key={option.value}>
                  {option.label}
                </li>
              )}
            />
          </Grid>
          <Grid item xs={11}>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              sx={{
                mt: 2,
                textTransform: 'none',
                fontSize: '16px',
                fontWeight: 'bold',
                borderRadius: '8px',
                height: '43px',
              }}
              onClick={() => handleSave(item.id)}
            >
              Save
            </Button>
          </Grid>
        </Grid>
      );
    }
    if (typeof item.value === 'boolean') {
      return (
        <Grid container alignItems="center" spacing={2} sx={{ ml: 2 }}>
          <Grid item xs={6}>
            <Typography variant="body1">
              {item.key
                .replace(/_/g, ' ')
                .toLowerCase()
                .replace(/\b\w/g, (char) => char.toUpperCase())}
            </Typography>
          </Grid>

          <Grid item xs={5}>
            <Switch
              checked={item.value}
              onChange={(e) => handleToggle(item.id, e.target.checked)}
              color="primary"
            />
          </Grid>
        </Grid>
      );
    }
    if (typeof item.value === 'number' || typeof item.value === 'string') {
      const tooltipText = fieldTooltips[item.key] || '';

      return (
        <Box display="flex" flexDirection="column" p={4} width="100%">
          {/* <Typography variant="h6" fontWeight="bold" mb={2}>
            {item.key
              .replace(/_/g, ' ')
              .toLowerCase()
              .replace(/^./, (char) => char.toUpperCase())}
          </Typography> */}

          <Box display="flex" alignItems="center">
            <Typography variant="body2" fontWeight="500" color="gray" mb={1}>
              {item.key
                .replace(/_/g, ' ')
                .toLowerCase()
                .replace(/^./, (char) => char.toUpperCase())}
            </Typography>
            {tooltipText && (
              <Tooltip title={tooltipText} arrow>
                <IconButton size="small" sx={{ ml: 1, mb: '10px' }}>
                  <InfoOutlinedIcon fontSize="medium" />
                </IconButton>
              </Tooltip>
            )}
          </Box>

          <TextField
            value={item.value}
            onChange={(e) => handleChange(item.id, e.target.value)}
            // label={t(item.key.replace(/_/g, ' '))}
            fullWidth
            variant="outlined"
            sx={{
              backgroundColor: '#F8F8F8',
              borderRadius: '8px',
              '& fieldset': { border: '1px solid #E0E0E0' },
            }}
          />

          <Button
            fullWidth
            variant="contained"
            color="primary"
            sx={{
              mt: 2,
              textTransform: 'none',
              fontSize: '17px',
              fontWeight: 'bold',
              borderRadius: '8px',
              height: '43px',
            }}
            onClick={() => handleSave(item.id)}
          >
            {t('Save')}
          </Button>
        </Box>
      );
    }
    return null;
  };

  return (
    <Container maxWidth="xl">
      <Paper sx={{ padding: 3, borderRadius: 2, boxShadow: 3 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: 3,
          }}
        >
          <Typography variant="h5" component="h1" color="primary">
            {t('App Settings')}
          </Typography>
        </Box>
        {appSettingsLoading ? (
          <Box
            sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}
          >
            <CircularProgress />
          </Box>
        ) : (
          <FormProvider {...methods}>
            <form>
              <Box>
                {formData &&
                  formData.map((item) => (
                    <Grid
                      item
                      xs={item.key === 'PRIVACY POLICY' || item.value === 'boolean' ? 12 : 7}
                      key={item.id}
                      sx={{ display: 'flex', justifyContent: 'flexstart' }}
                    >
                      <Box
                        sx={{
                          width: item.key === 'PRIVACY POLICY' ? '100%' : '65%',
                          marginBottom: 2,
                        }}
                      >
                        {renderInputField(item)}
                      </Box>
                    </Grid>
                  ))}
              </Box>
            </form>
          </FormProvider>
        )}
      </Paper>
    </Container>
  );
};

export default EditableForm;
