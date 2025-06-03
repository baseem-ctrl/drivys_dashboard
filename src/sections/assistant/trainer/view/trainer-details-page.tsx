import React from 'react';
import {
  Box,
  Typography,
  Avatar,
  Chip,
  Button,
  Divider,
  Rating,
  LinearProgress,
  Grid,
  IconButton,
  CircularProgress,
} from '@mui/material';
import AppleIcon from '@mui/icons-material/Apple';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import StarIcon from '@mui/icons-material/Star';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ShareIcon from '@mui/icons-material/Share';
import { useGetTrainerList } from 'src/api/assistant';

interface TrainerProfileProps {
  trainer_id: number;
}

const TrainerDeatilsPage: React.FC<TrainerProfileProps> = ({ trainer_id }) => {
  const { trainers, trainerListLoading, trainerListError } = useGetTrainerList({
    trainer_id: String(trainer_id),
  });
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

  const totalRatings = trainer.ratingBreakdown.reduce((a: number, b: number) => a + b, 0);

  return (
    <Box bgcolor="#1C1C1E" color="white" p={2} borderRadius={3} maxWidth={400} mx="auto">
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <IconButton>
          <ArrowBackIcon style={{ color: 'white' }} />
        </IconButton>
        <img src="/logo.png" alt="Logo" height={30} />
        <IconButton>
          <ShareIcon style={{ color: 'white' }} />
        </IconButton>
      </Box>

      {/* Profile */}
      <Box mt={2} display="flex" flexDirection="column" alignItems="center">
        <Avatar src={trainer.image} alt={trainer.name} sx={{ width: 80, height: 80 }} />
        <Box display="flex" alignItems="center" mt={1}>
          <StarIcon fontSize="small" sx={{ color: '#FFD700' }} />
          <Typography ml={0.5}>
            {trainer.rating.toFixed(1)} ({trainer.totalReviews})
          </Typography>
        </Box>
        <Typography variant="h6" mt={1}>
          {trainer.name}
        </Typography>
        <Typography variant="body2" color="gray">
          {trainer.school}
        </Typography>
        <Chip
          label={trainer.available ? 'Available' : 'Unavailable'}
          color={trainer.available ? 'success' : 'default'}
          size="small"
          sx={{ mt: 1 }}
        />
      </Box>

      {/* About */}
      <Box mt={3}>
        <Typography fontWeight={600} mb={1}>
          About
        </Typography>
        <Typography variant="body2" color="gray">
          {trainer.about}
        </Typography>
      </Box>

      {/* Gear and Car */}
      <Box mt={3} display="flex" justifyContent="space-between">
        <Chip label={trainer.gear} variant="outlined" />
        <Chip label={trainer.car} variant="outlined" />
      </Box>

      {/* Location */}
      <Box mt={3}>
        <Typography fontWeight={600} mb={1}>
          Location
        </Typography>
        <Box display="flex" alignItems="center">
          <LocationOnIcon fontSize="small" />
          <Typography variant="body2" ml={0.5}>
            {trainer.city} - {trainer.area}
          </Typography>
        </Box>
      </Box>

      {/* Languages */}
      <Box mt={3}>
        <Typography fontWeight={600} mb={1}>
          Language Spoken
        </Typography>
        <Box display="flex" flexWrap="wrap" gap={1}>
          {trainer.languages.map((lang: string) => (
            <Chip key={lang} label={lang} variant="outlined" />
          ))}
        </Box>
      </Box>

      {/* Rewards */}
      <Box mt={3} bgcolor="#3E2723" p={2} borderRadius={2}>
        <Box display="flex" alignItems="center" mb={1}>
          <CardGiftcardIcon sx={{ color: 'orange' }} />
          <Typography ml={1}>Reward {trainer.name}</Typography>
        </Box>
        <Box display="flex" gap={1} mb={1}>
          {trainer.rewardOptions.map((amount: number) => (
            <Button key={amount} variant="contained" color="warning" size="small">
              AED {amount}
            </Button>
          ))}
        </Box>
        <Button variant="contained" fullWidth startIcon={<AppleIcon />}>
          Apple Pay
        </Button>
      </Box>

      {/* Pickup Option */}
      <Box mt={3}>
        <Typography fontWeight={600}>Pickup Option</Typography>
        <Box display="flex" alignItems="center" mt={1}>
          <LocalShippingIcon />
          <Typography variant="body2" ml={1}>
            {trainer.pickupAvailable
              ? 'Pickup option is available for this instructor'
              : 'Pickup not available'}
          </Typography>
        </Box>
      </Box>

      {/* Ratings Breakdown */}
      <Box mt={3}>
        <Typography fontWeight={600} mb={1}>
          Ratings
        </Typography>
        <Box>
          {[5, 4, 3, 2, 1].map((star) => (
            <Box key={star} display="flex" alignItems="center">
              <Typography width={40}>{star} Star</Typography>
              <LinearProgress
                variant="determinate"
                value={(trainer.ratingBreakdown[5 - star] / totalRatings) * 100}
                sx={{ width: '100%', mx: 1, height: 8, borderRadius: 5 }}
              />
              <Typography>{trainer.ratingBreakdown[5 - star]}</Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Reviews */}
      <Box mt={3}>
        <Typography fontWeight={600} mb={1}>
          Reviews
        </Typography>
        {trainer.reviews.map((review: any, index: number) => (
          <Box key={index} mb={2}>
            <Typography fontWeight={600}>{review.name}</Typography>
            <Rating value={review.rating} readOnly size="small" />
            <Typography variant="body2" color="gray">
              {review.date}
            </Typography>
            <Typography variant="body2">{review.comment}</Typography>
          </Box>
        ))}
      </Box>

      {/* CTA */}
      <Button
        variant="contained"
        fullWidth
        sx={{ mt: 3, backgroundColor: '#FF6F00', borderRadius: 10 }}
      >
        Book {trainer.name} Now
      </Button>
    </Box>
  );
};

export default TrainerDeatilsPage;
