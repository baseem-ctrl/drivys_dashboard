import { Card, Typography, Box, Grid, Stack } from '@mui/material';
import Iconify from 'src/components/Iconify';
import { useGetPackage } from 'src/api/package';

// ----------------------------------------------------------------------

export default function SchoolPackageDetails({ id }) {
  const { packageList } = useGetPackage({
    vendor_id: id,
  });

  return (
    <Box>
      <Grid container justifyContent="flex-end" sx={{ marginBottom: '20px' }}>
        {Array.isArray(packageList) && packageList.length <= 0 && (
          <Grid item xs={12}>
            <Typography variant="body1" align="left" sx={{ color: '#CF5A0D' }}>
              No packages available.
            </Typography>
          </Grid>
        )}
      </Grid>

      <Grid container spacing={2} rowGap={1}>
        {Array.isArray(packageList) &&
          packageList.map((packageItem) => (
            <Grid item xs={12} sm={6} md={3} key={packageItem.id}>
              <Stack
                component={Card}
                direction="column"
                sx={{
                  marginBottom: '16px',
                  height: '260px',
                  position: 'relative',
                }}
              >
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{ px: 3, pt: 3, pb: 2, typography: 'body2' }}
                >
                  <Typography
                    variant="h8"
                    color="#CF5A0D"
                    sx={{ paddingRight: '14px', fontSize: '14px', fontWeight: 'bold' }}
                  >
                    {packageItem.package_translations.length > 0
                      ? packageItem.package_translations.map((trans) =>
                          trans.locale === 'en' || trans.locale === 'ar' ? (
                            <Typography key={trans.locale}>
                              {trans.name.toUpperCase() || 'UNNAMED PACKAGE'}
                            </Typography>
                          ) : null
                        )
                      : 'UNNAMED PACKAGE'}
                  </Typography>
                </Stack>

                <Stack spacing={2} sx={{ px: 3, pt: 3, pb: 2, flexGrow: 1, overflow: 'auto' }}>
                  <Typography variant="body2">{packageItem.number_of_sessions} Sessions</Typography>
                  <Typography sx={{ fontSize: '12px', fontWeight: '700' }}>
                    What's included
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Iconify icon="solar:check-circle-linear" color="#CF5A0D" />
                    <Typography
                      component="span"
                      dangerouslySetInnerHTML={{
                        __html:
                          packageItem.package_translations.find((trans) => trans.locale === 'en')
                            ?.session_inclusions || 'No inclusions available',
                      }}
                    />
                  </Stack>
                </Stack>

                <hr
                  style={{
                    width: '100%',
                    height: '0.5px',
                    border: 'none',
                    backgroundColor: '#CF5A0D',
                    position: 'absolute',
                    top: '70px',
                    left: '0',
                  }}
                />
              </Stack>
            </Grid>
          ))}
      </Grid>
    </Box>
  );
}
