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

const PackageCard: React.FC<PackageCardProps> = ({
  title,
  sessions,
  price,
  currency = 'AED',
  features,
  onSelect,
  background = '#1e293b',
  selected = false,
}) => {
  return (
    <Card
      sx={{
        background,
        color: '#fff',
        borderRadius: 3,
        border: '1px solid #333',
        width: 280,
        // mx: 'auto',
        boxShadow: 4,
        transition: 'transform 0.3s ease',
        '&:hover': { transform: 'scale(1.03)' },
      }}
    >
      <CardContent>
        <Typography fontWeight={600} sx={{ fontSize: '12px' }}>
          {title}{' '}
          <Typography component="span" fontWeight={400} sx={{ fontSize: '12px' }}>
            ({sessions === -1 ? 'Unlimited Sessions' : `${sessions} Sessions`})
          </Typography>
        </Typography>

        <Box mt={1} mb={1} display="flex" alignItems="center" gap={1}>
          <Typography fontWeight={700} sx={{ fontSize: '12px' }}>
            {price}
          </Typography>
          <Typography fontSize="12px">{currency}</Typography>
        </Box>

        {/* <Typography mt={1} fontWeight={500} sx={{ fontSize: '12px' }}>
          What’s included?
        </Typography> */}

        <Stack spacing={1} mt={1}>
          {features.map((f, i) => (
            <Box key={i} display="flex" alignItems="center" gap={1}>
              <CheckCircleIcon sx={{ color: '#00e676', fontSize: 12 }} />
              <Typography sx={{ fontSize: '12px' }}>{f}</Typography>
            </Box>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default PackageCard;
