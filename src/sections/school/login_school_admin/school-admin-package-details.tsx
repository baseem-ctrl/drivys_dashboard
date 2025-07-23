import { Card, Typography, Box, Grid, Stack } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useGetPackageBySchool } from 'src/api/school';
import Iconify from 'src/components/iconify';

export default function SchoolAdminPackageDetails({ id }) {
  const { t } = useTranslation();
  const { packageDetails, packageError, packageLoading } = useGetPackageBySchool(id);

  if (packageLoading) {
    return <Typography>{t('loading')}</Typography>;
  }

  if (packageError) {
    return (
      <Typography sx={{ color: 'red' }}>
        {t('error_loading_packages')}: {packageError}
      </Typography>
    );
  }

  return (
    <Box>
      <Grid container justifyContent="flex-end" sx={{ marginBottom: '20px' }}>
        {Array.isArray(packageDetails) && packageDetails.length <= 0 && (
          <Grid item xs={12}>
            <Typography variant="body1" align="left" sx={{ color: '#CF5A0D' }}>
              {t('no_packages_available')}
            </Typography>
          </Grid>
        )}
      </Grid>

      <Grid container spacing={2} rowGap={1}>
        {Array.isArray(packageDetails) &&
          packageDetails.map((packageItem) => (
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
                    sx={{ paddingRight: '14px', fontSize: '18px', fontWeight: 'bold' }}
                  >
                    {packageItem.package_translations.length > 0
                      ? packageItem.package_translations.map((trans) => (
                          <Typography key={trans.locale}>
                            {trans.name.toUpperCase() || t('unnamed_package')}
                          </Typography>
                        ))
                      : t('unnamed_package')}
                  </Typography>
                </Stack>

                <Stack spacing={2} sx={{ px: 3, pt: 3, pb: 2, flexGrow: 1, overflow: 'auto' }}>
                  <Typography variant="body2">
                    {packageItem.number_of_sessions} {t('sessions')}
                  </Typography>
                  <Typography sx={{ fontSize: '14px', fontWeight: '700' }}>
                    {t('whats_included')}
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Iconify icon="solar:check-circle-linear" color="#CF5A0D" />
                    <Typography
                      component="span"
                      dangerouslySetInnerHTML={{
                        __html:
                          packageItem.package_translations.find((trans) => trans.locale === 'en')
                            ?.session_inclusions || t('no_inclusions_available'),
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
