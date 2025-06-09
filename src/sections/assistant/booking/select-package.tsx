import React from 'react';
import { Card, CardContent, Typography, Button, Box, Stack, Avatar } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

interface PackageCardProps {
  title: string;
  sessions: number;
  price: number;
  currency?: string;
  features: string[];
  flagUrl?: string;
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
  flagUrl,
  onSelect,
  background,
  selected = false,
}) => {
  return (
    <Card
      sx={{
        background: background,
        color: '#fff',
        borderRadius: 3,
        border: '1px solid #333',
        width: 320,
        mx: 'auto',
        boxShadow: 4,
        transition: 'transform 0.3s ease',
        '&:hover': { transform: 'scale(1.03)' },
      }}
    >
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6" fontWeight={600}>
            {title}
            <Typography component="span" fontWeight={400}>
              {' '}
              ({sessions === -1 ? 'Unlimited Sessions' : `${sessions} Sessions`})
            </Typography>
          </Typography>
        </Box>

        <Box mt={2} mb={1} display="flex" gap="8px" alignItems="center">
          <Typography variant="h4" fontWeight={700}>
            {price}
          </Typography>
          <Typography fontSize="14px">{currency}</Typography>
        </Box>

        <Typography mt={2} fontWeight={500}>
          What’s included?
        </Typography>

        <Stack spacing={1} mt={1}>
          {features.map((feature, idx) => (
            <Box key={idx} display="flex" alignItems="center" gap={1}>
              <CheckCircleIcon sx={{ color: '#00e676', fontSize: 20 }} />
              <Typography variant="body2">{feature}</Typography>
            </Box>
          ))}
        </Stack>

        <Box mt={3} textAlign="center">
          {selected ? (
            <Button
              variant="contained"
              disabled
              sx={{
                backgroundColor: '#444',
                px: 4,
                borderRadius: 9999,
                textTransform: 'none',
                fontWeight: 600,
              }}
            >
              Selected
            </Button>
          ) : (
            <Button
              onClick={onSelect}
              variant="contained"
              sx={{
                backgroundColor: '#f97316',
                '&:hover': { backgroundColor: '#fb923c' },
                px: 4,
                borderRadius: 9999,
                textTransform: 'none',
                fontWeight: 600,
              }}
            >
              Select Package
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default PackageCard;
