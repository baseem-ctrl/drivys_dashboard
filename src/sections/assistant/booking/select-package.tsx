import React from 'react';
import { Card, CardContent, Typography, Button, Box, Stack, Chip } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useTranslation } from 'react-i18next';

interface OfferDetails {
  offer_price: number;
  discount_type: 'percentage' | 'flat';
  discount_value: number;
  offer_valid_until: string;
}

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
  offerDetails?: OfferDetails | null;
}

const PackageCard: React.FC<PackageCardProps> = ({
  title,
  sessions,
  price,
  currency = 'AED',
  features,
  onSelect,
  background,
  selected = false,
  offerDetails,
}) => {
  const { t } = useTranslation();
  console.log('features', features);
  const hasOffer =
    offerDetails &&
    offerDetails.offer_price &&
    new Date(offerDetails.offer_valid_until) > new Date();

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
        {/* Title + Sessions */}
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6" fontWeight={600}>
            {title}{' '}
            <Typography component="span" fontWeight={400}>
              ({sessions === -1 ? t('unlimited_sessions') : `${sessions} ${t('sessions')}`})
            </Typography>
          </Typography>
        </Box>

        {/* Price Section */}
        <Box mt={2} mb={1} display="flex" gap="8px" alignItems="center">
          {hasOffer ? (
            <>
              <Typography variant="body1" sx={{ textDecoration: 'line-through', opacity: 0.7 }}>
                {price} {currency}
              </Typography>
              <Typography variant="h4" fontWeight={700} color="secondary">
                {offerDetails.offer_price} {currency}
              </Typography>
              <Chip
                label={
                  offerDetails.discount_type === 'percentage'
                    ? `${offerDetails.discount_value}% OFF`
                    : `${currency} ${offerDetails.discount_value} OFF`
                }
                color="success"
                size="small"
                sx={{ fontWeight: 600 }}
              />
            </>
          ) : (
            <>
              <Typography variant="h4" fontWeight={700}>
                {price}
              </Typography>
              <Typography fontSize="14px">{currency}</Typography>
            </>
          )}
        </Box>

        {/* Offer Validity */}
        {hasOffer && (
          <Typography variant="caption" sx={{ color: '#ffeb3b' }}>
            {t('valid_until')}: {new Date(offerDetails.offer_valid_until).toLocaleDateString()}
          </Typography>
        )}

        {/* Features */}
        <Typography mt={2} fontWeight={500}>
          {t('whats_included')}
        </Typography>
        <Box
          mt={1}
          sx={{
            '& p': { margin: 0, fontSize: '0.9rem', color: '#fff' },
            '& ol': { paddingLeft: '20px' },
            '& li': { marginBottom: '4px' },
          }}
          dangerouslySetInnerHTML={{ __html: features }}
        />
        {/* <Stack spacing={1} mt={1}>
          {features.map((feature, idx) => (
            <Box key={idx} display="flex" alignItems="center" gap={1}>
              <CheckCircleIcon sx={{ color: '#00e676', fontSize: 20 }} />
              <Typography variant="body2">{feature}</Typography>
            </Box>
          ))}
        </Stack> */}

        {/* Action Button */}
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
              {t('selected')}
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
              {t('select_package')}
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default PackageCard;
