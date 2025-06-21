import React from 'react';
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Stack,
  Divider,
  Grid,
  TextField,
  InputAdornment,
  IconButton,
  CircularProgress,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useTranslation } from 'react-i18next';

interface Trainer {
  id: number;
  name: string;
  email?: string;
  avatarUrl?: string;
  photo_url?: string;
  is_active?: boolean;
}

interface TrainerStepProps {
  trainers: Trainer[];
  selectedTrainerId: number | null;
  setSelectedTrainerId: (id: number) => void;
  isLoading: boolean;
  setSearchTerm: (value: string) => void;
  searchTerm: string;
  renderFilters: any;
  setSelectedTrainer: any;
}

const TrainerSelectStep: React.FC<TrainerStepProps> = ({
  trainers,
  selectedTrainerId,
  setSelectedTrainerId,
  isLoading,
  setSearchTerm,
  searchTerm,
  renderFilters,
  setSelectedTrainer,
}) => {
  const { i18n, t } = useTranslation();
  const getInitials = (name?: string) => {
    if (!name) return t('n/a');
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  return (
    <>
      <Box
        mb={3}
        sx={{ width: '100%' }}
        display="flex"
        justifyContent="space-between"
        alignItems="center"
      >
        <TextField
          label={t('search')}
          variant="outlined"
          fullWidth
          value={searchTerm}
          sx={{ maxWidth: '300px' }}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            endAdornment: searchTerm && (
              <InputAdornment position="end">
                <IconButton onClick={handleClearSearch}>
                  <CloseIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        {renderFilters}
      </Box>

      <Grid container spacing={3}>
        {isLoading ? (
          <Grid item xs={12} sx={{ textAlign: 'center', py: 5 }}>
            <CircularProgress />
          </Grid>
        ) : (
          trainers.map((trainer) => (
            <Grid item xs={12} sm={6} md={4} key={trainer.user_id}>
              <Card
                onClick={() => {
                  setSelectedTrainerId(trainer.user_id);
                  setSelectedTrainer(trainer);
                }}
                sx={{
                  borderRadius: 5,
                  boxShadow: 4,
                  cursor: 'pointer',
                  overflow: 'hidden',
                  border: trainer.user_id === selectedTrainerId ? '2px solid #e36c1e' : 'none',
                }}
              >
                <Box
                  sx={{
                    height: 100,
                    background: 'linear-gradient(to right, #e36c1e, #e99562)',
                    position: 'relative',
                  }}
                >
                  <Chip
                    label={trainer?.user?.is_active ? t('active') : t('inactive')}
                    size="small"
                    variant="outlined"
                    sx={{
                      position: 'absolute',
                      top: 15,
                      right: 15,
                      backgroundColor: 'rgba(255,255,255,0.8)',
                      color: trainer?.user?.is_active ? '#388e3c' : '#d32f2f',
                      fontWeight: 600,
                      borderColor: 'rgba(255,255,255,0.5)',
                    }}
                  />

                  <Avatar
                    src={trainer?.user?.photo_url || trainer.avatarUrl}
                    sx={{
                      width: 80,
                      height: 80,
                      border: '3px solid white',
                      position: 'absolute',
                      bottom: -40,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      backgroundColor: '#eee',
                      fontSize: 24,
                      color: '#444',
                    }}
                  >
                    {getInitials(trainer.name)}
                  </Avatar>
                </Box>

                <CardContent sx={{ mt: 5, textAlign: 'center' }}>
                  <Typography fontWeight={600} sx={{ fontSize: '16px' }}>
                    {(i18n.language === 'ar' ? trainer?.user?.name_ar : trainer?.user?.name) ||
                      t('n/a')}{' '}
                  </Typography>
                  <Typography sx={{ fontSize: '13px' }} color="text.secondary">
                    {trainer?.user?.email || t('n/a')}
                  </Typography>

                  <Divider
                    sx={{
                      my: 2,
                      borderBottomWidth: 2,
                      borderColor: '#1976d2',
                      width: '80%',
                      mx: 'auto',
                    }}
                  />

                  <Stack spacing={1} sx={{ fontSize: '13px', textAlign: 'left', px: 2 }}>
                    <Typography sx={{ fontSize: '13px', mx: 'auto' }}>
                      <strong>{t('type')}:</strong>
                      {trainer?.user?.user_preference?.gear || t('n/a')}
                    </Typography>
                    <Typography sx={{ fontSize: '13px', mx: 'auto' }}>
                      <strong>{t('languages')}:</strong>
                      {trainer?.user?.languages?.length > 0
                        ? trainer?.user?.languages
                            .map((lang: any) => lang.dialect?.language_name)
                            .filter(Boolean)
                            .join(', ')
                        : t('n/a')}
                    </Typography>
                    <Typography sx={{ fontSize: '13px', mx: 'auto' }}>
                      <strong>{t('category')}:</strong>{' '}
                      {trainer?.user?.user_preference?.vehicle_type?.category_translations?.find(
                        (t) => t?.locale?.toLowerCase() === i18n.language.toLowerCase()
                      )?.name ||
                        trainer?.user?.user_preference?.vehicle_type?.category_translations?.[0]
                          ?.name ||
                        t('n/a')}{' '}
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>
    </>
  );
};

export default TrainerSelectStep;
