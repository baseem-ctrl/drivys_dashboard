import React from 'react';
import { Card, CardContent, Typography, Button, Box, Stack } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

interface PackageCardProps {
  title: string;
  sessions: number;
  price: number;
  currency?: string;
  features: string[];
  onSelect: () => void;
  background?: string;
  selected?: boolean;
}

const getPackageBackground = (title: string) => {
  const normalizedTitle = title.trim().toLowerCase();

  if (normalizedTitle.includes('unlimited')) {
    return '#e9d5ff'; // light purple
  } else if (normalizedTitle.includes('silver')) {
    return '#e8e8e8'; // silver gray
  } else if (normalizedTitle.includes('bronze')) {
    return '#f5e6d3'; // bronze tan
  } else if (normalizedTitle.includes('gold')) {
    return '#fef3c7'; // gold cream
  } else if (normalizedTitle.includes('starter')) {
    return '#dbeafe'; // light blue for starter
  } else {
    return '#1e293b'; // fallback dark (your original default)
  }
};

const PackageCard: React.FC<PackageCardProps> = ({
  title,
  sessions,
  price,
  currency = 'AED',
  features,
  onSelect,
  background,
  selected = false,
}) => {
  const bgColor = background || getPackageBackground(title);

  return (
    <Card
      sx={{
        background: bgColor,
        color: '#fff',
        borderRadius: 3,
        border: '1px solid #333',
        width: 280,
        boxShadow: 4,
        transition: 'transform 0.3s ease',
        '&:hover': { transform: 'scale(1.03)' },
      }}
    >
      <CardContent>
        <Typography fontWeight={600} sx={{ fontSize: '16px' }}>
          {title}{' '}
          <Typography component="span" fontWeight={400} sx={{ fontSize: '12px' }}>
            ({sessions === -1 ? 'Unlimited Sessions' : `${sessions} Sessions`})
          </Typography>
        </Typography>

        <Box mt={1} mb={1} display="flex" alignItems="center" gap={1}>
          <Typography fontWeight={700} sx={{ fontSize: '14px' }}>
            {price}
          </Typography>
          <Typography fontSize="14px">{currency}</Typography>
        </Box>

        <Stack spacing={1} mt={1}>
          {features.map((f, i) => (
            <Box key={i} display="flex" alignItems="center" gap={1}>
              <CheckCircleIcon sx={{ color: '#00e676', fontSize: 12 }} />
              <Typography sx={{ fontSize: '12px' }}>{f}</Typography>
            </Box>
          ))}
        </Stack>

        <Box mt={2} display="flex" justifyContent="center">
          <Button
            variant="contained"
            color="primary"
            size="medium"
            onClick={onSelect}
            sx={{ textTransform: 'none', fontSize: '12px', borderRadius: '12px' }}
          >
            Book Now
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default PackageCard;
