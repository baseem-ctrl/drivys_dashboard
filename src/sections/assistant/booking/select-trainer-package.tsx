import React from 'react';
import { Grid, Card, CardContent, Typography, CircularProgress, Box, Chip } from '@mui/material';
import { useTranslation } from 'react-i18next';

interface TrainerPackage {
  id: number;
  name: string;
  description?: string;
  price?: number;
  package?: {
    background_color?: 'normal' | 'gold' | 'orange' | 'silver';
    package_translations?: { name: string }[];
  };
  trainer?: { name: string };
}

interface TrainerPackageStepProps {
  trainerPackages: TrainerPackage[];
  selectedTrainerPackageId: number | null;
  setSelectedTrainerPackageId: (id: number) => void;
  isLoading: boolean;
  handleNext: any;
}

const getBackgroundColor = (color?: string) => {
  switch (color) {
    case 'gold':
      return '#FFF8E1';
    case 'silver':
      return '#ECEFF1';
    case 'orange':
      return '#FFF3E0';
    default:
      return '#FAFAFA';
  }
};

const TrainerPackageStep: React.FC<TrainerPackageStepProps> = ({
  trainerPackages,
  selectedTrainerPackageId,
  setSelectedTrainerPackageId,
  isLoading,
  handleNext,
}) => {
  const { i18n } = useTranslation();

  console.log('trainerPackages', trainerPackages);
  return isLoading ? (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
      <CircularProgress />
    </Box>
  ) : (
    <Grid container spacing={3}>
      {trainerPackages.map((pkg) => {
        const isSelected = pkg.id === selectedTrainerPackageId;
        const bgColor = getBackgroundColor(pkg?.package?.background_color);

        return (
          <Grid item xs={12} sm={6} md={4} key={pkg.id}>
            <Card
              onClick={() => {
                setSelectedTrainerPackageId(pkg.id);
                handleNext();
              }}
              sx={{
                cursor: 'pointer',
                position: 'relative',
                transition: 'transform 0.3s, box-shadow 0.3s',
                transform: isSelected ? 'scale(1.03)' : 'scale(1)',
                border: isSelected ? '2px solid #4caf50' : '1px solid #e0e0e0',
                boxShadow: isSelected
                  ? '0 4px 20px rgba(76, 175, 80, 0.4)'
                  : '0 2px 10px rgba(0,0,0,0.08)',
                borderRadius: '20px',
                background: bgColor,
                overflow: 'hidden',
              }}
            >
              <Box
                sx={{
                  height: 50,
                }}
              >
                <Chip
                  label={
                    <>
                      <span className="dirham-symbol">&#x00EA;</span>
                      {pkg?.price?.toFixed(2) || '0'}
                    </>
                  }
                  color="success"
                  variant="soft"
                  size="small"
                  sx={{
                    position: 'absolute',
                    top: 10,
                    right: 10,
                    fontWeight: 600,
                  }}
                />
              </Box>
              <CardContent>
                <Typography fontWeight={600} fontSize="14px" gutterBottom>
                  {pkg?.package?.package_translations?.[0]?.name || 'Tasty Vegetable Salad'}
                </Typography>
                <Typography color="text.secondary" fontSize="12px" gutterBottom noWrap>
                  {pkg?.trainer?.name || 'N/A'}
                </Typography>
                <Typography color="primary" fontSize="12px" gutterBottom noWrap>
                  {pkg?.package?.category?.category_translations?.find(
                    (t) => t.locale.toLowerCase() === i18n.language.toLowerCase()
                  )?.name || 'No Category'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        );
      })}
    </Grid>
  );
};

export default TrainerPackageStep;
