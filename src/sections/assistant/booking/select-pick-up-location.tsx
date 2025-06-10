import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Stack,
  Grid,
  Radio,
  useTheme,
  Divider,
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ApartmentIcon from '@mui/icons-material/Apartment';

const getIcon = (label: string) => {
  switch (label?.toUpperCase()) {
    case 'HOME':
      return <HomeIcon color="primary" />;
    case 'OFFICE':
      return <ApartmentIcon sx={{ color: '#9c27b0' }} />;
    default:
      return <LocationOnIcon sx={{ color: 'text.secondary' }} />;
  }
};

interface AddressSelectorProps {
  locations: any[];
  setPickupLocationSelected: (id: number) => void;
  pickupLocationSelected: number;
}

const AddressSelector: React.FC<AddressSelectorProps> = ({
  locations,
  setPickupLocationSelected,
  pickupLocationSelected,
}) => {
  const theme = useTheme();

  return (
    <>
      <Typography fontWeight={600} mb={2} mt={4} sx={{ fontSize: '17px' }}>
        Select a Pickup Address
      </Typography>
      <Grid container spacing={2}>
        {locations.map((address) => {
          const city = address.city_id_city?.city_translations?.find((c: any) => c.locale === 'En')
            ?.name;
          const state = address.state_province?.translations?.find((s: any) => s.locale === 'En')
            ?.name;

          const selected = address.id === pickupLocationSelected;

          return (
            <Grid item xs={12} sm={6} md={4} key={address.id}>
              <Card
                variant="outlined"
                onClick={() => setPickupLocationSelected(address.id)}
                sx={{
                  borderRadius: 3,
                  borderColor: selected ? theme.palette.primary.main : 'grey.300',
                  boxShadow: selected ? 4 : 1,
                  cursor: 'pointer',
                  transition: '0.2s ease',
                  p: 0,
                  '&:hover': {
                    borderColor: theme.palette.primary.main,
                    boxShadow: 3,
                  },
                }}
              >
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Radio checked={selected} />
                    {getIcon(address.label)}
                    <Typography fontWeight={600} fontSize={12}>
                      {address.label || 'Address'}
                    </Typography>
                  </Stack>

                  <Divider sx={{ my: 1.5 }} />

                  <Box pl={4}>
                    {address.street && (
                      <Typography sx={{ fontSize: '12px' }} color="text.primary">
                        {address.street}
                      </Typography>
                    )}
                    {city && (
                      <Typography sx={{ fontSize: '12px' }} color="text.secondary">
                        {city}
                      </Typography>
                    )}
                    {state && (
                      <Typography sx={{ fontSize: '12px' }} color="text.secondary">
                        {state}
                      </Typography>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </>
  );
};

export default AddressSelector;
