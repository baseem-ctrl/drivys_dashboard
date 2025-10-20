/* eslint-disable no-else-return */
import React from 'react';
import { Card, CardContent, Typography, Box, Stack } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
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
  features: string[] | string;
  flagUrl?: string;
  onSelect: () => void;
  background?: string;
  selected?: boolean;
  offerDetails?: OfferDetails | null;
}

const getPackageBackground = (title: string) => {
  const normalizedTitle = title.trim().toLowerCase();

  if (normalizedTitle.includes('unlimited')) {
    return '#e9d5ff';
  } else if (normalizedTitle.includes('silver')) {
    return '#e8e8e8';
  } else if (normalizedTitle.includes('bronze')) {
    return '#f5e6d3';
  } else if (normalizedTitle.includes('gold')) {
    return '#fef3c7';
  } else if (normalizedTitle.includes('starter')) {
    return '#dbeafe';
  } else {
    return '#f5f5f5';
  }
};

const PackageCard: React.FC<PackageCardProps> = ({
  title,
  sessions,
  price,
  currency = '',
  features,
  onSelect,

  selected = false,
  offerDetails,
}) => {
  const { t } = useTranslation();

  const hasOffer =
    offerDetails &&
    offerDetails.offer_price &&
    new Date(offerDetails.offer_valid_until) > new Date();

  const bgColor = getPackageBackground(title);

  return (
    <Card
      onClick={onSelect}
      sx={{
    backgroundColor: bgColor,
    borderRadius: 4,
    border: selected ? '3px solid #f97316' : '2px solid transparent',
    width: '100%',
    maxWidth: 340,
    boxShadow: selected ? '0 4px 12px rgba(249, 115, 22, 0.2)' : '0 2px 8px rgba(0,0,0,0.08)',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    position: 'relative',
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: '0 8px 16px rgba(0,0,0,0.12)',
    },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        {/* Header */}
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h6" fontWeight={700} sx={{ color: '#1f2937' }}>
            {title}
          </Typography>

          {/* Selection Indicator */}
          <Box
            sx={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              border: selected ? '2px solid #f97316' : '2px solid #d1d5db',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: selected ? '#f97316' : 'transparent',
              transition: 'all 0.2s ease',
            }}
          >
            {selected && (
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  bgcolor: 'white',
                }}
              />
            )}
          </Box>
        </Box>

        {/* Price Section */}
        <Box mb={2}>
          {hasOffer ? (
            <Box display="flex" alignItems="baseline" gap={1} mb={0.5}>
              <Typography
                variant="body2"
                sx={{ textDecoration: 'line-through', color: '#6b7280' }}
              >
                {price} {currency}
              </Typography>
              <Typography variant="h4" fontWeight={800} sx={{ color: '#1f2937' }}>
                {offerDetails.offer_price} {currency}
              </Typography>
            </Box>
          ) : (
            <Typography variant="h4" fontWeight={800} sx={{ color: '#1f2937' }}>

            </Typography>
          )}
        </Box>

        {/* Features */}
        <Stack spacing={1.5}>
          {features && typeof features === 'string' ? (
            <Box
              sx={{
                '& p': { margin: 0, fontSize: '0.875rem', color: '#1f2937' },
                '& ol, & ul': { paddingLeft: '0', listStyle: 'none', margin: 0 },
                '& li': {
                  marginBottom: '8px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px',
                  '&::before': {
                    content: '"✓"',
                    color: '#1f2937',
                    fontWeight: 700,
                    fontSize: '16px',
                    flexShrink: 0,
                  },
                },
              }}
              dangerouslySetInnerHTML={{ __html: features }}
            />
          ) : Array.isArray(features) ? (
            features.map((feature, idx) => (
              <Box key={idx} display="flex" alignItems="flex-start" gap={1}>
                <CheckIcon sx={{ color: '#1f2937', fontSize: 20, mt: 0.2, flexShrink: 0 }} />
                <Typography variant="body2" sx={{ color: '#1f2937' }}>
                  {feature}
                </Typography>
              </Box>
            ))
          ) : null}
        </Stack>

        {/* Offer Validity */}
        {hasOffer && (
          <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid rgba(0,0,0,0.1)' }}>
            <Typography variant="caption" sx={{ color: '#f97316', fontWeight: 600 }}>
              🎉 {t('valid_until')}: {new Date(offerDetails.offer_valid_until).toLocaleDateString()}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default PackageCard;
