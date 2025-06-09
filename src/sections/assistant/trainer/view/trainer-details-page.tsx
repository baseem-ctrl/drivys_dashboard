import React from 'react';
import {
  Box,
  Typography,
  Avatar,
  Chip,
  Rating,
  LinearProgress,
  CircularProgress,
} from '@mui/material';
import StarIcon from '@mui/icons-material/Star';

import { useGetTrainerList } from 'src/api/assistant';
import { useTranslation } from 'react-i18next';
import DriveEtaIcon from '@mui/icons-material/DriveEta';
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import LanguageIcon from '@mui/icons-material/Language';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';

interface TrainerProfileProps {
  trainer_id: number;
}

const TrainerDeatilsPage: React.FC<TrainerProfileProps> = ({ trainer_id }) => {
  const { trainers, trainerListLoading, trainerListError } = useGetTrainerList({
    trainer_id: String(trainer_id),
  });
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
        <Typography color="error">Failed to load trainer profile.</Typography>
      </Box>
    );
  }

  const rawBreakdown = trainer?.user?.rating_breakdown || {};
  const ratingBreakdown = [
    rawBreakdown['5_star'] ?? 0,
    rawBreakdown['4_star'] ?? 0,
    rawBreakdown['3_star'] ?? 0,
    rawBreakdown['2_star'] ?? 0,
    rawBreakdown['1_star'] ?? 0,
  ];
  const totalRatings = ratingBreakdown.reduce((a: number, b: number) => a + b, 0);
  const validReviews = Array.isArray(trainer?.user?.review)
    ? trainer.user.review.filter((r: any) => r.rating !== null || r.comment)
    : [];

  function getEmojiFlag(countryCode) {
    return countryCode
      .toUpperCase()
      .replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt(0)));
  }
  return (
    <Box color="black" p={2} borderRadius={3} width="100%" mx="auto">
      <Box
        mt={3}
        display="flex"
        flexDirection="column"
        alignItems="center"
        p={3}
        borderRadius="16px"
        boxShadow={3}
        sx={{ background: 'linear-gradient(to right, #ffffff, #f5f5f5)' }}
      >
        <Avatar
          src={trainer?.user?.photo_url}
          alt={trainer?.user?.name}
          sx={{ width: 100, height: 100, border: '1px solid #F37421' }}
        />
        <Box display="flex" alignItems="center" mt={1}>
          <StarIcon fontSize="small" sx={{ color: '#FFD700' }} />
          <Typography ml={0.5}>
            {(trainer?.rating ?? 0).toFixed(1)} ({trainer?.user?.rating_count ?? 0})
          </Typography>
        </Box>

        <Typography variant="h6" mt={1} color="black">
          {trainer?.user?.name}
        </Typography>
        <Typography variant="body2" color="black" sx={{ fontSize: '12px' }}>
          {trainer?.user?.vendor?.vendor_translations?.[0]?.name}
        </Typography>
        <Chip
          label={trainer?.user?.is_active ? 'Available' : 'Unavailable'}
          size="medium"
          color="primary"
          sx={{ mt: 1 }}
        />
      </Box>

      {/* About */}
      <Box mt={3}>
        <Typography fontWeight={600} mb={1} color="black">
          {t('about_label')}
        </Typography>

        <Typography variant="body2" color="gray">
          {i18n.language === 'ar'
            ? trainer.user?.user_preference?.bio_ar ?? 'N/A'
            : trainer.user?.user_preference?.bio ?? 'N/A'}
        </Typography>
      </Box>

      <Box
        mt={3}
        px={2}
        py={3}
        sx={{
          borderTop: '1px solid #CF5A0D',
          borderBottom: '1px solid #CF5A0D',
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: { xs: 'center', sm: 'space-between' },
          alignItems: 'center',
          gap: { xs: 3, sm: 0 },
          flexWrap: 'wrap',
        }}
      >
        <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
          <PrecisionManufacturingIcon sx={{ fontSize: 42, color: 'grey' }} />
          <Typography variant="h6" color="grey">
            {t('Gear')}
          </Typography>
          <Chip
            label={trainer.gear}
            sx={{
              px: 3,
              backgroundColor: '#f8d9c5',
              color: '#804820',
              fontWeight: 600,
              borderRadius: '24px',
            }}
          />
        </Box>

        <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
          <DriveEtaIcon sx={{ fontSize: 42, color: 'grey' }} />
          <Typography variant="h6" color="grey">
            {t('Car')}
          </Typography>
          <Chip
            label={
              trainer.user?.user_preference?.vehicle_type?.category_translations?.find(
                (item) => item.locale.toLowerCase() === i18n.language.toLowerCase()
              )?.name || 'N/A'
            }
            sx={{
              px: 3,
              backgroundColor: '#f8d9c5',
              color: '#804820',
              fontWeight: 600,
              borderRadius: '24px',
            }}
          />
        </Box>

        <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
          <LocationCityIcon sx={{ fontSize: 42, color: 'grey' }} />
          <Typography variant="h6" color="grey">
            {t('city')}
          </Typography>
          <Chip
            label={`${
              trainer.user?.user_preference?.city?.city_translations?.find(
                (item) => item.locale.toLowerCase() === i18n.language.toLowerCase()
              )?.name || 'N/A'
            } - ${
              trainer.user?.user_preference?.state_province?.translations?.find(
                (item) => item.locale.toLowerCase() === i18n.language.toLowerCase()
              )?.name || 'N/A'
            }`}
            sx={{
              px: 3,
              backgroundColor: '#f8d9c5',
              color: '#804820',
              fontWeight: 600,
              borderRadius: '24px',
            }}
          />
        </Box>
      </Box>
      <Box display="flex" alignItems="center" gap={1} minWidth={100} mt={3}>
        <LanguageIcon sx={{ fontSize: 32, color: 'grey' }} />
        <Typography variant="h6" color="grey" sx={{ fontSize: 18 }}>
          {t('language')}
        </Typography>
      </Box>

      <Box
        mt={3}
        px={2}
        py={3}
        sx={{
          borderBottom: '1px solid #CF5A0D',
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: { xs: 'center', sm: 'space-between' },
          alignItems: 'center',
          gap: { xs: 3, sm: 2 },
          flexWrap: 'wrap',
        }}
      >
        {/* Languages List */}
        {trainer?.user?.languages?.map((langObj, index) => {
          const languageName = langObj.dialect?.language_name || 'Unknown';
          const countryCode = langObj.dialect?.country_code || 'US';
          const emojiFlag = getEmojiFlag(countryCode);

          return (
            <Box
              key={index}
              display="flex"
              alignItems="center"
              gap={1}
              px={2}
              py={1}
              minWidth={130}
              borderRadius="24px"
              bgcolor="#f8d9c5"
              sx={{
                boxShadow: '0px 2px 6px rgba(0,0,0,0.2)',
              }}
            >
              <Typography sx={{ fontSize: 21 }}>{emojiFlag}</Typography>
              <Chip
                label={languageName}
                sx={{
                  fontWeight: 600,
                  backgroundColor: 'transparent',
                  color: '#804820',
                  padding: 0,
                  cursor: 'default',
                }}
              />
            </Box>
          );
        })}
      </Box>

      <Box mt={3} p={2} sx={{ paddingBottom: 3, borderBottom: '1px solid #CF5A0D' }}>
        <Box display="flex" alignItems="center" gap={1} mb={1}>
          <DirectionsCarIcon sx={{ fontSize: 32, color: 'grey' }} />
          <Typography fontWeight={600} variant="h6" color="grey" sx={{ fontSize: 18 }}>
            {t('pickup')}
          </Typography>
        </Box>
        <Typography variant="body2" color="grey" mb={2} textAlign="center">
          {t('this_option_is_for')}{' '}
        </Typography>

        <Box mt={2}>
          {trainer?.user?.user_preference?.is_pickup_enabled ? (
            <Box
              display="flex"
              alignItems="center"
              sx={{
                backgroundColor: '#e7f8ed',
                color: '#14532d',
                px: 2,
                py: 1,
                fontWeight: 600,
                width: 'fit-content',
                mx: 'auto',
              }}
            >
              <Typography fontSize="14px" fontWeight={600}>
                {t('pickup_option_available')}
              </Typography>

              <CheckCircleIcon sx={{ fontSize: 18, ml: 1 }} />
            </Box>
          ) : (
            <Box
              display="flex"
              alignItems="center"
              sx={{
                backgroundColor: '#fbeaea',
                color: '#7f1d1d',
                px: 2,
                py: 1,
                fontWeight: 600,
                width: 'fit-content',
                mx: 'auto',
              }}
            >
              <Typography fontSize="14px" fontWeight={600} textAlign="center">
                {t('pickup_option_not_available')}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      <Box mt={3}>
        <Typography fontWeight={600} mb={1}>
          {t('ratings_label')}
        </Typography>

        {totalRatings === 0 ? (
          <Typography variant="body2" color="gray">
            {t('no_reviews')}
          </Typography>
        ) : (
          <Box>
            {[5, 4, 3, 2, 1].map((star, index) => (
              <Box key={star} display="flex" alignItems="center" gap={1} mb={1}>
                <Typography width={60}>{star} Star</Typography>
                <LinearProgress
                  variant="determinate"
                  value={(ratingBreakdown[5 - star] / totalRatings) * 100}
                  sx={{
                    flex: 1,
                    height: 8,
                    borderRadius: 5,
                    backgroundColor: '#cdcdcd',
                    '& .MuiLinearProgress-bar': '#CF5A0D',
                  }}
                />
                <Typography width={20} textAlign="right">
                  {ratingBreakdown[5 - star]}
                </Typography>
              </Box>
            ))}
          </Box>
        )}
      </Box>

      <Box mt={4} sx={{ borderTop: '1px solid #CF5A0D', paddingTop: 2 }}>
        <Typography fontWeight={600} mb={1}>
          {t('reviews_label')}
        </Typography>

        {validReviews.length === 0 ? (
          <Typography variant="body2" color="gray" textAlign="center">
            {t('no_reviews_available')}
          </Typography>
        ) : (
          validReviews.map((review: any, index: number) => (
            <Box key={index} mb={2}>
              <Typography fontWeight={600}>{review.student || 'Anonymous'}</Typography>
              {review.rating !== null && <Rating value={review.rating} readOnly size="small" />}
              <Typography variant="body2" color="gray">
                {review.date || 'N/A'}
              </Typography>
              {review.comment && <Typography variant="body2">{review.comment}</Typography>}
            </Box>
          ))
        )}
      </Box>
    </Box>
  );
};

export default TrainerDeatilsPage;
