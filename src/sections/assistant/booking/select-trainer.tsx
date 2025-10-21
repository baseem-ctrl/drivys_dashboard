import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Avatar,
  Box,
  Card,
  Typography,
  Chip,
  Stack,
  TextField,
  InputAdornment,
  IconButton,
  CircularProgress,
  Button,
  Grid,
  Pagination,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EmailIcon from '@mui/icons-material/Email';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import SettingsIcon from '@mui/icons-material/Settings';
import { useTranslation } from 'react-i18next';

// Types
interface UserPreference {
  gear?: string | number;
  vehicle_type?: {
    category_translations?: Array<{
      locale?: string;
      name?: string;
    }>;
  };
}

interface Language {
  dialect?: {
    language_name?: string;
  };
}

interface User {
  name?: string;
  name_ar?: string;
  email?: string;
  photo_url?: string;
  is_active?: boolean;
  user_preference?: UserPreference;
  license_number?: string;
  languages?: Language[];
}

interface Trainer {
  id: number;
  user_id: number;
  name: string;
  email?: string;
  avatarUrl?: string;
  photo_url?: string;
  is_active?: boolean;
  license_number?: string;
  user?: User;
}

interface TrainerStepProps {
  trainers: Trainer[];
  selectedTrainerId: number | null;
  setSelectedTrainerId: (id: number) => void;
  isLoading: boolean;
  setSearchTerm?: (value: string) => void;
  searchTerm?: string;
  renderFilters?: React.ReactNode;
  setSelectedTrainer: (trainer: Trainer) => void;
}

// Constants
const ITEMS_PER_PAGE = 6;

const GEAR_TYPES = {
  MANUAL: ['Manual', 'manual', 1],
  AUTOMATIC: ['Automatic', 'automatic', 0],
} as const;

const VEHICLE_CONFIG = {
  car: { icon: DirectionsCarIcon, color: '#2196f3' },
  truck: { icon: LocalShippingIcon, color: '#f44336' },
  bus: { icon: DirectionsBusIcon, color: '#4caf50' },
  default: { icon: DirectionsCarIcon, color: '#2196f3' },
} as const;

// Utility Functions
const getInitials = (name?: string): string => {
  if (!name) return 'N/A';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();
};

const getVehicleConfig = (categoryName: string) => {
  const lower = categoryName?.toLowerCase() || '';

  if (lower.includes('car')) return VEHICLE_CONFIG.car;
  if (lower.includes('truck')) return VEHICLE_CONFIG.truck;
  if (lower.includes('bus')) return VEHICLE_CONFIG.bus;
  return VEHICLE_CONFIG.default;
};

const isGearType = (gear: string | number | undefined, type: 'MANUAL' | 'AUTOMATIC'): boolean => {
  if (!gear) return false;

  const gearValue = typeof gear === 'string' ? gear : gear.toString();
  return GEAR_TYPES[type].some(
    (value) => value.toString().toLowerCase() === gearValue.toLowerCase()
  );
};

// Debounce utility function
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): T & { cancel: () => void } {
  let timeout: NodeJS.Timeout | null = null;

  const debounced = function (this: any, ...args: Parameters<T>) {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      func.apply(this, args);
    }, wait);
  } as T & { cancel: () => void };

  debounced.cancel = () => {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
  };

  return debounced;
}

// Search filter function
const filterTrainers = (trainers: Trainer[], searchTerm: string, language: string): Trainer[] => {
  if (!searchTerm.trim()) return trainers;

  const lowerSearch = searchTerm.toLowerCase().trim();

  return trainers.filter((trainer) => {
    const name = language === 'ar' ? trainer?.user?.name_ar : trainer?.user?.name;
    const email = trainer?.user?.email;
    const licenseNumber = trainer?.user?.license_number || trainer?.license_number;

    // Get vehicle category
    const translations = trainer?.user?.user_preference?.vehicle_type?.category_translations;
    const vehicleCategory = translations?.find(
      (trans) => trans?.locale?.toLowerCase() === language.toLowerCase()
    )?.name || translations?.[0]?.name || '';

    // Get languages
    const languages = trainer?.user?.languages
      ?.map((lang) => lang.dialect?.language_name)
      .filter(Boolean)
      .join(' ') || '';

    // Search across all fields
    return (
      name?.toLowerCase().includes(lowerSearch) ||
      email?.toLowerCase().includes(lowerSearch) ||
      licenseNumber?.toLowerCase().includes(lowerSearch) ||
      vehicleCategory?.toLowerCase().includes(lowerSearch) ||
      languages?.toLowerCase().includes(lowerSearch)
    );
  });
};

// Sub-components
interface TrainerCardProps {
  trainer: Trainer;
  isSelected: boolean;
  onSelect: () => void;
  language: string;
  t: (key: string) => string;
}

