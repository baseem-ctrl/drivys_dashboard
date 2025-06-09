import React from 'react';
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Stack,
  Divider,
  Rating,
} from '@mui/material';
import { useTranslation } from 'react-i18next';

type Trainer = {
  name: string;
  email: string;
  phone: string;
  photo: string;
  dob: string;
  is_active: boolean;
  gender: string;
};

type TrainerProfileCardProps = {
  row: Trainer;
};

const TrainerProfileCard: React.FC<TrainerProfileCardProps> = ({ row }) => {
  const { i18n } = useTranslation();
  const locale = i18n.language;
  return (
    <Card
      sx={{
        width: '100%',
        height: 440,
        borderRadius: 5,
        padding: 0,
        boxShadow: 4,
        overflow: 'hidden',
        textAlign: 'center',
        backgroundColor: '#fff',
      }}
    >
      <Box
        sx={{
          height: 140,
          background: 'linear-gradient(to right, #e36c1e, #e99562, #FF9E57)',
          position: 'relative',
        }}
      >
        <Chip
          label={row?.user?.is_active ? 'Active' : 'Inactive'}
          size="small"
          variant="outlined"
          sx={{
            position: 'absolute',
            top: 15,
            right: 15,
            zIndex: 11,
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            color: row?.user?.is_active ? '#388e3c' : '#d32f2f',
            borderColor: 'rgba(255, 255, 255, 0.6)',
            fontWeight: 600,
            backdropFilter: 'blur(6px)',
            boxShadow: 1,
          }}
        />

        <Avatar
          src={row?.user?.photo_url}
          alt={row?.user?.name}
          sx={{
            width: 100,
            height: 100,
            border: '4px solid white',
            position: 'absolute',
            bottom: -50,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 10,
          }}
        />
      </Box>

      <CardContent sx={{ mt: 4 }}>
        <Typography fontWeight={200} sx={{ fontSize: '16px' }}>
          {row?.user?.name}
        </Typography>
        <Typography sx={{ fontSize: '13px' }} color="text.secondary" fontWeight={200}>
          {row?.user?.user_preference?.city?.city_translations?.find(
            (t) => t?.locale?.toLowerCase() === i18n.language.toLowerCase()
          )?.name ||
            row?.city?.city_translations?.[0]?.name ||
            'N/A'}
        </Typography>

        <Divider
          sx={{
            width: '100%',
            mx: 'auto',
            my: 2,
            borderColor: '#e53935',
            borderBottomWidth: 2,
          }}
        />

        <Stack spacing={1} mt={2} px={2}>
          <Typography sx={{ fontSize: '13px' }}>
            <strong>School:</strong>{' '}
            {row?.vendor?.vendor_translations?.find(
              (t) => t?.locale?.toLowerCase() === i18n.language.toLowerCase()
            )?.name ||
              row?.vendor?.vendor_translations?.[0]?.name ||
              'N/A'}
          </Typography>
          <Typography sx={{ fontSize: '13px' }}>
            <strong>Category:</strong>{' '}
            {row?.user?.user_preference?.vehicle_type?.category_translations?.find(
              (t) => t?.locale?.toLowerCase() === i18n.language.toLowerCase()
            )?.name ||
              row?.user?.user_preference?.vehicle_type?.category_translations?.[0]?.name ||
              'N/A'}{' '}
          </Typography>
          <Typography sx={{ fontSize: '13px' }}>
            <strong>Type:</strong> {row?.gear || 'N/A'}
          </Typography>
          <Typography sx={{ fontSize: '13px' }}>
            <strong>Languages:</strong>{' '}
            {row?.user?.languages?.length > 0
              ? row.user.languages
                  .map((lang: any) => lang.dialect?.language_name)
                  .filter(Boolean)
                  .join(', ')
              : 'N/A'}
          </Typography>

          <Typography
            sx={{
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <strong>Rating:</strong>&nbsp;
            <Rating value={row?.rating || 0} precision={0.5} readOnly size="small" />
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default TrainerProfileCard;
