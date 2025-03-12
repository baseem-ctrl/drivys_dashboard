import React from 'react';
import { Container, Typography, Paper, CircularProgress } from '@mui/material';
import TermsAccordion from './terms-and-condition-accordian';
import { useGetTermsAndConditions } from 'src/api/terms-and-conditions';

const TermsPageList: React.FC = () => {
  const { termsAndConditions, termsLoading, termsError } = useGetTermsAndConditions();

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

  return (
    <Container>
      <Paper elevation={3} sx={{ p: 3, mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Terms & Policies
        </Typography>
        <Typography variant="body1" color="textSecondary" mb={2}>
          Below are our key terms and policies. Click to expand for details.
        </Typography>
        <TermsAccordion terms={termsAndConditions[0]?.value || []} />
      </Paper>
    </Container>
  );
};

export default TermsPageList;