const TrainerCard: React.FC<TrainerCardProps> = ({
  trainer,
  isSelected,
  onSelect,
  language,
  t,
}) => {
  const trainerName = language === 'ar' ? trainer?.user?.name_ar : trainer?.user?.name;
  const trainerEmail = trainer?.user?.email;
  const photoUrl = trainer?.user?.photo_url || trainer.avatarUrl;
  const isActive = trainer?.user?.is_active ?? trainer.is_active;
  const gear = trainer?.user?.user_preference?.gear;
  const licenseNumber = trainer?.user?.license_number || trainer?.license_number;

  const vehicleCategory = useMemo(() => {
    const translations = trainer?.user?.user_preference?.vehicle_type?.category_translations;
    if (!translations?.length) return 'N/A';

    const translation = translations.find(
      (trans) => trans?.locale?.toLowerCase() === language.toLowerCase()
    );
    return translation?.name || translations[0]?.name || 'N/A';
  }, [trainer, language]);

  const languages = useMemo(() => {
    const userLanguages = trainer?.user?.languages;
    if (!userLanguages?.length) return 'N/A';

    return userLanguages
      .map((lang) => lang.dialect?.language_name)
      .filter(Boolean)
      .join(', ');
  }, [trainer]);

  const vehicleConfig = getVehicleConfig(vehicleCategory);
  const VehicleIcon = vehicleConfig.icon;

  return (
    <Card
      sx={{
        borderRadius: 3,
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        border: '1px solid #f0f0f0',
        position: 'relative',
        overflow: 'visible',
        height: '100%',
        '&:hover': {
          boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
        },
      }}
    >
      {/* Status Chip */}
      <Chip
        label={isActive ? t('active') : t('unavailable')}
        size="small"
        sx={{
          position: 'absolute',
          top: 16,
          right: 16,
          bgcolor: isActive ? '#4caf50' : '#f44336',
          color: 'white',
          fontWeight: 600,
          fontSize: 11,
          height: 24,
          zIndex: 1,
        }}
      />

      <Box sx={{ p: 2.5 }}>
        {/* Avatar and Name */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Avatar
            src={photoUrl}
            sx={{
              width: 80,
              height: 80,
              borderRadius: 2,
              bgcolor: '#f5f5f5',
              fontSize: 24,
              fontWeight: 600,
              color: '#666',
            }}
          >
            {getInitials(trainerName)}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5, fontSize: 18 }}>
              {trainerName || t('n/a')}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <EmailIcon sx={{ fontSize: 14, color: '#999' }} />
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: 12 }}>
                {trainerEmail || t('n/a')}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Badges Row */}
        <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
          {isGearType(gear, 'MANUAL') && (
            <Chip
              icon={<SettingsIcon />}
              label={t('manual') || 'Manual'}
              size="small"
              sx={{
                bgcolor: '#2196f3',
                color: 'white',
                fontWeight: 600,
                fontSize: 11,
                height: 24,
                '& .MuiChip-icon': { color: 'white', fontSize: 14 },
              }}
            />
          )}

          {isGearType(gear, 'AUTOMATIC') && (
            <Chip
              icon={<SettingsIcon />}
              label={t('automatic') || 'Automatic'}
              size="small"
              sx={{
                bgcolor: '#ff9800',
                color: 'white',
                fontWeight: 600,
                fontSize: 11,
                height: 24,
                '& .MuiChip-icon': { color: 'white', fontSize: 14 },
              }}
            />
          )}

          {licenseNumber && (
            <Chip
              label={licenseNumber}
              size="small"
              variant="outlined"
              sx={{
                fontWeight: 600,
                borderColor: '#ddd',
                fontSize: 11,
                height: 24,
              }}
            />
          )}
        </Stack>

        {/* Vehicle Category */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <Typography variant="body2" sx={{ fontSize: 12, color: '#666', minWidth: 100 }}>
            {t('Vehicle Category') || 'Vehicle'}:
          </Typography>
          <Chip
            icon={<VehicleIcon sx={{ fontSize: 16 }} />}
            label={vehicleCategory}
            size="small"
            sx={{
              bgcolor: vehicleConfig.color,
              color: 'white',
              fontWeight: 600,
              fontSize: 11,
              height: 24,
              '& .MuiChip-icon': { color: 'white', fontSize: 14 },
            }}
          />
        </Box>

        {/* Languages */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Typography variant="body2" sx={{ fontSize: 12, color: '#666', minWidth: 100 }}>
            {t('language') || 'Language'}:
          </Typography>
          <Typography variant="body2" sx={{ fontSize: 12, color: '#333' }}>
            {languages}
          </Typography>
        </Box>

        {/* Select Button */}
        <Button
          fullWidth
          variant={isSelected ? 'contained' : 'outlined'}
          onClick={onSelect}
          sx={{
            textTransform: 'none',
            borderRadius: 2,
            py: 1,
            fontWeight: 600,
            ...(isSelected
              ? {
                  bgcolor: '#ff6b35',
                  '&:hover': { bgcolor: '#ff5722' },
                }
              : {
                  borderColor: '#ff6b35',
                  color: '#ff6b35',
                  '&:hover': {
                    borderColor: '#ff6b35',
                    bgcolor: 'rgba(255,107,53,0.04)',
                  },
                }),
          }}
        >
          {isSelected ? t('selected') || 'Selected' : t('select_trainer') || 'Select Trainer'}
        </Button>
      </Box>
    </Card>
  );
};

