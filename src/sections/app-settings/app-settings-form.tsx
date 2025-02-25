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
  CircularProgress,
  IconButton,
  InputAdornment,
  Autocomplete,
  FormLabel,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';

import { useGetAllLanguage } from 'src/api/language';
import { enqueueSnackbar } from 'src/components/snackbar';
import { updateValue, useGetAllAppSettings } from 'src/api/app-settings';
import { useGetSchool } from 'src/api/school';

interface FormField {
  id: number;
  key: string;
  value: any;
  locale: string | null;
}

const EditableForm: React.FC = () => {
  const { language } = useGetAllLanguage(0, 1000);
  const [selectedLocale, setSelectedLocale] = useState('En');
  const [editedFields, setEditedFields] = useState<Record<number, boolean>>({});

  const {
    appSettings: data,
    appSettingsLoading,
    totalpages,
    revalidateAppSettings,
    appSettingsError,
  } = useGetAllAppSettings(0, 1000, selectedLocale);
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
    if (item.key === 'DEFAULT_SCHOOL') {
      const selectedSchool = schoolList.find((school) => school.id === item.value);

      return (
        <Box display="flex" alignItems="center" width="100%" gap={2}>
          <Typography variant="body1" color="primary">
            DEFAULT_SCHOOL
          </Typography>
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
            renderInput={(params) => <TextField placeholder="Select School" {...params} />}
            renderOption={(props, option) => (
              <li {...props} key={option.value}>
                {option.label}
              </li>
            )}
          />

          {editedFields[item.id] && (
            <>
              <IconButton color="primary" onClick={() => handleSave(item.id)}>
                <SaveIcon />
              </IconButton>
              <IconButton color="primary" onClick={() => handleCancelEdit(item.id)}>
                <CloseIcon />
              </IconButton>
            </>
          )}
        </Box>
      );
    }
    if (typeof item.value === 'boolean') {
      return (
        <Box display="flex" alignItems="center" width="100%">
          {' '}
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
          {editedFields[item.id] && (
            <>
              <IconButton color="primary" onClick={() => handleSave(item.id)}>
                <SaveIcon />
              </IconButton>
              <IconButton color="secondary" onClick={() => handleCancelEdit(item.id)}>
                <CloseIcon />
              </IconButton>
            </>
          )}
        </Box>
      );
    }
    if (typeof item.value === 'number' || typeof item.value === 'string') {
      return (
        <Box display="flex" alignItems="center" width="100%">
          <TextField
            value={item.value}
            onChange={(e) => handleChange(item.id, e.target.value)}
            label={item.key}
            fullWidth
            variant="outlined"
            margin="normal"
            multiline={item.value.toString().length > 20}
            rows={item.value.toString().length > 20 ? 4 : 1}
          />
          {editedFields[item.id] && (
            <>
              <IconButton color="primary" onClick={() => handleSave(item.id)}>
                <SaveIcon />
              </IconButton>
              <IconButton color="secondary" onClick={() => handleCancelEdit(item.id)}>
                <CloseIcon />
              </IconButton>
            </>
          )}
        </Box>
      );
    }
    return null;
  };

  // Separate fields based on type (single-line, multi-line, switch)
  const singleLineFields = sortedFormData.filter(
    (item) =>
      (typeof item.value === 'string' && item.value.length < 20) ||
      (typeof item.value === 'number' && item.value.toString().length < 20)
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
            <InputLabel>Locale</InputLabel>
            <Select
              value={selectedLocale}
              onChange={handleLocaleChange}
              InputLabelProps={{ shrink: true }}
            >
              {localeOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        {appSettingsLoading ? (
          <Box
            sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}
          >
            <CircularProgress />
          </Box>
        ) : (
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
          </form>
        )}
      </Paper>
    </Container>
  );
};

export default EditableForm;
