import { useEffect } from 'react';
// @mui
import { Typography, Box, Stack, Card, Grid } from '@mui/material';
// components
import { useGetAllCities } from 'src/api/city.tsx';
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';

// ----------------------------------------------------------------------

export default function CityDetails({ onEdit, city }) {
  const renderContent = (
    <Stack component={Card} spacing={3} sx={{ p: 3 }}>
      <Stack
        alignItems="end"
        sx={{
          width: '-webkit-fill-available',
          cursor: 'pointer',
          position: 'absolute',
          right: '1rem',
        }}
      >
        <Iconify icon="solar:pen-bold" onClick={onEdit} sx={{ cursor: 'pointer' }} />
      </Stack>
      <Stack
        spacing={1}
        alignItems={{ xs: 'center', md: 'center' }}
        direction={{
          xs: 'column',
          md: 'row',
        }}
        sx={{
          p: 2.5,
        }}
      >
        <Grid item xs={12} sm={8} md={8}>
          <Scrollbar>
            <Stack spacing={1} alignItems="flex-start" sx={{ typography: 'body2', pb: 2 }}>
              {[
                { label: 'City ID', value: city?.id ?? 'N/A' },
                { label: 'City Name', value: city?.city_translations[0]?.name ?? 'N/A' },
                { label: 'Locale', value: city?.city_translations[0]?.locale ?? 'N/A' },
                {
                  label: 'Published',
                  value: (
                    <Typography
                      variant="body2"
                      sx={{
                        color: city?.is_published === '1' ? 'success.main' : 'error.main',
                        fontWeight: 'bold',
                      }}
                    >
                      {city?.is_published === '1' ? 'Yes' : 'No'}
                    </Typography>
                  ),
                },
              ].map((item, index) => (
                <Box key={index} sx={{ display: 'flex', width: '100%' }}>
                  <Box component="span" sx={{ minWidth: '200px', fontWeight: 'bold' }}>
                    {item.label}
                  </Box>
                  <Box component="span" sx={{ minWidth: '100px', fontWeight: 'bold' }}>
                    :
                  </Box>
                  <Box component="span" sx={{ flex: 1 }}>
                    {item.value ?? 'N/A'}
                  </Box>
                </Box>
              ))}
            </Stack>
          </Scrollbar>
        </Grid>
      </Stack>
    </Stack>
  );

  return renderContent;
}
