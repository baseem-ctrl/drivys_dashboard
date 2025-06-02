import React from 'react';
import { Avatar, Box, Card, CardContent, Typography, Chip, Stack, Divider } from '@mui/material';

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

const TrainerProfileCard: React.FC<TrainerProfileCardProps> = ({ row }) => (
  <Card
    sx={{
      width: 280,
      height: 390,
      mx: 'auto',
      borderRadius: 5,
      boxShadow: 4,
      overflow: 'hidden',
      textAlign: 'center',
      backgroundColor: '#fff',
    }}
  >
    <Box
      sx={{
        height: 140,
        background: 'linear-gradient(to right, #ff9a8b, #ff6a88, #ff99ac)',
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
        src={row?.user?.photo}
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
        {row?.user?.gender}
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
          <strong>DOB:</strong> {row?.user?.dob}
        </Typography>
        <Typography sx={{ fontSize: '13px' }}>
          <strong>Email:</strong> {row?.user?.email}
        </Typography>
        <Typography sx={{ fontSize: '13px' }}>
          <strong>Phone:</strong> {row?.user?.phone}
        </Typography>
      </Stack>
    </CardContent>
  </Card>
);

export default TrainerProfileCard;
