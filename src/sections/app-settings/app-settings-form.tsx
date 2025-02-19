import React, { useEffect, useState } from 'react';
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
} from '@mui/material';
import { useGetAllLanguage } from 'src/api/language';
import { enqueueSnackbar } from 'src/components/snackbar';
import { updateValue, useGetAllAppSettings } from 'src/api/app-settings';

interface FormField {
  id: number;
  key: string;
  value: any;
  locale: string | null;
}

const EditableForm: React.FC = () => {
  const { language } = useGetAllLanguage(0, 1000);
  const [selectedLocale, setSelectedLocale] = useState('En');
  const {
    appSettings: data,
    appSettingsLoading,
    totalpages,
    revalidateAppSettings,
    appSettingsError,
  } = useGetAllAppSettings(0, 1000, selectedLocale === 'En' ? null : selectedLocale);
  const [formData, setFormData] = useState(data);

  const localeOptions = (language || []).map((lang) => ({
    value: lang.language_culture,
    label: lang.name,
  }));
  console.log('data', data);
  const handleLocaleChange = (event: SelectChangeEvent<string>) => {
    setSelectedLocale(event.target.value);
  };

  const handleChange = (id: number, newValue: any) => {
    setFormData((prevData) =>
      prevData.map((item) => (item.id === id ? { ...item, value: newValue } : item))
    );
  };

  useEffect(() => {
    setFormData(data);
  }, [data]);

  const handleSave = async () => {
    console.log('Data saved:', formData);
    try {
      const editedField = formData.find((item) => {
        const original = data.find((d) => d.key === item.key);
        return original && String(original.value) !== String(item.value);
      });

      const body = editedField
        ? {
            id: editedField.id,
            key: editedField.key,
            value: editedField.value,
            locale: selectedLocale,
          }
        : null;

      console.log('Final Payload:', body);

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
      ...data.filter(
        (item) =>
          (typeof item.value === 'number' || typeof item.value === 'string') &&
          item.value.toString().length <= 20
      ),

      // Long strings (> 20 characters)
      ...data.filter((item) => typeof item.value === 'string' && item.value.toString().length > 20),

      // Boolean values
      ...data.filter((item) => typeof item.value === 'boolean'),
    ];
  }

  const renderInputField = (item: FormField) => {
    if (typeof item.value === 'boolean') {
      return (
        <FormControlLabel
          control={
            <Switch
              checked={item.value}
              onChange={(e) => handleChange(item.id, e.target.checked)}
              color="primary"
            />
          }
          label={item.key}
        />
      );
    } else if (typeof item.value === 'number' || typeof item.value === 'string') {
      if (item.value.toString().length > 20) {
        return (
          <TextField
            value={item.value}
            onChange={(e) => handleChange(item.id, e.target.value)}
            label={item.key}
            multiline
            rows={4}
            fullWidth
            variant="outlined"
            margin="normal"
          />
        );
      }
      return (
        <TextField
          value={item.value}
          onChange={(e) => handleChange(item.id, e.target.value)}
          label={item.key}
          fullWidth
          variant="outlined"
          margin="normal"
        />
      );
    }
    return null;
  };
  console.log('Selected Locale:', selectedLocale);
  console.log('Available Options:', localeOptions);

  // Separate fields based on type (single-line, multi-line, switch)
  const singleLineFields = sortedFormData.filter(
    (item) => typeof item.value === 'string' || typeof item.value === 'number'
  );
  const multiLineFields = sortedFormData.filter(
    (item) => typeof item.value === 'string' && item.value.toString().length > 20
  );
  const switchFields = sortedFormData.filter((item) => typeof item.value === 'boolean');

  return (
    <Container maxWidth="xl">
      <Paper sx={{ padding: 3, borderRadius: 2, boxShadow: 3 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 3,
          }}
        >
          <Typography variant="h5" component="h1" color="primary">
            App Settings
          </Typography>
          <FormControl sx={{ minWidth: 250, mb: 4 }}>
            <InputLabel>Language</InputLabel>
            <Select value={selectedLocale} onChange={handleLocaleChange}>
              {localeOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        <form>
          {/* Render single-line fields */}
          <Grid container spacing={2}>
            {singleLineFields.map((item, index) => (
              <Grid item xs={6} key={item.id}>
                <Box sx={{ marginBottom: 2 }}>{renderInputField(item)}</Box>
              </Grid>
            ))}
          </Grid>

          {/* Render multi-line fields */}
          <Grid container spacing={2}>
            {multiLineFields.map((item, index) => (
              <Grid item xs={6} key={item.id}>
                <Box sx={{ marginBottom: 2 }}>{renderInputField(item)}</Box>
              </Grid>
            ))}
          </Grid>

          {/* Render switch fields */}
          <Grid container spacing={2}>
            {switchFields.map((item, index) => (
              <Grid item xs={6} key={item.id}>
                <Box sx={{ marginBottom: 2 }}>{renderInputField(item)} </Box>
              </Grid>
            ))}
          </Grid>

          {/* Save button */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginTop: 2 }}>
            <Button
              variant="outlined"
              color="primary"
              onClick={handleSave}
              sx={{
                padding: '10px 20px',
                fontSize: '16px',
                borderRadius: 2,
                boxShadow: 2,
              }}
            >
              Save
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default EditableForm;
