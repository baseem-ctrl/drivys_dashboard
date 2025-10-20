import React from 'react';
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Stack,
  Button,
  Tooltip,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import PinIcon from '@mui/icons-material/Pin';




type Trainer = {
  name: string;
  email: string;
  phone: string;
  photo: string;
  dob: string;
  is_active: boolean;
  gender: string;
  vehicle_number?: string;
  user?: {
    name?: string;
    name_ar?: string;
    email?: string;
    photo_url?: string;
    is_active?: boolean;
    languages?: Array<{
      dialect?: {
        language_name?: string;
      };
    }>;
    user_preference?: {
      gear?: string;
      vehicle_type?: {
        category_translations?: Array<{
          locale?: string;
          name?: string;
        }>;
      };
    };
  };
};

type TrainerProfileCardProps = {
  row: Trainer;
};

const TrainerProfileCard: React.FC<TrainerProfileCardProps> = ({ row }) => {
  const { i18n, t } = useTranslation();

  const gearType = row?.user?.user_preference?.gear || 'Unknown';
  const isManual = gearType.toLowerCase() === 'manual';
  const isAutomatic = gearType.toLowerCase() === 'automatic';
  const vehicleNumber = row?.vehicle_number || 'N/A';

  return (
    <Card
      sx={{
        width: '100%',
        maxWidth: 650,
        borderRadius: 4,
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        overflow: 'hidden',
        backgroundColor: '#ffffff',
        transition: 'transform 0.25s ease, box-shadow 0.25s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 6px 24px rgba(0,0,0,0.12)',
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', gap: 3, alignItems: 'flex-start', position: 'relative' }}>
          {/* Big Square Avatar */}
          <Avatar
            src={row?.user?.photo_url}
            alt={row?.user?.name}
            sx={{
              width: 130,
              height: 130,
              borderRadius: 1, // square with slightly rounded corners
              flexShrink: 0,
            }}
          />

          {/* Info */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            {/* Name */}
            <Typography
              sx={{
                fontSize: 18,
                fontWeight: 700,
                color: '#212121',
                mb: 0.5,
                lineHeight: 1.3,
              }}
              noWrap
            >
              {i18n.language === 'ar'
                ? row?.user?.name_ar || row?.user?.name || t('n/a')
                : row?.user?.name || t('n/a')}
            </Typography>

            {/* Email */}
            <Typography sx={{ fontSize: 13.5, color: '#616161', mb: 1.5 }} noWrap>
              {row?.user?.email || t('n/a')}
            </Typography>

            {/* Action Buttons */}
            <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 1.5 }}>
              {isManual && (
                <Button
                  size="small"
                  variant="contained"
                  startIcon={<Box component="span">≡</Box>}
                  sx={{
                    backgroundColor: '#1976d2',
                    fontSize: '12px',
                    px: 1.5,
                    py: 0.3,
                    fontWeight: 600,
                    textTransform: 'none',
                    borderRadius: 2,
                    '&:hover': { backgroundColor: '#115293' },
                  }}
                >
                  {t('Manual')}
                </Button>
              )}

              {isAutomatic && (
                <Button
                  size="small"
                  variant="contained"
                  startIcon={<Box component="span">⚙</Box>}
                  sx={{
                    backgroundColor: '#f57c00',
                    fontSize: '12px',
                    px: 1.5,
                    py: 0.3,
                    fontWeight: 600,
                    textTransform: 'none',
                    borderRadius: 2,
                    '&:hover': { backgroundColor: '#ef6c00' },
                  }}
                >
                  {t('Automatic')}
                </Button>
              )}

              {!isManual && !isAutomatic && gearType !== 'Unknown' && (
                <Button
                  size="small"
                  variant="contained"
                  sx={{
                    backgroundColor: '#424242',
                    fontSize: '12px',
                    px: 1.5,
                    py: 0.3,
                    fontWeight: 600,
                    textTransform: 'none',
                    borderRadius: 2,
                    color: '#fff',
                    '&:hover': { backgroundColor: '#212121' },
                  }}
                >
                  {gearType}
                </Button>
              )}

              <Tooltip title="Vehicle Number">
                <Chip
                  icon={<PinIcon sx={{ fontSize: 16, color: '#424242' }} />}
                  label={vehicleNumber}
                  size="small"
                  variant="outlined"
                  sx={{
                    fontSize: '12px',
                    height: 28,
                    borderColor: '#bdbdbd',
                    borderWidth: 1.5,
                    fontWeight: 600,
                    color: '#212121',
                    backgroundColor: '#fafafa',
                    borderRadius: 2,
                    '& .MuiChip-icon': {
                      marginLeft: '4px',
                      marginRight: '-2px',
                    },
                  }}
                />
              </Tooltip>
            </Stack>

            {/* Vehicle Category */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Typography sx={{ fontSize: 12.5, color: '#616161', minWidth: 120, fontWeight: 500 }}>
                {t('Vehicle Category')}:
              </Typography>
              <Chip
                icon={<DirectionsCarIcon sx={{ fontSize: 14 }} />}
                label={
                  row?.user?.user_preference?.vehicle_type?.category_translations?.find(
                    (t) => t?.locale?.toLowerCase() === i18n.language.toLowerCase()
                  )?.name ||
                  row?.user?.user_preference?.vehicle_type?.category_translations?.[0]?.name ||
                  t('Car')
                }
                size="small"
                sx={{
                  backgroundColor: '#1e88e5',
                  color: 'white',
                  fontSize: '11px',
                  height: 22,
                  fontWeight: 600,
                  borderRadius: 2,
                  '& .MuiChip-icon': { color: 'white', marginLeft: '6px' },
                }}
              />
            </Box>

            {/* Languages */}
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography sx={{ fontSize: 12.5, color: '#616161', minWidth: 120, fontWeight: 500 }}>
                {t('Language')}:
              </Typography>
              <Typography sx={{ fontSize: 12.5, color: '#212121', fontWeight: 500 }}>
                {row?.user?.languages?.length > 0
                  ? row.user.languages
                      .map((lang: any) => lang.dialect?.language_name)
                      .filter(Boolean)
                      .join(', ')
                  : t('n/a')}
              </Typography>
            </Box>
          </Box>

          {/* Active Badge */}
          <Chip
            label={row?.user?.is_active ? t('Active') : t('Inactive')}
            size="small"
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              backgroundColor: row?.user?.is_active ? '#2e7d32' : '#c62828',
              color: 'white',
              fontWeight: 700,
              fontSize: '11px',
              height: 22,
              px: 1,
              borderRadius: '6px',
            }}
          />
        </Box>
      </CardContent>
    </Card>
  );
};

export default TrainerProfileCard;
