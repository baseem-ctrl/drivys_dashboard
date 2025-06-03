import React from 'react';
import { Box, FormControl, InputLabel, Select, MenuItem, Typography } from '@mui/material';

interface Address {
  id: number;
  street: string | null;
  city_id_city: {
    city_translations: { locale: string; name: string }[];
  };
}

interface PickupLocationStepProps {
  pickupLocation: Address[];
  setPickupLocation: (locationId: number) => void;
  pickupLocationSelected: any;
  setPickupLocationSelected: any;
}

export default function PickupLocationStep({
  pickupLocation,
  setPickupLocation,
  pickupLocationSelected,
  setPickupLocationSelected,
}: PickupLocationStepProps) {
  const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setPickupLocationSelected(event.target.value as number);
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Select Pickup Location
      </Typography>

      <FormControl fullWidth>
        <InputLabel id="pickup-location-label">Pickup Location</InputLabel>
        <Select
          labelId="pickup-location-label"
          value={pickupLocationSelected ?? ''}
          onChange={handleChange}
          label="Pickup Location"
        >
          {pickupLocation.map((loc) => {
            const cityName =
              loc.city_id_city.city_translations.find((t) => t.locale === 'En')?.name || 'N/A';
            const streetName = loc.street ?? 'N/A';
            const label = `${streetName} / ${cityName}`;

            return (
              <MenuItem key={loc.id} value={loc.id}>
                {label}
              </MenuItem>
            );
          })}
        </Select>
      </FormControl>
    </Box>
  );
}
