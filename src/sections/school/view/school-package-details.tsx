import { Card, Typography, Box, Grid, Stack } from '@mui/material';
import { useGetPackage } from 'src/api/package';
import Iconify from 'src/components/iconify';
import i18n from 'src/locales/i18n';
import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';

// ----------------------------------------------------------------------

export default function SchoolPackageDetails({ id, t }) {
  const router = useRouter();

  const { packageList } = useGetPackage({
    vendor_id: id,
  });
  const handlePackageClick = (packageItem) => {
    router.push(paths.dashboard.package.details(packageItem?.id));
  };

  return (
    <Box>
      <Grid container justifyContent="flex-end" sx={{ marginBottom: '20px' }}>
        {Array.isArray(packageList) && packageList.length <= 0 && (
          <Grid item xs={12}>
            <Typography variant="body1" align="left" sx={{ color: '#CF5A0D' }}>
              {t('no_packages_available')}
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
                  cursor: 'pointer',
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 6px 15px rgba(0, 0, 0, 0.2)',
                  },
                }}
                onClick={() => handlePackageClick(packageItem)}
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
                    sx={{ paddingRight: '14px', fontSize: '16px', fontWeight: 'bold' }}
                  >
                    {packageItem.package_translations.length > 0
                      ? packageItem.package_translations.map((trans) => (
                          <Typography key={trans.locale}>
                            {trans.name ? trans.name.toUpperCase() : t('unnamed_package')}
                          </Typography>
                        ))
                      : t('unnamed_package')}
                  </Typography>
                </Stack>

                <Stack spacing={2} sx={{ px: 3, pt: 3, pb: 2, flexGrow: 1, overflow: 'auto' }}>
                  <Typography variant="body2">
                    {t('sessions_count', { count: packageItem.number_of_sessions })}
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
                          packageItem.package_translations.find(
                            (trans) => trans.locale?.toLowerCase() === i18n.language.toLowerCase()
                          )?.session_inclusions || t('no_inclusions_available'),
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