// Main Component
const TrainerSelectStep: React.FC<TrainerStepProps> = ({
  trainers,
  selectedTrainerId,
  setSelectedTrainerId,
  isLoading,
  setSearchTerm,
  searchTerm: externalSearchTerm = '',
  setSelectedTrainer,
}) => {
  const { i18n, t } = useTranslation();
  const [currentPage, setCurrentPage] = useState(1);
  const [localSearchTerm, setLocalSearchTerm] = useState(externalSearchTerm);

  // Create debounced search function
  const debouncedSetSearchTerm = useMemo(
    () => debounce((value: string) => {
      if (setSearchTerm) {
        setSearchTerm(value);
      }
    }, 300),
    [setSearchTerm]
  );

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      debouncedSetSearchTerm.cancel();
    };
  }, [debouncedSetSearchTerm]);

  // Sync local search term with prop when it changes externally
  useEffect(() => {
    setLocalSearchTerm(externalSearchTerm);
  }, [externalSearchTerm]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalSearchTerm(value);
    debouncedSetSearchTerm(value);
  }, [debouncedSetSearchTerm]);

  const handleClearSearch = useCallback(() => {
    setLocalSearchTerm('');
    if (setSearchTerm) {
      setSearchTerm('');
    }
    debouncedSetSearchTerm.cancel();
  }, [setSearchTerm, debouncedSetSearchTerm]);

  // Filter trainers based on search term
  const filteredTrainers = useMemo(() => {
    return filterTrainers(trainers, localSearchTerm, i18n.language);
  }, [trainers, localSearchTerm, i18n.language]);

  // Reset to page 1 when filtered trainers change
  useEffect(() => {
    setCurrentPage(1);
  }, [filteredTrainers.length]);

  // Calculate pagination
  const { totalPages, currentTrainers } = useMemo(() => {
    const total = Math.ceil(filteredTrainers.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const current = filteredTrainers.slice(startIndex, endIndex);

    return { totalPages: total, currentTrainers: current };
  }, [filteredTrainers, currentPage]);

  const handlePageChange = useCallback((_event: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleSelectTrainer = useCallback(
    (trainer: Trainer) => {
      setSelectedTrainerId(trainer.user_id);
      setSelectedTrainer(trainer);
    },
    [setSelectedTrainerId, setSelectedTrainer]
  );

  if (isLoading) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      {/* Search Bar */}
      <Box
        mb={3}
        sx={{ width: '100%' }}
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        gap={2}
      >
        <TextField
          placeholder={t('search') || 'Search trainers...'}
          variant="outlined"
          size="small"
          value={localSearchTerm}
          sx={{ maxWidth: '300px' }}
          onChange={handleSearchChange}
          InputProps={{
            endAdornment: localSearchTerm && (
              <InputAdornment position="end">
                <IconButton size="small" onClick={handleClearSearch}>
                  <CloseIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* No Results Message */}
      {filteredTrainers.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
          <Typography variant="h6" gutterBottom>
            {t('no_trainers_found') || 'No trainers found'}
          </Typography>
          {localSearchTerm && (
            <Typography variant="body2">
              {t('try_different_search') || 'Try adjusting your search terms'}
            </Typography>
          )}
        </Box>
      )}

      {/* Trainer Grid */}
      {filteredTrainers.length > 0 && (
        <>
          <Grid container spacing={3}>
            {currentTrainers.map((trainer) => (
              <Grid item xs={12} md={6} key={trainer.user_id}>
                <TrainerCard
                  trainer={trainer}
                  isSelected={trainer.user_id === selectedTrainerId}
                  onSelect={() => handleSelectTrainer(trainer)}
                  language={i18n.language}
                  t={t}
                />
              </Grid>
            ))}
          </Grid>

          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={handlePageChange}
                color="primary"
                size="large"
                showFirstButton
                showLastButton
                sx={{
                  '& .MuiPaginationItem-root': {
                    fontWeight: 600,
                  },
                  '& .Mui-selected': {
                    bgcolor: '#ff6b35 !important',
                    color: 'white',
                    '&:hover': {
                      bgcolor: '#ff5722 !important',
                    },
                  },
                }}
              />
            </Box>
          )}
        </>
      )}
    </>
  );
};

export default TrainerSelectStep;
