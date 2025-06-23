import React, { useState } from 'react';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import RoomIcon from '@mui/icons-material/Room';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import PlaceIcon from '@mui/icons-material/Place';
import PublicIcon from '@mui/icons-material/Public';

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
  FormControl,
  FormControlLabel,
  RadioGroup,
  Paper,
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ApartmentIcon from '@mui/icons-material/Apartment';
import { useTranslation } from 'react-i18next';

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
  selectedTrainer: any;
}

const AddressSelector: React.FC<AddressSelectorProps> = ({
  locations,
  setPickupLocationSelected,
  pickupLocationSelected,
  selectedTrainer,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const [pickupMode, setPickupMode] = useState<'pickup' | 'driver'>('driver');
  const defaultAddress = selectedTrainer?.user?.user_addresses?.find(
    (addr: any) => addr.is_default
  );

  return (
    <>
      <Box mt={4} mb={4}>
        <Paper
          elevation={3}
          sx={{
            p: 3,
            borderRadius: 3,
            backgroundColor: '#f9f9f9',
            border: '1px solid #ddd',
          }}
        >
          <Typography fontWeight={600} mb={2} sx={{ fontSize: '18px' }}>
            {t('pickup_option')}
          </Typography>

          <FormControl component="fieldset" fullWidth>
            <RadioGroup
              row
              value={pickupMode}
              onChange={(e) => setPickupMode(e.target.value as 'pickup' | 'driver')}
              sx={{ gap: 2 }}
            >
              <FormControlLabel
                value="driver"
                control={<Radio />}
                label={
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <DirectionsCarIcon color="primary" />
                    <Typography variant="body2">{t('go_to_driver_location')}</Typography>
                  </Stack>
                }
              />

              <FormControlLabel
                value="pickup"
                control={<Radio />}
                label={
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <RoomIcon color="primary" />
                    <Typography variant="body2">{t('pick_me_up')}</Typography>
                  </Stack>
                }
              />
            </RadioGroup>
          </FormControl>
        </Paper>
      </Box>
      {/* Conditional content */}
      {pickupMode === 'pickup' ? (
        <>
          <Typography fontWeight={600} mb={2} sx={{ fontSize: '17px' }}>
            {t('select_pickup_address')}
          </Typography>

          <Grid container spacing={2}>
            {locations.map((address) => {
              const city = address.city_id_city?.city_translations?.find(
                (c: any) => c.locale === 'En'
              )?.name;
              const state = address.state_province?.translations?.find(
                (s: any) => s.locale === 'En'
              )?.name;

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
      ) : (
        <Box mt={4}>
          <Typography fontWeight={600} fontSize={18} mb={2}>
            {t('driver_location')}
          </Typography>
          {defaultAddress ? (
            <Box
              sx={{
                p: 3,
                borderRadius: 3,
                boxShadow: 3,
                backgroundColor: '#ffffff',
                border: '1px solid #e0e0e0',
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                <HomeWorkIcon color="primary" fontSize="small" />
                <Typography fontWeight={600} color="text.primary">
                  {defaultAddress?.building_name || t('n/a')}
                </Typography>
              </Stack>

              {defaultAddress?.street && (
                <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                  <LocationOnIcon color="action" fontSize="small" />
                  <Typography variant="body2" color="text.secondary">
                    {defaultAddress.street}
                  </Typography>
                </Stack>
              )}

              {defaultAddress?.landmark && (
                <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                  <PlaceIcon color="action" fontSize="small" />
                  <Typography variant="body2" color="text.secondary">
                    {t('landmark')}: {defaultAddress.landmark}
                  </Typography>
                </Stack>
              )}

              {(defaultAddress?.city ||
                defaultAddress?.city_id_city?.city_translations?.find((c: any) => c.locale === 'En')
                  ?.name) && (
                <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                  <ApartmentIcon color="action" fontSize="small" />
                  <Typography variant="body2" color="text.secondary">
                    {t('city')}:
                    {defaultAddress.city ||
                      defaultAddress.city_id_city?.city_translations?.find(
                        (c: any) => c.locale === 'En'
                      )?.name}
                  </Typography>
                </Stack>
              )}

              {defaultAddress?.state_province?.translations?.find((s: any) => s.locale === 'En')
                ?.name && (
                <Stack direction="row" alignItems="center" spacing={1}>
                  <PublicIcon color="action" fontSize="small" />
                  <Typography variant="body2" color="text.secondary">
                    {t('state')}:
                    {
                      defaultAddress.state_province.translations.find((s: any) => s.locale === 'En')
                        ?.name
                    }
                  </Typography>
                </Stack>
              )}
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary">
              {t('no_address_available')}
            </Typography>
          )}
        </Box>
      )}
    </>
  );
};

export default AddressSelector;
