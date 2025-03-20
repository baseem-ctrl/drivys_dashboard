import React, { useState } from 'react';
import {
  Container,
  Typography,
  Paper,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { Delete } from '@mui/icons-material';
import { useGetTermsAndConditions, updateCreateTC } from 'src/api/terms-and-conditions';
import { enqueueSnackbar } from 'src/components/snackbar';
import TermsAccordion from './terms-and-condition-accordian';
import { useGetAllLanguage } from 'src/api/language';

const TermsPageList: React.FC = () => {
  const [locale, setLocale] = useState('En');
  const { termsAndConditions, termsLoading, termsError, revalidateTermsAndConditions } =
    useGetTermsAndConditions(locale);
  const [open, setOpen] = useState(false);
  const [termsList, setTermsList] = useState([{ heading: '', content: '' }]);
  const [isEditing, setIsEditing] = useState(false);
  const { language } = useGetAllLanguage(0, 1000);
  const localeOptions = (language || []).map((lang) => ({
    value: lang.language_culture,
    label: lang.name,
  }));
  const handleLocaleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setLocale(event.target.value as string);
  };
  const handleOpen = (edit = false) => {
    setOpen(true);
    setIsEditing(edit);
    if (edit && termsAndConditions[0]?.value) {
      setTermsList([...termsAndConditions[0].value]);
    } else {
      setTermsList([{ heading: '', content: '' }]);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setTermsList([{ heading: '', content: '' }]);
    setIsEditing(false);
  };

  const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const updatedTerms = [...termsList];
    updatedTerms[index] = { ...updatedTerms[index], [name]: value };
    const filteredTerms = updatedTerms.filter(
      (term) => term.heading.trim() !== '' || term.content.trim() !== ''
    );

    setTermsList(filteredTerms.length > 0 ? filteredTerms : [{ heading: '', content: '' }]);
  };

  const handleAddTerm = () => {
    setTermsList([...termsList, { heading: '', content: '' }]);
  };

  const handleSubmit = async () => {
    try {
      const updatedPayload = {
        content: isEditing
          ? [...termsList]
          : [...(termsAndConditions[0]?.value || []), ...termsList],
        locale,
        display_order: termsAndConditions[0]?.display_order || 1,
      };

      const response = await updateCreateTC(updatedPayload);
      if (response) {
        enqueueSnackbar(response.message, { variant: 'success' });
        revalidateTermsAndConditions();
        handleClose();
      }
    } catch (error) {
      if (error?.errors && typeof error?.errors === 'object' && !Array.isArray(error?.errors)) {
        Object.values(error?.errors).forEach((errorMessage: any) => {
          enqueueSnackbar(errorMessage[0], { variant: 'error' });
        });
      } else {
        enqueueSnackbar(error.message, { variant: 'error' });
      }
    }
  };

  if (termsLoading) {
    return (
      <Container maxWidth="md" sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (termsError) {
    return (
      <Container maxWidth="md">
        <Paper elevation={3} sx={{ p: 3, mt: 4 }}>
          <Typography variant="h4" gutterBottom>
            Terms & Policies
          </Typography>

          <Typography color="error">Failed to load terms and conditions.</Typography>
        </Paper>
      </Container>
    );
  }
  const handleRemoveTerm = (index: number) => {
    const updatedTerms = termsList.filter((_, i) => i !== index);
    setTermsList(updatedTerms.length > 0 ? updatedTerms : [{ heading: '', content: '' }]);
  };
  return (
    <Container>
      <Paper elevation={3} sx={{ p: 3, mt: 4 }}>
        <Box display="flex" justifyContent="flex-end" sx={{ mb: 2 }}>
          <FormControl sx={{ minWidth: 250, mb: 4 }} variant="outlined">
            <InputLabel shrink={!!locale}>Locale</InputLabel>
            <Select value={locale} onChange={handleLocaleChange} label="Locale">
              {localeOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h4" gutterBottom>
            Terms & Policies
          </Typography>
          <Box>
            <Button
              variant="contained"
              color="primary"
              sx={{ mr: 2 }}
              onClick={() => handleOpen(false)}
            >
              Add T&C
            </Button>
            <Button variant="outlined" color="primary" onClick={() => handleOpen(true)}>
              Update T&C
            </Button>
          </Box>
        </Box>
        <Typography variant="body1" color="textSecondary" mb={2}>
          Below are our key terms and policies. Click to expand for details.
        </Typography>

        {termsAndConditions.length === 0 ? (
          <Typography variant="body1" color="primary" mt={3} textAlign="center">
            No terms and conditions available.
          </Typography>
        ) : (
          <TermsAccordion terms={termsAndConditions[0]?.value || []} />
        )}

        <Dialog open={open} onClose={handleClose}>
          <DialogTitle>
            {isEditing ? 'Update Terms and Conditions' : 'Add Terms and Conditions'}
          </DialogTitle>
          <DialogContent>
            {termsList.map((term, index) => (
              <Box key={index} sx={{ mb: 2 }}>
                <TextField
                  fullWidth
                  margin="dense"
                  label="Heading"
                  name="heading"
                  value={term.heading}
                  onChange={(e) => handleChange(index, e)}
                />
                <TextField
                  fullWidth
                  margin="dense"
                  label="Content"
                  name="content"
                  multiline
                  rows={4}
                  value={term.content}
                  onChange={(e) => handleChange(index, e)}
                />
                {termsList.length > 1 && (
                  <IconButton
                    onClick={() => handleRemoveTerm(index)}
                    color="primary"
                    sx={{ ml: 'auto', display: 'block' }}
                  >
                    <Delete />
                  </IconButton>
                )}
              </Box>
            ))}
            <Button onClick={handleAddTerm} color="primary">
              + Add Another
            </Button>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} color="secondary">
              Cancel
            </Button>
            <Button onClick={handleSubmit} color="primary" variant="contained">
              {isEditing ? 'Update' : 'Save'}
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Container>
  );
};

export default TermsPageList;
