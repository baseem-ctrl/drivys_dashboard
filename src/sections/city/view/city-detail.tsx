import { useEffect } from 'react';
import { Typography, Box, Stack, Card, Grid } from '@mui/material';
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';

// ----------------------------------------------------------------------

export default function CityDetails({ onEdit, city }) {
  const renderContent = (
    <>
      {city?.city_translations && city.city_translations.length > 0 ? (
        <Grid spacing={3}>
          {city.city_translations.map((translation, index) => (
            <Grid item xs={12} sm={6} md={4} key={index} marginBottom={5}>
              <Stack component={Card} spacing={3} sx={{ p: 3, position: 'relative' }}>
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
                  {/* Add a heading for each detail section */}

                  <Scrollbar>
                    <Stack spacing={2} alignItems="flex-start" sx={{ typography: 'body2' }}>
                      <Box sx={{ p: 2, width: '100%' }}>
                        <Stack spacing={1} sx={{ width: '100%' }}>
                          <Box sx={{ display: 'flex', width: '100%' }}>
                            <Box component="span" sx={{ minWidth: '250px', fontWeight: 'bold' }}>
                              City Name
                            </Box>
                            <Box component="span" sx={{ minWidth: '100px', fontWeight: 'bold' }}>
                              :
                            </Box>
                            <Box component="span" sx={{ flex: 1 }}>
                              {translation.name ?? 'N/A'}
                            </Box>
                          </Box>

                          <Box sx={{ display: 'flex', width: '100%' }}>
                            <Box component="span" sx={{ minWidth: '250px', fontWeight: 'bold' }}>
                              Locale
                            </Box>
                            <Box component="span" sx={{ minWidth: '100px', fontWeight: 'bold' }}>
                              :
                            </Box>
                            <Box component="span" sx={{ flex: 1 }}>
                              {translation.locale ?? 'N/A'}
                            </Box>
                          </Box>
                          <Box sx={{ display: 'flex', width: '100%' }}>
                            <Box component="span" sx={{ minWidth: '250px', fontWeight: 'bold' }}>
                              Maximum Slot
                            </Box>
                            <Box component="span" sx={{ minWidth: '100px', fontWeight: 'bold' }}>
                              :
                            </Box>
                            <Box component="span" sx={{ flex: 1 }}>
                              {city.max_slot ?? 'N/A'}
                            </Box>
                          </Box>

                          <Box sx={{ display: 'flex', width: '100%' }}>
                            <Box component="span" sx={{ minWidth: '250px', fontWeight: 'bold' }}>
                              Published
                            </Box>
                            <Box component="span" sx={{ minWidth: '100px', fontWeight: 'bold' }}>
                              :
                            </Box>
                            <Box component="span" sx={{ flex: 1 }}>
                              <Typography
                                variant="body2"
                                sx={{
                                  color: city.is_published === 1 ? 'success.main' : 'error.main',
                                  fontWeight: 'bold',
                                }}
                              >
                                {city.is_published === 1 ? 'Yes' : 'No'}
                              </Typography>
                            </Box>
                          </Box>
                          <Box sx={{ display: 'flex', width: '100%' }}>
                            <Box component="span" sx={{ minWidth: '250px', fontWeight: 'bold' }}>
                              Certificate Available
                            </Box>
                            <Box component="span" sx={{ minWidth: '100px', fontWeight: 'bold' }}>
                              :
                            </Box>
                            <Box component="span" sx={{ flex: 1 }}>
                              <Typography
                                variant="body2"
                                sx={{
                                  color:
                                    city.is_certificate_available === 1
                                      ? 'success.main'
                                      : 'error.main',
                                  fontWeight: 'bold',
                                }}
                              >
                                {city.is_certificate_available === 1 ? 'Yes' : 'No'}
                              </Typography>
                            </Box>
                          </Box>

                          {city.is_certificate_available === 1 && (
                            <>
                              <Box sx={{ display: 'flex', width: '100%' }}>
                                <Box
                                  component="span"
                                  sx={{ minWidth: '250px', fontWeight: 'bold' }}
                                >
                                  Certificate Price
                                </Box>
                                <Box
                                  component="span"
                                  sx={{ minWidth: '100px', fontWeight: 'bold' }}
                                >
                                  :
                                </Box>
                                <Box component="span" sx={{ flex: 1 }}>
                                  <Typography variant="body2">
                                    <span className="dirham-symbol" style={{ marginLeft: 4 }}>
                                      &#x00EA;
                                    </span>{' '}
                                    {city.certificate_price ?? '0'}
                                  </Typography>
                                </Box>
                              </Box>
                              <Box sx={{ display: 'flex', width: '100%' }}>
                                <Box
                                  component="span"
                                  sx={{ minWidth: '250px', fontWeight: 'bold' }}
                                >
                                  Certificate Link
                                </Box>
                                <Box
                                  component="span"
                                  sx={{ minWidth: '100px', fontWeight: 'bold' }}
                                >
                                  :
                                </Box>
                                <Box component="span" sx={{ flex: 1 }}>
                                  <Typography
                                    variant="body2"
                                    onClick={() => window.open(city.certificate_link, '_blank')}
                                    sx={{ cursor: 'pointer' }}
                                  >
                                    {city.certificate_link
                                      ? `${city.certificate_link.slice(
                                          0,
                                          8
                                        )}...${city.certificate_link.slice(-6)}`
                                      : 'N/A'}
                                  </Typography>
                                </Box>
                              </Box>
                            </>
                          )}
                          <Box sx={{ display: 'flex', width: '100%' }}>
                            <Box component="span" sx={{ minWidth: '250px', fontWeight: 'bold' }}>
                              Reschedule Fee
                            </Box>
                            <Box component="span" sx={{ minWidth: '100px', fontWeight: 'bold' }}>
                              :
                            </Box>
                            <Box component="span" sx={{ flex: 1 }}>
                              <Typography variant="body2">
                                {city?.reschedule_fee ?? 'N/A'}
                              </Typography>
                            </Box>
                          </Box>
                          <Box sx={{ display: 'flex', width: '100%' }}>
                            <Box component="span" sx={{ minWidth: '250px', fontWeight: 'bold' }}>
                              Fee Reschedule Before
                            </Box>
                            <Box component="span" sx={{ minWidth: '100px', fontWeight: 'bold' }}>
                              :
                            </Box>
                            <Box component="span" sx={{ flex: 1 }}>
                              <Typography variant="body2">
                                {city?.free_reschedule_before ?? 'N/A'}
                              </Typography>
                            </Box>
                          </Box>
                          <Box sx={{ display: 'flex', width: '100%' }}>
                            <Box component="span" sx={{ minWidth: '250px', fontWeight: 'bold' }}>
                              Fee Reschedule Before Type
                            </Box>
                            <Box component="span" sx={{ minWidth: '100px', fontWeight: 'bold' }}>
                              :
                            </Box>
                            <Box component="span" sx={{ flex: 1 }}>
                              <Typography variant="body2">
                                {city?.free_reschedule_before_type === 0
                                  ? 'Hours'
                                  : city?.free_reschedule_before_type === 1
                                  ? 'Days'
                                  : 'N/A'}
                              </Typography>
                            </Box>
                          </Box>
                          <Box sx={{ display: 'flex', width: '100%' }}>
                            <Box component="span" sx={{ minWidth: '250px', fontWeight: 'bold' }}>
                              Price Per Km
                            </Box>
                            <Box component="span" sx={{ minWidth: '100px', fontWeight: 'bold' }}>
                              :
                            </Box>
                            <Box component="span" sx={{ flex: 1 }}>
                              <Typography variant="body2">
                                {city.price_per_km ? city?.price_per_km : 'N/A'}
                              </Typography>
                            </Box>
                          </Box>
                          <Box sx={{ display: 'flex', width: '100%' }}>
                            <Box component="span" sx={{ minWidth: '250px', fontWeight: 'bold' }}>
                              Minimum Price
                            </Box>
                            <Box component="span" sx={{ minWidth: '100px', fontWeight: 'bold' }}>
                              :
                            </Box>
                            <Box component="span" sx={{ flex: 1 }}>
                              <Typography variant="body2">
                                {city.min_price ? city?.min_price : 'N/A'}
                              </Typography>
                            </Box>
                          </Box>
                        </Stack>
                      </Box>
                    </Stack>
                  </Scrollbar>
                </Stack>
              </Stack>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Typography>No city translations available.</Typography>
      )}
    </>
  );

  return (
    <Box sx={{ position: 'relative', pt: 6 }}>
      <Stack
        alignItems="end"
        sx={{
          position: 'absolute',
          right: '1rem',
          top: '1rem',
          cursor: 'pointer',
          zIndex: 10,
        }}
      >
        <Iconify icon="solar:pen-bold" onClick={() => onEdit(city.id)} sx={{ cursor: 'pointer' }} />
      </Stack>
      {renderContent}
    </Box>
  );
}
