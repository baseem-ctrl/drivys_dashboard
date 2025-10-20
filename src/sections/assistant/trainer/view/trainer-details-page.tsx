/* eslint-disable no-nested-ternary */
import React, { useState } from 'react';
import {
  Box,
  Typography,
  Avatar,
  Chip,
  Card,
  CardContent,
  Button,
  Grid,
  Divider,
  CircularProgress,
  Rating,
} from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import EditIcon from '@mui/icons-material/Edit';
import AutoModeIcon from '@mui/icons-material/AutoMode';
import { useGetTrainerList } from 'src/api/assistant';
import { useTranslation } from 'react-i18next';
import CheckIcon from '@mui/icons-material/Check';
import TrainerAddressMap from '../trainer-address-map';
import moment from 'moment';

interface TrainerProfileProps {
  trainer_id: number;
}

const TrainerDetailsPage: React.FC<TrainerProfileProps> = ({ trainer_id }) => {
  const { trainers, trainerListLoading, trainerListError } = useGetTrainerList({
    trainer_id: String(trainer_id),
  });
  const [selectedLang, setSelectedLang] = useState('Arabic');
  const [showAllReviews, setShowAllReviews] = useState(false);

  const { i18n, t } = useTranslation();

  const trainer = trainers?.[0];

  if (trainerListLoading) {
    return (
      <Box display="flex" justifyContent="center" mt={5}>
        <CircularProgress />
      </Box>
    );
  }

  if (trainerListError || !trainer) {
    return (
      <Box textAlign="center" mt={5}>
        <Typography color="error">{t('failed_to_load_trainer_profile')}</Typography>
      </Box>
    );
  }

  // Determine if mode is manual or automatic
  const isManual = trainer?.user?.user_preference?.is_manual_mode === true;

  // Get real address data
  const primaryAddress = trainer?.user?.user_addresses?.[0];
  const addressLine1 = primaryAddress?.address_line_1 || '';
  const addressLine2 = primaryAddress?.address_line_2 || '';
  const city = primaryAddress?.city || '';

  // Get reviews
  const validReviews = Array.isArray(trainer?.user?.reviews)
    ? trainer.user.reviews.filter((r: any) => r.rating !== null || r.comment)
    : [];
  const reviewsToShow = showAllReviews ? validReviews : validReviews.slice(0, 3);

  // Package color mapping
  const getPackageColor = (packageName: string) => {
    const name = packageName?.toLowerCase() || '';
    if (name.includes('gold')) return '#fff8e1';
    if (name.includes('silver')) return '#f5f5f5';
    if (name.includes('bronze')) return '#fff3e0';
    if (name.includes('platinum')) return '#e8eaf6';
    return 'white';
  };

  const getPackageBorderColor = (packageName: string) => {
    const name = packageName?.toLowerCase() || '';
    if (name.includes('gold')) return '#ffa000';
    if (name.includes('silver')) return '#9e9e9e';
    if (name.includes('bronze')) return '#ff6f00';
    if (name.includes('platinum')) return '#5e35b1';
    return '#e0e0e0';
  };

  // Get language-specific bio
  const getBioByLanguage = (lang: string) => {
    const langMap: { [key: string]: string } = {
      'Arabic': trainer.user?.user_preference?.bio_ar || t('n/a'),
      'English': trainer.user?.user_preference?.bio || t('n/a'),
      'Urdu': trainer.user?.user_preference?.bio_ur || t('n/a'),
      'Malayalam': trainer.user?.user_preference?.bio_ml || t('n/a'),
    };
    return langMap[lang] || trainer.user?.user_preference?.bio || t('n/a');
  };

  return (
    <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100vh', p: 3 }}>
      {/* Header */}
      <Box mb={3}>
        <Typography variant="h5" fontWeight={600}>
          {t('trainers')}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t('home')} / {t('trainers')} / <strong>{t('trainer_details')}</strong>
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* LEFT COLUMN */}
        <Grid item xs={12} md={6}>
          {/* Profile Card */}
          <Card sx={{ borderRadius: 2, mb: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" gap={3} mb={3}>
                {/* Avatar */}
                <Avatar
                  src={trainer?.user?.photo_url}
                  alt={trainer?.user?.name}
                  sx={{ width: 160, height: 160, borderRadius: 2 }}
                />

                {/* Info */}
                <Box flex={1}>
                  {/* Name & Status */}
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <Typography variant="h5" fontWeight={600}>
                      {i18n.language === 'ar'
                        ? trainer?.user?.name_ar || trainer?.user?.name || t('n/a')
                        : trainer?.user?.name || t('n/a')}
                    </Typography>
                    <Chip
                      label={trainer?.user?.is_active ? t('active') : t('inactive')}
                      size="small"
                      sx={{
                        bgcolor: trainer?.user?.is_active ? '#4caf50' : '#f44336',
                        color: 'white',
                        fontWeight: 600,
                        fontSize: '0.7rem',
                      }}
                    />
                  </Box>

                  {/* Vendor Location */}
                  <Typography variant="body2" color="text.secondary" mb={2}>
                    {' '}
                    {trainer?.user?.vendor?.vendor_translations?.find(
                      (vt: any) => vt?.locale?.toLowerCase() === i18n.language.toLowerCase()
                    )?.name ||
                      trainer?.user?.vendor?.vendor_translations?.[0]?.name ||
                      'Al Ain - Sanaya'}
                  </Typography>

                  {/* Buttons */}
                  <Box display="flex" gap={1} mb={2}>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={isManual ? <EditIcon /> : <AutoModeIcon />}
                      sx={{
                        bgcolor: isManual ? '#2196f3' : '#4caf50',
                        textTransform: 'none',
                        px: 3,
                        '&:hover': {
                          bgcolor: isManual ? '#1976d2' : '#388e3c',
                        },
                      }}
                    >
                      {isManual ? t('manual') : t('automatic')}
                    </Button>

                    <Button
                      variant="outlined"
                      size="small"
                      sx={{
                        textTransform: 'none',
                        borderColor: '#e0e0e0',
                        color: 'text.primary',
                        px: 3,
                      }}
                    >
                      {trainer?.vehicle_number || 'AD-12345'}
                    </Button>
                  </Box>

                  {/* Contact Details */}
                  <Box>
                    <InfoLine
                      label={t('Phone Number')}
                      value={`+${trainer?.user?.country_code || '971'} ${trainer?.user?.phone || '56 600 5000'}`}
                    />
                    <InfoLine
                      label={t('Email')}
                      value={trainer?.user?.email || 'floydmiles@gmail.com'}
                    />
                    <InfoLine
                      label={t('Vehicle Category')}
                      value={
                        trainer.user?.user_preference?.vehicle_type?.category_translations?.find(
                          (item: any) => item.locale.toLowerCase() === i18n.language.toLowerCase()
                        )?.name || t('light_vehicle')
                      }
                    />
                    <InfoLine
                      label={t('language')}
                      value={
                        trainer?.user?.languages
                          ?.map((l: any) => l.dialect?.language_name)
                          .join(', ') || 'English, Malayalam, Arabic, Hindi'
                      }
                    />
                    <InfoLine
                      label={t('pickup_option')}
                      value={
                        trainer?.user?.user_preference?.is_pickup_enabled
                          ? `${t('yes')} (${t('extra_fee_applies')})`
                          : t('no')
                      }
                    />
                  </Box>

                  {/* Rating */}
                  <Box display="flex" alignItems="center" gap={0.5} mt={2}>
                    <Typography variant="h6" fontWeight={600}>
                      {(trainer?.user?.average_rating ?? 0).toFixed(1)}
                    </Typography>
                    <StarIcon sx={{ color: '#ffc107', fontSize: 20 }} />
                    <Typography variant="body2" color="text.secondary">
                      ({trainer?.user?.rating_count ?? 0})
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Trainer Address */}
          <Card sx={{ borderRadius: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600} mb={2}>
                {t('trainer_address')}
              </Typography>

              {primaryAddress ? (
                <>
                  {primaryAddress.building_name && (
                    <Typography variant="body2" color="text.secondary">
                      {primaryAddress.building_name}
                    </Typography>
                  )}
                  {primaryAddress.street && (
                    <Typography variant="body2" color="text.secondary">
                      {primaryAddress.street}
                    </Typography>
                  )}
                  {primaryAddress.neighbourhood && (
                    <Typography variant="body2" color="text.secondary" mb={2}>
                      {primaryAddress.neighbourhood}
                    </Typography>
                  )}
                </>
              ) : (
                <Typography variant="body2" color="text.secondary" mb={2}>
                  {t('no_address_available')}
                </Typography>
              )}

              <TrainerAddressMap
                addresses={trainer?.user?.user_addresses || []}
                max_radius={trainer?.user?.user_preference?.max_radius_in_km}
              />

              <Box
                sx={{
                  bgcolor: '#ff5722',
                  color: 'white',
                  px: 2,
                  py: 1,
                  borderRadius: 1,
                  mt: 2,
                  display: 'inline-block',
                }}
              >
                <Typography variant="body2" fontWeight={600}>
                  {t('maximum_radius')}: {trainer?.user?.user_preference?.max_radius_in_km || 60}KM
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* RIGHT COLUMN */}
        <Grid item xs={12} md={6}>
          {/* About Section */}
          <Card sx={{ borderRadius: 2, mb: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600} mb={2}>
                {t('about')}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                mb={3}
                sx={{ lineHeight: 1.8, textAlign: i18n.language === 'ar' ? 'right' : 'left' }}
              >
                {getBioByLanguage(selectedLang)}
              </Typography>

              {/* Language Tabs */}
              <Box display="flex" gap={1} flexWrap="wrap">
                {['Arabic', 'English', 'Urdu', 'Malayalam'].map((lang) => (
                  <Button
                    key={lang}
                    variant={selectedLang === lang ? 'contained' : 'outlined'}
                    size="small"
                    onClick={() => setSelectedLang(lang)}
                    sx={{
                      textTransform: 'none',
                      bgcolor: selectedLang === lang ? '#ff5722' : 'transparent',
                      color: selectedLang === lang ? 'white' : 'text.primary',
                      borderColor: '#e0e0e0',
                      px: 3,
                      '&:hover': {
                        bgcolor: selectedLang === lang ? '#e64a19' : '#f5f5f5',
                      },
                    }}
                  >
                    {t(lang.toLowerCase())}
                  </Button>
                ))}
              </Box>
            </CardContent>
          </Card>

          {/* Available Package */}
          <Card sx={{ borderRadius: 2, mb: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600} mb={3}>
                {t('available_package')}
              </Typography>

              {trainer?.user?.packages && trainer.user.packages.length > 0 ? (
                <Grid container spacing={2}>
                  {trainer.user.packages.map((userPkg: any) => {
                    const pkg = userPkg.package;

                    if (!pkg) return null;

                    const translation =
                      pkg.package_translations?.find(
                        (pt: any) => pt.locale?.toLowerCase() === i18n.language.toLowerCase()
                      ) || pkg.package_translations?.[0];

                    const packageName = translation?.name || t('package');
                    const isGold = packageName?.toLowerCase().includes('gold');

                    // Extract features from session_inclusions HTML or use default
                    const sessionInclusions = translation?.session_inclusions || '';
                    const featuresArray = sessionInclusions
                      ? [sessionInclusions.replace(/<\/?p>/g, '').trim()]
                      : [
                          t('driving_fundamentals'),
                          t('sessions_before_test'),
                          t('discount_on_certificate'),
                          t('serious_preparation'),
                        ];

                    return (
                      <Grid item xs={12} sm={6} key={userPkg.id}>
                        <PackageCard
                          title={packageName}
                          price={parseFloat(userPkg.price || 0)}
                          sessions={pkg.number_of_sessions || 0}
                          isUnlimited={pkg.is_unlimited || false}
                          features={featuresArray}
                          bgColor={getPackageColor(packageName)}
                          borderColor={getPackageBorderColor(packageName)}
                          isGold={isGold}
                          discountText={t('discount_on_certificate_percent')}
                        />
                      </Grid>
                    );
                  })}
                </Grid>
              ) : (
                <Typography variant="body2" color="gray" textAlign="center">
                  {t('no_packages_available')}
                </Typography>
              )}
            </CardContent>
          </Card>

          {/* Reviews Section */}
          {validReviews.length > 0 && (
            <Card sx={{ borderRadius: 2 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={600} mb={3}>
                  {t('reviews')} ({validReviews.length})
                </Typography>

                {reviewsToShow.map((review: any, index: number) => (
                  <Box key={review.id || index} mb={3}>
                    <Box display="flex" alignItems="center" gap={2} mb={1}>
                      <Avatar
                        src={review.user?.photo_url}
                        alt={review.user?.name}
                        sx={{ width: 40, height: 40 }}
                      />
                      <Box flex={1}>
                        <Typography variant="body1" fontWeight={600}>
                          {review.user?.name || t('anonymous')}
                        </Typography>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Rating
                            value={review.rating || 0}
                            readOnly
                            size="small"
                            precision={0.5}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {review.created_at
                              ? moment(review.created_at).format('MMM DD, YYYY')
                              : ''}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                    {review.comment && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ pl: 7, lineHeight: 1.6 }}
                      >
                        {review.comment}
                      </Typography>
                    )}
                    {index < reviewsToShow.length - 1 && <Divider sx={{ mt: 2 }} />}
                  </Box>
                ))}

                {validReviews.length > 3 && (
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => setShowAllReviews(!showAllReviews)}
                    sx={{
                      textTransform: 'none',
                      borderColor: '#e0e0e0',
                      color: 'text.primary',
                      mt: 2,
                    }}
                  >
                    {showAllReviews
                      ? t('show_less')
                      : `${t('show_all_reviews')} (${validReviews.length - 3} ${t('more')})`}
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

// Helper Components
const InfoLine = ({ label, value }: { label: string; value: string }) => (
  <Box mb={1}>
    <Typography variant="caption" color="text.secondary" component="span">
      {label}:{' '}
    </Typography>
    <Typography variant="body2" component="span" fontWeight={500}>
      {value}
    </Typography>
  </Box>
);

const PackageCard = ({
  title,
  price,
  sessions,
  isUnlimited,
  description,
  features,
  bgColor = 'white',
  borderColor = '#e0e0e0',
  isGold = false,
  discountText = '40% discount on certificate',
}: {
  title: string;
  price: number;
  sessions?: number;
  isUnlimited?: boolean;
  description?: string;
  features?: string[];
  bgColor?: string;
  borderColor?: string;
  isGold?: boolean;
  discountText?: string;
}) => (
  <Card
    sx={{
      border: `2px solid ${borderColor}`,
      borderRadius: 2,
      p: 2.5,
      height: '100%',
      bgcolor: bgColor,
      position: 'relative',
    }}
  >
    <Typography variant="h6" fontWeight={700} mb={1}>
      {title}
    </Typography>
    <Typography variant="h4" fontWeight={700} mb={1}>
      {price} <span style={{ fontSize: '1.2rem' }}>AED</span>
    </Typography>
    {isUnlimited ? (
      <Typography variant="body2" color="primary" fontWeight={600} mb={1}>
        Unlimited Sessions
      </Typography>
    ) : sessions > 0 ? (
      <Typography variant="body2" color="primary" fontWeight={600} mb={1}>
        {sessions} {sessions === 1 ? 'Session' : 'Sessions'}
      </Typography>
    ) : null}
    {description && (
      <Typography variant="body2" color="text.secondary" mb={2.5}>
        {description}
      </Typography>
    )}

    {isGold && (
      <Box
        sx={{
          bgcolor: '#fff3e0',
          color: '#ff6f00',
          px: 2,
          py: 0.8,
          borderRadius: 1,
          mt: 2,
          textAlign: 'center',
        }}
      >
        <Typography variant="body2" fontWeight={600}>
          {discountText}
        </Typography>
      </Box>
    )}
  </Card>
);

export default TrainerDetailsPage;
